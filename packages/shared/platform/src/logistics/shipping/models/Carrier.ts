/**
 * Carrier Entity
 * 
 * Represents a shipping carrier configuration.
 */

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { CarrierCode, CarrierStatus, ServiceType } from '../types';

@Entity('carriers')
export class Carrier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  tenant_id: string;

  @Column({
    type: 'enum',
    enum: CarrierCode
  })
  carrier_code: CarrierCode;

  @Column()
  carrier_name: string;

  @Column()
  account_number: string;

  @Column('jsonb')
  api_credentials: Record<string, any>;

  @Column({
    type: 'enum',
    enum: CarrierStatus,
    default: CarrierStatus.ACTIVE
  })
  status: CarrierStatus;

  @Column('simple-array')
  supported_services: ServiceType[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Business logic methods
  isActive(): boolean {
    return this.status === CarrierStatus.ACTIVE;
  }

  supportsService(service_type: ServiceType): boolean {
    return this.supported_services.includes(service_type);
  }

  activate(): void {
    this.status = CarrierStatus.ACTIVE;
  }

  deactivate(): void {
    this.status = CarrierStatus.INACTIVE;
  }

  suspend(): void {
    this.status = CarrierStatus.SUSPENDED;
  }
}
