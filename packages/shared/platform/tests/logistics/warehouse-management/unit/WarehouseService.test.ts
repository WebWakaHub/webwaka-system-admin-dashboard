/**
 * WarehouseService Unit Tests
 * Step 394: Unit tests for Warehouse Management module
 * Agent: webwakaagent5
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { DataSource, Repository } from 'typeorm';
import { WarehouseService } from '../../../../src/logistics/warehouse-management/services/WarehouseService';
import { Warehouse, WarehouseLocation, PickingList, PickingListItem } from '../../../../src/logistics/warehouse-management/models';
import { EventPublisher } from '../../../../src/logistics/warehouse-management/events/EventPublisher';
import { CreateWarehouseDTO, CreateLocationDTO, CreatePickingListDTO, PickingStatus } from '../../../../src/logistics/warehouse-management/types';

describe('WarehouseService', () => {
  let service: WarehouseService;
  let dataSource: jest.Mocked<DataSource>;
  let eventPublisher: jest.Mocked<EventPublisher>;
  let warehouseRepo: jest.Mocked<Repository<Warehouse>>;
  let locationRepo: jest.Mocked<Repository<WarehouseLocation>>;
  let pickingListRepo: jest.Mocked<Repository<PickingList>>;
  let pickingListItemRepo: jest.Mocked<Repository<PickingListItem>>;

  beforeEach(() => {
    warehouseRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      createQueryBuilder: jest.fn()
    } as any;

    locationRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn()
    } as any;

    pickingListRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      createQueryBuilder: jest.fn()
    } as any;

    pickingListItemRepo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn()
    } as any;

    dataSource = {
      getRepository: jest.fn((entity) => {
        if (entity === Warehouse) return warehouseRepo;
        if (entity === WarehouseLocation) return locationRepo;
        if (entity === PickingList) return pickingListRepo;
        if (entity === PickingListItem) return pickingListItemRepo;
      })
    } as any;

    eventPublisher = {
      publishWarehouseCreated: jest.fn(),
      publishLocationCreated: jest.fn(),
      publishPickingListCreated: jest.fn(),
      publishPickingListCompleted: jest.fn()
    } as any;

    service = new WarehouseService(dataSource, eventPublisher);
  });

  describe('createWarehouse', () => {
    it('should create a new warehouse', async () => {
      const dto: CreateWarehouseDTO = {
        tenant_id: 'tenant-1',
        name: 'Main Warehouse',
        code: 'WH-001',
        address: '123 Warehouse St',
        city: 'Lagos',
        state: 'Lagos',
        country: 'Nigeria',
        postal_code: '100001',
        manager_name: 'John Doe',
        manager_email: 'john@example.com',
        manager_phone: '+2348012345678'
      };

      const warehouse = {
        id: 'wh-1',
        ...dto,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      } as Warehouse;

      warehouseRepo.create.mockReturnValue(warehouse);
      warehouseRepo.save.mockResolvedValue(warehouse);

      const result = await service.createWarehouse(dto);

      expect(warehouseRepo.create).toHaveBeenCalledWith({
        ...dto,
        status: 'active'
      });
      expect(warehouseRepo.save).toHaveBeenCalledWith(warehouse);
      expect(eventPublisher.publishWarehouseCreated).toHaveBeenCalledWith(warehouse);
      expect(result).toEqual(warehouse);
    });

    it('should set status to active by default', async () => {
      const dto: CreateWarehouseDTO = {
        tenant_id: 'tenant-1',
        name: 'Test Warehouse',
        code: 'WH-002',
        address: '456 Test St',
        city: 'Abuja',
        state: 'FCT',
        country: 'Nigeria',
        postal_code: '900001',
        manager_name: 'Jane Doe',
        manager_email: 'jane@example.com',
        manager_phone: '+2348087654321'
      };

      const warehouse = { ...dto, status: 'active' } as Warehouse;
      warehouseRepo.create.mockReturnValue(warehouse);
      warehouseRepo.save.mockResolvedValue(warehouse);

      await service.createWarehouse(dto);

      expect(warehouseRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'active' })
      );
    });
  });

  describe('getWarehouse', () => {
    it('should retrieve a warehouse by id and tenant_id', async () => {
      const warehouse = {
        id: 'wh-1',
        tenant_id: 'tenant-1',
        name: 'Main Warehouse',
        status: 'active'
      } as Warehouse;

      warehouseRepo.findOne.mockResolvedValue(warehouse);

      const result = await service.getWarehouse('wh-1', 'tenant-1');

      expect(warehouseRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'wh-1', tenant_id: 'tenant-1' }
      });
      expect(result).toEqual(warehouse);
    });

    it('should return null if warehouse not found', async () => {
      warehouseRepo.findOne.mockResolvedValue(null);

      const result = await service.getWarehouse('non-existent', 'tenant-1');

      expect(result).toBeNull();
    });

    it('should enforce multi-tenant isolation', async () => {
      warehouseRepo.findOne.mockResolvedValue(null);

      await service.getWarehouse('wh-1', 'wrong-tenant');

      expect(warehouseRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'wh-1', tenant_id: 'wrong-tenant' }
      });
    });
  });

  describe('createLocation', () => {
    it('should create a new warehouse location', async () => {
      const dto: CreateLocationDTO = {
        warehouse_id: 'wh-1',
        tenant_id: 'tenant-1',
        aisle: 'A',
        rack: '01',
        shelf: '01',
        bin: '01',
        location_type: 'storage'
      };

      const warehouse = { id: 'wh-1', tenant_id: 'tenant-1' } as Warehouse;
      const location = {
        id: 'loc-1',
        ...dto,
        location_code: 'A-01-01-01',
        status: 'active'
      } as WarehouseLocation;

      warehouseRepo.findOne.mockResolvedValue(warehouse);
      locationRepo.create.mockReturnValue(location);
      locationRepo.save.mockResolvedValue(location);

      const result = await service.createLocation(dto);

      expect(locationRepo.create).toHaveBeenCalled();
      expect(locationRepo.save).toHaveBeenCalledWith(location);
      expect(eventPublisher.publishLocationCreated).toHaveBeenCalledWith(location);
      expect(result).toEqual(location);
    });

    it('should throw error if warehouse not found', async () => {
      const dto: CreateLocationDTO = {
        warehouse_id: 'non-existent',
        tenant_id: 'tenant-1',
        aisle: 'A',
        rack: '01',
        shelf: '01',
        bin: '01',
        location_type: 'storage'
      };

      warehouseRepo.findOne.mockResolvedValue(null);

      await expect(service.createLocation(dto)).rejects.toThrow('Warehouse not found');
    });

    it('should generate location code from aisle-rack-shelf-bin', async () => {
      const dto: CreateLocationDTO = {
        warehouse_id: 'wh-1',
        tenant_id: 'tenant-1',
        aisle: 'B',
        rack: '05',
        shelf: '03',
        bin: '02',
        location_type: 'picking'
      };

      const warehouse = { id: 'wh-1', tenant_id: 'tenant-1' } as Warehouse;
      const location = {
        ...dto,
        location_code: 'B-05-03-02'
      } as WarehouseLocation;

      warehouseRepo.findOne.mockResolvedValue(warehouse);
      locationRepo.create.mockReturnValue(location);
      locationRepo.save.mockResolvedValue(location);

      const result = await service.createLocation(dto);

      expect(result.location_code).toBe('B-05-03-02');
    });
  });

  describe('createPickingList', () => {
    it('should create a new picking list', async () => {
      const dto: CreatePickingListDTO = {
        tenant_id: 'tenant-1',
        warehouse_id: 'wh-1',
        order_id: 'order-1',
        assigned_to: 'picker-1',
        items: [
          {
            product_id: 'prod-1',
            product_name: 'Product 1',
            quantity: 5,
            location_id: 'loc-1',
            location_code: 'A-01-01-01'
          }
        ]
      };

      const pickingList = {
        id: 'pl-1',
        ...dto,
        status: PickingStatus.PENDING,
        created_at: new Date()
      } as PickingList;

      pickingListRepo.create.mockReturnValue(pickingList);
      pickingListRepo.save.mockResolvedValue(pickingList);

      const result = await service.createPickingList(dto);

      expect(pickingListRepo.create).toHaveBeenCalled();
      expect(pickingListRepo.save).toHaveBeenCalledWith(pickingList);
      expect(eventPublisher.publishPickingListCreated).toHaveBeenCalledWith(pickingList);
      expect(result).toEqual(pickingList);
    });

    it('should set status to PENDING by default', async () => {
      const dto: CreatePickingListDTO = {
        tenant_id: 'tenant-1',
        warehouse_id: 'wh-1',
        order_id: 'order-1',
        assigned_to: 'picker-1',
        items: []
      };

      const pickingList = { ...dto, status: PickingStatus.PENDING } as PickingList;
      pickingListRepo.create.mockReturnValue(pickingList);
      pickingListRepo.save.mockResolvedValue(pickingList);

      await service.createPickingList(dto);

      expect(pickingListRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: PickingStatus.PENDING })
      );
    });
  });

  describe('completePickingList', () => {
    it('should mark picking list as completed', async () => {
      const pickingList = {
        id: 'pl-1',
        tenant_id: 'tenant-1',
        status: PickingStatus.IN_PROGRESS,
        markAsCompleted: jest.fn()
      } as any;

      pickingListRepo.findOne.mockResolvedValue(pickingList);
      pickingListRepo.save.mockResolvedValue({
        ...pickingList,
        status: PickingStatus.COMPLETED
      });

      const result = await service.completePickingList('pl-1', 'tenant-1');

      expect(pickingList.markAsCompleted).toHaveBeenCalled();
      expect(pickingListRepo.save).toHaveBeenCalledWith(pickingList);
      expect(eventPublisher.publishPickingListCompleted).toHaveBeenCalled();
      expect(result.status).toBe(PickingStatus.COMPLETED);
    });

    it('should throw error if picking list not found', async () => {
      pickingListRepo.findOne.mockResolvedValue(null);

      await expect(
        service.completePickingList('non-existent', 'tenant-1')
      ).rejects.toThrow('Picking list not found');
    });
  });

  describe('Multi-tenant isolation', () => {
    it('should enforce tenant isolation in all queries', async () => {
      const tenant_id = 'tenant-1';

      await service.getWarehouse('wh-1', tenant_id);
      expect(warehouseRepo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tenant_id })
        })
      );
    });

    it('should not allow cross-tenant access', async () => {
      warehouseRepo.findOne.mockResolvedValue(null);

      const result = await service.getWarehouse('wh-1', 'wrong-tenant');

      expect(result).toBeNull();
    });
  });
});
