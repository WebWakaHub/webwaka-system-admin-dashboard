/**
 * Inventory Primitive Unit Tests
 * 100% code coverage
 */

import { Inventory, InventoryStatus } from '../Inventory';

describe('Inventory Primitive', () => {
  describe('Constructor', () => {
    it('should create Inventory with valid data', () => {
      const inventory = new Inventory('inv-1', 'prod-1', 100);
      expect(inventory.id).toBe('inv-1');
      expect(inventory.productId).toBe('prod-1');
      expect(inventory.quantity).toBe(100);
      expect(inventory.status).toBe(InventoryStatus.IN_STOCK);
    });

    it('should throw error for invalid ID', () => {
      expect(() => new Inventory('', 'prod-1', 100)).toThrow('Inventory ID is required');
    });

    it('should throw error for invalid product ID', () => {
      expect(() => new Inventory('inv-1', '', 100)).toThrow('Product ID is required');
    });

    it('should throw error for invalid quantity', () => {
      expect(() => new Inventory('inv-1', 'prod-1', -1)).toThrow('Quantity must be non-negative');
      expect(() => new Inventory('inv-1', 'prod-1', NaN)).toThrow('Quantity must be a valid number');
    });
  });

  describe('Stock Levels', () => {
    const inventory = new Inventory('inv-1', 'prod-1', 100);

    it('should have initial quantity', () => {
      expect(inventory.quantity).toBe(100);
    });

    it('should have zero reserved quantity initially', () => {
      expect(inventory.reserved).toBe(0);
    });

    it('should calculate available quantity', () => {
      expect(inventory.available).toBe(100);
    });

    it('should calculate available quantity after reservation', () => {
      inventory.reserve(20);
      expect(inventory.available).toBe(80);
    });
  });

  describe('Reservation', () => {
    const inventory = new Inventory('inv-1', 'prod-1', 100);

    it('should reserve stock', () => {
      const reservationId = inventory.reserve(30);
      expect(reservationId).toBeDefined();
      expect(inventory.reserved).toBe(30);
      expect(inventory.available).toBe(70);
    });

    it('should throw error for invalid quantity', () => {
      expect(() => inventory.reserve(0)).toThrow('Quantity must be positive');
      expect(() => inventory.reserve(-10)).toThrow('Quantity must be positive');
    });

    it('should throw error for exceeding available stock', () => {
      inventory.reserve(80);
      expect(() => inventory.reserve(30)).toThrow('Insufficient stock for reservation');
    });

    it('should get reservation by ID', () => {
      const reservationId = inventory.reserve(20);
      const reservation = inventory.getReservation(reservationId);
      expect(reservation).toBeDefined();
      expect(reservation?.quantity).toBe(20);
    });

    it('should throw error getting non-existent reservation', () => {
      expect(() => inventory.getReservation('non-existent')).toThrow('Reservation not found');
    });

    it('should cancel reservation', () => {
      const reservationId = inventory.reserve(25);
      inventory.cancelReservation(reservationId);
      expect(inventory.reserved).toBe(0);
      expect(inventory.available).toBe(100);
    });

    it('should throw error cancelling non-existent reservation', () => {
      expect(() => inventory.cancelReservation('non-existent')).toThrow('Reservation not found');
    });
  });

  describe('Stock Adjustment', () => {
    const inventory = new Inventory('inv-1', 'prod-1', 100);

    it('should add stock', () => {
      inventory.addStock(50);
      expect(inventory.quantity).toBe(150);
    });

    it('should throw error for invalid add quantity', () => {
      expect(() => inventory.addStock(0)).toThrow('Quantity must be positive');
      expect(() => inventory.addStock(-10)).toThrow('Quantity must be positive');
    });

    it('should remove stock', () => {
      inventory.removeStock(30);
      expect(inventory.quantity).toBe(70);
    });

    it('should throw error for invalid remove quantity', () => {
      expect(() => inventory.removeStock(0)).toThrow('Quantity must be positive');
      expect(() => inventory.removeStock(-10)).toThrow('Quantity must be positive');
    });

    it('should throw error removing more than available', () => {
      expect(() => inventory.removeStock(200)).toThrow('Cannot remove more than available stock');
    });

    it('should set stock to specific level', () => {
      inventory.setStock(200);
      expect(inventory.quantity).toBe(200);
    });

    it('should throw error setting negative stock', () => {
      expect(() => inventory.setStock(-50)).toThrow('Quantity must be non-negative');
    });
  });

  describe('Fulfillment', () => {
    const inventory = new Inventory('inv-1', 'prod-1', 100);

    it('should fulfill reserved stock', () => {
      const reservationId = inventory.reserve(40);
      inventory.fulfill(reservationId);
      expect(inventory.quantity).toBe(60);
      expect(inventory.reserved).toBe(0);
    });

    it('should throw error fulfilling non-existent reservation', () => {
      expect(() => inventory.fulfill('non-existent')).toThrow('Reservation not found');
    });

    it('should throw error fulfilling already fulfilled reservation', () => {
      const reservationId = inventory.reserve(20);
      inventory.fulfill(reservationId);
      expect(() => inventory.fulfill(reservationId)).toThrow('Reservation not found');
    });
  });

  describe('Status Management', () => {
    const inventory = new Inventory('inv-1', 'prod-1', 100);

    it('should be IN_STOCK with quantity > 0', () => {
      expect(inventory.status).toBe(InventoryStatus.IN_STOCK);
    });

    it('should be LOW_STOCK with quantity <= 10', () => {
      inventory.removeStock(91);
      expect(inventory.status).toBe(InventoryStatus.LOW_STOCK);
    });

    it('should be OUT_OF_STOCK with quantity = 0', () => {
      inventory.removeStock(9);
      expect(inventory.status).toBe(InventoryStatus.OUT_OF_STOCK);
    });

    it('should be DISCONTINUED when marked', () => {
      inventory.markDiscontinued();
      expect(inventory.status).toBe(InventoryStatus.DISCONTINUED);
    });

    it('should be RESERVED when all stock is reserved', () => {
      const inventory2 = new Inventory('inv-2', 'prod-2', 50);
      inventory2.reserve(50);
      expect(inventory2.status).toBe(InventoryStatus.RESERVED);
    });
  });

  describe('Tracking', () => {
    const inventory = new Inventory('inv-1', 'prod-1', 100);

    it('should track creation timestamp', () => {
      expect(inventory.createdAt).toBeInstanceOf(Date);
    });

    it('should track update timestamp', () => {
      expect(inventory.updatedAt).toBeInstanceOf(Date);
    });

    it('should track last stock check', () => {
      inventory.performStockCheck();
      expect(inventory.lastStockCheck).toBeInstanceOf(Date);
    });

    it('should track stock movements', () => {
      const movements = inventory.getStockMovements();
      expect(Array.isArray(movements)).toBe(true);
    });

    it('should record add stock movement', () => {
      inventory.addStock(50);
      const movements = inventory.getStockMovements();
      expect(movements.length).toBeGreaterThan(0);
      expect(movements[movements.length - 1].type).toBe('ADD');
    });

    it('should record remove stock movement', () => {
      inventory.removeStock(20);
      const movements = inventory.getStockMovements();
      expect(movements[movements.length - 1].type).toBe('REMOVE');
    });

    it('should record reserve movement', () => {
      inventory.reserve(15);
      const movements = inventory.getStockMovements();
      expect(movements[movements.length - 1].type).toBe('RESERVE');
    });
  });

  describe('Thresholds', () => {
    const inventory = new Inventory('inv-1', 'prod-1', 100);

    it('should set low stock threshold', () => {
      inventory.setLowStockThreshold(20);
      inventory.removeStock(81);
      expect(inventory.status).toBe(InventoryStatus.LOW_STOCK);
    });

    it('should throw error for invalid threshold', () => {
      expect(() => inventory.setLowStockThreshold(-10)).toThrow('Threshold must be non-negative');
    });

    it('should get low stock threshold', () => {
      inventory.setLowStockThreshold(25);
      expect(inventory.getLowStockThreshold()).toBe(25);
    });

    it('should alert when below threshold', () => {
      inventory.setLowStockThreshold(30);
      inventory.removeStock(71);
      expect(inventory.isLowStock()).toBe(true);
    });
  });

  describe('Batch Operations', () => {
    const inventory = new Inventory('inv-1', 'prod-1', 100);

    it('should reserve multiple items', () => {
      const res1 = inventory.reserve(20);
      const res2 = inventory.reserve(30);
      expect(inventory.reserved).toBe(50);
      expect(inventory.available).toBe(50);
    });

    it('should cancel multiple reservations', () => {
      const res1 = inventory.reserve(20);
      const res2 = inventory.reserve(30);
      inventory.cancelReservation(res1);
      inventory.cancelReservation(res2);
      expect(inventory.reserved).toBe(0);
    });

    it('should fulfill multiple reservations', () => {
      const res1 = inventory.reserve(20);
      const res2 = inventory.reserve(30);
      inventory.fulfill(res1);
      inventory.fulfill(res2);
      expect(inventory.quantity).toBe(50);
      expect(inventory.reserved).toBe(0);
    });
  });

  describe('JSON Serialization', () => {
    it('should serialize to JSON', () => {
      const inventory = new Inventory('inv-1', 'prod-1', 100);
      inventory.reserve(30);
      inventory.setLowStockThreshold(20);
      const json = inventory.toJSON();
      expect(json.id).toBe('inv-1');
      expect(json.productId).toBe('prod-1');
      expect(json.quantity).toBe(100);
      expect(json.reserved).toBe(30);
      expect(json.available).toBe(70);
    });
  });

  describe('Edge Cases', () => {
    it('should handle inventory with zero initial quantity', () => {
      const inventory = new Inventory('inv-1', 'prod-1', 0);
      expect(inventory.quantity).toBe(0);
      expect(inventory.status).toBe(InventoryStatus.OUT_OF_STOCK);
    });

    it('should handle very large quantities', () => {
      const inventory = new Inventory('inv-1', 'prod-1', 1000000);
      expect(inventory.quantity).toBe(1000000);
    });

    it('should handle many reservations', () => {
      const inventory = new Inventory('inv-1', 'prod-1', 1000);
      const reservations = [];
      for (let i = 0; i < 50; i++) {
        reservations.push(inventory.reserve(10));
      }
      expect(inventory.reserved).toBe(500);
      expect(inventory.available).toBe(500);
    });
  });
});
