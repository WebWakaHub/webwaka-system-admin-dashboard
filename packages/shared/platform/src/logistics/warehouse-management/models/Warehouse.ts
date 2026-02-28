/**
 * Warehouse Entity
 * 
 * Represents a physical warehouse location.
 */

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { WarehouseStatus, Address, OperatingHours } from '../types';
import { WarehouseLocation } from './WarehouseLocation';

@Entity('warehouses')
export class Warehouse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  tenant_id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column('jsonb')
  address: Address;

  @Column()
  contact_phone: string;

  @Column()
  contact_email: string;

  @Column({
    type: 'enum',
    enum: WarehouseStatus,
    default: WarehouseStatus.ACTIVE
  })
  status: WarehouseStatus;

  @Column('decimal', { precision: 10, scale: 2 })
  capacity_sqm: number;

  @Column('jsonb', { nullable: true })
  operating_hours: OperatingHours;

  @OneToMany(() => WarehouseLocation, location => location.warehouse)
  locations: WarehouseLocation[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Business logic methods
  isActive(): boolean {
    return this.status === WarehouseStatus.ACTIVE;
  }

  canAcceptOrders(): boolean {
    return this.status === WarehouseStatus.ACTIVE;
  }

  activate(): void {
    this.status = WarehouseStatus.ACTIVE;
  }

  deactivate(): void {
    this.status = WarehouseStatus.INACTIVE;
  }

  setMaintenance(): void {
    this.status = WarehouseStatus.MAINTENANCE;
  }
}
