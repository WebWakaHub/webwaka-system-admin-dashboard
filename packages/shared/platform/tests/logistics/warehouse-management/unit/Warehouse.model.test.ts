/**
 * Warehouse Model Unit Tests
 * Step 394: Unit tests for Warehouse entity
 * Agent: webwakaagent5
 */

import { describe, it, expect } from '@jest/globals';
import { Warehouse } from '../../../../src/logistics/warehouse-management/models/Warehouse';

describe('Warehouse Model', () => {
  describe('isActive', () => {
    it('should return true when status is active', () => {
      const warehouse = new Warehouse();
      warehouse.status = 'active';

      expect(warehouse.isActive()).toBe(true);
    });

    it('should return false when status is inactive', () => {
      const warehouse = new Warehouse();
      warehouse.status = 'inactive';

      expect(warehouse.isActive()).toBe(false);
    });
  });

  describe('activate', () => {
    it('should set status to active', () => {
      const warehouse = new Warehouse();
      warehouse.status = 'inactive';

      warehouse.activate();

      expect(warehouse.status).toBe('active');
    });
  });

  describe('deactivate', () => {
    it('should set status to inactive', () => {
      const warehouse = new Warehouse();
      warehouse.status = 'active';

      warehouse.deactivate();

      expect(warehouse.status).toBe('inactive');
    });
  });

  describe('getFullAddress', () => {
    it('should return formatted full address', () => {
      const warehouse = new Warehouse();
      warehouse.address = '123 Warehouse St';
      warehouse.city = 'Lagos';
      warehouse.state = 'Lagos';
      warehouse.country = 'Nigeria';
      warehouse.postal_code = '100001';

      const expected = '123 Warehouse St, Lagos, Lagos, Nigeria 100001';
      expect(warehouse.getFullAddress()).toBe(expected);
    });

    it('should handle missing postal code', () => {
      const warehouse = new Warehouse();
      warehouse.address = '456 Test St';
      warehouse.city = 'Abuja';
      warehouse.state = 'FCT';
      warehouse.country = 'Nigeria';

      const result = warehouse.getFullAddress();
      expect(result).toContain('456 Test St');
      expect(result).toContain('Abuja');
      expect(result).toContain('Nigeria');
    });
  });

  describe('Entity validation', () => {
    it('should have required fields', () => {
      const warehouse = new Warehouse();
      warehouse.id = 'wh-1';
      warehouse.tenant_id = 'tenant-1';
      warehouse.name = 'Main Warehouse';
      warehouse.code = 'WH-001';
      warehouse.address = '123 St';
      warehouse.city = 'Lagos';
      warehouse.state = 'Lagos';
      warehouse.country = 'Nigeria';
      warehouse.status = 'active';

      expect(warehouse.id).toBeDefined();
      expect(warehouse.tenant_id).toBeDefined();
      expect(warehouse.name).toBeDefined();
      expect(warehouse.code).toBeDefined();
    });

    it('should have manager contact information', () => {
      const warehouse = new Warehouse();
      warehouse.manager_name = 'John Doe';
      warehouse.manager_email = 'john@example.com';
      warehouse.manager_phone = '+2348012345678';

      expect(warehouse.manager_name).toBe('John Doe');
      expect(warehouse.manager_email).toBe('john@example.com');
      expect(warehouse.manager_phone).toBe('+2348012345678');
    });
  });
});
