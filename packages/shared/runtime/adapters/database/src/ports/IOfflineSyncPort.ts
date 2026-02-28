/**
 * RUNTIME-ADAPTER-DATABASE-v0.1.0
 * IOfflineSyncPort — Offline Synchronization Contract
 *
 * Issue: webwaka-runtime-universe#18 (P3-T01)
 */

import { ExecutionContext } from '../types/context';
import {
  SyncChange,
  SyncConflict,
  ConflictResolution,
  SyncResult,
  SyncStatus,
} from '../types/sync';

/**
 * Offline sync port for managing local-remote data synchronization.
 * Used exclusively in offline-first mode (SQLite).
 */
export interface IOfflineSyncPort {
  /**
   * Queue a local change for sync to remote.
   */
  queueChange(change: SyncChange): Promise<void>;

  /**
   * Get all pending changes ordered by priority.
   */
  getPendingChanges(limit?: number): Promise<SyncChange[]>;

  /**
   * Execute a sync cycle: push local changes, pull remote changes.
   */
  sync(context: ExecutionContext): Promise<SyncResult>;

  /**
   * Resolve a sync conflict.
   */
  resolveConflict(
    conflict: SyncConflict,
    resolution: ConflictResolution,
  ): Promise<void>;

  /**
   * Get current sync status.
   */
  getSyncStatus(): Promise<SyncStatus>;

  /**
   * Force a full re-sync from remote.
   */
  fullResync(context: ExecutionContext): Promise<SyncResult>;
}
