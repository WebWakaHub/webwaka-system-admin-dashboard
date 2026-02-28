/**
 * Order Model Unit Tests
 * 
 * Tests for Order entity business logic and validation.
 */

import { Order } from '../../../../src/logistics/order-management/models/Order';
import { OrderItem } from '../../../../src/logistics/order-management/models/OrderItem';
import { OrderStatus, PaymentStatus } from '../../../../src/logistics/order-management/types';

describe('Order Model', () => {
  describe('calculateTotals', () => {
    it('should calculate totals from items', () => {
      const order = new Order();
      order.items = [
        { total_price: 5000 } as OrderItem,
        { total_price: 3000 } as OrderItem
      ];
      order.tax = 800;
      order.shipping_cost = 1200;

      order.calculateTotals();

      expect(order.subtotal).toBe(8000);
      expect(order.total).toBe(10000); // 8000 + 800 + 1200
    });

    it('should handle empty items array', () => {
      const order = new Order();
      order.items = [];

      order.calculateTotals();

      expect(order.subtotal).toBe(0);
      expect(order.total).toBe(0);
    });
  });

  describe('canConfirm', () => {
    it('should return true for pending orders', () => {
      const order = new Order();
      order.status = OrderStatus.PENDING;

      expect(order.canConfirm()).toBe(true);
    });

    it('should return false for confirmed orders', () => {
      const order = new Order();
      order.status = OrderStatus.CONFIRMED;

      expect(order.canConfirm()).toBe(false);
    });
  });

  describe('canCancel', () => {
    it('should return true for pending orders', () => {
      const order = new Order();
      order.status = OrderStatus.PENDING;

      expect(order.canCancel()).toBe(true);
    });

    it('should return true for confirmed orders', () => {
      const order = new Order();
      order.status = OrderStatus.CONFIRMED;

      expect(order.canCancel()).toBe(true);
    });

    it('should return false for shipped orders', () => {
      const order = new Order();
      order.status = OrderStatus.SHIPPED;

      expect(order.canCancel()).toBe(false);
    });

    it('should return false for delivered orders', () => {
      const order = new Order();
      order.status = OrderStatus.DELIVERED;

      expect(order.canCancel()).toBe(false);
    });
  });

  describe('confirm', () => {
    it('should update status to confirmed', () => {
      const order = new Order();
      order.status = OrderStatus.PENDING;

      order.confirm();

      expect(order.status).toBe(OrderStatus.CONFIRMED);
      expect(order.payment_status).toBe(PaymentStatus.PAID);
    });

    it('should throw error if order cannot be confirmed', () => {
      const order = new Order();
      order.status = OrderStatus.SHIPPED;

      expect(() => order.confirm()).toThrow('Cannot confirm order in status');
    });
  });

  describe('cancel', () => {
    it('should update status to cancelled', () => {
      const order = new Order();
      order.status = OrderStatus.PENDING;

      order.cancel();

      expect(order.status).toBe(OrderStatus.CANCELLED);
    });

    it('should throw error if order cannot be cancelled', () => {
      const order = new Order();
      order.status = OrderStatus.DELIVERED;

      expect(() => order.cancel()).toThrow('Cannot cancel order in status');
    });
  });

  describe('ship', () => {
    it('should update status to shipped', () => {
      const order = new Order();
      order.status = OrderStatus.CONFIRMED;

      order.ship();

      expect(order.status).toBe(OrderStatus.SHIPPED);
    });

    it('should throw error if order cannot be shipped', () => {
      const order = new Order();
      order.status = OrderStatus.PENDING;

      expect(() => order.ship()).toThrow('Cannot ship order in status');
    });
  });

  describe('deliver', () => {
    it('should update status to delivered', () => {
      const order = new Order();
      order.status = OrderStatus.SHIPPED;

      order.deliver();

      expect(order.status).toBe(OrderStatus.DELIVERED);
    });

    it('should throw error if order cannot be delivered', () => {
      const order = new Order();
      order.status = OrderStatus.CONFIRMED;

      expect(() => order.deliver()).toThrow('Cannot deliver order in status');
    });
  });
});
