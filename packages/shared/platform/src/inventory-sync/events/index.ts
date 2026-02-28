/**
 * Inventory Synchronization Event Handlers
 * Handles events for inventory synchronization
 */

import { SyncService } from '../services';

export class InventorySyncEventHandler {
  private syncService: SyncService;

  constructor() {
    this.syncService = new SyncService();
  }

  /**
   * Handles inventory.updated events
   * Triggered when inventory is updated on the platform
   */
  async onInventoryUpdated(event: any): Promise<void> {
    try {
      const { connection_id, inventory } = event.data;

      if (!connection_id || !inventory) {
        throw new Error('Missing connection_id or inventory data');
      }

      // Update inventory in the system
      await this.syncService.updateInventory(inventory);

      // Emit event to notify other services
      console.log(`Inventory updated for connection: ${connection_id}`);
    } catch (error) {
      console.error('Error handling inventory.updated event:', error);
    }
  }

  /**
   * Handles sync.triggered events
   * Triggered when a manual synchronization is requested
   */
  async onSyncTriggered(event: any): Promise<void> {
    try {
      const { connection_id } = event.data;

      if (!connection_id) {
        throw new Error('Missing connection_id');
      }

      // Perform synchronization
      const result = await this.syncService.syncInventory(connection_id);

      if (result.success) {
        console.log(`Synchronization completed for connection: ${connection_id}`);
      } else {
        console.error(`Synchronization failed for connection: ${connection_id}`);
      }
    } catch (error) {
      console.error('Error handling sync.triggered event:', error);
    }
  }

  /**
   * Handles connection.created events
   * Triggered when a new connection is created
   */
  async onConnectionCreated(event: any): Promise<void> {
    try {
      const { connection } = event.data;

      if (!connection) {
        throw new Error('Missing connection data');
      }

      console.log(`Connection created: ${connection.connection_id}`);

      // Optionally trigger initial synchronization
      // await this.syncService.syncInventory(connection.connection_id);
    } catch (error) {
      console.error('Error handling connection.created event:', error);
    }
  }

  /**
   * Handles connection.deleted events
   * Triggered when a connection is deleted
   */
  async onConnectionDeleted(event: any): Promise<void> {
    try {
      const { connection_id } = event.data;

      if (!connection_id) {
        throw new Error('Missing connection_id');
      }

      console.log(`Connection deleted: ${connection_id}`);
    } catch (error) {
      console.error('Error handling connection.deleted event:', error);
    }
  }

  /**
   * Handles sync.error events
   * Triggered when a synchronization error occurs
   */
  async onSyncError(event: any): Promise<void> {
    try {
      const { connection_id, error } = event.data;

      if (!connection_id || !error) {
        throw new Error('Missing connection_id or error data');
      }

      console.error(`Synchronization error for connection ${connection_id}: ${error}`);

      // Optionally send alert or notification
    } catch (error) {
      console.error('Error handling sync.error event:', error);
    }
  }
}

export const inventorySyncEventHandler = new InventorySyncEventHandler();
