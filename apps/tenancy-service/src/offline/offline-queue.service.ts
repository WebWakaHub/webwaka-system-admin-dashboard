import { Injectable, Logger } from '@nestjs/common';

interface QueueEntry {
  id: string;
  operation: string;
  payload: unknown;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

/**
 * Offline Queue Service
 *
 * In-memory queue for operations that fail due to connectivity issues.
 * Implements FIFO with configurable max size and eviction.
 *
 * Offline-First: All failed operations are queued for replay
 * when connectivity is restored.
 *
 * Nigeria-First: Conservative defaults for retry intervals
 * and queue size to handle intermittent connectivity.
 */
@Injectable()
export class OfflineQueueService {
  private readonly logger = new Logger(OfflineQueueService.name);
  private readonly queue: QueueEntry[] = [];
  private readonly maxQueueSize = 100;
  private readonly defaultMaxRetries = 3;

  /**
   * Add an operation to the offline queue.
   * Evicts oldest entry if queue is full (FIFO eviction).
   */
  async enqueue(entry: {
    operation: string;
    payload: unknown;
    maxRetries?: number;
  }): Promise<void> {
    if (this.queue.length >= this.maxQueueSize) {
      const evicted = this.queue.shift();
      this.logger.warn(
        `Offline queue full (${this.maxQueueSize}). Evicted oldest entry: ${evicted?.operation}`,
      );
    }

    this.queue.push({
      id: `oq-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      operation: entry.operation,
      payload: entry.payload,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: entry.maxRetries || this.defaultMaxRetries,
    });

    this.logger.log(
      `Queued offline operation: ${entry.operation} (queue size: ${this.queue.length})`,
    );
  }

  /**
   * Process all queued operations.
   * Called when connectivity is restored.
   */
  async processQueue(
    processor: (entry: QueueEntry) => Promise<void>,
  ): Promise<{ processed: number; failed: number }> {
    let processed = 0;
    let failed = 0;
    const toRemove: string[] = [];

    for (const entry of this.queue) {
      try {
        await processor(entry);
        toRemove.push(entry.id);
        processed++;
      } catch (error) {
        entry.retryCount++;
        if (entry.retryCount >= entry.maxRetries) {
          this.logger.error(
            `Offline operation '${entry.operation}' exceeded max retries (${entry.maxRetries}). Dropping.`,
          );
          toRemove.push(entry.id);
          failed++;
        }
      }
    }

    // Remove processed and exhausted entries
    for (const id of toRemove) {
      const idx = this.queue.findIndex((e) => e.id === id);
      if (idx !== -1) this.queue.splice(idx, 1);
    }

    return { processed, failed };
  }

  /**
   * Get the current queue status.
   */
  getStatus(): {
    size: number;
    maxSize: number;
    oldestEntry: number | null;
  } {
    return {
      size: this.queue.length,
      maxSize: this.maxQueueSize,
      oldestEntry: this.queue.length > 0 ? this.queue[0].timestamp : null,
    };
  }

  /**
   * Clear the queue (used in tests and emergency recovery).
   */
  clear(): void {
    this.queue.length = 0;
  }
}
