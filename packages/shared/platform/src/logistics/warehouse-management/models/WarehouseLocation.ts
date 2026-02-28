/**
 * WarehouseLocation Entity
 * 
 * Represents a specific location within a warehouse (zone, aisle, rack, shelf, bin).
 */

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { LocationType, LocationStatus } from '../types';
import { Warehouse } from './Warehouse';

@Entity('warehouse_locations')
export class WarehouseLocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  tenant_id: string;

  @Column('uuid')
  warehouse_id: string;

  @Column({ unique: true })
  location_code: string;

  @Column()
  zone: string;

  @Column()
  aisle: string;

  @Column()
  rack: string;

  @Column()
  shelf: string;

  @Column()
  bin: string;

  @Column({
    type: 'enum',
    enum: LocationType,
    default: LocationType.BIN
  })
  location_type: LocationType;

  @Column('int')
  capacity_units: number;

  @Column('int', { default: 0 })
  current_units: number;

  @Column({
    type: 'enum',
    enum: LocationStatus,
    default: LocationStatus.AVAILABLE
  })
  status: LocationStatus;

  @ManyToOne(() => Warehouse, warehouse => warehouse.locations)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Business logic methods
  isAvailable(): boolean {
    return this.status === LocationStatus.AVAILABLE && this.current_units < this.capacity_units;
  }

  hasCapacity(units: number): boolean {
    return (this.current_units + units) <= this.capacity_units;
  }

  addUnits(units: number): void {
    if (!this.hasCapacity(units)) {
      throw new Error(`Location ${this.location_code} does not have capacity for ${units} units`);
    }
    this.current_units += units;
    if (this.current_units >= this.capacity_units) {
      this.status = LocationStatus.OCCUPIED;
    }
  }

  removeUnits(units: number): void {
    if (this.current_units < units) {
      throw new Error(`Location ${this.location_code} does not have ${units} units to remove`);
    }
    this.current_units -= units;
    if (this.current_units < this.capacity_units && this.status === LocationStatus.OCCUPIED) {
      this.status = LocationStatus.AVAILABLE;
    }
  }

  reserve(): void {
    this.status = LocationStatus.RESERVED;
  }

  markDamaged(): void {
    this.status = LocationStatus.DAMAGED;
  }

  makeAvailable(): void {
    if (this.current_units < this.capacity_units) {
      this.status = LocationStatus.AVAILABLE;
    }
  }
}
