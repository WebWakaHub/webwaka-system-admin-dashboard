/**
 * Order Entity Model
 * 
 * Represents an order in the system with multi-tenant isolation.
 * Includes order lifecycle management and business logic.
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index
} from 'typeorm';
import { OrderItem } from './OrderItem';
import { OrderStatus, PaymentStatus, Address } from '../types';

@Entity('orders')
@Index(['tenant_id', 'order_number'], { unique: true })
@Index(['tenant_id', 'customer_id'])
@Index(['tenant_id', 'status'])
@Index(['tenant_id', 'order_date'])
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  tenant_id: string;

  @Column({ length: 50 })
  order_number: string;

  @Column({ type: 'uuid' })
  @Index()
  customer_id: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  order_date: Date;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING
  })
  status: OrderStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tax: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  shipping_cost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total: number;

  @Column({ length: 3, default: 'NGN' })
  currency: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING
  })
  payment_status: PaymentStatus;

  @Column({ type: 'jsonb' })
  shipping_address: Address;

  @Column({ type: 'jsonb', nullable: true })
  billing_address?: Address;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @OneToMany(() => OrderItem, item => item.order, { cascade: true })
  items: OrderItem[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Business logic methods

  /**
   * Calculate order totals from items
   */
  calculateTotals(): void {
    if (!this.items || this.items.length === 0) {
      this.subtotal = 0;
      this.total = 0;
      return;
    }

    this.subtotal = this.items.reduce((sum, item) => {
      return sum + Number(item.total_price);
    }, 0);

    this.total = Number(this.subtotal) + Number(this.tax) + Number(this.shipping_cost);
  }

  /**
   * Check if order can be confirmed
   */
  canConfirm(): boolean {
    return this.status === OrderStatus.PENDING;
  }

  /**
   * Check if order can be cancelled
   */
  canCancel(): boolean {
    return [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PROCESSING].includes(this.status);
  }

  /**
   * Check if order can be shipped
   */
  canShip(): boolean {
    return [OrderStatus.CONFIRMED, OrderStatus.PROCESSING].includes(this.status);
  }

  /**
   * Check if order can be delivered
   */
  canDeliver(): boolean {
    return this.status === OrderStatus.SHIPPED;
  }

  /**
   * Confirm the order
   */
  confirm(): void {
    if (!this.canConfirm()) {
      throw new Error(`Cannot confirm order in status: ${this.status}`);
    }
    this.status = OrderStatus.CONFIRMED;
    this.payment_status = PaymentStatus.PAID;
  }

  /**
   * Cancel the order
   */
  cancel(): void {
    if (!this.canCancel()) {
      throw new Error(`Cannot cancel order in status: ${this.status}`);
    }
    this.status = OrderStatus.CANCELLED;
  }

  /**
   * Mark order as shipped
   */
  ship(): void {
    if (!this.canShip()) {
      throw new Error(`Cannot ship order in status: ${this.status}`);
    }
    this.status = OrderStatus.SHIPPED;
  }

  /**
   * Mark order as delivered
   */
  deliver(): void {
    if (!this.canDeliver()) {
      throw new Error(`Cannot deliver order in status: ${this.status}`);
    }
    this.status = OrderStatus.DELIVERED;
  }

  /**
   * Start processing the order
   */
  startProcessing(): void {
    if (this.status !== OrderStatus.CONFIRMED) {
      throw new Error(`Cannot start processing order in status: ${this.status}`);
    }
    this.status = OrderStatus.PROCESSING;
  }
}
