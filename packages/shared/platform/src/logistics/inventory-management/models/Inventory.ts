/**
 * Inventory Model
 * 
 * Database model for Inventory entity
 * Implements multi-tenant isolation with row-level security
 */

import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  Index,
  Check
} from 'typeorm';
import { Currency, ValuationMethod } from '../types';

@Entity('inventory')
@Index(['tenant_id', 'sku', 'location_id'], { unique: true })
@Index(['tenant_id', 'location_id'])
@Index(['tenant_id', 'sku'])
@Index(['tenant_id', 'last_movement_date'])
@Check('"on_hand" >= 0')
@Check('"available" >= 0')
@Check('"reserved" >= 0')
@Check('"allocated" >= 0')
@Check('"committed" >= 0')
@Check('"on_hand" = "available" + "reserved" + "allocated" + "committed"')
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  tenant_id!: string;

  @Column({ type: 'varchar', length: 100 })
  sku!: string;

  @Column('uuid')
  product_id!: string;

  @Column('uuid')
  location_id!: string;

  @Column({ type: 'integer', default: 0 })
  on_hand!: number;

  @Column({ type: 'integer', default: 0 })
  available!: number;

  @Column({ type: 'integer', default: 0 })
  reserved!: number;

  @Column({ type: 'integer', default: 0 })
  allocated!: number;

  @Column({ type: 'integer', default: 0 })
  committed!: number;

  @Column({ type: 'integer', nullable: true })
  reorder_point?: number;

  @Column({ type: 'integer', nullable: true })
  safety_stock?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  unit_cost?: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  total_value?: number;

  @Column({ type: 'varchar', length: 3, default: 'NGN' })
  currency!: Currency;

  @Column({ type: 'varchar', length: 20, default: 'fifo' })
  valuation_method!: ValuationMethod;

  @Column({ type: 'uuid', nullable: true })
  last_movement_id?: string;

  @Column({ type: 'timestamp', nullable: true })
  last_movement_date?: Date;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Calculated field: check if stock is low
  isLowStock(): boolean {
    if (!this.reorder_point) return false;
    return this.available <= this.reorder_point;
  }

  // Calculated field: check if stock is out
  isOutOfStock(): boolean {
    return this.available === 0;
  }

  // Calculate available stock
  calculateAvailable(): number {
    return this.on_hand - this.reserved - this.allocated - this.committed;
  }

  // Validate stock level balance
  validateBalance(): boolean {
    return this.on_hand === (this.available + this.reserved + this.allocated + this.committed);
  }
}
