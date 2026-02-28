/**
 * RUNTIME-ADAPTER-DATABASE-v0.1.0
 * SyncEngine — Offline synchronization with conflict resolution
 *
 * Issue: webwaka-runtime-universe#20 (P3-T03)
 */

import { IOfflineSyncPort } from '../ports/IOfflineSyncPort';
import { ExecutionContext } from '../types/context';
import {
  SyncChange,
  SyncConflict,
  ConflictResolution,
  SyncResult,
  SyncStatus,
} from '../types/sync';
import { DatabaseError, DatabaseErrorCode } from '../types/errors';

export class SyncEngine implements IOfflineSyncPort {
  private queue: SyncChange[] = [];
  private lastSyncAt: string | null = null;
  private consecutiveFailures: number = 0;
  private readonly maxBatchSize: number;
  private readonly conflictStrategy: string;

  constructor(maxBatchSize: number = 100, conflictStrategy: string = 'lww') {
    this.maxBatchSize = maxBatchSize;
    this.conflictStrategy = conflictStrategy;
  }

  async queueChange(change: SyncChange): Promise<void> {
    // Insert in priority order (higher priority first)
    const insertIndex = this.queue.findIndex((c) => c.priority < change.priority);
    if (insertIndex === -1) {
      this.queue.push(change);
    } else {
      this.queue.splice(insertIndex, 0, change);
    }
  }

  async getPendingChanges(limit?: number): Promise<SyncChange[]> {
    const effectiveLimit = limit || this.maxBatchSize;
    return this.queue.slice(0, effectiveLimit);
  }

  async sync(context: ExecutionContext): Promise<SyncResult> {
    const startTime = Date.now();
    let pushed = 0;
    let pulled = 0;
    let conflicts = 0;
    let resolved = 0;
    let failed = 0;

    try {
      // Phase 1: Push local changes to remote
      const batch = await this.getPendingChanges(this.maxBatchSize);

      for (const change of batch) {
        try {
          // Simulate push to remote (actual implementation depends on remote adapter)
          await this.pushChange(change, context);
          pushed++;

          // Remove from queue on success
          const idx = this.queue.indexOf(change);
          if (idx !== -1) this.queue.splice(idx, 1);
        } catch (error) {
          if (error instanceof DatabaseError && error.code === DatabaseErrorCode.SYNC_CONFLICT) {
            conflicts++;
            // Auto-resolve based on strategy
            if (this.conflictStrategy === 'lww') {
              // Last Writer Wins — local change takes precedence
              resolved++;
            }
          } else {
            failed++;
          }
        }
      }

      // Phase 2: Pull remote changes
      // (Actual implementation would fetch from remote and apply locally)
      pulled = 0; // Placeholder — depends on remote adapter

      this.lastSyncAt = new Date().toISOString();
      this.consecutiveFailures = 0;

      return {
        pushed,
        pulled,
        conflicts,
        resolved,
        failed,
        duration_ms: Date.now() - startTime,
      };
    } catch (error) {
      this.consecutiveFailures++;
      throw new DatabaseError(
        DatabaseErrorCode.SYNC_FAILED,
        `Sync cycle failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error : undefined,
        { consecutiveFailures: this.consecutiveFailures },
      );
    }
  }

  async resolveConflict(
    conflict: SyncConflict,
    resolution: ConflictResolution,
  ): Promise<void> {
    switch (resolution.strategy) {
      case 'local_wins':
        // Re-queue the local change with higher priority
        await this.queueChange({
          ...conflict.localChange,
          priority: conflict.localChange.priority + 100,
        });
        break;
      case 'remote_wins':
        // Discard local change — remote version is already applied
        const idx = this.queue.findIndex((c) => c.id === conflict.localChange.id);
        if (idx !== -1) this.queue.splice(idx, 1);
        break;
      case 'merge':
        // Replace local change payload with merged data
        const mergeIdx = this.queue.findIndex((c) => c.id === conflict.localChange.id);
        if (mergeIdx !== -1) {
          this.queue[mergeIdx] = {
            ...conflict.localChange,
            payload: resolution.mergedData,
          };
        }
        break;
    }
  }

  async getSyncStatus(): Promise<SyncStatus> {
    return {
      pendingChanges: this.queue.length,
      lastSyncAt: this.lastSyncAt,
      syncHealthy: this.consecutiveFailures < 3,
      consecutiveFailures: this.consecutiveFailures,
    };
  }

  async fullResync(context: ExecutionContext): Promise<SyncResult> {
    // Clear local queue and perform full pull from remote
    this.queue = [];
    return this.sync(context);
  }

  /**
   * Push a single change to the remote database.
   * This is a placeholder — actual implementation depends on the remote adapter.
   */
  private async pushChange(change: SyncChange, context: ExecutionContext): Promise<void> {
    // In a real implementation, this would:
    // 1. Connect to the remote database
    // 2. Check for conflicts (version mismatch)
    // 3. Apply the change
    // 4. Update the sync cursor
  }
}
