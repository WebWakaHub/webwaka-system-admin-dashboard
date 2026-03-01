import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TenantMiddleware } from '../src/middleware/tenant.middleware';
import { TenantsService } from '../src/tenants/tenants.service';
import { TenantStatus } from '../src/common/enums/tenant-status.enum';

const mockTenant = (status = TenantStatus.ACTIVE) => ({
  id: 'tenant-uuid-1',
  slug: 'dangote-industries',
  status,
});

describe('TenantMiddleware', () => {
  let middleware: TenantMiddleware;
  let tenantsService: jest.Mocked<Partial<TenantsService>>;
  let jwtService: jest.Mocked<Partial<JwtService>>;

  const mockNext = jest.fn();

  beforeEach(async () => {
    tenantsService = {
      findOne: jest.fn(),
      findBySlug: jest.fn(),
      setRlsContext: jest.fn(),
    };
    jwtService = {
      decode: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantMiddleware,
        { provide: TenantsService, useValue: tenantsService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    middleware = module.get<TenantMiddleware>(TenantMiddleware);
    mockNext.mockClear();
  });

  describe('public endpoints', () => {
    it('should bypass tenant resolution for /health', async () => {
      const req = { path: '/health', headers: {}, method: 'GET' } as any;
      await middleware.use(req, {} as any, mockNext);
      expect(mockNext).toHaveBeenCalled();
      expect(tenantsService.findOne).not.toHaveBeenCalled();
    });

    it('should bypass tenant resolution for POST /tenants', async () => {
      const req = { path: '/tenants', headers: {}, method: 'POST' } as any;
      await middleware.use(req, {} as any, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('X-Tenant-ID header resolution', () => {
    it('should resolve tenant from X-Tenant-ID header', async () => {
      (tenantsService.findOne as jest.Mock).mockResolvedValue(mockTenant());
      (tenantsService.setRlsContext as jest.Mock).mockResolvedValue(undefined);

      const req = {
        path: '/tenants/tenant-uuid-1',
        headers: { 'x-tenant-id': 'tenant-uuid-1' },
        method: 'GET',
      } as any;

      await middleware.use(req, {} as any, mockNext);
      expect(req.tenantId).toBe('tenant-uuid-1');
      expect(tenantsService.setRlsContext).toHaveBeenCalledWith('tenant-uuid-1', false);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('X-Tenant-Slug header resolution', () => {
    it('should resolve tenant from X-Tenant-Slug header', async () => {
      (tenantsService.findBySlug as jest.Mock).mockResolvedValue(mockTenant());
      (tenantsService.findOne as jest.Mock).mockResolvedValue(mockTenant());
      (tenantsService.setRlsContext as jest.Mock).mockResolvedValue(undefined);

      const req = {
        path: '/tenants/features',
        headers: { 'x-tenant-slug': 'dangote-industries' },
        method: 'GET',
      } as any;

      await middleware.use(req, {} as any, mockNext);
      expect(req.tenantId).toBe('tenant-uuid-1');
    });
  });

  describe('JWT token resolution', () => {
    it('should resolve tenant from JWT payload', async () => {
      (jwtService.decode as jest.Mock).mockReturnValue({
        tenantId: 'tenant-uuid-1',
        actorType: 'TENANT_ADMIN',
      });
      (tenantsService.findOne as jest.Mock).mockResolvedValue(mockTenant());
      (tenantsService.setRlsContext as jest.Mock).mockResolvedValue(undefined);

      const req = {
        path: '/tenants/features',
        headers: { authorization: 'Bearer valid.jwt.token' },
        method: 'GET',
      } as any;

      await middleware.use(req, {} as any, mockNext);
      expect(req.tenantId).toBe('tenant-uuid-1');
    });

    it('should bypass RLS for SUPER_ADMIN', async () => {
      (jwtService.decode as jest.Mock).mockReturnValue({
        actorType: 'SUPER_ADMIN',
      });
      (tenantsService.setRlsContext as jest.Mock).mockResolvedValue(undefined);

      const req = {
        path: '/tenants',
        headers: { authorization: 'Bearer super.admin.token' },
        method: 'GET',
      } as any;

      await middleware.use(req, {} as any, mockNext);
      expect(tenantsService.setRlsContext).toHaveBeenCalledWith('', true);
      expect(req.isSuperAdmin).toBe(true);
    });
  });

  describe('terminated tenant', () => {
    it('should throw UnauthorizedException for terminated tenant', async () => {
      (tenantsService.findOne as jest.Mock).mockResolvedValue(
        mockTenant(TenantStatus.TERMINATED),
      );

      const req = {
        path: '/tenants/features',
        headers: { 'x-tenant-id': 'tenant-uuid-1' },
        method: 'GET',
      } as any;

      await expect(middleware.use(req, {} as any, mockNext)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('no tenant context', () => {
    it('should throw UnauthorizedException when no tenant context provided', async () => {
      (jwtService.decode as jest.Mock).mockReturnValue(null);

      const req = {
        path: '/tenants/features',
        headers: {},
        method: 'GET',
      } as any;

      await expect(middleware.use(req, {} as any, mockNext)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
