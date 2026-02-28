/**
 * Inventory Alert Model
 * 
 * Database model for inventory alerts (low stock, expiry, etc.)
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index
} from 'typeorm';
import { AlertType, AlertSeverity, AlertStatus } from '../types';

@Entity('inventory_alerts')
@Index(['tenant_id', 'alert_type', 'status'])
@Index(['tenant_id', 'location_id', 'status'])
@Index(['tenant_id', 'sku', 'status'])
@Index(['tenant_id', 'severity', 'status'])
export class InventoryAlert {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  tenant_id!: string;

  @Column({ type: 'varchar', length: 20 })
  alert_type!: AlertType;

  @Column({ type: 'varchar', length: 100 })
  sku!: string;

  @Column('uuid')
  product_id!: string;

  @Column('uuid')
  location_id!: string;

  @Column({ type: 'integer', nullable: true })
  current_stock?: number;

  @Column({ type: 'integer', nullable: true })
  reorder_point?: number;

  @Column({ type: 'date', nullable: true })
  expiry_date?: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  batch_number?: string;

  @Column({ type: 'varchar', length: 20 })
  severity!: AlertSeverity;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status!: AlertStatus;

  @Column({ type: 'uuid', nullable: true })
  acknowledged_by?: string;

  @Column({ type: 'timestamp', nullable: true })
  acknowledged_at?: Date;

  @Column({ type: 'timestamp', nullable: true })
  resolved_at?: Date;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Check if alert is active
  isActive(): boolean {
    return this.status === 'active';
  }

  // Check if alert is acknowledged
  isAcknowledged(): boolean {
    return this.status === 'acknowledged';
  }

  // Check if alert is resolved
  isResolved(): boolean {
    return this.status === 'resolved';
  }

  // Check if alert is critical
  isCritical(): boolean {
    return this.severity === 'critical';
  }

  // Get alert age in hours
  getAgeInHours(): number {
    const now = new Date();
    const age = now.getTime() - this.created_at.getTime();
    return Math.floor(age / (60 * 60 * 1000));
  }

  // Check if alert needs escalation (>24 hours unacknowledged)
  needsEscalation(): boolean {
    return this.isActive() && this.getAgeInHours() > 24;
  }
}
