/**
 * Sync Engine Server Service
 * 
 * Provides server-side synchronization functionality.
 */

import { ISyncEngineServer, SyncRequest, SyncResponse, Change, ConflictResolution } from '../types';

export class SyncEngineServerService implements ISyncEngineServer {
  private changes: Map<string, Change[]> = new Map();

  /**
   * Get changes since last sync
   */
  async getChanges(request: SyncRequest): Promise<SyncResponse> {
    const tenantChanges = this.changes.get(request.tenantId) || [];
    
    // Filter changes since last sync timestamp
    let filteredChanges = tenantChanges;
    if (request.lastSyncTimestamp) {
      const lastSyncDate = new Date(request.lastSyncTimestamp);
      filteredChanges = tenantChanges.filter(change => 
        new Date(change.timestamp) > lastSyncDate
      );
    }

    return {
      changes: filteredChanges,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Post changes from client
   */
  async postChanges(request: SyncRequest): Promise<void> {
    if (!request.changes || request.changes.length === 0) {
      return;
    }

    const tenantChanges = this.changes.get(request.tenantId) || [];

    for (const change of request.changes) {
      // Check for conflicts
      const conflict = this.detectConflict(change, tenantChanges);
      
      if (conflict) {
        // Resolve conflict using last-write-wins strategy
        const resolution = this.resolveConflict(change, conflict);
        tenantChanges.push(resolution.winner);
      } else {
        tenantChanges.push(change);
      }
    }

    this.changes.set(request.tenantId, tenantChanges);

    // Broadcast changes to other clients (would use Event System in production)
    for (const change of request.changes) {
      await this.broadcastChange(change);
    }
  }

  /**
   * Detect if a change conflicts with existing changes
   */
  private detectConflict(change: Change, existingChanges: Change[]): Change | null {
    const conflictingChange = existingChanges.find(
      c => c.entity === change.entity && 
           c.entityId === change.entityId && 
           c.id !== change.id
    );

    return conflictingChange || null;
  }

  /**
   * Resolve a conflict using last-write-wins strategy
   */
  private resolveConflict(newChange: Change, existingChange: Change): ConflictResolution {
    const newTimestamp = new Date(newChange.timestamp).getTime();
    const existingTimestamp = new Date(existingChange.timestamp).getTime();

    const winner = newTimestamp > existingTimestamp ? newChange : existingChange;
    const loser = newTimestamp > existingTimestamp ? existingChange : newChange;

    return {
      resolved: true,
      winner,
      loser,
      strategy: 'last-write-wins',
    };
  }

  /**
   * Broadcast a change to other clients
   */
  async broadcastChange(change: Change): Promise<void> {
    // In production, this would use the Event System to broadcast changes
    // For now, we'll just log the broadcast
    console.log(`Broadcasting change: ${change.type} ${change.entity}:${change.entityId}`);
  }
}
