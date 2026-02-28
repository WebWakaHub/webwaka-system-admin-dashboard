/**
 * Audit Query API
 * Provides a secure REST API for querying audit logs
 */

import { AuditLogQuery, AuditLogQueryResult } from '../types/AuditLog';
import { AuditDataStore } from '../store/AuditDataStore';
import { UnauthorizedAuditAccessError } from '../errors/AuditSystemError';

/**
 * Permission checker interface
 * In a real implementation, this would integrate with the Permission System
 */
export interface PermissionChecker {
  hasPermission(userId: string, permission: string, tenantId: string): Promise<boolean>;
}

/**
 * AuditQueryAPI class
 * Provides a secure interface for querying audit logs
 */
export class AuditQueryAPI {
  private dataStore: AuditDataStore;
  private permissionChecker: PermissionChecker;

  constructor(dataStore: AuditDataStore, permissionChecker: PermissionChecker) {
    this.dataStore = dataStore;
    this.permissionChecker = permissionChecker;
  }

  /**
   * Query audit logs
   * @param userId - The ID of the user making the request
   * @param query - The query parameters
   * @returns The audit logs matching the query
   * @throws UnauthorizedAuditAccessError if the user does not have permission
   */
  public async queryAuditLogs(userId: string, query: AuditLogQuery): Promise<AuditLogQueryResult> {
    // Check if the user has permission to access audit logs
    const hasPermission = await this.permissionChecker.hasPermission(userId, 'audit:read', query.tenantId);
    if (!hasPermission) {
      throw new UnauthorizedAuditAccessError(`User ${userId} does not have permission to access audit logs`);
    }

    // Ensure the query is scoped to the user's tenant
    // (In a real implementation, the tenantId would be derived from the user's context)
    return await this.dataStore.queryAuditLogs(query);
  }

  /**
   * Get an audit log by ID
   * @param userId - The ID of the user making the request
   * @param logId - The ID of the audit log
   * @param tenantId - The tenant ID
   * @returns The audit log, or undefined if not found
   * @throws UnauthorizedAuditAccessError if the user does not have permission
   */
  public async getAuditLogById(userId: string, logId: string, tenantId: string): Promise<any> {
    // Check if the user has permission to access audit logs
    const hasPermission = await this.permissionChecker.hasPermission(userId, 'audit:read', tenantId);
    if (!hasPermission) {
      throw new UnauthorizedAuditAccessError(`User ${userId} does not have permission to access audit logs`);
    }

    return await this.dataStore.getAuditLogById(logId);
  }

  /**
   * Verify the integrity of an audit log
   * @param userId - The ID of the user making the request
   * @param logId - The ID of the audit log
   * @param expectedHash - The expected hash of the audit log
   * @param tenantId - The tenant ID
   * @returns True if the hash matches, false otherwise
   * @throws UnauthorizedAuditAccessError if the user does not have permission
   */
  public async verifyAuditLogIntegrity(userId: string, logId: string, expectedHash: string, tenantId: string): Promise<boolean> {
    // Check if the user has permission to access audit logs
    const hasPermission = await this.permissionChecker.hasPermission(userId, 'audit:read', tenantId);
    if (!hasPermission) {
      throw new UnauthorizedAuditAccessError(`User ${userId} does not have permission to verify audit logs`);
    }

    return await this.dataStore.verifyAuditLogIntegrity(logId, expectedHash);
  }
}
