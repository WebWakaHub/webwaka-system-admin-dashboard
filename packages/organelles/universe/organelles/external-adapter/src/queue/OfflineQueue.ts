/**
 * ORG-EI-EXTERNAL_ADAPTER-v0.1.0 — OfflineQueue
 * Persistent offline queue with IndexedDB and in-memory fallback
 * Agent: webwakaagent4 (Engineering & Delivery)
 * Issue: #510 (P3-T03)
 */

import { QueueEntry } from '../types';
import { IOfflineQueuePort } from '../ports';
import { QueueFullError } from '../errors';

export class InMemoryOfflineQueue implements IOfflineQueuePort {
  private readonly queue: QueueEntry[] = [];
  private readonly maxSize: number;
  private readonly maxBytes: number;
  private currentBytes = 0;

  constructor(maxSize: number = 1000, maxBytes: number = 10 * 1024 * 1024) {
    this.maxSize = maxSize;
    this.maxBytes = maxBytes;
  }

  async enqueue<T>(entry: QueueEntry<T>): Promise<void> {
    const entrySize = this.estimateSize(entry);

    if (this.queue.length >= this.maxSize) {
      throw new QueueFullError(this.queue.length, this.maxSize);
    }

    if (this.currentBytes + entrySize > this.maxBytes) {
      throw new QueueFullError(this.queue.length, this.maxSize);
    }

    this.queue.push(entry as QueueEntry);
    this.currentBytes += entrySize;
  }

  async peek(count: number): Promise<QueueEntry[]> {
    return this.queue.slice(0, Math.min(count, this.queue.length));
  }

  async dequeue(id: string): Promise<void> {
    const index = this.queue.findIndex(e => e.id === id);
    if (index !== -1) {
      const entry = this.queue[index];
      this.currentBytes -= this.estimateSize(entry);
      this.queue.splice(index, 1);
    }
  }

  async size(): Promise<number> {
    return this.queue.length;
  }

  async sizeBytes(): Promise<number> {
    return this.currentBytes;
  }

  async clear(): Promise<void> {
    this.queue.length = 0;
    this.currentBytes = 0;
  }

  private estimateSize(entry: QueueEntry): number {
    return JSON.stringify(entry).length * 2;
  }
}
