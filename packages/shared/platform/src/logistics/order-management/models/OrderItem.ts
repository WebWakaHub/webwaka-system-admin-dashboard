/**
 * OrderItem Entity Model
 * 
 * Represents individual line items within an order.
 * Links to inventory reservations for stock management.
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm';
import { Order } from './Order';

@Entity('order_items')
@Index(['order_id'])
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  order_id: string;

  @ManyToOne(() => Order, order => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ length: 100 })
  @Index()
  sku: string;

  @Column({ type: 'uuid' })
  product_id: string;

  @Column({ type: 'integer' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unit_price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_price: number;

  @Column({ type: 'uuid', nullable: true })
  inventory_reservation_id?: string;

  // Business logic methods

  /**
   * Calculate total price from quantity and unit price
   */
  calculateTotalPrice(): void {
    this.total_price = Number(this.quantity) * Number(this.unit_price);
  }

  /**
   * Validate quantity is positive
   */
  validateQuantity(): void {
    if (this.quantity <= 0) {
      throw new Error('Quantity must be greater than zero');
    }
  }

  /**
   * Validate unit price is positive
   */
  validateUnitPrice(): void {
    if (this.unit_price <= 0) {
      throw new Error('Unit price must be greater than zero');
    }
  }

  /**
   * Validate the order item
   */
  validate(): void {
    this.validateQuantity();
    this.validateUnitPrice();
    this.calculateTotalPrice();
  }
}
