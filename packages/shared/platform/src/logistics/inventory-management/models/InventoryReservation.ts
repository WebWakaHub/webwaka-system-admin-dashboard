/**
 * Inventory Reservation Model
 * 
 * Database model for time-limited inventory reservations
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
import { ReservationStatus } from '../types';

@Entity('inventory_reservations')
@Index(['tenant_id', 'order_id'])
@Index(['tenant_id', 'location_id', 'sku'])
@Index(['tenant_id', 'reservation_expires_at'])
@Index(['tenant_id', 'status'])
@Check('"quantity" > 0')
export class InventoryReservation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  tenant_id!: string;

  @Column('uuid')
  order_id!: string;

  @Column({ type: 'varchar', length: 100 })
  sku!: string;

  @Column('uuid')
  product_id!: string;

  @Column('uuid')
  location_id!: string;

  @Column({ type: 'integer' })
  quantity!: number;

  @Column({ type: 'timestamp' })
  reservation_expires_at!: Date;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status!: ReservationStatus;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Check if reservation is active
  isActive(): boolean {
    return this.status === 'active' && !this.isExpired();
  }

  // Check if reservation is expired
  isExpired(): boolean {
    return new Date() > this.reservation_expires_at;
  }

  // Check if reservation can be released
  canRelease(): boolean {
    return this.status === 'active';
  }

  // Check if reservation can be allocated
  canAllocate(): boolean {
    return this.status === 'active' && !this.isExpired();
  }

  // Get remaining time in minutes
  getRemainingMinutes(): number {
    const now = new Date();
    const remaining = this.reservation_expires_at.getTime() - now.getTime();
    return Math.max(0, Math.floor(remaining / (60 * 1000)));
  }
}
