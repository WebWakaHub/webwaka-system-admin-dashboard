import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Tenant } from '../database/entities/tenant.entity';
import { TenantConfig } from '../database/entities/tenant-config.entity';
import { TenantFeatureFlag } from '../database/entities/tenant-feature-flag.entity';
import {
  TenantStatus,
  TenantPlan,
  TenantEvent,
} from '../common/enums/tenant-status.enum';
import { CreateTenantDto } from '../common/dto/create-tenant.dto';
import {
  UpdateTenantDto,
  SuspendTenantDto,
  SetTenantConfigDto,
  SetFeatureFlagDto,
  CompleteTenantOnboardingDto,
} from '../common/dto/tenant-operations.dto';
import { EventsService } from '../events/events.service';

/**
 * Tenants Service
 *
 * Implements the full tenant lifecycle:
 * - Create → Onboard → Activate → (Suspend → Reactivate) → Terminate
 *
 * RLS Enforcement:
 * - All tenant-scoped queries set the PostgreSQL session variable
 *   app.current_tenant_id before executing
 * - Super Admin bypass: app.bypass_rls = 'true'
 *
 * Nigeria-First: Default locale en-NG, timezone Africa/Lagos, currency NGN.
 * Offline-First: syncStatus tracked on all tenant records.
 */
