import { OfflineQueue, OfflineQueueItem } from '../models/OfflineQueue';

/**
 * Manages offline synchronization for POS transactions
 */
export class OfflineSync {
  private queue: OfflineQueue = new OfflineQueue();
  private isOnline: boolean = navigator?.onLine ?? true;
  private syncInProgress: boolean = false;

  constructor() {
    // Listen for online/offline events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleOnline());
      window.addEventListener('offline', () => this.handleOffline());
    }
  }

  /**
   * Handle online event
   */
  private handleOnline(): void {
    this.isOnline = true;
    this.syncPendingTransactions();
  }

  /**
   * Handle offline event
   */
  private handleOffline(): void {
    this.isOnline = false;
  }

  /**
   * Check if online
   */
  getIsOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Queue a transaction for sync
   */
  queueTransaction(
    transactionId: string,
    type: 'sale' | 'customer_create' | 'inventory_update',
    payload: any
  ): OfflineQueueItem {
    const item = new OfflineQueueItem(transactionId, type, payload);
    this.queue.add(item);
    return item;
  }

  /**
   * Get pending transactions
   */
  getPendingTransactions(): OfflineQueueItem[] {
    return this.queue.getPending();
  }

  /**
   * Get queue size
   */
  getQueueSize(): number {
    return this.queue.size();
  }

  /**
   * Sync pending transactions
   */
  async syncPendingTransactions(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) {
      return;
    }

    this.syncInProgress = true;

    try {
      const pendingItems = this.queue.getPending();

      for (const item of pendingItems) {
        try {
          await this.syncTransaction(item);
          item.markSynced();
        } catch (error) {
          item.incrementRetry();
          if (!item.shouldRetry()) {
            item.markFailed((error as Error).message);
          }
        }
      }

      // Clear synced items
      this.queue.clearSynced();
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Sync a single transaction
   */
  private async syncTransaction(item: OfflineQueueItem): Promise<void> {
    // This would be implemented to call the actual API endpoint
    // For now, we'll simulate the sync
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  }

  /**
   * Get failed transactions
   */
  getFailedTransactions(): OfflineQueueItem[] {
    return this.queue.getFailed();
  }

  /**
   * Retry failed transaction
   */
  async retryFailedTransaction(id: string): Promise<void> {
    const item = this.queue.getById(id);
    if (item && item.shouldRetry()) {
      try {
        await this.syncTransaction(item);
        item.markSynced();
      } catch (error) {
        item.incrementRetry();
        if (!item.shouldRetry()) {
          item.markFailed((error as Error).message);
        }
      }
    }
  }

  /**
   * Clear queue
   */
  clearQueue(): void {
    this.queue.clearSynced();
  }
}
