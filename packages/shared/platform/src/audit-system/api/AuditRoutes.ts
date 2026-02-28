/**
 * Audit System REST API Routes
 * Provides HTTP endpoints for audit log querying and management
 */

import { AuditQueryAPI } from './AuditQueryAPI';
import { AuditLogQuery } from '../types/AuditLog';

/**
 * HTTP request context
 */
export interface HttpContext {
  userId: string;
  tenantId: string;
  method: string;
  path: string;
  query: Record<string, any>;
  body: Record<string, any>;
}

/**
 * HTTP response
 */
export interface HttpResponse {
  statusCode: number;
  body: any;
  headers?: Record<string, string>;
}

/**
 * AuditRoutes class
 * Handles HTTP routing for audit log endpoints
 */
export class AuditRoutes {
  private queryAPI: AuditQueryAPI;

  constructor(queryAPI: AuditQueryAPI) {
    this.queryAPI = queryAPI;
  }

  /**
   * Handle GET /api/v1/audit/logs
   * Query audit logs
   */
  public async handleQueryLogs(context: HttpContext): Promise<HttpResponse> {
    try {
      // Parse query parameters
      const query: AuditLogQuery = {
        tenantId: context.tenantId,
        userId: context.query.userId,
        entityType: context.query.entityType,
        entityId: context.query.entityId,
        actionType: context.query.actionType,
        startDate: context.query.startDate ? new Date(context.query.startDate) : undefined,
        endDate: context.query.endDate ? new Date(context.query.endDate) : undefined,
        page: context.query.page ? parseInt(context.query.page) : 1,
        limit: context.query.limit ? parseInt(context.query.limit) : 100,
      };

      // Query audit logs
      const result = await this.queryAPI.queryAuditLogs(context.userId, query);

      return {
        statusCode: 200,
        body: result,
        headers: { 'Content-Type': 'application/json' },
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  /**
   * Handle GET /api/v1/audit/logs/:logId
   * Get a specific audit log
   */
  public async handleGetLog(context: HttpContext): Promise<HttpResponse> {
    try {
      const logId = context.path.split('/').pop();
      if (!logId) {
        return {
          statusCode: 400,
          body: { error: 'Log ID is required' },
        };
      }

      const log = await this.queryAPI.getAuditLogById(context.userId, logId, context.tenantId);

      if (!log) {
        return {
          statusCode: 404,
          body: { error: 'Audit log not found' },
        };
      }

      return {
        statusCode: 200,
        body: log,
        headers: { 'Content-Type': 'application/json' },
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  /**
   * Handle POST /api/v1/audit/logs/:logId/verify
   * Verify audit log integrity
   */
  public async handleVerifyLog(context: HttpContext): Promise<HttpResponse> {
    try {
      const logId = context.path.split('/')[context.path.split('/').length - 2];
      const { expectedHash } = context.body;

      if (!logId || !expectedHash) {
        return {
          statusCode: 400,
          body: { error: 'Log ID and expected hash are required' },
        };
      }

      const isValid = await this.queryAPI.verifyAuditLogIntegrity(context.userId, logId, expectedHash, context.tenantId);

      return {
        statusCode: 200,
        body: { valid: isValid },
        headers: { 'Content-Type': 'application/json' },
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  /**
   * Handle errors and return appropriate HTTP response
   */
  private handleError(error: any): HttpResponse {
    if (error.code === 'UNAUTHORIZED_AUDIT_ACCESS') {
      return {
        statusCode: 403,
        body: { error: error.message },
      };
    }

    if (error.code === 'INVALID_AUDIT_EVENT') {
      return {
        statusCode: 400,
        body: { error: error.message },
      };
    }

    return {
      statusCode: 500,
      body: { error: 'Internal server error' },
    };
  }
}