@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(TenantConfig)
    private readonly configRepository: Repository<TenantConfig>,
    @InjectRepository(TenantFeatureFlag)
    private readonly featureFlagRepository: Repository<TenantFeatureFlag>,
    private readonly dataSource: DataSource,
    private readonly eventsService: EventsService,
  ) {}

  /**
   * Create a new tenant.
   * Initial status is PENDING until onboarding is completed.
   */
  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    // Check for duplicate slug
    const existing = await this.tenantRepository.findOne({
      where: { slug: createTenantDto.slug },
    });
    if (existing) {
      throw new ConflictException(
        `A tenant with slug '${createTenantDto.slug}' already exists`,
      );
    }

    const tenant = this.tenantRepository.create({
      ...createTenantDto,
      status: TenantStatus.PENDING,
      countryCode: createTenantDto.countryCode || 'NG',
      locale: createTenantDto.locale || 'en-NG',
      timezone: createTenantDto.timezone || 'Africa/Lagos',
      currency: createTenantDto.currency || 'NGN',
      plan: createTenantDto.plan || TenantPlan.STARTER,
      syncStatus: 'synced',
    });

    const savedTenant = await this.tenantRepository.save(tenant);

    await this.eventsService.emit(TenantEvent.TENANT_CREATED, {
      tenantId: savedTenant.id,
      slug: savedTenant.slug,
      plan: savedTenant.plan,
    });

    return savedTenant;
  }

  /**
   * Find all tenants (Super Admin only — no RLS applied here).
   */
  async findAll(
    page: number = 1,
    limit: number = 20,
    status?: TenantStatus,
  ): Promise<{ tenants: Tenant[]; total: number }> {
    const where: Record<string, any> = {};
    if (status) where.status = status;

    const [tenants, total] = await this.tenantRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { tenants, total };
  }

  /**
   * Find a single tenant by ID.
   */
  async findOne(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { id },
      relations: ['configs', 'featureFlags'],
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant '${id}' not found`);
    }

    return tenant;
  }

  /**
   * Find a tenant by slug.
   */
  async findBySlug(slug: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { slug },
      relations: ['featureFlags'],
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with slug '${slug}' not found`);
    }

    return tenant;
  }

  /**
   * Update tenant details.
   */
  async update(id: string, updateTenantDto: UpdateTenantDto): Promise<Tenant> {
    const tenant = await this.findOne(id);

    // Cannot update a terminated tenant
    if (tenant.status === TenantStatus.TERMINATED) {
      throw new ForbiddenException('Cannot update a terminated tenant');
    }

    // Check slug uniqueness if changing
    if (updateTenantDto.slug && updateTenantDto.slug !== tenant.slug) {
      const existing = await this.tenantRepository.findOne({
        where: { slug: updateTenantDto.slug },
      });
      if (existing) {
        throw new ConflictException(
          `A tenant with slug '${updateTenantDto.slug}' already exists`,
        );
      }
    }

    Object.assign(tenant, updateTenantDto);
    const savedTenant = await this.tenantRepository.save(tenant);

    await this.eventsService.emit(TenantEvent.TENANT_UPDATED, {
      tenantId: id,
      changes: Object.keys(updateTenantDto),
    });

    return savedTenant;
  }

  /**
   * Complete tenant onboarding workflow.
   * Transitions tenant from PENDING → ACTIVE.
   */
  async completeOnboarding(
    id: string,
    dto: CompleteTenantOnboardingDto,
  ): Promise<Tenant> {
    const tenant = await this.findOne(id);

    if (tenant.status !== TenantStatus.PENDING) {
      throw new BadRequestException(
        `Tenant is in '${tenant.status}' status. Onboarding only applies to PENDING tenants.`,
      );
    }

    // Apply initial feature flags
    if (dto.initialFeatures && dto.initialFeatures.length > 0) {
      for (const feature of dto.initialFeatures) {
        await this.setFeatureFlag(id, {
          feature,
          enabled: true,
        });
      }
    }

    // Apply initial configuration
    if (dto.initialConfig) {
      for (const [key, value] of Object.entries(dto.initialConfig)) {
        await this.setConfig(id, { key, value });
      }
    }

    // Activate the tenant
    tenant.status = TenantStatus.ACTIVE;
    tenant.onboardingCompleted = true;
    tenant.activatedAt = new Date();
    const savedTenant = await this.tenantRepository.save(tenant);

    await this.eventsService.emit(TenantEvent.TENANT_ONBOARDING_COMPLETED, {
      tenantId: id,
      adminUserId: dto.adminUserId,
    });

    await this.eventsService.emit(TenantEvent.TENANT_ACTIVATED, {
      tenantId: id,
      activatedAt: savedTenant.activatedAt,
    });

    return savedTenant;
  }

  /**
   * Suspend a tenant.
   * Transitions ACTIVE → SUSPENDED.
   */
  async suspend(id: string, dto: SuspendTenantDto): Promise<Tenant> {
    const tenant = await this.findOne(id);

    if (tenant.status !== TenantStatus.ACTIVE) {
      throw new BadRequestException(
        `Cannot suspend a tenant in '${tenant.status}' status. Only ACTIVE tenants can be suspended.`,
      );
    }

    tenant.status = TenantStatus.SUSPENDED;
    tenant.suspendedAt = new Date();
    tenant.suspensionReason = dto.reason;
    const savedTenant = await this.tenantRepository.save(tenant);

    await this.eventsService.emit(TenantEvent.TENANT_SUSPENDED, {
      tenantId: id,
      reason: dto.reason,
      suspendedAt: savedTenant.suspendedAt,
    });

    return savedTenant;
  }

  /**
   * Reactivate a suspended tenant.
   * Transitions SUSPENDED → ACTIVE.
   */
  async reactivate(id: string): Promise<Tenant> {
    const tenant = await this.findOne(id);

    if (tenant.status !== TenantStatus.SUSPENDED) {
      throw new BadRequestException(
        `Cannot reactivate a tenant in '${tenant.status}' status. Only SUSPENDED tenants can be reactivated.`,
      );
    }

    tenant.status = TenantStatus.ACTIVE;
    tenant.suspendedAt = null;
    tenant.suspensionReason = null;
    const savedTenant = await this.tenantRepository.save(tenant);

    await this.eventsService.emit(TenantEvent.TENANT_REACTIVATED, {
      tenantId: id,
      reactivatedAt: new Date(),
    });

    return savedTenant;
  }

  /**
   * Terminate a tenant permanently.
   * Transitions ACTIVE|SUSPENDED → TERMINATED.
   * Data is retained per data retention policy.
   */
  async terminate(id: string): Promise<Tenant> {
    const tenant = await this.findOne(id);

    if (tenant.status === TenantStatus.TERMINATED) {
      throw new BadRequestException('Tenant is already terminated');
    }

    if (tenant.status === TenantStatus.PENDING) {
      throw new BadRequestException(
        'Cannot terminate a PENDING tenant. Complete or cancel onboarding first.',
      );
    }

    tenant.status = TenantStatus.TERMINATED;
    tenant.terminatedAt = new Date();
    const savedTenant = await this.tenantRepository.save(tenant);

    await this.eventsService.emit(TenantEvent.TENANT_TERMINATED, {
      tenantId: id,
      terminatedAt: savedTenant.terminatedAt,
    });

    return savedTenant;
  }

  /**
   * Change tenant subscription plan.
   */
  async changePlan(id: string, newPlan: TenantPlan): Promise<Tenant> {
    const tenant = await this.findOne(id);
    const oldPlan = tenant.plan;

    tenant.plan = newPlan;
    const savedTenant = await this.tenantRepository.save(tenant);

    await this.eventsService.emit(TenantEvent.TENANT_PLAN_CHANGED, {
      tenantId: id,
      oldPlan,
      newPlan,
    });

    return savedTenant;
  }

  /**
   * Set a configuration value for a tenant.
   * Creates or updates the config key.
   */
  async setConfig(tenantId: string, dto: SetTenantConfigDto): Promise<TenantConfig> {
    // Verify tenant exists
    await this.findOne(tenantId);

    let config = await this.configRepository.findOne({
      where: { tenantId, key: dto.key },
    });

    if (config) {
      config.value = dto.value;
      if (dto.isSensitive !== undefined) config.isSensitive = dto.isSensitive;
      if (dto.description !== undefined) config.description = dto.description;
    } else {
      config = this.configRepository.create({
        tenantId,
        key: dto.key,
        value: dto.value,
        isSensitive: dto.isSensitive || false,
        description: dto.description,
      });
    }

    const savedConfig = await this.configRepository.save(config);

    await this.eventsService.emit(TenantEvent.TENANT_CONFIG_UPDATED, {
      tenantId,
      key: dto.key,
      isSensitive: dto.isSensitive || false,
    });

    return savedConfig;
  }

  /**
   * Get all configuration for a tenant.
   * Masks sensitive values in the response.
   */
  async getConfig(tenantId: string): Promise<TenantConfig[]> {
    await this.findOne(tenantId);

    const configs = await this.configRepository.find({
      where: { tenantId },
      order: { key: 'ASC' },
    });

    // Mask sensitive values
    return configs.map((c) => ({
      ...c,
      value: c.isSensitive ? '***REDACTED***' : c.value,
    }));
  }

  /**
   * Get a specific config value (unmasked — internal use only).
   */
  async getConfigValue(tenantId: string, key: string): Promise<string | null> {
    const config = await this.configRepository.findOne({
      where: { tenantId, key },
    });
    return config?.value || null;
  }

  /**
   * Set a feature flag for a tenant.
   */
  async setFeatureFlag(tenantId: string, dto: SetFeatureFlagDto): Promise<TenantFeatureFlag> {
    await this.findOne(tenantId);

    let flag = await this.featureFlagRepository.findOne({
      where: { tenantId, feature: dto.feature },
    });

    if (flag) {
      flag.enabled = dto.enabled;
      flag.toggledAt = new Date();
      if (dto.metadata !== undefined) flag.metadata = dto.metadata;
    } else {
      flag = this.featureFlagRepository.create({
        tenantId,
        feature: dto.feature,
        enabled: dto.enabled,
        metadata: dto.metadata,
        toggledAt: new Date(),
      });
    }

    const savedFlag = await this.featureFlagRepository.save(flag);

    const eventType = dto.enabled
      ? TenantEvent.TENANT_FEATURE_ENABLED
      : TenantEvent.TENANT_FEATURE_DISABLED;

    await this.eventsService.emit(eventType, {
      tenantId,
      feature: dto.feature,
      enabled: dto.enabled,
    });

    return savedFlag;
  }

  /**
   * Get all feature flags for a tenant.
   */
  async getFeatureFlags(tenantId: string): Promise<TenantFeatureFlag[]> {
    await this.findOne(tenantId);

    return this.featureFlagRepository.find({
      where: { tenantId },
      order: { feature: 'ASC' },
    });
  }

  /**
   * Check if a specific feature is enabled for a tenant.
   * Offline-First: Returns false if tenant not found (safe default).
   */
  async isFeatureEnabled(tenantId: string, feature: string): Promise<boolean> {
    const flag = await this.featureFlagRepository.findOne({
      where: { tenantId, feature },
    });
    return flag?.enabled || false;
  }

  /**
   * Set the PostgreSQL RLS session variable for a tenant.
   * Called by TenantMiddleware before each request.
   */
  async setRlsContext(tenantId: string, isSuperAdmin: boolean): Promise<void> {
    if (isSuperAdmin) {
      await this.dataSource.query(
        `SELECT set_config('app.bypass_rls', 'true', true)`,
      );
    } else {
      await this.dataSource.query(
        `SELECT set_config('app.current_tenant_id', $1, true)`,
        [tenantId],
      );
      await this.dataSource.query(
        `SELECT set_config('app.bypass_rls', 'false', true)`,
      );
    }
  }
}
