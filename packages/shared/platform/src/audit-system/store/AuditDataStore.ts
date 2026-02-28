/**
 * Audit Data Store
 * Provides secure, immutable, and scalable storage for audit logs
 */

import { AuditLog, AuditLogQuery, AuditLogQueryResult } from '../types/AuditLog';
import { AuditLogStorageError, AuditLogQueryError } from '../errors/AuditSystemError';

/**
 * In-memory storage for audit logs (for development/testing)
 * In production, this would be replaced with Elasticsearch, ClickHouse, or similar
 */
interface StoredAuditLog {
  auditLog: AuditLog;
  hash: string;
  storedAt: Date;
}

/**
 * AuditDataStore class
 * Manages the storage and retrieval of audit logs
 */
export class AuditDataStore {
  private logs: Map<string, StoredAuditLog> = new Map();
  private tenantIndex: Map<string, Set<string>> = new Map();

  /**
   * Store an audit log
   * @param auditLog - The audit log to store
   * @param hash - The cryptographic hash of the audit log
   * @throws AuditLogStorageError if storage fails
   */
  public async storeAuditLog(auditLog: AuditLog, hash: string): Promise<void> {
    try {
      // Store the log with its hash
      this.logs.set(auditLog.logId, {
        auditLog,
        hash,
        storedAt: new Date(),
      });

      // Update the tenant index
      if (!this.tenantIndex.has(auditLog.tenantId)) {
        this.tenantIndex.set(auditLog.tenantId, new Set());
      }
      this.tenantIndex.get(auditLog.tenantId)!.add(auditLog.logId);

      console.log(`Audit log stored: ${auditLog.logId}`);
    } catch (error) {
      throw new AuditLogStorageError(`Failed to store audit log: ${error}`);
    }
  }

  /**
   * Query audit logs
   * @param query - The query parameters
   * @returns The audit logs matching the query
   * @throws AuditLogQueryError if the query fails
   */
  public async queryAuditLogs(query: AuditLogQuery): Promise<AuditLogQueryResult> {
    try {
      // Get all logs for the tenant
      const tenantLogIds = this.tenantIndex.get(query.tenantId) || new Set();
      let results = Array.from(tenantLogIds).map((logId) => this.logs.get(logId)!.auditLog);

      // Filter by user ID if provided
      if (query.userId) {
        results = results.filter((log) => log.actor.userId === query.userId);
      }

      // Filter by entity type if provided
      if (query.entityType) {
        results = results.filter((log) => log.action.entityType === query.entityType);
      }

      // Filter by entity ID if provided
      if (query.entityId) {
        results = results.filter((log) => log.action.entityId === query.entityId);
      }

      // Filter by action type if provided
      if (query.actionType) {
        results = results.filter((log) => log.action.type === query.actionType);
      }

      // Filter by date range if provided
      if (query.startDate) {
        results = results.filter((log) => log.timestamp >= query.startDate!);
      }
      if (query.endDate) {
        results = results.filter((log) => log.timestamp <= query.endDate!);
      }

      // Sort by timestamp descending
      results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      // Apply pagination
      const page = query.page || 1;
      const limit = query.limit || 100;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedResults = results.slice(startIndex, endIndex);

      return {
        logs: paginatedResults,
        pagination: {
          total: results.length,
          page,
          limit,
        },
      };
    } catch (error) {
      throw new AuditLogQueryError(`Failed to query audit logs: ${error}`);
    }
  }

  /**
   * Get an audit log by ID
   * @param logId - The ID of the audit log
   * @returns The audit log, or undefined if not found
   */
  public async getAuditLogById(logId: string): Promise<AuditLog | undefined> {
    const stored = this.logs.get(logId);
    return stored?.auditLog;
  }

  /**
   * Verify the integrity of an audit log
   * @param logId - The ID of the audit log
   * @param expectedHash - The expected hash of the audit log
   * @returns True if the hash matches, false otherwise
   */
  public async verifyAuditLogIntegrity(logId: string, expectedHash: string): Promise<boolean> {
    const stored = this.logs.get(logId);
    if (!stored) {
      return false;
    }
    return stored.hash === expectedHash;
  }

  /**
   * Get the total number of audit logs
   */
  public async getTotalAuditLogCount(): Promise<number> {
    return this.logs.size;
  }

  /**
   * Get the total number of audit logs for a tenant
   */
  public async getTenantAuditLogCount(tenantId: string): Promise<number> {
    return this.tenantIndex.get(tenantId)?.size || 0;
  }
}
