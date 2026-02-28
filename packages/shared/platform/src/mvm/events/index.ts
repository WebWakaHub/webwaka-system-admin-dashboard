/**
 * MVM Event Handlers
 * Event-driven integration for multi-vendor management
 */

import { EventEmitter } from 'events';
import { OrderService, CommissionService, PayoutService } from '../services';
import { createOrderItem, createCommission, createPayout, OrderItem } from '../models';

export interface OrderPlacedEvent {
  type: 'platform.order.created';
  orderId: string;
  customerId: string;
  items: Array<{
    productId: string;
    vendorId: string;
    quantity: number;
    unitPrice: number;
  }>;
  totalAmount: number;
  currency: string;
}

export interface OrderProcessedEvent {
  type: 'mvm.order.processed';
  orderId: string;
  vendorId: string;
  commissionAmount: number;
  vendorEarnings: number;
}

export class MVMEventHandler extends EventEmitter {
  constructor(
    private orderService: OrderService,
    private commissionService: CommissionService,
    private payoutService: PayoutService,
    private commissionRate: number = 0.1 // 10% default commission rate
  ) {
    super();
  }

  /**
   * Handle order.created event from the event bus
   * Creates order items for each vendor and calculates commissions
   */
  handleOrderCreated(event: OrderPlacedEvent): void {
    try {
      // Group items by vendor
      const itemsByVendor = new Map<string, typeof event.items>();
      event.items.forEach(item => {
        if (!itemsByVendor.has(item.vendorId)) {
          itemsByVendor.set(item.vendorId, []);
        }
        itemsByVendor.get(item.vendorId)!.push(item);
      });

      // Process each vendor's items
      itemsByVendor.forEach((items, vendorId) => {
        let vendorTotal = 0;

        items.forEach(item => {
          const subtotal = item.quantity * item.unitPrice;
          vendorTotal += subtotal;

          // Create order item
          const orderItem = createOrderItem({
            order_id: event.orderId,
            vendor_id: vendorId,
            product_id: item.productId,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            subtotal,
            status: 'pending',
          });

          this.orderService.addOrderItem(orderItem);

          // Calculate commission
          const commission = this.commissionService.calculateCommission(orderItem, this.commissionRate);

          // Emit order processed event
          this.emit('order.processed', {
            type: 'mvm.order.processed',
            orderId: event.orderId,
            vendorId,
            commissionAmount: commission.amount,
            vendorEarnings: subtotal - commission.amount,
          } as OrderProcessedEvent);
        });
      });
    } catch (error) {
      console.error('Error handling order.created event:', error);
      throw error;
    }
  }

  /**
   * Handle order status update
   * Publishes order status change events
   */
  handleOrderStatusUpdate(orderId: string, orderItemId: string, newStatus: string): void {
    try {
      const orderItem = this.orderService.updateOrderItemStatus(orderItemId, newStatus);
      
      // Emit order status updated event
      this.emit('order.status.updated', {
        type: 'mvm.order.status.updated',
        orderId,
        orderItemId,
        vendorId: orderItem.vendor_id,
        status: newStatus,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  /**
   * Handle payout cycle
   * Creates payout records for vendors based on their earnings
   */
  handlePayoutCycle(vendorId: string): void {
    try {
      const commissions = this.commissionService.getVendorCommissions(vendorId);
      
      if (commissions.length === 0) {
        console.log(`No commissions found for vendor ${vendorId}`);
        return;
      }

      // Calculate total vendor earnings
      const totalEarnings = commissions.reduce((sum, c) => sum + (c.amount * (1 - this.commissionRate)), 0);

      if (totalEarnings > 0) {
        // Create payout record
        const payout = createPayout({
          vendor_id: vendorId,
          amount: Math.round(totalEarnings),
          status: 'pending',
        });

        this.payoutService.createPayout(payout);

        // Emit payout created event
        this.emit('payout.created', {
          type: 'mvm.payout.created',
          payoutId: payout.payout_id,
          vendorId,
          amount: payout.amount,
          timestamp: new Date(),
        });
      }
    } catch (error) {
      console.error('Error handling payout cycle:', error);
      throw error;
    }
  }

  /**
   * Set commission rate
   */
  setCommissionRate(rate: number): void {
    if (rate < 0 || rate > 1) {
      throw new Error('Commission rate must be between 0 and 1');
    }
    this.commissionRate = rate;
  }

  /**
   * Get current commission rate
   */
  getCommissionRate(): number {
    return this.commissionRate;
  }
}

/**
 * Create MVM event handler instance
 */
export const createMVMEventHandler = (
  orderService: OrderService,
  commissionService: CommissionService,
  payoutService: PayoutService,
  commissionRate?: number
): MVMEventHandler => {
  return new MVMEventHandler(orderService, commissionService, payoutService, commissionRate);
};
