/**
 * Sync Engine Service
 * Implements offline-first synchronization with conflict resolution
 */

import { SyncQueue } from '@prisma/client';
import { db } from '../../shared/database';
import { logger } from '../../shared/logger';

export interface QueueOperationInput {
  tenantId: string;
  userId?: string;
  operationType: 'create' | 'update' | 'delete';
  resourceType: string;
  resourceId: string;
  payload: Record<string, any>;
  priority?: number;
}

export interface SyncStatus {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
}

export interface ConflictResolutionStrategy {
  strategy: 'server-wins' | 'client-wins' | 'merge' | 'manual';
  resolver?: (serverData: any, clientData: any) => any;
}

export class SyncEngineService {
  private readonly MAX_RETRY_COUNT = 3;
  private readonly RETRY_DELAY_MS = 1000;

  /**
   * Queue an operation for sync
   */
  async queueOperation(input: QueueOperationInput): Promise<SyncQueue> {
    try {
      const operation = await db.syncQueue.create({
        data: {
          tenantId: input.tenantId,
          userId: input.userId,
          operationType: input.operationType,
          resourceType: input.resourceType,
          resourceId: input.resourceId,
          payload: input.payload,
          priority: input.priority || 0,
          status: 'pending',
        },
      });

      logger.info('Operation queued for sync', {
        operationId: operation.id,
        tenantId: input.tenantId,
        operationType: input.operationType,
        resourceType: input.resourceType,
      });

      return operation;
    } catch (error) {
      logger.error('Failed to queue operation', { error, input });
      throw error;
    }
  }

  /**
   * Process pending sync operations
   */
  async processPendingOperations(tenantId: string, limit: number = 10): Promise<number> {
    try {
      // Get pending operations ordered by priority and creation time
      const operations = await db.syncQueue.findMany({
        where: {
          tenantId,
          status: 'pending',
        },
        orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
        take: limit,
      });

      let processedCount = 0;

      for (const operation of operations) {
        try {
          // Mark as processing
          await db.syncQueue.update({
            where: { id: operation.id },
            data: { status: 'processing' },
          });

          // Process the operation
          await this.processOperation(operation);

          // Mark as completed
          await db.syncQueue.update({
            where: { id: operation.id },
            data: {
              status: 'completed',
              processedAt: new Date(),
            },
          });

          processedCount++;
        } catch (error) {
          logger.error('Failed to process operation', { error, operationId: operation.id });

          // Handle retry logic
          const retryCount = operation.retryCount + 1;
          if (retryCount >= this.MAX_RETRY_COUNT) {
            // Max retries reached, mark as failed
            await db.syncQueue.update({
              where: { id: operation.id },
              data: {
                status: 'failed',
                retryCount,
                lastError: error instanceof Error ? error.message : String(error),
              },
            });
          } else {
            // Retry later
            await db.syncQueue.update({
              where: { id: operation.id },
              data: {
                status: 'pending',
                retryCount,
                lastError: error instanceof Error ? error.message : String(error),
              },
            });
          }
        }
      }

      logger.info('Processed sync operations', { tenantId, processedCount, totalOperations: operations.length });
      return processedCount;
    } catch (error) {
      logger.error('Failed to process pending operations', { error, tenantId });
      throw error;
    }
  }

