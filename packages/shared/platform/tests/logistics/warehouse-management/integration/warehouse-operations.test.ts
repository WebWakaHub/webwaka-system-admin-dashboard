/**
 * Warehouse Operations Integration Tests
 * Step 394: Integration tests for Warehouse Management module
 * Agent: webwakaagent5
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { DataSource } from 'typeorm';
import { WarehouseService } from '../../../../src/logistics/warehouse-management/services/WarehouseService';
import { Warehouse, WarehouseLocation, PickingList } from '../../../../src/logistics/warehouse-management/models';
import { EventPublisher } from '../../../../src/logistics/warehouse-management/events/EventPublisher';
import { PickingStatus } from '../../../../src/logistics/warehouse-management/types';

describe('Warehouse Operations Integration Tests', () => {
  let dataSource: DataSource;
  let service: WarehouseService;
  let eventPublisher: EventPublisher;
  let testTenantId: string;
  let testWarehouseId: string;

  beforeAll(async () => {
    // Initialize test database connection
    dataSource = new DataSource({
      type: 'sqlite',
      database: ':memory:',
      entities: [Warehouse, WarehouseLocation, PickingList],
      synchronize: true,
      logging: false
    });

    await dataSource.initialize();

    eventPublisher = {
      publishWarehouseCreated: jest.fn(),
      publishLocationCreated: jest.fn(),
      publishPickingListCreated: jest.fn(),
      publishPickingListCompleted: jest.fn()
    } as any;

    service = new WarehouseService(dataSource, eventPublisher);
    testTenantId = 'test-tenant-1';
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('End-to-end warehouse workflow', () => {
    it('should create warehouse, locations, and picking lists', async () => {
      // Step 1: Create warehouse
      const warehouse = await service.createWarehouse({
        tenant_id: testTenantId,
        name: 'Integration Test Warehouse',
        code: 'WH-INT-001',
        address: '123 Integration St',
        city: 'Lagos',
        state: 'Lagos',
        country: 'Nigeria',
        postal_code: '100001',
        manager_name: 'Test Manager',
        manager_email: 'manager@test.com',
        manager_phone: '+2348012345678'
      });

      expect(warehouse.id).toBeDefined();
      expect(warehouse.status).toBe('active');
      testWarehouseId = warehouse.id;

      // Step 2: Create locations
      const location1 = await service.createLocation({
        warehouse_id: testWarehouseId,
        tenant_id: testTenantId,
        aisle: 'A',
        rack: '01',
        shelf: '01',
        bin: '01',
        location_type: 'storage'
      });

      expect(location1.location_code).toBe('A-01-01-01');
      expect(location1.status).toBe('active');

      const location2 = await service.createLocation({
        warehouse_id: testWarehouseId,
        tenant_id: testTenantId,
        aisle: 'A',
        rack: '01',
        shelf: '01',
        bin: '02',
        location_type: 'picking'
      });

      expect(location2.location_code).toBe('A-01-01-02');

      // Step 3: Create picking list
      const pickingList = await service.createPickingList({
        tenant_id: testTenantId,
        warehouse_id: testWarehouseId,
        order_id: 'order-int-001',
        assigned_to: 'picker-1',
        items: [
          {
            product_id: 'prod-1',
            product_name: 'Test Product 1',
            quantity: 5,
            location_id: location1.id,
            location_code: location1.location_code
          },
          {
            product_id: 'prod-2',
            product_name: 'Test Product 2',
            quantity: 3,
            location_id: location2.id,
            location_code: location2.location_code
          }
        ]
      });

      expect(pickingList.id).toBeDefined();
      expect(pickingList.status).toBe(PickingStatus.PENDING);
      expect(pickingList.items).toHaveLength(2);

      // Step 4: Complete picking list
      const completedList = await service.completePickingList(
        pickingList.id,
        testTenantId
      );

      expect(completedList.status).toBe(PickingStatus.COMPLETED);
      expect(completedList.completed_at).toBeDefined();

      // Verify events were published
      expect(eventPublisher.publishWarehouseCreated).toHaveBeenCalledWith(warehouse);
      expect(eventPublisher.publishLocationCreated).toHaveBeenCalledTimes(2);
      expect(eventPublisher.publishPickingListCreated).toHaveBeenCalledWith(pickingList);
      expect(eventPublisher.publishPickingListCompleted).toHaveBeenCalled();
    });

    it('should enforce multi-tenant isolation', async () => {
      const wrongTenant = 'wrong-tenant';

      // Try to access warehouse with wrong tenant
      const warehouse = await service.getWarehouse(testWarehouseId, wrongTenant);
      expect(warehouse).toBeNull();

      // Try to create location with wrong tenant
      await expect(
        service.createLocation({
          warehouse_id: testWarehouseId,
          tenant_id: wrongTenant,
          aisle: 'B',
          rack: '01',
          shelf: '01',
          bin: '01',
          location_type: 'storage'
        })
      ).rejects.toThrow('Warehouse not found');
    });

    it('should handle warehouse deactivation', async () => {
      const warehouse = await service.getWarehouse(testWarehouseId, testTenantId);
      expect(warehouse).not.toBeNull();
      expect(warehouse!.isActive()).toBe(true);

      await service.deactivateWarehouse(testWarehouseId, testTenantId);

      const deactivated = await service.getWarehouse(testWarehouseId, testTenantId);
      expect(deactivated!.isActive()).toBe(false);
    });
  });

  describe('Location management', () => {
    it('should retrieve locations by warehouse', async () => {
      const locations = await service.getLocationsByWarehouse(
        testWarehouseId,
        testTenantId
      );

      expect(locations.length).toBeGreaterThan(0);
      expect(locations[0].warehouse_id).toBe(testWarehouseId);
    });

    it('should find location by code', async () => {
      const location = await service.getLocationByCode(
        'A-01-01-01',
        testWarehouseId,
        testTenantId
      );

      expect(location).not.toBeNull();
      expect(location!.location_code).toBe('A-01-01-01');
    });
  });

  describe('Picking list management', () => {
    it('should retrieve picking lists by status', async () => {
      const completedLists = await service.getPickingListsByStatus(
        testTenantId,
        PickingStatus.COMPLETED
      );

      expect(completedLists.length).toBeGreaterThan(0);
      expect(completedLists[0].status).toBe(PickingStatus.COMPLETED);
    });

    it('should retrieve picking lists by order', async () => {
      const lists = await service.getPickingListsByOrder(
        'order-int-001',
        testTenantId
      );

      expect(lists.length).toBeGreaterThan(0);
      expect(lists[0].order_id).toBe('order-int-001');
    });
  });
});
