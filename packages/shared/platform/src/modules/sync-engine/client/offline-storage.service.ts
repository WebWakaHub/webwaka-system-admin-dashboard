/**
 * Offline Storage Service
 * 
 * Provides offline storage using IndexedDB.
 */

/// <reference lib="dom" />

import { OfflineStorage } from '../types';

export class OfflineStorageService implements OfflineStorage {
  private dbName: string;
  private db: IDBDatabase | null = null;

  constructor(dbName: string = 'webwaka-offline-db') {
    this.dbName = dbName;
  }

  /**
   * Initialize the IndexedDB database
   */
  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores for different entities
        if (!db.objectStoreNames.contains('entities')) {
          const objectStore = db.createObjectStore('entities', { keyPath: 'key' });
          objectStore.createIndex('entity', 'entity', { unique: false });
          objectStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  /**
   * Get a single item from offline storage
   */
  async get(entity: string, id: string): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['entities'], 'readonly');
      const objectStore = transaction.objectStore('entities');
      const key = `${entity}:${id}`;
      const request = objectStore.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.data : null);
      };
    });
  }

  /**
   * Get all items of a specific entity type from offline storage
   */
  async getAll(entity: string): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['entities'], 'readonly');
      const objectStore = transaction.objectStore('entities');
      const index = objectStore.index('entity');
      const request = index.getAll(entity);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const results = request.result || [];
        resolve(results.map((r: any) => r.data));
      };
    });
  }

  /**
   * Set an item in offline storage
   */
  async set(entity: string, id: string, data: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['entities'], 'readwrite');
      const objectStore = transaction.objectStore('entities');
      const key = `${entity}:${id}`;
      const request = objectStore.put({
        key,
        entity,
        id,
        data,
        timestamp: new Date(),
      });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Delete an item from offline storage
   */
  async delete(entity: string, id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['entities'], 'readwrite');
      const objectStore = transaction.objectStore('entities');
      const key = `${entity}:${id}`;
      const request = objectStore.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Clear all items of a specific entity type from offline storage
   */
  async clear(entity: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['entities'], 'readwrite');
      const objectStore = transaction.objectStore('entities');
      const index = objectStore.index('entity');
      const request = index.openCursor(entity);

      request.onerror = () => reject(request.error);
      request.onsuccess = (event: Event) => {
        const cursor = ((event.target as IDBRequest<IDBCursorWithValue | null>).result);
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
    });
  }
}