  /**
   * Process a single operation
   */
  private async processOperation(operation: SyncQueue): Promise<void> {
    // This is a placeholder for actual operation processing
    // In a real implementation, this would:
    // 1. Validate the operation
    // 2. Check for conflicts
    // 3. Apply the operation to the database
    // 4. Emit events
    // 5. Handle conflict resolution if needed

    logger.debug('Processing operation', {
      operationId: operation.id,
      operationType: operation.operationType,
      resourceType: operation.resourceType,
    });

    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  /**
   * Get sync status for tenant
   */
  async getSyncStatus(tenantId: string): Promise<SyncStatus> {
    try {
      const [pending, processing, completed, failed] = await Promise.all([
        db.syncQueue.count({ where: { tenantId, status: 'pending' } }),
        db.syncQueue.count({ where: { tenantId, status: 'processing' } }),
        db.syncQueue.count({ where: { tenantId, status: 'completed' } }),
        db.syncQueue.count({ where: { tenantId, status: 'failed' } }),
      ]);

      return { pending, processing, completed, failed };
    } catch (error) {
      logger.error('Failed to get sync status', { error, tenantId });
      throw error;
    }
  }

  /**
   * Push local changes to server
   */
  async pushChanges(tenantId: string, operations: QueueOperationInput[]): Promise<SyncQueue[]> {
    try {
      const queuedOperations: SyncQueue[] = [];

      for (const operation of operations) {
        const queued = await this.queueOperation(operation);
        queuedOperations.push(queued);
      }

      // Process immediately
      await this.processPendingOperations(tenantId, operations.length);

      logger.info('Changes pushed', { tenantId, count: operations.length });
      return queuedOperations;
    } catch (error) {
      logger.error('Failed to push changes', { error, tenantId });
      throw error;
    }
  }

  /**
   * Pull server changes to client
   */
  async pullChanges(tenantId: string, lastSyncTime?: Date): Promise<SyncQueue[]> {
    try {
      const where: any = {
        tenantId,
        status: 'completed',
      };

      if (lastSyncTime) {
        where.processedAt = {
          gt: lastSyncTime,
        };
      }

      const changes = await db.syncQueue.findMany({
        where,
        orderBy: { processedAt: 'asc' },
      });

      logger.info('Changes pulled', { tenantId, count: changes.length });
      return changes;
    } catch (error) {
      logger.error('Failed to pull changes', { error, tenantId });
      throw error;
    }
  }

  /**
   * Resolve conflict between server and client data
   */
  async resolveConflict(
    operation: SyncQueue,
    serverData: any,
    strategy: ConflictResolutionStrategy
  ): Promise<any> {
    try {
      const clientData = operation.payload;

      let resolvedData: any;

      switch (strategy.strategy) {
        case 'server-wins':
          resolvedData = serverData;
          break;

        case 'client-wins':
          resolvedData = clientData;
          break;

        case 'merge':
          // Simple merge strategy - in production, this should be more sophisticated
          resolvedData = { ...serverData, ...clientData };
          break;

        case 'manual':
          if (strategy.resolver) {
            resolvedData = strategy.resolver(serverData, clientData);
          } else {
            throw new Error('Manual resolution requires a resolver function');
          }
          break;

        default:
          throw new Error(`Unknown conflict resolution strategy: ${strategy.strategy}`);
      }

      logger.info('Conflict resolved', {
        operationId: operation.id,
        strategy: strategy.strategy,
      });

      return resolvedData;
    } catch (error) {
      logger.error('Failed to resolve conflict', { error, operationId: operation.id });
      throw error;
    }
  }

  /**
   * Retry failed operations
   */
  async retryFailedOperations(tenantId: string): Promise<number> {
    try {
      // Reset failed operations to pending
      const result = await db.syncQueue.updateMany({
        where: {
          tenantId,
          status: 'failed',
          retryCount: {
            lt: this.MAX_RETRY_COUNT,
          },
        },
        data: {
          status: 'pending',
        },
      });

      logger.info('Failed operations reset for retry', { tenantId, count: result.count });
      return result.count;
    } catch (error) {
      logger.error('Failed to retry operations', { error, tenantId });
      throw error;
    }
  }

  /**
   * Clear completed operations
   */
  async clearCompletedOperations(tenantId: string, olderThan: Date): Promise<number> {
    try {
      const result = await db.syncQueue.deleteMany({
        where: {
          tenantId,
          status: 'completed',
          processedAt: {
            lt: olderThan,
          },
        },
      });

      logger.info('Completed operations cleared', { tenantId, count: result.count });
      return result.count;
    } catch (error) {
      logger.error('Failed to clear completed operations', { error, tenantId });
      throw error;
    }
  }
}

// Export singleton instance
export const syncEngineService = new SyncEngineService();
