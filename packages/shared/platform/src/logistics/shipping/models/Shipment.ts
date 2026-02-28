/**
 * Shipment Entity
 * 
 * Represents a shipment for an order.
 */

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ShipmentStatus, ServiceType, Address, PackageDetails } from '../types';
import { TrackingEvent } from './TrackingEvent';

@Entity('shipments')
export class Shipment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  tenant_id: string;

  @Column('uuid')
  order_id: string;

  @Column({ unique: true })
  shipment_number: string;

  @Column('uuid')
  carrier_id: string;

  @Column()
  carrier_code: string;

  @Column()
  service_type: ServiceType;

  @Column({ nullable: true })
  tracking_number: string;

  @Column({
    type: 'enum',
    enum: ShipmentStatus,
    default: ShipmentStatus.PENDING
  })
  status: ShipmentStatus;

  @Column('jsonb')
  from_address: Address;

  @Column('jsonb')
  to_address: Address;

  @Column('jsonb')
  packages: PackageDetails[];

  @Column('decimal', { precision: 10, scale: 2 })
  total_weight_kg: number;

  @Column('decimal', { precision: 10, scale: 2 })
  total_declared_value: number;

  @Column('decimal', { precision: 10, scale: 2 })
  shipping_cost: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  insurance_cost: number;

  @Column('decimal', { precision: 10, scale: 2 })
  total_cost: number;

  @Column('text', { nullable: true })
  label_url: string;

  @Column('text', { nullable: true })
  commercial_invoice_url: string;

  @Column('text', { nullable: true })
  special_instructions: string;

  @Column({ type: 'timestamp', nullable: true })
  scheduled_pickup_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  shipped_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  estimated_delivery_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  delivered_at: Date;

  @Column('text', { nullable: true })
  delivery_signature: string;

  @OneToMany(() => TrackingEvent, event => event.shipment)
  tracking_events: TrackingEvent[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Business logic methods
  isPending(): boolean {
    return this.status === ShipmentStatus.PENDING;
  }

  canGenerateLabel(): boolean {
    return this.status === ShipmentStatus.PENDING;
  }

  canCancel(): boolean {
    return this.status === ShipmentStatus.PENDING || 
           this.status === ShipmentStatus.LABEL_GENERATED ||
           this.status === ShipmentStatus.READY_FOR_PICKUP;
  }

  isDelivered(): boolean {
    return this.status === ShipmentStatus.DELIVERED;
  }

  generateLabel(label_url: string, tracking_number: string): void {
    if (!this.canGenerateLabel()) {
      throw new Error(`Cannot generate label for shipment in status ${this.status}`);
    }
    this.label_url = label_url;
    this.tracking_number = tracking_number;
    this.status = ShipmentStatus.LABEL_GENERATED;
  }

  markShipped(): void {
    if (this.status !== ShipmentStatus.LABEL_GENERATED && 
        this.status !== ShipmentStatus.READY_FOR_PICKUP) {
      throw new Error(`Cannot mark shipment as shipped from status ${this.status}`);
    }
    this.status = ShipmentStatus.IN_TRANSIT;
    this.shipped_at = new Date();
  }

  markDelivered(signature?: string): void {
    if (this.status !== ShipmentStatus.OUT_FOR_DELIVERY && 
        this.status !== ShipmentStatus.IN_TRANSIT) {
      throw new Error(`Cannot mark shipment as delivered from status ${this.status}`);
    }
    this.status = ShipmentStatus.DELIVERED;
    this.delivered_at = new Date();
    if (signature) {
      this.delivery_signature = signature;
    }
  }

  cancel(): void {
    if (!this.canCancel()) {
      throw new Error(`Cannot cancel shipment in status ${this.status}`);
    }
    this.status = ShipmentStatus.CANCELLED;
  }

  calculateTotalCost(): void {
    this.total_cost = this.shipping_cost + this.insurance_cost;
  }
}
