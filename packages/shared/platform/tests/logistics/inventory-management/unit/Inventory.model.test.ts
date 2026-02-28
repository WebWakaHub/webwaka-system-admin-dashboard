/**
 * Inventory Model Unit Tests
 * 
 * Tests for Inventory entity methods and validations
 */

import { Inventory } from '../../../../src/logistics/inventory-management/models';

describe('Inventory Model', () => {
  let inventory: Inventory;

  beforeEach(() => {
    inventory = new Inventory();
    inventory.id = 'inv-001';
    inventory.tenant_id = 'tenant-001';
    inventory.sku = 'SKU-12345';
    inventory.product_id = 'PROD-001';
    inventory.location_id = 'LOC-001';
    inventory.on_hand = 100;
    inventory.available = 85;
    inventory.reserved = 10;
    inventory.allocated = 5;
    inventory.committed = 0;
    inventory.reorder_point = 20;
    inventory.safety_stock = 10;
    inventory.unit_cost = 1500.00;
    inventory.total_value = 150000.00;
    inventory.currency = 'NGN';
    inventory.valuation_method = 'fifo';
    inventory.created_at = new Date();
    inventory.updated_at = new Date();
  });

  describe('isLowStock', () => {
    it('should return true when available stock is below reorder point', () => {
      inventory.available = 15;
      inventory.reorder_point = 20;

      expect(inventory.isLowStock()).toBe(true);
    });

    it('should return true when available stock equals reorder point', () => {
      inventory.available = 20;
      inventory.reorder_point = 20;

      expect(inventory.isLowStock()).toBe(true);
    });

    it('should return false when available stock is above reorder point', () => {
      inventory.available = 25;
      inventory.reorder_point = 20;

      expect(inventory.isLowStock()).toBe(false);
    });

    it('should return false when reorder point is not set', () => {
      inventory.available = 15;
      inventory.reorder_point = undefined;

      expect(inventory.isLowStock()).toBe(false);
    });
  });

  describe('isOutOfStock', () => {
    it('should return true when available stock is zero', () => {
      inventory.available = 0;

      expect(inventory.isOutOfStock()).toBe(true);
    });

    it('should return false when available stock is greater than zero', () => {
      inventory.available = 1;

      expect(inventory.isOutOfStock()).toBe(false);
    });
  });

  describe('calculateAvailable', () => {
    it('should calculate available stock correctly', () => {
      inventory.on_hand = 100;
      inventory.reserved = 10;
      inventory.allocated = 5;
      inventory.committed = 0;

      const available = inventory.calculateAvailable();

      expect(available).toBe(85);
    });

    it('should handle zero values correctly', () => {
      inventory.on_hand = 0;
      inventory.reserved = 0;
      inventory.allocated = 0;
      inventory.committed = 0;

      const available = inventory.calculateAvailable();

      expect(available).toBe(0);
    });
  });

  describe('validateBalance', () => {
    it('should return true when balance constraint is satisfied', () => {
      inventory.on_hand = 100;
      inventory.available = 85;
      inventory.reserved = 10;
      inventory.allocated = 5;
      inventory.committed = 0;

      expect(inventory.validateBalance()).toBe(true);
    });

    it('should return false when balance constraint is violated', () => {
      inventory.on_hand = 100;
      inventory.available = 90; // Incorrect value
      inventory.reserved = 10;
      inventory.allocated = 5;
      inventory.committed = 0;

      expect(inventory.validateBalance()).toBe(false);
    });
  });
});
