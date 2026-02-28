import { v4 as uuidv4 } from 'uuid';

/**
 * Represents a queued transaction for offline-first functionality
 */
export class OfflineQueueItem {
  readonly id: string;
  readonly transactionId: string;
  readonly type: 'sale' | 'customer_create' | 'inventory_update';
  readonly payload: any;
  status: 'pending' | 'synced' | 'failed';
  readonly createdAt: Date;
  syncedAt?: Date;
  errorMessage?: string;
  retryCount: number;

  constructor(
    transactionId: string,
    type: 'sale' | 'customer_create' | 'inventory_update',
    payload: any,
    status: 'pending' | 'synced' | 'failed' = 'pending'
  ) {
    this.id = uuidv4();
    this.transactionId = transactionId;
    this.type = type;
    this.payload = payload;
    this.status = status;
    this.createdAt = new Date();
    this.retryCount = 0;
  }

  /**
   * Mark as synced
   */
  markSynced(): void {
    this.status = 'synced';
    this.syncedAt = new Date();
  }

  /**
   * Mark as failed
   */
  markFailed(errorMessage: string): void {
    this.status = 'failed';
    this.errorMessage = errorMessage;
  }

  /**
   * Increment retry count
   */
  incrementRetry(): void {
    this.retryCount++;
  }

  /**
   * Check if should retry
   */
  shouldRetry(): boolean {
    return this.retryCount < 3 && this.status === 'failed';
  }
}

/**
 * Manages offline queue for transactions
 */
export class OfflineQueue {
  private items: OfflineQueueItem[] = [];

  /**
   * Add item to queue
   */
  add(item: OfflineQueueItem): void {
    this.items.push(item);
  }

  /**
   * Get pending items
   */
  getPending(): OfflineQueueItem[] {
    return this.items.filter(item => item.status === 'pending');
  }

  /**
   * Get failed items
   */
  getFailed(): OfflineQueueItem[] {
    return this.items.filter(item => item.status === 'failed');
  }

  /**
   * Get item by ID
   */
  getById(id: string): OfflineQueueItem | undefined {
    return this.items.find(item => item.id === id);
  }

  /**
   * Remove item from queue
   */
  remove(id: string): void {
    this.items = this.items.filter(item => item.id !== id);
  }

  /**
   * Clear all synced items
   */
  clearSynced(): void {
    this.items = this.items.filter(item => item.status !== 'synced');
  }

  /**
   * Get queue size
   */
  size(): number {
    return this.items.length;
  }

  /**
   * Get all items
   */
  getAll(): OfflineQueueItem[] {
    return [...this.items];
  }
}
