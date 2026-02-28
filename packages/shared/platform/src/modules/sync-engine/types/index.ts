/**
 * Sync Engine Types and Interfaces
 * 
 * Defines the core types for the Offline-First Sync Engine.
 */

/**
 * Type of change operation
 */
export type ChangeType = 'create' | 'update' | 'delete';

/**
 * Represents a single change to be synchronized
 */
export interface Change {
  id: string;
  type: ChangeType;
  entity: string;
  entityId: string;
  data?: any;
  timestamp: Date;
  tenantId: string;
  userId: string;
}

/**
 * Sync request from client to server
 */
export interface SyncRequest {
  lastSyncTimestamp?: string;
  changes?: Change[];
  tenantId: string;
  userId: string;
}

/**
 * Sync response from server to client
 */
export interface SyncResponse {
  changes: Change[];
  timestamp: string;
}

/**
 * Conflict resolution strategy
 */
export type ConflictResolutionStrategy = 'last-write-wins' | 'custom';

/**
 * Conflict resolution result
 */
export interface ConflictResolution {
  resolved: boolean;
  winner: Change;
  loser: Change;
  strategy: ConflictResolutionStrategy;
}

/**
 * Sync Engine configuration
 */
export interface SyncEngineConfig {
  syncIntervalMs: number;
  maxRetries: number;
  conflictResolutionStrategy: ConflictResolutionStrategy;
  enableRealTimeSync: boolean;
}

/**
 * Offline storage interface
 */
export interface OfflineStorage {
  get(entity: string, id: string): Promise<any>;
  getAll(entity: string): Promise<any[]>;
  set(entity: string, id: string, data: any): Promise<void>;
  delete(entity: string, id: string): Promise<void>;
  clear(entity: string): Promise<void>;
}

/**
 * Sync status
 */
export type SyncStatus = 'idle' | 'syncing' | 'error';

/**
 * Sync Engine client interface
 */
export interface ISyncEngineClient {
  initialize(): Promise<void>;
  sync(): Promise<void>;
  get(entity: string, id: string): Promise<any>;
  getAll(entity: string): Promise<any[]>;
  create(entity: string, data: any): Promise<string>;
  update(entity: string, id: string, data: any): Promise<void>;
  delete(entity: string, id: string): Promise<void>;
  getSyncStatus(): SyncStatus;
}

/**
 * Sync Engine server interface
 */
export interface ISyncEngineServer {
  getChanges(request: SyncRequest): Promise<SyncResponse>;
  postChanges(request: SyncRequest): Promise<void>;
  broadcastChange(change: Change): Promise<void>;
}
