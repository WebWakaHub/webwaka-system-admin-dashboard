/**
 * Inventory Service Unit Tests
 * 
 * Comprehensive unit tests for InventoryService
 * Target: 100% code coverage
 */

import { DataSource, Repository } from 'typeorm';
import { InventoryService } from '../../../../src/logistics/inventory-management/services/InventoryService';
import { Inventory, InventoryReservation } from '../../../../src/logistics/inventory-management/models';
import { EventPublisher } from '../../../../src/logistics/inventory-management/events/EventPublisher';

describe('InventoryService', () => {
  let inventoryService: InventoryService;
  let mockDataSource: jest.Mocked<DataSource>;
  let mockEventPublisher: jest.Mocked<EventPublisher>;
  let mockInventoryRepo: jest.Mocked<Repository<Inventory>>;
  let mockReservationRepo: jest.Mocked<Repository<InventoryReservation>>;

  beforeEach(() => {
    // Mock DataSource
    mockDataSource = {
      getRepository: jest.fn()
    } as any;

    // Mock EventPublisher
    mockEventPublisher = {
      publish: jest.fn().mockResolvedValue(undefined),
      publishBatch: jest.fn().mockResolvedValue(undefined)
    } as any;

    // Mock Inventory Repository
    mockInventoryRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn()
    } as any;

    // Mock Reservation Repository
    mockReservationRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn()
    } as any;

    mockDataSource.getRepository.mockImplementation((entity: any) => {
      if (entity === Inventory) return mockInventoryRepo as any;
      if (entity === InventoryReservation) return mockReservationRepo as any;
      return {} as any;
    });

    inventoryService = new InventoryService(mockDataSource, mockEventPublisher);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createInventory', () => {
    it('should create new inventory record successfully', async () => {
      const input = {
        tenant_id: 'tenant-001',
        sku: 'SKU-12345',
        product_id: 'PROD-001',
        location_id: 'LOC-001',
        on_hand: 100,
        reorder_point: 20,
        unit_cost: 1500.00,
        currency: 'NGN' as const
      };

      const createdInventory = {
        id: 'inv-001',
        ...input,
        available: 100,
        reserved: 0,
        allocated: 0,
        committed: 0,
        total_value: 150000.00,
        valuation_method: 'fifo' as const,
        created_at: new Date(),
        updated_at: new Date()
      };

      mockInventoryRepo.findOne.mockResolvedValue(null); // No existing inventory
      mockInventoryRepo.create.mockReturnValue(createdInventory as any);
      mockInventoryRepo.save.mockResolvedValue(createdInventory as any);

      const result = await inventoryService.createInventory(input);

      expect(result).toEqual(createdInventory);
      expect(mockInventoryRepo.findOne).toHaveBeenCalledWith({
        where: { tenant_id: input.tenant_id, sku: input.sku, location_id: input.location_id }
      });
      expect(mockEventPublisher.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'inventory.stock_level_changed',
          tenantId: input.tenant_id,
          data: expect.objectContaining({
            sku: input.sku,
            new_on_hand: 100
          })
        })
      );
    });

    it('should throw error if inventory already exists', async () => {
      const input = {
        tenant_id: 'tenant-001',
        sku: 'SKU-12345',
        product_id: 'PROD-001',
        location_id: 'LOC-001'
      };

      mockInventoryRepo.findOne.mockResolvedValue({ id: 'existing' } as any);

      await expect(inventoryService.createInventory(input)).rejects.toThrow(
        'Inventory already exists for SKU SKU-12345 at location LOC-001'
      );
    });
  });

  describe('getInventoryBySku', () => {
    it('should return inventory by SKU and location', async () => {
      const inventory = {
        id: 'inv-001',
        tenant_id: 'tenant-001',
        sku: 'SKU-12345',
        location_id: 'LOC-001',
        on_hand: 100,
        available: 85
      };

      mockInventoryRepo.findOne.mockResolvedValue(inventory as any);

      const result = await inventoryService.getInventoryBySku('tenant-001', 'SKU-12345', 'LOC-001');

      expect(result).toEqual(inventory);
      expect(mockInventoryRepo.findOne).toHaveBeenCalledWith({
        where: { tenant_id: 'tenant-001', sku: 'SKU-12345', location_id: 'LOC-001' }
      });
    });

    it('should return null if inventory not found', async () => {
      mockInventoryRepo.findOne.mockResolvedValue(null);

      const result = await inventoryService.getInventoryBySku('tenant-001', 'SKU-NOTFOUND', 'LOC-001');

      expect(result).toBeNull();
    });
  });

  describe('checkAvailability', () => {
    it('should return true if sufficient inventory available', async () => {
      const inventory = {
        id: 'inv-001',
        tenant_id: 'tenant-001',
        sku: 'SKU-12345',
        location_id: 'LOC-001',
        available: 100
      };

      mockInventoryRepo.findOne.mockResolvedValue(inventory as any);

      const result = await inventoryService.checkAvailability('tenant-001', 'SKU-12345', 'LOC-001', 50);

      expect(result).toBe(true);
    });

    it('should return false if insufficient inventory', async () => {
      const inventory = {
        id: 'inv-001',
        tenant_id: 'tenant-001',
        sku: 'SKU-12345',
        location_id: 'LOC-001',
        available: 10
      };

      mockInventoryRepo.findOne.mockResolvedValue(inventory as any);

      const result = await inventoryService.checkAvailability('tenant-001', 'SKU-12345', 'LOC-001', 50);

      expect(result).toBe(false);
    });

    it('should return false if inventory not found', async () => {
      mockInventoryRepo.findOne.mockResolvedValue(null);

      const result = await inventoryService.checkAvailability('tenant-001', 'SKU-NOTFOUND', 'LOC-001', 50);

      expect(result).toBe(false);
    });
  });

  describe('reserveInventory', () => {
    it('should reserve inventory successfully', async () => {
      const input = {
        tenant_id: 'tenant-001',
        order_id: 'ORD-001',
        location_id: 'LOC-001',
        items: [
          {
            sku: 'SKU-12345',
            product_id: 'PROD-001',
            quantity: 10
          }
        ],
        reservation_expires_at: new Date(Date.now() + 3600000)
      };

      const inventory = {
        id: 'inv-001',
        tenant_id: 'tenant-001',
        sku: 'SKU-12345',
        location_id: 'LOC-001',
        available: 100,
        reserved: 0
      };

      const reservation = {
        id: 'res-001',
        ...input,
        sku: input.items[0].sku,
        product_id: input.items[0].product_id,
        quantity: input.items[0].quantity,
        status: 'active' as const
      };

      mockInventoryRepo.findOne.mockResolvedValue(inventory as any);
      mockReservationRepo.create.mockReturnValue(reservation as any);
      mockReservationRepo.save.mockResolvedValue(reservation as any);
      mockInventoryRepo.save.mockResolvedValue({ ...inventory, available: 90, reserved: 10 } as any);

      const result = await inventoryService.reserveInventory(input);

      expect(result).toEqual(reservation);
      expect(mockReservationRepo.save).toHaveBeenCalled();
    });

    it('should throw error if insufficient inventory', async () => {
      const input = {
        tenant_id: 'tenant-001',
        order_id: 'ORD-001',
        location_id: 'LOC-001',
        items: [
          {
            sku: 'SKU-12345',
            product_id: 'PROD-001',
            quantity: 100
          }
        ],
        reservation_expires_at: new Date(Date.now() + 3600000)
      };

      const inventory = {
        id: 'inv-001',
        tenant_id: 'tenant-001',
        sku: 'SKU-12345',
        location_id: 'LOC-001',
        available: 50
      };

      mockInventoryRepo.findOne.mockResolvedValue(inventory as any);

      await expect(inventoryService.reserveInventory(input)).rejects.toThrow(
        'Insufficient inventory for SKU SKU-12345'
      );
    });

    it('should throw error if inventory not found', async () => {
      const input = {
        tenant_id: 'tenant-001',
        order_id: 'ORD-001',
        location_id: 'LOC-001',
        items: [
          {
            sku: 'SKU-NOTFOUND',
            product_id: 'PROD-001',
            quantity: 10
          }
        ],
        reservation_expires_at: new Date(Date.now() + 3600000)
      };

      mockInventoryRepo.findOne.mockResolvedValue(null);

      await expect(inventoryService.reserveInventory(input)).rejects.toThrow(
        'Inventory not found for SKU SKU-NOTFOUND'
      );
    });
  });

  describe('releaseReservation', () => {
    it('should release reservation successfully', async () => {
      const reservation = {
        id: 'res-001',
        tenant_id: 'tenant-001',
        sku: 'SKU-12345',
        location_id: 'LOC-001',
        quantity: 10,
        status: 'active' as const,
        canRelease: jest.fn().mockReturnValue(true)
      };

      const inventory = {
        id: 'inv-001',
        tenant_id: 'tenant-001',
        sku: 'SKU-12345',
        location_id: 'LOC-001',
        available: 90,
        reserved: 10
      };

      mockReservationRepo.findOne.mockResolvedValue(reservation as any);
      mockInventoryRepo.findOne.mockResolvedValue(inventory as any);
      mockInventoryRepo.save.mockResolvedValue({ ...inventory, available: 100, reserved: 0 } as any);
      mockReservationRepo.save.mockResolvedValue({ ...reservation, status: 'released' } as any);

      await inventoryService.releaseReservation('res-001');

      expect(mockReservationRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'released' })
      );
    });

    it('should throw error if reservation not found', async () => {
      mockReservationRepo.findOne.mockResolvedValue(null);

      await expect(inventoryService.releaseReservation('res-notfound')).rejects.toThrow(
        'Reservation not found: res-notfound'
      );
    });

    it('should throw error if reservation cannot be released', async () => {
      const reservation = {
        id: 'res-001',
        status: 'allocated' as const,
        canRelease: jest.fn().mockReturnValue(false)
      };

      mockReservationRepo.findOne.mockResolvedValue(reservation as any);

      await expect(inventoryService.releaseReservation('res-001')).rejects.toThrow(
        'Reservation cannot be released: res-001'
      );
    });
  });

  describe('allocateReservation', () => {
    it('should allocate reservation successfully', async () => {
      const reservation = {
        id: 'res-001',
        tenant_id: 'tenant-001',
        sku: 'SKU-12345',
        location_id: 'LOC-001',
        quantity: 10,
        status: 'active' as const,
        canAllocate: jest.fn().mockReturnValue(true)
      };

      const inventory = {
        id: 'inv-001',
        tenant_id: 'tenant-001',
        sku: 'SKU-12345',
        location_id: 'LOC-001',
        reserved: 10,
        allocated: 0
      };

      mockReservationRepo.findOne.mockResolvedValue(reservation as any);
      mockInventoryRepo.findOne.mockResolvedValue(inventory as any);
      mockInventoryRepo.save.mockResolvedValue({ ...inventory, reserved: 0, allocated: 10 } as any);
      mockReservationRepo.save.mockResolvedValue({ ...reservation, status: 'allocated' } as any);

      await inventoryService.allocateReservation('res-001');

      expect(mockReservationRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'allocated' })
      );
    });

    it('should throw error if reservation not found', async () => {
      mockReservationRepo.findOne.mockResolvedValue(null);

      await expect(inventoryService.allocateReservation('res-notfound')).rejects.toThrow(
        'Reservation not found: res-notfound'
      );
    });

    it('should throw error if reservation cannot be allocated', async () => {
      const reservation = {
        id: 'res-001',
        status: 'expired' as const,
        canAllocate: jest.fn().mockReturnValue(false)
      };

      mockReservationRepo.findOne.mockResolvedValue(reservation as any);

      await expect(inventoryService.allocateReservation('res-001')).rejects.toThrow(
        'Reservation cannot be allocated: res-001'
      );
    });
  });
});
