/**
 * Stock Movement Model
 * 
 * Database model for Stock Movement entity
 * Implements immutable event log for audit trail
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany
} from 'typeorm';
import { MovementType, MovementStatus, ApprovalStatus, Currency } from '../types';
import { StockMovementItem } from './StockMovementItem';

@Entity('stock_movements')
@Index(['tenant_id', 'movement_date'])
@Index(['tenant_id', 'movement_type'])
@Index(['tenant_id', 'reference_number'])
@Index(['tenant_id', 'from_location_id'])
@Index(['tenant_id', 'to_location_id'])
export class StockMovement {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  tenant_id!: string;

  @Column({ type: 'varchar', length: 20 })
  movement_type!: MovementType;

  @Column({ type: 'varchar', length: 100, nullable: true })
  reference_number?: string;

  @Column({ type: 'uuid', nullable: true })
  from_location_id?: string;

  @Column({ type: 'uuid', nullable: true })
  to_location_id?: string;

  @Column({ type: 'timestamp' })
  movement_date!: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reason?: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status!: MovementStatus;

  @Column({ type: 'boolean', default: false })
  approval_required!: boolean;

  @Column({ type: 'varchar', length: 20, nullable: true })
  approval_status?: ApprovalStatus;

  @Column({ type: 'uuid', nullable: true })
  approved_by?: string;

  @Column({ type: 'timestamp', nullable: true })
  approved_at?: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  total_value?: number;

  @Column({ type: 'varchar', length: 3, default: 'NGN' })
  currency!: Currency;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column('uuid')
  created_by!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @OneToMany(() => StockMovementItem, item => item.movement, { cascade: true })
  items!: StockMovementItem[];

  // Check if movement is approved
  isApproved(): boolean {
    return this.approval_status === 'approved';
  }

  // Check if movement is pending approval
  isPendingApproval(): boolean {
    return this.approval_required && this.approval_status === 'pending';
  }

  // Check if movement is completed
  isCompleted(): boolean {
    return this.status === 'completed';
  }
}
