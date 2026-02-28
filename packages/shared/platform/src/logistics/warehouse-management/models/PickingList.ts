/**
 * PickingList Entity
 * 
 * Represents a picking list for warehouse staff to pick items for orders.
 */

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { PickingType, PickingStatus } from '../types';
import { PickingListItem } from './PickingListItem';

@Entity('picking_lists')
export class PickingList {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  tenant_id: string;

  @Column('uuid')
  warehouse_id: string;

  @Column({ unique: true })
  picking_list_number: string;

  @Column('simple-array')
  order_ids: string[];

  @Column('uuid', { nullable: true })
  assigned_to: string;

  @Column({
    type: 'enum',
    enum: PickingType,
    default: PickingType.DISCRETE
  })
  picking_type: PickingType;

  @Column({
    type: 'enum',
    enum: PickingStatus,
    default: PickingStatus.PENDING
  })
  status: PickingStatus;

  @Column('int', { default: 3 })
  priority: number;

  @OneToMany(() => PickingListItem, item => item.picking_list, { cascade: true })
  items: PickingListItem[];

  @Column({ type: 'timestamp', nullable: true })
  started_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Business logic methods
  canStart(): boolean {
    return this.status === PickingStatus.PENDING;
  }

  canComplete(): boolean {
    return this.status === PickingStatus.IN_PROGRESS;
  }

  start(staff_id: string): void {
    if (!this.canStart()) {
      throw new Error(`Cannot start picking list in status ${this.status}`);
    }
    this.status = PickingStatus.IN_PROGRESS;
    this.assigned_to = staff_id;
    this.started_at = new Date();
  }

  complete(): void {
    if (!this.canComplete()) {
      throw new Error(`Cannot complete picking list in status ${this.status}`);
    }
    
    // Check if all items are picked
    const allPicked = this.items.every(item => 
      item.status === 'picked' || item.status === 'not_found'
    );
    
    if (!allPicked) {
      throw new Error('Cannot complete picking list with pending items');
    }

    this.status = PickingStatus.COMPLETED;
    this.completed_at = new Date();
  }

  cancel(): void {
    if (this.status === PickingStatus.COMPLETED) {
      throw new Error('Cannot cancel completed picking list');
    }
    this.status = PickingStatus.CANCELLED;
  }

  getProgress(): { total: number; picked: number; percentage: number } {
    const total = this.items.length;
    const picked = this.items.filter(item => item.status === 'picked').length;
    const percentage = total > 0 ? (picked / total) * 100 : 0;
    return { total, picked, percentage };
  }
}
