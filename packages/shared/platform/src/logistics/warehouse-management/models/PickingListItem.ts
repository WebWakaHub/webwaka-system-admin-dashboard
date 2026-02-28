/**
 * PickingListItem Entity
 * 
 * Represents an individual item to be picked in a picking list.
 */

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PickingItemStatus } from '../types';
import { PickingList } from './PickingList';

@Entity('picking_list_items')
export class PickingListItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  picking_list_id: string;

  @Column('uuid')
  order_id: string;

  @Column('uuid')
  order_item_id: string;

  @Column()
  sku: string;

  @Column('uuid')
  product_id: string;

  @Column()
  product_name: string;

  @Column()
  location_code: string;

  @Column('int')
  quantity_requested: number;

  @Column('int', { default: 0 })
  quantity_picked: number;

  @Column({
    type: 'enum',
    enum: PickingItemStatus,
    default: PickingItemStatus.PENDING
  })
  status: PickingItemStatus;

  @Column({ type: 'timestamp', nullable: true })
  picked_at: Date;

  @Column('text', { nullable: true })
  notes: string;

  @ManyToOne(() => PickingList, pickingList => pickingList.items)
  @JoinColumn({ name: 'picking_list_id' })
  picking_list: PickingList;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Business logic methods
  pick(quantity: number, notes?: string): void {
    if (this.status !== PickingItemStatus.PENDING) {
      throw new Error(`Cannot pick item in status ${this.status}`);
    }

    this.quantity_picked = quantity;
    this.notes = notes;
    this.picked_at = new Date();

    if (quantity === this.quantity_requested) {
      this.status = PickingItemStatus.PICKED;
    } else {
      this.status = PickingItemStatus.QUANTITY_MISMATCH;
    }
  }

  markNotFound(notes?: string): void {
    this.status = PickingItemStatus.NOT_FOUND;
    this.notes = notes;
    this.picked_at = new Date();
  }

  markDamaged(notes?: string): void {
    this.status = PickingItemStatus.DAMAGED;
    this.notes = notes;
    this.picked_at = new Date();
  }
}
