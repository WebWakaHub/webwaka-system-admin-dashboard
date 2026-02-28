/**
 * Stock Movement Item Model
 * 
 * Database model for Stock Movement Item entity (line items)
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  Check
} from 'typeorm';
import { StockMovement } from './StockMovement';

@Entity('stock_movement_items')
@Index(['tenant_id', 'movement_id'])
@Index(['tenant_id', 'sku'])
@Index(['tenant_id', 'batch_number'])
@Index(['tenant_id', 'serial_number'])
@Check('"quantity" > 0')
export class StockMovementItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  tenant_id!: string;

  @Column('uuid')
  movement_id!: string;

  @Column({ type: 'varchar', length: 100 })
  sku!: string;

  @Column('uuid')
  product_id!: string;

  @Column({ type: 'integer' })
  quantity!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  unit_cost?: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  total_cost?: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  batch_number?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  serial_number?: string;

  @Column({ type: 'date', nullable: true })
  expiry_date?: Date;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @ManyToOne(() => StockMovement, movement => movement.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'movement_id' })
  movement!: StockMovement;

  // Calculate total cost
  calculateTotalCost(): number {
    if (!this.unit_cost) return 0;
    return this.quantity * this.unit_cost;
  }

  // Check if item has batch tracking
  hasBatchTracking(): boolean {
    return !!this.batch_number;
  }

  // Check if item has serial tracking
  hasSerialTracking(): boolean {
    return !!this.serial_number;
  }

  // Check if item is expiring soon (within 30 days)
  isExpiringSoon(): boolean {
    if (!this.expiry_date) return false;
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    return this.expiry_date <= thirtyDaysFromNow;
  }

  // Check if item is expired
  isExpired(): boolean {
    if (!this.expiry_date) return false;
    return this.expiry_date < new Date();
  }
}
