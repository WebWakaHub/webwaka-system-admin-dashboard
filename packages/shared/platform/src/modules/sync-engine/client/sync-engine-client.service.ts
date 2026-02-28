/**
 * Sync Engine Client Service
 * 
 * Provides client-side synchronization functionality.
 */

import { ISyncEngineClient, SyncEngineConfig, SyncStatus, Change, SyncRequest, SyncResponse } from '../types';
import { OfflineStorageService } from './offline-storage.service';

export class SyncEngineClientService implements ISyncEngineClient {
  private config: SyncEngineConfig;
  private storage: OfflineStorageService;
  private syncStatus: SyncStatus = 'idle';
  private syncIntervalId: any = null;
  private pendingChanges: Change[] = [];
  private lastSyncTimestamp: string | null = null;
  private tenantId: string;
  private userId: string;
  private apiBaseUrl: string;

  constructor(
    config: SyncEngineConfig,
    tenantId: string,
    userId: string,
    apiBaseUrl: string = '/api/v1/sync'
  ) {
    this.config = config;
    this.tenantId = tenantId;
    this.userId = userId;
    this.apiBaseUrl = apiBaseUrl;
    this.storage = new OfflineStorageService();
  }

  /**
   * Initialize the Sync Engine Client
   */
  async initialize(): Promise<void> {
    await this.storage.initialize();
    
    // Load pending changes from storage
    const storedChanges = await this.storage.get('_sync', 'pending-changes');
    if (storedChanges) {
      this.pendingChanges = storedChanges;
    }

    // Load last sync timestamp
    const lastSync = await this.storage.get('_sync', 'last-sync-timestamp');
    if (lastSync) {
      this.lastSyncTimestamp = lastSync;
    }

    // Start periodic sync if enabled
    if (this.config.enableRealTimeSync) {
      this.startPeriodicSync();
    }
  }

  /**
   * Start periodic synchronization
   */
  private startPeriodicSync(): void {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
    }

    this.syncIntervalId = setInterval(() => {
      this.sync().catch(error => {
        console.error('Periodic sync failed:', error);
      });
    }, this.config.syncIntervalMs);
  }

  /**
   * Stop periodic synchronization
   */
  private stopPeriodicSync(): void {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
    }
  }

  /**
   * Synchronize with the server
   */
  async sync(): Promise<void> {
    if (this.syncStatus === 'syncing') {
      return; // Already syncing
    }

    this.syncStatus = 'syncing';

    try {
      // Step 1: Send pending changes to server
      if (this.pendingChanges.length > 0) {
        await this.pushChanges();
      }

      // Step 2: Pull changes from server
      await this.pullChanges();

      this.syncStatus = 'idle';
    } catch (error) {
      this.syncStatus = 'error';
      throw error;
    }
  }

  /**
   * Push pending changes to server
   */
  private async pushChanges(): Promise<void> {
    const request: SyncRequest = {
      changes: this.pendingChanges,
      tenantId: this.tenantId,
      userId: this.userId,
    };

    const response = await fetch(`${this.apiBaseUrl}/changes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to push changes: ${response.statusText}`);
    }

    // Clear pending changes
    this.pendingChanges = [];
    await this.storage.set('_sync', 'pending-changes', []);
  }

  /**
   * Pull changes from server
   */
  private async pullChanges(): Promise<void> {
    const request: SyncRequest = {
      lastSyncTimestamp: this.lastSyncTimestamp || undefined,
      tenantId: this.tenantId,
      userId: this.userId,
    };

    const response = await fetch(`${this.apiBaseUrl}/changes?${new URLSearchParams(request as any)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to pull changes: ${response.statusText}`);
    }

    const syncResponse = await response.json() as SyncResponse;

    // Apply changes to local storage
    for (const change of syncResponse.changes) {
      await this.applyChange(change);
    }

    // Update last sync timestamp
    this.lastSyncTimestamp = syncResponse.timestamp;
    await this.storage.set('_sync', 'last-sync-timestamp', this.lastSyncTimestamp);
  }

  /**
   * Apply a change to local storage
   */
  private async applyChange(change: Change): Promise<void> {
    switch (change.type) {
      case 'create':
      case 'update':
        await this.storage.set(change.entity, change.entityId, change.data);
        break;
      case 'delete':
        await this.storage.delete(change.entity, change.entityId);
        break;
    }
  }

  /**
   * Queue a change for synchronization
   */
  private async queueChange(change: Change): Promise<void> {
    this.pendingChanges.push(change);
    await this.storage.set('_sync', 'pending-changes', this.pendingChanges);
  }

  /**
   * Get an item
   */
  async get(entity: string, id: string): Promise<any> {
    return this.storage.get(entity, id);
  }

  /**
   * Get all items of a specific entity type
   */
  async getAll(entity: string): Promise<any[]> {
    return this.storage.getAll(entity);
  }

  /**
   * Create an item
   */
  async create(entity: string, data: any): Promise<string> {
    const id = this.generateId();
    await this.storage.set(entity, id, data);

    const change: Change = {
      id: this.generateId(),
      type: 'create',
      entity,
      entityId: id,
      data,
      timestamp: new Date(),
      tenantId: this.tenantId,
      userId: this.userId,
    };

    await this.queueChange(change);

    return id;
  }

  /**
   * Update an item
   */
  async update(entity: string, id: string, data: any): Promise<void> {
    await this.storage.set(entity, id, data);

    const change: Change = {
      id: this.generateId(),
      type: 'update',
      entity,
      entityId: id,
      data,
      timestamp: new Date(),
      tenantId: this.tenantId,
      userId: this.userId,
    };

    await this.queueChange(change);
  }

  /**
   * Delete an item
   */
  async delete(entity: string, id: string): Promise<void> {
    await this.storage.delete(entity, id);

    const change: Change = {
      id: this.generateId(),
      type: 'delete',
      entity,
      entityId: id,
      timestamp: new Date(),
      tenantId: this.tenantId,
      userId: this.userId,
    };

    await this.queueChange(change);
  }

  /**
   * Get sync status
   */
  getSyncStatus(): SyncStatus {
    return this.syncStatus;
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
