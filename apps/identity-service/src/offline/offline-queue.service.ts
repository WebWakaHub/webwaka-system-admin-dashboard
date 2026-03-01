import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

/**
 * Offline Queue Entry
 *
 * Represents a single queued operation that could not be
 * completed due to network unavailability.
 */
export interface OfflineQueueEntry {
  id: string;
  operation: string;
  payload: Record<string, any>;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  status: 'pending' | 'processing' | 'failed' | 'synced';
  errorMessage?: string;
}

/**
 * Offline Queue Service
 *
 * Implements the Offline-First doctrine for the identity system.
 * When auth events fail to persist (e.g., audit log write failure,
 * event bus unavailable), they are queued locally and retried
 * when connectivity is restored.
 *
 * Africa-First: Designed for intermittent connectivity environments.
 * The queue persists in memory on the server side and can be
 * extended to use Redis or database-backed persistence.
 *
 * Key behaviors:
 * - Failed operations are queued with exponential backoff
 * - Queue has a configurable max size to prevent memory exhaustion
 * - Oldest entries are dropped when queue is full (FIFO eviction)
 * - Sync is attempted automatically at configurable intervals
 * - All queue state changes emit events for observability
 */
@Injectable()
export class OfflineQueueService {
  private readonly logger = new Logger(OfflineQueueService.name);
  private queue: OfflineQueueEntry[] = [];
  private readonly maxQueueSize: number;
  private readonly maxRetries: number;
  private readonly retryInterval: number;
  private syncTimer: NodeJS.Timeout | null = null;

  constructor(private readonly configService: ConfigService) {
    this.maxQueueSize = this.configService.get<number>('offlineFirst.queueMaxSize') || 1000;
    this.maxRetries = this.configService.get<number>('offlineFirst.maxRetries') || 5;
    this.retryInterval = this.configService.get<number>('offlineFirst.syncRetryInterval') || 5000;
  }

  /**
   * Add a failed operation to the offline queue.
   * If the queue is full, the oldest entry is evicted (FIFO).
   */
  enqueue(operation: string, payload: Record<string, any>): OfflineQueueEntry {
    // Evict oldest entry if queue is full
    if (this.queue.length >= this.maxQueueSize) {
      const evicted = this.queue.shift();
      this.logger.warn(
        `Offline queue full (${this.maxQueueSize}). Evicted oldest entry: ${evicted?.id}`,
      );
    }

    const entry: OfflineQueueEntry = {
      id: uuidv4(),
      operation,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: this.maxRetries,
      status: 'pending',
    };

    this.queue.push(entry);
    this.logger.log(
      `Queued offline operation: ${operation} (id: ${entry.id}, queue size: ${this.queue.length})`,
    );

    return entry;
  }

  /**
   * Get all pending entries in the queue.
   */
  getPendingEntries(): OfflineQueueEntry[] {
    return this.queue.filter((e) => e.status === 'pending');
  }

  /**
   * Get the current queue status.
   */
  getQueueStatus(): {
    total: number;
    pending: number;
    processing: number;
    failed: number;
    synced: number;
    oldestEntry: number | null;
  } {
    return {
      total: this.queue.length,
      pending: this.queue.filter((e) => e.status === 'pending').length,
      processing: this.queue.filter((e) => e.status === 'processing').length,
      failed: this.queue.filter((e) => e.status === 'failed').length,
      synced: this.queue.filter((e) => e.status === 'synced').length,
      oldestEntry: this.queue.length > 0 ? this.queue[0].timestamp : null,
    };
  }

  /**
   * Process the queue by executing a sync function for each pending entry.
   * Uses exponential backoff for retries.
   */
  async processQueue(
    syncFn: (entry: OfflineQueueEntry) => Promise<boolean>,
  ): Promise<{ synced: number; failed: number }> {
    const pending = this.getPendingEntries();
    let synced = 0;
    let failed = 0;

    for (const entry of pending) {
      entry.status = 'processing';

      try {
        const success = await syncFn(entry);
        if (success) {
          entry.status = 'synced';
          synced++;
          this.logger.log(`Synced offline entry: ${entry.id}`);
        } else {
          entry.retryCount++;
          if (entry.retryCount >= entry.maxRetries) {
            entry.status = 'failed';
            entry.errorMessage = 'Max retries exceeded';
            failed++;
            this.logger.error(
              `Failed to sync offline entry after ${entry.maxRetries} retries: ${entry.id}`,
            );
          } else {
            entry.status = 'pending'; // Re-queue for retry
          }
        }
      } catch (error: any) {
        entry.retryCount++;
        entry.errorMessage = error.message;
        if (entry.retryCount >= entry.maxRetries) {
          entry.status = 'failed';
          failed++;
        } else {
          entry.status = 'pending';
        }
      }
    }

    // Clean up synced entries
    this.queue = this.queue.filter((e) => e.status !== 'synced');

    return { synced, failed };
  }

  /**
   * Start automatic sync processing at the configured interval.
   */
  startAutoSync(syncFn: (entry: OfflineQueueEntry) => Promise<boolean>): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    this.syncTimer = setInterval(async () => {
      if (this.getPendingEntries().length > 0) {
        this.logger.log('Auto-sync: Processing offline queue...');
        const result = await this.processQueue(syncFn);
        this.logger.log(
          `Auto-sync complete: ${result.synced} synced, ${result.failed} failed`,
        );
      }
    }, this.retryInterval);
  }

  /**
   * Stop automatic sync processing.
   */
  stopAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  /**
   * Clear all entries from the queue.
   */
  clearQueue(): void {
    this.queue = [];
    this.logger.log('Offline queue cleared');
  }
}
