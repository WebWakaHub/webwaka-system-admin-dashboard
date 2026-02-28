/**
 * Inventory Service
 * 
 * Core business logic for inventory management operations
 * Implements IInventoryService interface
 */

import { DataSource } from 'typeorm';
import { Inventory, InventoryReservation } from '../models';
import { InventoryRepository } from '../repositories/InventoryRepository';
import {
  IInventoryService,
  InventoryQuery,
  CreateInventoryInput,
  UpdateInventoryInput,
  CreateReservationInput
} from '../types';
import { EventPublisher } from '../events/EventPublisher';

export class InventoryService implements IInventoryService {
  private inventoryRepo: InventoryRepository;
  private eventPublisher: EventPublisher;

  constructor(
    private dataSource: DataSource,
    eventPublisher: EventPublisher
  ) {
    this.inventoryRepo = new InventoryRepository(dataSource);
    this.eventPublisher = eventPublisher;
  }

  /**
   * Get inventory by query
   */
  async getInventory(query: InventoryQuery): Promise<Inventory[]> {
    return this.inventoryRepo.find(query);
  }

  /**
   * Get inventory by SKU (optionally filtered by location)
   */
  async getInventoryBySku(
    tenant_id: string,
    sku: string,
    location_id?: string
  ): Promise<Inventory | null> {
    if (location_id) {
      return this.inventoryRepo.findBySkuAndLocation(tenant_id, sku, location_id);
    }

    // If no location specified, return first match (or aggregate across locations)
    const inventories = await this.inventoryRepo.find({ tenant_id, sku });
    return inventories.length > 0 ? inventories[0] : null;
  }

  /**
   * Create new inventory record
   */
  async createInventory(input: CreateInventoryInput): Promise<Inventory> {
    // Check if inventory already exists for this SKU and location
    const existing = await this.inventoryRepo.findBySkuAndLocation(
      input.tenant_id,
      input.sku,
      input.location_id
    );

    if (existing) {
      throw new Error(`Inventory already exists for SKU ${input.sku} at location ${input.location_id}`);
    }

    const inventory = await this.inventoryRepo.create(input);

    // Emit event if initial stock > 0
    if (inventory.on_hand > 0) {
      await this.eventPublisher.publish({
        eventType: 'inventory.stock_level_changed',
        eventId: this.generateEventId(),
        timestamp: new Date(),
        tenantId: inventory.tenant_id,
        data: {
          sku: inventory.sku,
          location_id: inventory.location_id,
          previous_on_hand: 0,
          new_on_hand: inventory.on_hand,
          previous_available: 0,
          new_available: inventory.available,
          change_quantity: inventory.on_hand,
          change_reason: 'receipt',
          movement_id: 'initial',
          reference_number: 'INITIAL_STOCK'
        }
      });
    }

    return inventory;
  }

  /**
   * Update inventory record
   */
  async updateInventory(id: string, input: UpdateInventoryInput): Promise<Inventory> {
    // Get current inventory to track changes
    const current = await this.inventoryRepo.findById(id, input.tenant_id || '');
    if (!current) {
      throw new Error(`Inventory not found: ${id}`);
    }

    const previous_on_hand = current.on_hand;
    const previous_available = current.available;

    const updated = await this.inventoryRepo.update(id, current.tenant_id, input);

    // Emit event if stock levels changed
    if (updated.on_hand !== previous_on_hand || updated.available !== previous_available) {
      await this.eventPublisher.publish({
        eventType: 'inventory.stock_level_changed',
        eventId: this.generateEventId(),
        timestamp: new Date(),
        tenantId: updated.tenant_id,
        data: {
          sku: updated.sku,
          location_id: updated.location_id,
          previous_on_hand,
          new_on_hand: updated.on_hand,
          previous_available,
          new_available: updated.available,
          change_quantity: updated.on_hand - previous_on_hand,
          change_reason: 'adjustment',
          movement_id: 'manual_update',
          reference_number: undefined
        }
      });
    }

    return updated;
  }

