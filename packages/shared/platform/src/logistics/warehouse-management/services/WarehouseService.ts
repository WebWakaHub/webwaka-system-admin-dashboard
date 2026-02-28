/**
 * WarehouseService
 * 
 * Core business logic for warehouse management operations.
 */

import { DataSource, Repository } from 'typeorm';
import { Warehouse, WarehouseLocation, PickingList, PickingListItem } from '../models';
import {
  CreateWarehouseDTO,
  UpdateWarehouseDTO,
  CreateLocationDTO,
  CreatePickingListDTO,
  PickItemDTO,
  WarehouseFilterDTO,
  LocationFilterDTO,
  PickingListFilterDTO,
  PickingStatus
} from '../types';
import { EventPublisher } from '../events/EventPublisher';

export class WarehouseService {
  private warehouseRepo: Repository<Warehouse>;
  private locationRepo: Repository<WarehouseLocation>;
  private pickingListRepo: Repository<PickingList>;
  private pickingListItemRepo: Repository<PickingListItem>;

  constructor(
    private dataSource: DataSource,
    private eventPublisher: EventPublisher
  ) {
    this.warehouseRepo = dataSource.getRepository(Warehouse);
    this.locationRepo = dataSource.getRepository(WarehouseLocation);
    this.pickingListRepo = dataSource.getRepository(PickingList);
    this.pickingListItemRepo = dataSource.getRepository(PickingListItem);
  }

  // Warehouse Management
  async createWarehouse(dto: CreateWarehouseDTO): Promise<Warehouse> {
    const warehouse = this.warehouseRepo.create({
      ...dto,
      status: 'active'
    });

    const saved = await this.warehouseRepo.save(warehouse);
    await this.eventPublisher.publishWarehouseCreated(saved);
    return saved;
  }

  async getWarehouse(id: string, tenant_id: string): Promise<Warehouse | null> {
    return await this.warehouseRepo.findOne({
      where: { id, tenant_id },
      relations: ['locations']
    });
  }

