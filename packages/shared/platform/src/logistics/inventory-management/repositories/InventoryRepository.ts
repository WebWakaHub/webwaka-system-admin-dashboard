/**
 * Inventory Repository
 * 
 * Data access layer for Inventory entity with multi-tenant isolation
 */

import { Repository, DataSource } from 'typeorm';
import { Inventory } from '../models';
import { InventoryQuery, CreateInventoryInput, UpdateInventoryInput } from '../types';

export class InventoryRepository {
  private repository: Repository<Inventory>;

  constructor(private dataSource: DataSource) {
    this.repository = dataSource.getRepository(Inventory);
  }

  /**
   * Find inventory by query (with multi-tenant isolation)
   */
  async find(query: InventoryQuery): Promise<Inventory[]> {
    const queryBuilder = this.repository
      .createQueryBuilder('inventory')
      .where('inventory.tenant_id = :tenant_id', { tenant_id: query.tenant_id });

    if (query.sku) {
      queryBuilder.andWhere('inventory.sku = :sku', { sku: query.sku });
    }

    if (query.product_id) {
      queryBuilder.andWhere('inventory.product_id = :product_id', { product_id: query.product_id });
    }

    if (query.location_id) {
      queryBuilder.andWhere('inventory.location_id = :location_id', { location_id: query.location_id });
    }

    return queryBuilder.getMany();
  }

  /**
   * Find inventory by SKU and location
   */
  async findBySkuAndLocation(tenant_id: string, sku: string, location_id: string): Promise<Inventory | null> {
    return this.repository.findOne({
      where: { tenant_id, sku, location_id }
    });
  }

  /**
   * Find inventory by ID
   */
  async findById(id: string, tenant_id: string): Promise<Inventory | null> {
    return this.repository.findOne({
      where: { id, tenant_id }
    });
  }

  /**
   * Create new inventory record
   */
  async create(input: CreateInventoryInput): Promise<Inventory> {
    const inventory = this.repository.create({
      ...input,
      available: input.on_hand || 0,
      reserved: 0,
      allocated: 0,
      committed: 0,
      total_value: (input.on_hand || 0) * (input.unit_cost || 0)
    });

    return this.repository.save(inventory);
  }

  /**
   * Update inventory record
   */
  async update(id: string, tenant_id: string, input: UpdateInventoryInput): Promise<Inventory> {
    const inventory = await this.findById(id, tenant_id);
    if (!inventory) {
      throw new Error(`Inventory not found: ${id}`);
    }

    Object.assign(inventory, input);

    // Recalculate total value if unit_cost or on_hand changed
    if (input.unit_cost !== undefined || input.on_hand !== undefined) {
      inventory.total_value = inventory.on_hand * (inventory.unit_cost || 0);
    }

    return this.repository.save(inventory);
  }

  /**
   * Update stock levels (atomic operation)
   */
  async updateStockLevels(
    id: string,
    tenant_id: string,
    delta: {
      on_hand?: number;
      available?: number;
      reserved?: number;
      allocated?: number;
      committed?: number;
    }
  ): Promise<Inventory> {
    const inventory = await this.findById(id, tenant_id);
    if (!inventory) {
      throw new Error(`Inventory not found: ${id}`);
    }

    if (delta.on_hand !== undefined) inventory.on_hand += delta.on_hand;
    if (delta.available !== undefined) inventory.available += delta.available;
    if (delta.reserved !== undefined) inventory.reserved += delta.reserved;
    if (delta.allocated !== undefined) inventory.allocated += delta.allocated;
    if (delta.committed !== undefined) inventory.committed += delta.committed;

    // Validate balance constraint
    if (!inventory.validateBalance()) {
      throw new Error('Stock level balance constraint violated');
    }

    // Recalculate total value
    inventory.total_value = inventory.on_hand * (inventory.unit_cost || 0);

    return this.repository.save(inventory);
  }

  /**
   * Find low stock items (available <= reorder_point)
   */
  async findLowStock(tenant_id: string, location_id?: string): Promise<Inventory[]> {
    const queryBuilder = this.repository
      .createQueryBuilder('inventory')
      .where('inventory.tenant_id = :tenant_id', { tenant_id })
      .andWhere('inventory.reorder_point IS NOT NULL')
      .andWhere('inventory.available <= inventory.reorder_point');

    if (location_id) {
      queryBuilder.andWhere('inventory.location_id = :location_id', { location_id });
    }

    return queryBuilder.getMany();
  }

  /**
   * Find out of stock items (available = 0)
   */
  async findOutOfStock(tenant_id: string, location_id?: string): Promise<Inventory[]> {
    const queryBuilder = this.repository
      .createQueryBuilder('inventory')
      .where('inventory.tenant_id = :tenant_id', { tenant_id })
      .andWhere('inventory.available = 0');

    if (location_id) {
      queryBuilder.andWhere('inventory.location_id = :location_id', { location_id });
    }

    return queryBuilder.getMany();
  }

  /**
   * Get total inventory value by location
   */
  async getTotalValue(tenant_id: string, location_id?: string): Promise<number> {
    const queryBuilder = this.repository
      .createQueryBuilder('inventory')
      .select('SUM(inventory.total_value)', 'total')
      .where('inventory.tenant_id = :tenant_id', { tenant_id });

    if (location_id) {
      queryBuilder.andWhere('inventory.location_id = :location_id', { location_id });
    }

    const result = await queryBuilder.getRawOne();
    return parseFloat(result?.total || '0');
  }

  /**
   * Get inventory count by location
   */
  async getInventoryCount(tenant_id: string, location_id?: string): Promise<{ item_count: number; sku_count: number }> {
    const queryBuilder = this.repository
      .createQueryBuilder('inventory')
      .where('inventory.tenant_id = :tenant_id', { tenant_id });

    if (location_id) {
      queryBuilder.andWhere('inventory.location_id = :location_id', { location_id });
    }

    const inventories = await queryBuilder.getMany();
    const item_count = inventories.reduce((sum, inv) => sum + inv.on_hand, 0);
    const sku_count = inventories.length;

    return { item_count, sku_count };
  }

  /**
   * Delete inventory record (soft delete by setting quantities to 0)
   */
  async delete(id: string, tenant_id: string): Promise<void> {
    const inventory = await this.findById(id, tenant_id);
    if (!inventory) {
      throw new Error(`Inventory not found: ${id}`);
    }

    // Soft delete by setting all quantities to 0
    inventory.on_hand = 0;
    inventory.available = 0;
    inventory.reserved = 0;
    inventory.allocated = 0;
    inventory.committed = 0;
    inventory.total_value = 0;

    await this.repository.save(inventory);
  }
}
