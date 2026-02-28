/**
 * TrackingEvent Entity
 * 
 * Represents a tracking event for a shipment.
 */

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TrackingEventType } from '../types';
import { Shipment } from './Shipment';

@Entity('tracking_events')
export class TrackingEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  tenant_id: string;

  @Column('uuid')
  shipment_id: string;

  @Column()
  tracking_number: string;

  @Column({
    type: 'enum',
    enum: TrackingEventType
  })
  event_type: TrackingEventType;

  @Column('text')
  event_description: string;

  @Column()
  event_location: string;

  @Column('timestamp')
  event_timestamp: Date;

  @Column({ nullable: true })
  carrier_event_code: string;

  @ManyToOne(() => Shipment, shipment => shipment.tracking_events)
  @JoinColumn({ name: 'shipment_id' })
  shipment: Shipment;

  @CreateDateColumn()
  created_at: Date;
}
