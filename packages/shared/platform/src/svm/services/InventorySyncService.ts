/**
 * Inventory Synchronization Service
 * Handles real-time inventory synchronization across channels
 */

import { MVMService } from './MVMService';

export interface SyncEvent {
  readonly eventId: string;
  readonly eventType: string;
  readonly productId: string;
  readonly quantity: number;
  readonly channel: string;
  readonly timestamp: Date;
}

export class InventorySyncService {
  private mvmService: MVMService;
  private syncQueue: SyncEvent[] = [];
  private syncInProgress: boolean = false;
  private lastSyncTime: Map<string, Date> = new Map();

  constructor(mvmService: MVMService) {
    this.mvmService = mvmService;
  }

  /**
   * Queue a sync event
   */
  queueSyncEvent(event: SyncEvent): void {
    this.syncQueue.push(event);
  }

  /**
   * Process sync queue
   */
  async processSyncQueue(): Promise<void> {
    if (this.syncInProgress || this.syncQueue.length === 0) {
      return;
    }

    this.syncInProgress = true;

    try {
      const events = [...this.syncQueue];
      this.syncQueue = [];

      for (const event of events) {
        await this.processSyncEvent(event);
      }
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Process individual sync event
   */
  private async processSyncEvent(event: SyncEvent): Promise<void> {
    try {
      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Update inventory based on event
      if (event.eventType === 'sale.completed') {
        this.mvmService.adjustStock(event.productId, -event.quantity);
      } else if (event.eventType === 'inventory.adjusted') {
        const inventory = this.mvmService.getInventoryByProduct(
          event.productId
        );
        if (inventory) {
          inventory.setStockLevel(event.quantity);
        }
      }

      // Record sync time
      this.lastSyncTime.set(event.productId, new Date());
    } catch (error) {
      console.error(`Failed to process sync event: ${event.eventId}`, error);
      // Re-queue failed event
      this.syncQueue.push(event);
    }
  }

  /**
   * Get last sync time for a product
   */
  getLastSyncTime(productId: string): Date | undefined {
    return this.lastSyncTime.get(productId);
  }

  /**
   * Get sync status
   */
  getSyncStatus(): {
    queueLength: number;
    syncInProgress: boolean;
    lastSyncTimes: Record<string, Date>;
  } {
    return {
      queueLength: this.syncQueue.length,
      syncInProgress: this.syncInProgress,
      lastSyncTimes: Object.fromEntries(this.lastSyncTime),
    };
  }

  /**
   * Manual sync trigger
   */
  async triggerManualSync(): Promise<void> {
    await this.processSyncQueue();
  }
}
