/**
 * RUNTIME-ADAPTER-DATABASE-v0.1.0
 * Sync Types — Offline synchronization model
 *
 * Issue: webwaka-runtime-universe#18 (P3-T01)
 */

export interface SyncChange {
  id: string;
  tableName: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  recordId: string;
  payload: Record<string, unknown>;
  createdAt: string;
  priority: number;
}

export interface SyncConflict {
  localChange: SyncChange;
  remoteVersion: Record<string, unknown>;
  conflictType: 'UPDATE_UPDATE' | 'UPDATE_DELETE' | 'DELETE_UPDATE';
}

export type ConflictResolution =
  | { strategy: 'local_wins' }
  | { strategy: 'remote_wins' }
  | { strategy: 'merge'; mergedData: Record<string, unknown> };

export interface SyncResult {
  pushed: number;
  pulled: number;
  conflicts: number;
  resolved: number;
  failed: number;
  duration_ms: number;
}

export interface SyncStatus {
  pendingChanges: number;
  lastSyncAt: string | null;
  syncHealthy: boolean;
  consecutiveFailures: number;
}
