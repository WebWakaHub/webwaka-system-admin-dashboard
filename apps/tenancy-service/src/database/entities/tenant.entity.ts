import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { TenantStatus, TenantPlan } from '../../common/enums/tenant-status.enum';
import { TenantConfig } from './tenant-config.entity';
import { TenantFeatureFlag } from './tenant-feature-flag.entity';

/**
 * Tenant Entity
 *
 * Represents a tenant in the multi-tenant WebWaka platform.
 * A tenant is the top-level isolation boundary — all data
 * belonging to a tenant is scoped by tenantId.
 *
 * RLS Policy: PostgreSQL Row-Level Security is enforced via
 * the current_setting('app.current_tenant_id') session variable.
 * All tenant-scoped tables have RLS policies that filter by tenantId.
 *
 * Nigeria-First: Default locale en-NG, timezone Africa/Lagos, currency NGN.
 * Offline-First: syncStatus tracks client-side sync state.
 */
@Entity('tenants')
@Index(['slug'], { unique: true })
@Index(['partnerId'])
@Index(['status'])
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Human-readable name of the tenant (e.g., "Dangote Industries")
   */
  @Column({ type: 'varchar', length: 255 })
  name: string;

  /**
   * URL-safe slug for the tenant (e.g., "dangote-industries")
   * Used for subdomain routing and API identification.
   */
  @Column({ type: 'varchar', length: 100, unique: true })
  slug: string;

  /**
   * The partner who owns this tenant.
   * Partners are the B2B customers of WebWaka.
   */
  @Column({ type: 'uuid', nullable: true })
  partnerId: string | null;

  /**
   * Current lifecycle status of the tenant.
   */
  @Column({
    type: 'enum',
    enum: TenantStatus,
    default: TenantStatus.PENDING,
  })
  status: TenantStatus;

  /**
   * Subscription plan tier.
   */
  @Column({
    type: 'enum',
    enum: TenantPlan,
    default: TenantPlan.STARTER,
  })
  plan: TenantPlan;

  /**
   * Tenant's primary contact email.
   */
  @Column({ type: 'varchar', length: 255 })
  contactEmail: string;

  /**
   * Tenant's primary contact phone (Nigeria-First: +234 format).
   */
  @Column({ type: 'varchar', length: 20, nullable: true })
  contactPhone: string | null;

  /**
   * Tenant's country code (ISO 3166-1 alpha-2).
   * Nigeria-First: Default 'NG'.
   */
  @Column({ type: 'varchar', length: 2, default: 'NG' })
  countryCode: string;

  /**
   * Tenant's default locale.
   * Nigeria-First: Default 'en-NG'.
   */
  @Column({ type: 'varchar', length: 10, default: 'en-NG' })
  locale: string;

  /**
   * Tenant's default timezone.
   * Nigeria-First: Default 'Africa/Lagos'.
   */
  @Column({ type: 'varchar', length: 50, default: 'Africa/Lagos' })
  timezone: string;

  /**
   * Tenant's default currency.
   * Nigeria-First: Default 'NGN'.
   */
  @Column({ type: 'varchar', length: 3, default: 'NGN' })
  currency: string;

  /**
   * Branding configuration (logo URL, primary color, etc.)
   * Stored as JSONB for flexibility.
   */
  @Column({ type: 'jsonb', nullable: true })
  branding: Record<string, any> | null;

  /**
   * Maximum number of users allowed for this tenant.
   * Enforced at the application layer.
   */
  @Column({ type: 'int', default: 10 })
  maxUsers: number;

  /**
   * Maximum storage allowed in MB.
   */
  @Column({ type: 'int', default: 1024 })
  maxStorageMb: number;

  /**
   * Whether onboarding has been completed.
   */
  @Column({ type: 'boolean', default: false })
  onboardingCompleted: boolean;

  /**
   * When the tenant was activated (first went ACTIVE).
   */
  @Column({ type: 'timestamp', nullable: true })
  activatedAt: Date | null;

  /**
   * When the tenant was suspended (if applicable).
   */
  @Column({ type: 'timestamp', nullable: true })
  suspendedAt: Date | null;

  /**
   * Reason for suspension (if applicable).
   */
  @Column({ type: 'text', nullable: true })
  suspensionReason: string | null;

  /**
   * When the tenant was terminated (if applicable).
   */
  @Column({ type: 'timestamp', nullable: true })
  terminatedAt: Date | null;

  /**
   * Offline-First: Client-side sync status.
   */
  @Column({
    type: 'enum',
    enum: ['synced', 'pending', 'conflict'],
    default: 'synced',
  })
  syncStatus: 'synced' | 'pending' | 'conflict';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => TenantConfig, (config) => config.tenant, { cascade: true })
  configs: TenantConfig[];

  @OneToMany(() => TenantFeatureFlag, (flag) => flag.tenant, { cascade: true })
  featureFlags: TenantFeatureFlag[];
}