  /**
   * Reserve inventory for an order (time-limited)
   */
  async reserveInventory(input: CreateReservationInput): Promise<InventoryReservation> {
    const reservationRepo = this.dataSource.getRepository(InventoryReservation);

    // Check inventory availability for each item
    for (const item of input.items) {
      const inventory = await this.inventoryRepo.findBySkuAndLocation(
        input.tenant_id,
        item.sku,
        input.location_id
      );

      if (!inventory) {
        throw new Error(`Inventory not found for SKU ${item.sku} at location ${input.location_id}`);
      }

      if (inventory.available < item.quantity) {
        throw new Error(
          `Insufficient inventory for SKU ${item.sku}. Available: ${inventory.available}, Requested: ${item.quantity}`
        );
      }
    }

    // Create reservations and update inventory
    const reservations: InventoryReservation[] = [];

    for (const item of input.items) {
      // Create reservation
      const reservation = reservationRepo.create({
        tenant_id: input.tenant_id,
        order_id: input.order_id,
        sku: item.sku,
        product_id: item.product_id,
        location_id: input.location_id,
        quantity: item.quantity,
        reservation_expires_at: input.reservation_expires_at,
        status: 'active'
      });

      await reservationRepo.save(reservation);
      reservations.push(reservation);

      // Update inventory stock levels (decrease available, increase reserved)
      const inventory = await this.inventoryRepo.findBySkuAndLocation(
        input.tenant_id,
        item.sku,
        input.location_id
      );

      if (inventory) {
        await this.inventoryRepo.updateStockLevels(inventory.id, input.tenant_id, {
          available: -item.quantity,
          reserved: item.quantity
        });
      }
    }

    // Return first reservation (or aggregate if needed)
    return reservations[0];
  }

  /**
   * Release reservation (cancel order or timeout)
   */
  async releaseReservation(reservation_id: string): Promise<void> {
    const reservationRepo = this.dataSource.getRepository(InventoryReservation);
    const reservation = await reservationRepo.findOne({ where: { id: reservation_id } });

    if (!reservation) {
      throw new Error(`Reservation not found: ${reservation_id}`);
    }

    if (!reservation.canRelease()) {
      throw new Error(`Reservation cannot be released: ${reservation_id}`);
    }

    // Update inventory stock levels (increase available, decrease reserved)
    const inventory = await this.inventoryRepo.findBySkuAndLocation(
      reservation.tenant_id,
      reservation.sku,
      reservation.location_id
    );

    if (inventory) {
      await this.inventoryRepo.updateStockLevels(inventory.id, reservation.tenant_id, {
        available: reservation.quantity,
        reserved: -reservation.quantity
      });
    }

    // Update reservation status
    reservation.status = 'released';
    await reservationRepo.save(reservation);
  }

  /**
   * Allocate reservation (confirm order)
   */
  async allocateReservation(reservation_id: string): Promise<void> {
    const reservationRepo = this.dataSource.getRepository(InventoryReservation);
    const reservation = await reservationRepo.findOne({ where: { id: reservation_id } });

    if (!reservation) {
      throw new Error(`Reservation not found: ${reservation_id}`);
    }

    if (!reservation.canAllocate()) {
      throw new Error(`Reservation cannot be allocated: ${reservation_id}`);
    }

    // Update inventory stock levels (decrease reserved, increase allocated)
    const inventory = await this.inventoryRepo.findBySkuAndLocation(
      reservation.tenant_id,
      reservation.sku,
      reservation.location_id
    );

    if (inventory) {
      await this.inventoryRepo.updateStockLevels(inventory.id, reservation.tenant_id, {
        reserved: -reservation.quantity,
        allocated: reservation.quantity
      });
    }

    // Update reservation status
    reservation.status = 'allocated';
    await reservationRepo.save(reservation);
  }

  /**
   * Check inventory availability
   */
  async checkAvailability(
    tenant_id: string,
    sku: string,
    location_id: string,
    quantity: number
  ): Promise<boolean> {
    const inventory = await this.inventoryRepo.findBySkuAndLocation(tenant_id, sku, location_id);

    if (!inventory) {
      return false;
    }

    return inventory.available >= quantity;
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `evt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}
