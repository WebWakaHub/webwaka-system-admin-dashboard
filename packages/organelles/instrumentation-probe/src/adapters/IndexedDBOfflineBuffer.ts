/**
 * ORG-IN-INSTRUMENTATION_PROBE-v0.1.0
 * IndexedDB Offline Buffer Adapter (Browser Environment)
 *
 * Agent: webwakaagent4 (Engineering & Delivery)
 * Issue: webwaka-organelle-universe#480 (P3-T02)
 *
 * Implements IOfflineBufferPort for browser environments using IndexedDB.
 * Supports Nigeria First / Offline First doctrines.
 */

import { IOfflineBufferPort } from '../ports';
import { BufferEntry } from '../types';
import { BufferOverflowError } from '../errors';

const DB_NAME = 'webwaka_instrumentation_buffer';
const STORE_NAME = 'telemetry_entries';
const DB_VERSION = 1;

export class IndexedDBOfflineBuffer implements IOfflineBufferPort {
  private db: IDBDatabase | null = null;
  private maxSize: number;
  private currentByteSize: number = 0;

  constructor(maxSize: number = 10 * 1024 * 1024) {
    this.maxSize = maxSize;
  }

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: 'id',
            autoIncrement: true,
          });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('type', 'type', { unique: false });
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onerror = () => {
        reject(new Error(`Failed to open IndexedDB: ${request.error?.message}`));
      };
    });
  }

  async append(entry: BufferEntry): Promise<void> {
    const serialized = JSON.stringify(entry);
    const entrySize = new TextEncoder().encode(serialized).length;

    // Check buffer capacity (INV-IN-008)
    if (this.currentByteSize + entrySize > this.maxSize) {
      // Evict oldest entries to make room
      await this.evictOldest(entrySize);

      if (this.currentByteSize + entrySize > this.maxSize) {
        throw new BufferOverflowError(this.currentByteSize + entrySize, this.maxSize);
      }
    }

    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.add(entry);

      tx.oncomplete = () => {
        this.currentByteSize += entrySize;
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  }

  async flush(batchSize: number): Promise<BufferEntry[]> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('timestamp');
      const entries: BufferEntry[] = [];
      const keysToDelete: IDBValidKey[] = [];

      const cursorRequest = index.openCursor();
      let count = 0;

      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result;
        if (cursor && count < batchSize) {
          entries.push(cursor.value);
          keysToDelete.push(cursor.primaryKey);
          count++;
          cursor.continue();
        } else {
          // Delete flushed entries
          for (const key of keysToDelete) {
            store.delete(key);
          }
        }
      };

      tx.oncomplete = () => {
        // Update byte size estimate
        for (const entry of entries) {
          const size = new TextEncoder().encode(JSON.stringify(entry)).length;
          this.currentByteSize = Math.max(0, this.currentByteSize - size);
        }
        resolve(entries);
      };
      tx.onerror = () => reject(tx.error);
    });
  }

  async getSize(): Promise<number> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const countRequest = store.count();
      countRequest.onsuccess = () => resolve(countRequest.result);
      countRequest.onerror = () => reject(countRequest.error);
    });
  }

  async getByteSize(): Promise<number> {
    return this.currentByteSize;
  }

  async clear(): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.clear();
      tx.oncomplete = () => {
        this.currentByteSize = 0;
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  }

  setMaxSize(bytes: number): void {
    this.maxSize = bytes;
    // Trigger eviction if over limit (async, fire-and-forget)
    if (this.currentByteSize > this.maxSize) {
      this.evictOldest(0).catch(() => {});
    }
  }

  private async evictOldest(bytesNeeded: number): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('timestamp');
      const cursorRequest = index.openCursor();
      let freedBytes = 0;

      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result;
        if (cursor && this.currentByteSize - freedBytes + bytesNeeded > this.maxSize) {
          const size = new TextEncoder().encode(JSON.stringify(cursor.value)).length;
          freedBytes += size;
          cursor.delete();
          cursor.continue();
        }
      };

      tx.oncomplete = () => {
        this.currentByteSize = Math.max(0, this.currentByteSize - freedBytes);
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  }
}