  async listWarehouses(filters: WarehouseFilterDTO): Promise<{ warehouses: Warehouse[]; total: number }> {
    const { tenant_id, status, page = 1, limit = 20 } = filters;
    
    const query = this.warehouseRepo.createQueryBuilder('warehouse')
      .where('warehouse.tenant_id = :tenant_id', { tenant_id });

    if (status) {
      query.andWhere('warehouse.status = :status', { status });
    }

    const [warehouses, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('warehouse.created_at', 'DESC')
      .getManyAndCount();

    return { warehouses, total };
  }

  async updateWarehouse(id: string, tenant_id: string, dto: UpdateWarehouseDTO): Promise<Warehouse> {
    const warehouse = await this.getWarehouse(id, tenant_id);
    if (!warehouse) {
      throw new Error('Warehouse not found');
    }

    Object.assign(warehouse, dto);
    return await this.warehouseRepo.save(warehouse);
  }

  // Location Management
  async createLocation(dto: CreateLocationDTO): Promise<WarehouseLocation> {
    const location = this.locationRepo.create({
      ...dto,
      current_units: 0,
      status: 'available'
    });

    return await this.locationRepo.save(location);
  }

  async getLocation(id: string, tenant_id: string): Promise<WarehouseLocation | null> {
    return await this.locationRepo.findOne({
      where: { id, tenant_id }
    });
  }

  async listLocations(filters: LocationFilterDTO): Promise<{ locations: WarehouseLocation[]; total: number }> {
    const { tenant_id, warehouse_id, zone, status, page = 1, limit = 50 } = filters;
    
    const query = this.locationRepo.createQueryBuilder('location')
      .where('location.tenant_id = :tenant_id', { tenant_id })
      .andWhere('location.warehouse_id = :warehouse_id', { warehouse_id });

    if (zone) {
      query.andWhere('location.zone = :zone', { zone });
    }

    if (status) {
      query.andWhere('location.status = :status', { status });
    }

    const [locations, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('location.location_code', 'ASC')
      .getManyAndCount();

    return { locations, total };
  }

  // Picking Operations
  async createPickingList(dto: CreatePickingListDTO): Promise<PickingList> {
    // Generate unique picking list number
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const picking_list_number = `PICK-${timestamp}-${random}`;

    // Create picking list
    const pickingList = this.pickingListRepo.create({
      ...dto,
      picking_list_number,
      status: PickingStatus.PENDING,
      items: []
    });

    // TODO: Fetch order items and create picking list items
    // This would integrate with Order Management module
    // For now, we'll save the empty picking list

    const saved = await this.pickingListRepo.save(pickingList);
    await this.eventPublisher.publishPickingListCreated(saved);
    return saved;
  }

  async getPickingList(id: string, tenant_id: string): Promise<PickingList | null> {
    return await this.pickingListRepo.findOne({
      where: { id, tenant_id },
      relations: ['items']
    });
  }

  async listPickingLists(filters: PickingListFilterDTO): Promise<{ picking_lists: PickingList[]; total: number }> {
    const { tenant_id, warehouse_id, status, assigned_to, page = 1, limit = 20 } = filters;
    
    const query = this.pickingListRepo.createQueryBuilder('picking_list')
      .where('picking_list.tenant_id = :tenant_id', { tenant_id });

    if (warehouse_id) {
      query.andWhere('picking_list.warehouse_id = :warehouse_id', { warehouse_id });
    }

    if (status) {
      query.andWhere('picking_list.status = :status', { status });
    }

    if (assigned_to) {
      query.andWhere('picking_list.assigned_to = :assigned_to', { assigned_to });
    }

    const [picking_lists, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('picking_list.priority', 'ASC')
      .addOrderBy('picking_list.created_at', 'ASC')
      .getManyAndCount();

    return { picking_lists, total };
  }

  async startPicking(id: string, tenant_id: string, staff_id: string): Promise<PickingList> {
    const pickingList = await this.getPickingList(id, tenant_id);
    if (!pickingList) {
      throw new Error('Picking list not found');
    }

    pickingList.start(staff_id);
    const saved = await this.pickingListRepo.save(pickingList);
    await this.eventPublisher.publishPickingStarted(saved);
    return saved;
  }

  async pickItem(
    picking_list_id: string,
    item_id: string,
    tenant_id: string,
    dto: PickItemDTO
  ): Promise<PickingList> {
    const pickingList = await this.getPickingList(picking_list_id, tenant_id);
    if (!pickingList) {
      throw new Error('Picking list not found');
    }

    const item = pickingList.items.find(i => i.id === item_id);
    if (!item) {
      throw new Error('Picking list item not found');
    }

    item.pick(dto.quantity_picked, dto.notes);
    await this.pickingListItemRepo.save(item);

    return await this.getPickingList(picking_list_id, tenant_id);
  }

  async completePicking(id: string, tenant_id: string): Promise<PickingList> {
    const pickingList = await this.getPickingList(id, tenant_id);
    if (!pickingList) {
      throw new Error('Picking list not found');
    }

    pickingList.complete();
    const saved = await this.pickingListRepo.save(pickingList);
    await this.eventPublisher.publishPickingCompleted(saved);
    
    // TODO: Trigger packing list generation
    
    return saved;
  }

  // Statistics
  async getWarehouseStatistics(warehouse_id: string, tenant_id: string): Promise<any> {
    const warehouse = await this.getWarehouse(warehouse_id, tenant_id);
    if (!warehouse) {
      throw new Error('Warehouse not found');
    }

    const totalLocations = await this.locationRepo.count({
      where: { warehouse_id, tenant_id }
    });

    const availableLocations = await this.locationRepo.count({
      where: { warehouse_id, tenant_id, status: 'available' }
    });

    const activePicking = await this.pickingListRepo.count({
      where: { warehouse_id, tenant_id, status: PickingStatus.IN_PROGRESS }
    });

    const pendingPicking = await this.pickingListRepo.count({
      where: { warehouse_id, tenant_id, status: PickingStatus.PENDING }
    });

    return {
      warehouse_id,
      total_locations: totalLocations,
      available_locations: availableLocations,
      utilization_rate: totalLocations > 0 ? ((totalLocations - availableLocations) / totalLocations) * 100 : 0,
      active_picking_lists: activePicking,
      pending_picking_lists: pendingPicking
    };
  }
}
