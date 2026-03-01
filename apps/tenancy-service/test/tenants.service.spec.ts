import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConflictException, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { TenantsService } from '../src/tenants/tenants.service';
import { Tenant } from '../src/database/entities/tenant.entity';
import { TenantConfig } from '../src/database/entities/tenant-config.entity';
import { TenantFeatureFlag } from '../src/database/entities/tenant-feature-flag.entity';
import { TenantStatus, TenantPlan, TenantEvent } from '../src/common/enums/tenant-status.enum';
import { EventsService } from '../src/events/events.service';

const mockTenant = (): Partial<Tenant> => ({
  id: 'tenant-uuid-1',
  name: 'Dangote Industries',
  slug: 'dangote-industries',
  status: TenantStatus.ACTIVE,
  plan: TenantPlan.STARTER,
  contactEmail: 'admin@dangote.com',
  countryCode: 'NG',
  locale: 'en-NG',
  timezone: 'Africa/Lagos',
  currency: 'NGN',
  maxUsers: 10,
  maxStorageMb: 1024,
  onboardingCompleted: true,
  syncStatus: 'synced',
  configs: [],
  featureFlags: [],
});

describe('TenantsService', () => {
  let service: TenantsService;
  let tenantRepo: jest.Mocked<Repository<Tenant>>;
  let configRepo: jest.Mocked<Repository<TenantConfig>>;
  let featureFlagRepo: jest.Mocked<Repository<TenantFeatureFlag>>;
  let dataSource: jest.Mocked<DataSource>;
  let eventsService: jest.Mocked<EventsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantsService,
        {
          provide: getRepositoryToken(Tenant),
          useValue: {
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(TenantConfig),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(TenantFeatureFlag),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            query: jest.fn(),
          },
        },
        {
          provide: EventsService,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TenantsService>(TenantsService);
    tenantRepo = module.get(getRepositoryToken(Tenant));
    configRepo = module.get(getRepositoryToken(TenantConfig));
    featureFlagRepo = module.get(getRepositoryToken(TenantFeatureFlag));
    dataSource = module.get(DataSource);
    eventsService = module.get(EventsService);
  });

  // ===== CREATE =====

  describe('create', () => {
    it('should create a tenant with Nigeria-First defaults', async () => {
      tenantRepo.findOne.mockResolvedValue(null);
      const created = { ...mockTenant(), status: TenantStatus.PENDING };
      tenantRepo.create.mockReturnValue(created as Tenant);
      tenantRepo.save.mockResolvedValue(created as Tenant);

      const result = await service.create({
        name: 'Dangote Industries',
        slug: 'dangote-industries',
        contactEmail: 'admin@dangote.com',
      });

      expect(result.status).toBe(TenantStatus.PENDING);
      expect(tenantRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          locale: 'en-NG',
          timezone: 'Africa/Lagos',
          currency: 'NGN',
          countryCode: 'NG',
        }),
      );
      expect(eventsService.emit).toHaveBeenCalledWith(
        TenantEvent.TENANT_CREATED,
        expect.any(Object),
      );
    });

    it('should throw ConflictException if slug already exists', async () => {
      tenantRepo.findOne.mockResolvedValue(mockTenant() as Tenant);

      await expect(
        service.create({
          name: 'Duplicate',
          slug: 'dangote-industries',
          contactEmail: 'dup@test.com',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ===== FIND =====

  describe('findOne', () => {
    it('should return a tenant by ID', async () => {
      tenantRepo.findOne.mockResolvedValue(mockTenant() as Tenant);
      const result = await service.findOne('tenant-uuid-1');
      expect(result.id).toBe('tenant-uuid-1');
    });

    it('should throw NotFoundException if tenant does not exist', async () => {
      tenantRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated tenants', async () => {
      tenantRepo.findAndCount.mockResolvedValue([[mockTenant() as Tenant], 1]);
      const result = await service.findAll(1, 20);
      expect(result.tenants).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  // ===== LIFECYCLE =====

  describe('completeOnboarding', () => {
    it('should activate a PENDING tenant', async () => {
      const pendingTenant = { ...mockTenant(), status: TenantStatus.PENDING, onboardingCompleted: false };
      tenantRepo.findOne.mockResolvedValue(pendingTenant as Tenant);
      tenantRepo.save.mockResolvedValue({ ...pendingTenant, status: TenantStatus.ACTIVE } as Tenant);

      const result = await service.completeOnboarding('tenant-uuid-1', {
        adminUserId: 'admin-uuid',
      });

      expect(tenantRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: TenantStatus.ACTIVE }),
      );
      expect(eventsService.emit).toHaveBeenCalledWith(
        TenantEvent.TENANT_ACTIVATED,
        expect.any(Object),
      );
    });

    it('should throw BadRequestException if tenant is not PENDING', async () => {
      tenantRepo.findOne.mockResolvedValue(mockTenant() as Tenant); // ACTIVE
      await expect(
        service.completeOnboarding('tenant-uuid-1', { adminUserId: 'admin-uuid' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('suspend', () => {
    it('should suspend an ACTIVE tenant', async () => {
      tenantRepo.findOne.mockResolvedValue(mockTenant() as Tenant);
      tenantRepo.save.mockResolvedValue({ ...mockTenant(), status: TenantStatus.SUSPENDED } as Tenant);

      await service.suspend('tenant-uuid-1', { reason: 'Payment overdue' });

      expect(eventsService.emit).toHaveBeenCalledWith(
        TenantEvent.TENANT_SUSPENDED,
        expect.objectContaining({ reason: 'Payment overdue' }),
      );
    });

    it('should throw BadRequestException if tenant is not ACTIVE', async () => {
      tenantRepo.findOne.mockResolvedValue({
        ...mockTenant(), status: TenantStatus.SUSPENDED,
      } as Tenant);
      await expect(
        service.suspend('tenant-uuid-1', { reason: 'test' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('reactivate', () => {
    it('should reactivate a SUSPENDED tenant', async () => {
      tenantRepo.findOne.mockResolvedValue({
        ...mockTenant(), status: TenantStatus.SUSPENDED,
      } as Tenant);
      tenantRepo.save.mockResolvedValue({ ...mockTenant(), status: TenantStatus.ACTIVE } as Tenant);

      await service.reactivate('tenant-uuid-1');
      expect(eventsService.emit).toHaveBeenCalledWith(
        TenantEvent.TENANT_REACTIVATED,
        expect.any(Object),
      );
    });
  });

  describe('terminate', () => {
    it('should terminate an ACTIVE tenant', async () => {
      tenantRepo.findOne.mockResolvedValue(mockTenant() as Tenant);
      tenantRepo.save.mockResolvedValue({ ...mockTenant(), status: TenantStatus.TERMINATED } as Tenant);

      await service.terminate('tenant-uuid-1');
      expect(eventsService.emit).toHaveBeenCalledWith(
        TenantEvent.TENANT_TERMINATED,
        expect.any(Object),
      );
    });

    it('should throw BadRequestException if already terminated', async () => {
      tenantRepo.findOne.mockResolvedValue({
        ...mockTenant(), status: TenantStatus.TERMINATED,
      } as Tenant);
      await expect(service.terminate('tenant-uuid-1')).rejects.toThrow(BadRequestException);
    });
  });

  // ===== CONFIG =====

  describe('setConfig', () => {
    it('should create a new config entry', async () => {
      tenantRepo.findOne.mockResolvedValue(mockTenant() as Tenant);
      configRepo.findOne.mockResolvedValue(null);
      const newConfig = { id: 'cfg-1', tenantId: 'tenant-uuid-1', key: 'payment.gateway', value: 'paystack' };
      configRepo.create.mockReturnValue(newConfig as TenantConfig);
      configRepo.save.mockResolvedValue(newConfig as TenantConfig);

      const result = await service.setConfig('tenant-uuid-1', {
        key: 'payment.gateway',
        value: 'paystack',
      });

      expect(result.key).toBe('payment.gateway');
      expect(result.value).toBe('paystack');
    });
  });

  describe('getConfig', () => {
    it('should mask sensitive config values', async () => {
      tenantRepo.findOne.mockResolvedValue(mockTenant() as Tenant);
      configRepo.find.mockResolvedValue([
        { key: 'payment.gateway', value: 'paystack', isSensitive: false } as TenantConfig,
        { key: 'api.secret', value: 'my-secret-key', isSensitive: true } as TenantConfig,
      ]);

      const result = await service.getConfig('tenant-uuid-1');
      expect(result[0].value).toBe('paystack');
      expect(result[1].value).toBe('***REDACTED***');
    });
  });

  // ===== FEATURE FLAGS =====

  describe('isFeatureEnabled', () => {
    it('should return true for enabled feature', async () => {
      featureFlagRepo.findOne.mockResolvedValue({ enabled: true } as TenantFeatureFlag);
      const result = await service.isFeatureEnabled('tenant-uuid-1', 'domain.ecommerce');
      expect(result).toBe(true);
    });

    it('should return false for disabled feature (Offline-First safe default)', async () => {
      featureFlagRepo.findOne.mockResolvedValue(null);
      const result = await service.isFeatureEnabled('tenant-uuid-1', 'domain.ecommerce');
      expect(result).toBe(false);
    });
  });

  // ===== RLS =====

  describe('setRlsContext', () => {
    it('should set bypass_rls for Super Admin', async () => {
      dataSource.query.mockResolvedValue(undefined);
      await service.setRlsContext('', true);
      expect(dataSource.query).toHaveBeenCalledWith(
        `SELECT set_config('app.bypass_rls', 'true', true)`,
      );
    });

    it('should set current_tenant_id for regular tenant', async () => {
      dataSource.query.mockResolvedValue(undefined);
      await service.setRlsContext('tenant-uuid-1', false);
      expect(dataSource.query).toHaveBeenCalledWith(
        `SELECT set_config('app.current_tenant_id', $1, true)`,
        ['tenant-uuid-1'],
      );
    });
  });
});
