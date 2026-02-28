/**
 * MVM Event Integration Tests
 */

import {
  OrderService,
  CommissionService,
  PayoutService,
} from '../services';
import { createMVMEventHandler, OrderPlacedEvent } from '../events';

describe('MVM Event Handler', () => {
  let orderService: OrderService;
  let commissionService: CommissionService;
  let payoutService: PayoutService;

  beforeEach(() => {
    orderService = new OrderService();
    commissionService = new CommissionService();
    payoutService = new PayoutService();
  });

  it('should handle order.created event', (done) => {
    const eventHandler = createMVMEventHandler(orderService, commissionService, payoutService, 0.1);

    const event: OrderPlacedEvent = {
      type: 'platform.order.created',
      orderId: 'order-1',
      customerId: 'customer-1',
      items: [
        {
          productId: 'product-1',
          vendorId: 'vendor-1',
          quantity: 2,
          unitPrice: 500,
        },
        {
          productId: 'product-2',
          vendorId: 'vendor-2',
          quantity: 1,
          unitPrice: 1000,
        },
      ],
      totalAmount: 2000,
      currency: 'NGN',
    };

    let processedCount = 0;

    eventHandler.on('order.processed', (processedEvent) => {
      processedCount++;
      expect(processedEvent.orderId).toBe('order-1');
      expect(processedEvent.vendorId).toMatch(/vendor-[12]/);

      if (processedEvent.vendorId === 'vendor-1') {
        expect(processedEvent.commissionAmount).toBe(100); // 1000 * 0.1
        expect(processedEvent.vendorEarnings).toBe(900);
      } else if (processedEvent.vendorId === 'vendor-2') {
        expect(processedEvent.commissionAmount).toBe(100); // 1000 * 0.1
        expect(processedEvent.vendorEarnings).toBe(900);
      }

      if (processedCount === 2) {
        done();
      }
    });

    eventHandler.handleOrderCreated(event);
  });

  it('should handle order status update', (done) => {
    const eventHandler = createMVMEventHandler(orderService, commissionService, payoutService);

    // Create an order and order item first
    const { createOrder, createOrderItem } = require('../models');
    const order = createOrder({
      customer_id: 'customer-1',
      total_amount: 1000,
      currency: 'NGN',
      status: 'pending',
    });

    orderService.createOrder(order);

    const orderItem = createOrderItem({
      order_id: order.order_id,
      vendor_id: 'vendor-1',
      product_id: 'product-1',
      quantity: 1,
      unit_price: 1000,
      subtotal: 1000,
      status: 'pending',
    });

    orderService.addOrderItem(orderItem);

    eventHandler.on('order.status.updated', (event) => {
      expect(event.orderId).toBe(order.order_id);
      expect(event.orderItemId).toBe(orderItem.order_item_id);
      expect(event.status).toBe('shipped');
      done();
    });

    eventHandler.handleOrderStatusUpdate(order.order_id, orderItem.order_item_id, 'shipped');
  });

  it('should set and get commission rate', () => {
    const eventHandler = createMVMEventHandler(orderService, commissionService, payoutService, 0.15);

    expect(eventHandler.getCommissionRate()).toBe(0.15);

    eventHandler.setCommissionRate(0.2);
    expect(eventHandler.getCommissionRate()).toBe(0.2);
  });

  it('should throw error for invalid commission rate', () => {
    const eventHandler = createMVMEventHandler(orderService, commissionService, payoutService);

    expect(() => eventHandler.setCommissionRate(-0.1)).toThrow();
    expect(() => eventHandler.setCommissionRate(1.5)).toThrow();
  });

  it('should handle payout cycle', (done) => {
    const eventHandler = createMVMEventHandler(orderService, commissionService, payoutService, 0.1);

    // Create order items and commissions
    const { createOrderItem } = require('../models');
    const orderItem1 = createOrderItem({
      order_id: 'order-1',
      vendor_id: 'vendor-1',
      product_id: 'product-1',
      quantity: 1,
      unit_price: 1000,
      subtotal: 1000,
      status: 'pending',
    });

    const orderItem2 = createOrderItem({
      order_id: 'order-2',
      vendor_id: 'vendor-1',
      product_id: 'product-2',
      quantity: 1,
      unit_price: 500,
      subtotal: 500,
      status: 'pending',
    });

    commissionService.calculateCommission(orderItem1, 0.1);
    commissionService.calculateCommission(orderItem2, 0.1);

    eventHandler.on('payout.created', (event) => {
      expect(event.vendorId).toBe('vendor-1');
      expect(event.amount).toBeGreaterThan(0);
      done();
    });

    eventHandler.handlePayoutCycle('vendor-1');
  });

  it('should not create payout for vendor with no commissions', (done) => {
    const eventHandler = createMVMEventHandler(orderService, commissionService, payoutService);

    let payoutCreated = false;

    eventHandler.on('payout.created', () => {
      payoutCreated = true;
    });

    eventHandler.handlePayoutCycle('vendor-no-commissions');

    // Wait a bit to ensure no event is emitted
    setTimeout(() => {
      expect(payoutCreated).toBe(false);
      done();
    }, 100);
  });
});
