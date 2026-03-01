import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { TenantsService } from '../tenants/tenants.service';
import { TenantStatus } from '../common/enums/tenant-status.enum';

/**
 * Tenant Middleware
 *
 * Resolves the current tenant from the incoming request and sets
 * the PostgreSQL RLS session variable (app.current_tenant_id).
 *
 * Tenant resolution order:
 * 1. X-Tenant-ID header (explicit tenant ID)
 * 2. X-Tenant-Slug header (slug-based resolution)
 * 3. JWT token payload (tenantId claim)
 * 4. Subdomain (e.g., dangote-industries.webwaka.com)
 *
 * RLS Context:
 * - Super Admin (SUPER_ADMIN actor type): bypass_rls = 'true'
 * - All others: current_tenant_id = resolved tenantId
 *
 * Offline-First: Suspended tenants still allow read-only access
 * to cached data. Terminated tenants are fully blocked.
 *
 * Nigeria-First: Error messages in plain English, no technical jargon.
 */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    private readonly tenantsService: TenantsService,
    private readonly jwtService: JwtService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    // Health check endpoints bypass tenant resolution
    if (req.path === '/health' || req.path === '/metrics') {
      return next();
    }

    // Public endpoints (tenant creation, onboarding) bypass tenant resolution
    if (this.isPublicEndpoint(req)) {
      return next();
    }

    let tenantId: string | null = null;
    let isSuperAdmin = false;

    // Step 1: Try X-Tenant-ID header
    const tenantIdHeader = req.headers['x-tenant-id'] as string;
    if (tenantIdHeader) {
      tenantId = tenantIdHeader;
    }

    // Step 2: Try X-Tenant-Slug header
    if (!tenantId) {
      const tenantSlugHeader = req.headers['x-tenant-slug'] as string;
      if (tenantSlugHeader) {
        try {
          const tenant = await this.tenantsService.findBySlug(tenantSlugHeader);
          tenantId = tenant.id;
        } catch {
          throw new BadRequestException(
            `Tenant '${tenantSlugHeader}' not found`,
          );
        }
      }
    }

    // Step 3: Try JWT token payload
    if (!tenantId) {
      const authHeader = req.headers['authorization'] as string;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        try {
          const payload = this.jwtService.decode(token) as any;
          if (payload?.tenantId) {
            tenantId = payload.tenantId;
          }
          if (payload?.actorType === 'SUPER_ADMIN') {
            isSuperAdmin = true;
          }
        } catch {
          // Token decode failure is non-fatal here — JWT guard handles auth
        }
      }
    }

    // Step 4: Try subdomain resolution
    if (!tenantId) {
      const host = req.headers['host'] as string;
      if (host) {
        const subdomain = this.extractSubdomain(host);
        if (subdomain && subdomain !== 'www' && subdomain !== 'api') {
          try {
            const tenant = await this.tenantsService.findBySlug(subdomain);
            tenantId = tenant.id;
          } catch {
            // Subdomain resolution failure is non-fatal
          }
        }
      }
    }

    // Super Admin bypasses tenant requirement
    if (isSuperAdmin) {
      await this.tenantsService.setRlsContext('', true);
      (req as any).isSuperAdmin = true;
      return next();
    }

    // Non-super-admin requests require a resolved tenant
    if (!tenantId) {
      throw new UnauthorizedException(
        'Tenant context is required. Provide X-Tenant-ID header, X-Tenant-Slug header, or a valid JWT token with tenantId.',
      );
    }

    // Verify tenant exists and is not terminated
    try {
      const tenant = await this.tenantsService.findOne(tenantId);

      if (tenant.status === TenantStatus.TERMINATED) {
        throw new UnauthorizedException(
          'This tenant account has been terminated. Please contact support.',
        );
      }

      // Set RLS context for this request
      await this.tenantsService.setRlsContext(tenantId, false);

      // Attach tenant context to request for downstream use
      (req as any).tenantId = tenantId;
      (req as any).tenant = tenant;
      (req as any).tenantStatus = tenant.status;

    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new UnauthorizedException('Invalid tenant context');
    }

    return next();
  }

  /**
   * Determines if an endpoint is public (no tenant context required).
   */
  private isPublicEndpoint(req: Request): boolean {
    const publicPaths = [
      '/tenants',          // POST /tenants — create tenant
      '/health',
      '/metrics',
      '/docs',
      '/swagger',
    ];

    // POST /tenants is public (creating a new tenant)
    if (req.method === 'POST' && req.path === '/tenants') {
      return true;
    }

    return publicPaths.some(
      (path) => req.path === path || req.path.startsWith(`${path}/`),
    );
  }

  /**
   * Extracts subdomain from host header.
   * e.g., 'dangote-industries.webwaka.com' → 'dangote-industries'
   */
  private extractSubdomain(host: string): string | null {
    const parts = host.split('.');
    if (parts.length >= 3) {
      return parts[0];
    }
    return null;
  }
}
