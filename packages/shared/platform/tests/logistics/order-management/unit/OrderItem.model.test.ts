/**
 * OrderItem Model Unit Tests
 * 
 * Tests for OrderItem entity business logic and validation.
 */

import { OrderItem } from '../../../../src/logistics/order-management/models/OrderItem';

describe('OrderItem Model', () => {
  describe('calculateTotalPrice', () => {
    it('should calculate total price from quantity and unit price', () => {
      const item = new OrderItem();
      item.quantity = 3;
      item.unit_price = 5000;

      item.calculateTotalPrice();

      expect(item.total_price).toBe(15000);
    });

    it('should handle decimal prices', () => {
      const item = new OrderItem();
      item.quantity = 2;
      item.unit_price = 2500.50;

      item.calculateTotalPrice();

      expect(item.total_price).toBe(5001);
    });
  });

  describe('validateQuantity', () => {
    it('should accept positive quantities', () => {
      const item = new OrderItem();
      item.quantity = 5;

      expect(() => item.validateQuantity()).not.toThrow();
    });

    it('should reject zero quantity', () => {
      const item = new OrderItem();
      item.quantity = 0;

      expect(() => item.validateQuantity()).toThrow('Quantity must be greater than zero');
    });

    it('should reject negative quantity', () => {
      const item = new OrderItem();
      item.quantity = -1;

      expect(() => item.validateQuantity()).toThrow('Quantity must be greater than zero');
    });
  });

  describe('validateUnitPrice', () => {
    it('should accept positive unit prices', () => {
      const item = new OrderItem();
      item.unit_price = 1000;

      expect(() => item.validateUnitPrice()).not.toThrow();
    });

    it('should reject zero unit price', () => {
      const item = new OrderItem();
      item.unit_price = 0;

      expect(() => item.validateUnitPrice()).toThrow('Unit price must be greater than zero');
    });

    it('should reject negative unit price', () => {
      const item = new OrderItem();
      item.unit_price = -100;

      expect(() => item.validateUnitPrice()).toThrow('Unit price must be greater than zero');
    });
  });

  describe('validate', () => {
    it('should validate and calculate total for valid item', () => {
      const item = new OrderItem();
      item.quantity = 2;
      item.unit_price = 5000;

      item.validate();

      expect(item.total_price).toBe(10000);
    });

    it('should throw error for invalid quantity', () => {
      const item = new OrderItem();
      item.quantity = 0;
      item.unit_price = 5000;

      expect(() => item.validate()).toThrow('Quantity must be greater than zero');
    });

    it('should throw error for invalid unit price', () => {
      const item = new OrderItem();
      item.quantity = 2;
      item.unit_price = 0;

      expect(() => item.validate()).toThrow('Unit price must be greater than zero');
    });
  });
});
