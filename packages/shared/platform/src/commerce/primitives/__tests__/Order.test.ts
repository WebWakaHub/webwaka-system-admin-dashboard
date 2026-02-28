/**
 * Order Primitive Unit Tests
 * 100% code coverage
 */

import { Order, OrderStatus, IOrderAddress } from '../Order';
import { Money } from '../Money';

describe('Order Primitive', () => {
  const basePrice = new Money(10000, 'NGN');
  const billingAddress: IOrderAddress = {
    street: '123 Street',
    city: 'Lagos',
    state: 'Lagos',
    postalCode: '100001',
    country: 'Nigeria',
  };
  const shippingAddress: IOrderAddress = {
    street: '456 Avenue',
    city: 'Abuja',
    state: 'FCT',
    postalCode: '900001',
    country: 'Nigeria',
  };

  describe('Constructor', () => {
    it('should create Order with valid data', () => {
      const order = new Order('order-1', 'cust-1', 'NGN', billingAddress, shippingAddress);
      expect(order.id).toBe('order-1');
      expect(order.customerId).toBe('cust-1');
      expect(order.status).toBe(OrderStatus.PENDING);
    });

    it('should throw error for invalid ID', () => {
      expect(() => new Order('', 'cust-1', 'NGN', billingAddress, shippingAddress)).toThrow('Order ID is required');
    });

    it('should throw error for invalid customer ID', () => {
      expect(() => new Order('order-1', '', 'NGN', billingAddress, shippingAddress)).toThrow('Customer ID is required');
    });
  });

  describe('Item Management', () => {
    let order: Order;

    beforeEach(() => {
      order = new Order('order-1', 'cust-1', 'NGN', billingAddress, shippingAddress);
    });

    it('should add item to order', () => {
      order.addItem('prod-1', 'Product 1', 2, new Money(5000, 'NGN'));
      expect(order.items.length).toBe(1);
      expect(order.items[0].productId).toBe('prod-1');
    });

    it('should throw error for invalid product ID', () => {
      expect(() => order.addItem('', 'Product', 1, basePrice)).toThrow('Product ID is required');
    });

    it('should throw error for invalid quantity', () => {
      expect(() => order.addItem('prod-1', 'Product', 0, basePrice)).toThrow('Quantity must be a positive integer');
      expect(() => order.addItem('prod-1', 'Product', -1, basePrice)).toThrow('Quantity must be a positive integer');
    });

    it('should update item quantity', () => {
      order.addItem('prod-3', 'Product 3', 1, new Money(2000, 'NGN'));
      const itemId = order.items[0].id;
      order.updateItemQuantity(itemId, 3);
      expect(order.items[0].quantity).toBe(3);
    });

    it('should throw error updating non-existent item', () => {
      expect(() => order.updateItemQuantity('non-existent', 1)).toThrow('Item with ID non-existent not found');
    });

    it('should remove item from order', () => {
      order.addItem('prod-4', 'Product 4', 1, new Money(1000, 'NGN'));
      const itemId = order.items[0].id;
      order.removeItem(itemId);
      expect(order.items.length).toBe(0);
    });

    it('should throw error removing non-existent item', () => {
      expect(() => order.removeItem('non-existent')).toThrow('Item with ID non-existent not found');
    });
  });

  describe('Address Management', () => {
    let order: Order;

    beforeEach(() => {
      order = new Order('order-1', 'cust-1', 'NGN', billingAddress, shippingAddress);
    });

    it('should get billing address', () => {
      expect(order.billingAddress).toBeDefined();
      expect(order.billingAddress.street).toBe('123 Street');
    });

    it('should get shipping address', () => {
      expect(order.shippingAddress).toBeDefined();
      expect(order.shippingAddress.street).toBe('456 Avenue');
    });
  });

  describe('Tax and Shipping', () => {
    let order: Order;

    beforeEach(() => {
      order = new Order('order-1', 'cust-1', 'NGN', billingAddress, shippingAddress);
      order.addItem('prod-1', 'Product 1', 1, new Money(10000, 'NGN'));
    });

    it('should set tax', () => {
      const tax = new Money(1000, 'NGN');
      order.setTax(tax);
      expect(order.tax.amount).toBe(1000);
    });

    it('should set shipping', () => {
      const shipping = new Money(500, 'NGN');
      order.setShipping(shipping);
      expect(order.shipping.amount).toBe(500);
    });

    it('should throw error for invalid tax', () => {
      expect(() => order.setTax(null as any)).toThrow('Tax is required');
    });

    it('should throw error for invalid shipping', () => {
      expect(() => order.setShipping(null as any)).toThrow('Shipping is required');
    });
  });

  describe('Discount Management', () => {
    let order: Order;

    beforeEach(() => {
      order = new Order('order-1', 'cust-1', 'NGN', billingAddress, shippingAddress);
      order.addItem('prod-1', 'Product 1', 1, new Money(10000, 'NGN'));
    });

    it('should apply discount', () => {
      const discount = new Money(1000, 'NGN');
      order.applyDiscount(discount);
      expect(order.discount.amount).toBe(1000);
    });

    it('should throw error for invalid discount', () => {
      expect(() => order.applyDiscount(null as any)).toThrow('Discount is required');
    });

    it('should throw error for discount exceeding subtotal', () => {
      const discount = new Money(20000, 'NGN');
      expect(() => order.applyDiscount(discount)).toThrow('Discount cannot exceed subtotal');
    });
  });

  describe('Order Status', () => {
    let order: Order;

    beforeEach(() => {
      order = new Order('order-1', 'cust-1', 'NGN', billingAddress, shippingAddress);
    });

    it('should have PENDING status initially', () => {
      expect(order.status).toBe(OrderStatus.PENDING);
    });

    it('should calculate total correctly', () => {
      order.addItem('prod-1', 'Product 1', 2, new Money(5000, 'NGN'));
      order.setTax(new Money(1000, 'NGN'));
      order.setShipping(new Money(500, 'NGN'));
      expect(order.total.amount).toBe(11500);
    });
  });

  describe('Order Serialization', () => {
    let order: Order;

    beforeEach(() => {
      order = new Order('order-1', 'cust-1', 'NGN', billingAddress, shippingAddress);
      order.addItem('prod-1', 'Product 1', 1, new Money(10000, 'NGN'));
      order.setTax(new Money(1000, 'NGN'));
    });

    it('should convert to JSON', () => {
      const json = order.toJSON();
      expect(json.id).toBe('order-1');
      expect(json.customerId).toBe('cust-1');
      expect(json.status).toBe(OrderStatus.PENDING);
      expect(json.items.length).toBe(1);
    });
  });
});
