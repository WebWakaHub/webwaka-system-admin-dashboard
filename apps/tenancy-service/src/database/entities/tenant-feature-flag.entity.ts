import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Tenant } from './tenant.entity';

/**
 * Tenant Feature Flag Entity
 *
 * Controls which business domains and features are enabled
 * for a specific tenant. This is the feature gate system.
 *
 * Examples:
 * - feature: 'domain.ecommerce', enabled: true
 * - feature: 'domain.logistics', enabled: false
 * - feature: 'ai.vendor_neutral', enabled: true
 * - feature: 'payments.paystack', enabled: true
 * - feature: 'payments.flutterwave', enabled: false
 *
 * Offline-First: Feature flags are cached on the client for
 * offline feature availability decisions.
 */
@Entity('tenant_feature_flags')
@Index(['tenantId', 'feature'], { unique: true })
export class TenantFeatureFlag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  /**
   * Feature identifier in dot-notation namespace.
   * e.g., 'domain.ecommerce', 'ai.vendor_neutral'
   */
  @Column({ type: 'varchar', length: 255 })
  feature: string;

  /**
   * Whether the feature is enabled for this tenant.
   */
  @Column({ type: 'boolean', default: false })
  enabled: boolean;

  /**
   * Optional metadata for the feature flag.
   * e.g., rollout percentage, A/B test variant
   */
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  /**
   * When this feature was enabled/disabled.
   */
  @Column({ type: 'timestamp', nullable: true })
  toggledAt: Date | null;

  /**
   * Who toggled this feature (user ID).
   */
  @Column({ type: 'uuid', nullable: true })
  toggledBy: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Tenant, (tenant) => tenant.featureFlags, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;
}
