import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { ActorType } from '../common/enums/actor-type.enum';
import { JwtPayload } from '../common/dto/auth.dto';

/**
 * Tenant Context Service (Request-scoped)
 *
 * Provides tenant isolation context for the current request.
 * All database queries MUST use this service to enforce RLS.
 *
 * Rules:
 * - Super Admin: No tenant filter (cross-tenant access)
 * - All other actors: Queries are scoped to their tenantId
 *
 * Offline-First: Tenant context is embedded in the JWT token,
 * so it can be reconstructed offline from the cached token.
 */
@Injectable({ scope: Scope.REQUEST })
export class TenantContextService {
  private readonly currentUser: JwtPayload | null;

  constructor(@Inject(REQUEST) private readonly request: Request) {
    this.currentUser = (request as any).user || null;
  }

  /**
   * Get the current tenant ID.
   * Returns null for Super Admin (cross-tenant access).
   */
  getTenantId(): string | null {
    if (!this.currentUser) return null;
    return this.currentUser.tenantId;
  }

  /**
   * Get the current user's actor type.
   */
  getActorType(): ActorType | null {
    if (!this.currentUser) return null;
    return this.currentUser.actorType;
  }

  /**
   * Get the current user's ID.
   */
  getUserId(): string | null {
    if (!this.currentUser) return null;
    return this.currentUser.sub;
  }

  /**
   * Get the current user's partner ID.
   */
  getPartnerId(): string | null {
    if (!this.currentUser) return null;
    return this.currentUser.partnerId;
  }

  /**
   * Check if the current user is a Super Admin.
   * Super Admins bypass tenant scoping.
   */
  isSuperAdmin(): boolean {
    return this.currentUser?.actorType === ActorType.SUPER_ADMIN;
  }

  /**
   * Get the tenant filter condition for database queries.
   * Returns an empty object for Super Admin (no filter).
   * Returns { tenantId } for all other actors.
   *
   * Usage in repositories:
   *   const filter = this.tenantContext.getTenantFilter();
   *   return this.repo.find({ where: { ...filter, ...otherConditions } });
   */
  getTenantFilter(): Record<string, any> {
    if (this.isSuperAdmin()) {
      return {}; // No tenant filter for Super Admin
    }
    const tenantId = this.getTenantId();
    if (!tenantId) {
      return {}; // Unauthenticated requests have no filter
    }
    return { tenantId };
  }

  /**
   * Get the full current user payload.
   */
  getCurrentUser(): JwtPayload | null {
    return this.currentUser;
  }
}
