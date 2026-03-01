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
 * Tenant Config Entity
 *
 * Stores per-tenant configuration as key-value pairs.
 * Provides configuration isolation between tenants.
 *
 * Examples:
 * - key: 'payment.gateway', value: 'paystack'
 * - key: 'notifications.sms.provider', value: 'termii'
 * - key: 'branding.primary_color', value: '#FF6B35'
 * - key: 'limits.max_products', value: '500'
 *
 * RLS: All queries are scoped to the current tenant.
 * Offline-First: Config values are cacheable on the client.
 */
@Entity('tenant_configs')
@Index(['tenantId', 'key'], { unique: true })
export class TenantConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  /**
   * Configuration key in dot-notation namespace.
   * e.g., 'payment.gateway', 'notifications.sms.provider'
   */
  @Column({ type: 'varchar', length: 255 })
  key: string;

  /**
   * Configuration value (stored as text, parsed by consumers).
   */
  @Column({ type: 'text' })
  value: string;

  /**
   * Whether this config is sensitive (e.g., API keys).
   * Sensitive configs are masked in API responses.
   */
  @Column({ type: 'boolean', default: false })
  isSensitive: boolean;

  /**
   * Description of the config key for documentation.
   */
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Tenant, (tenant) => tenant.configs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;
}
