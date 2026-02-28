/**
 * Audit System Middleware
 * Express middleware for integrating Audit System with HTTP requests
 */

import { AuditSystem } from '../AuditSystem';
import { EventEmitter } from '../utils/EventEmitter';
import { Actor, Action } from '../types/AuditLog';

/**
 * Audit middleware configuration
 */
export interface AuditMiddlewareConfig {
  /**
   * Enable audit logging for this middleware
   */
  enabled: boolean;

  /**
   * Exclude certain routes from audit logging
   */
  excludeRoutes?: string[];

  /**
   * Include only certain routes in audit logging
   */
  includeRoutes?: string[];

  /**
   * Extract actor information from request
   */
  extractActor?: (req: any) => Actor;

  /**
   * Extract action information from request
   */
  extractAction?: (req: any) => Action;
}

/**
 * Default audit middleware configuration
 */
const DEFAULT_CONFIG: AuditMiddlewareConfig = {
  enabled: true,
  excludeRoutes: ['/health', '/metrics', '/docs'],
};

/**
 * AuditMiddleware class
 * Express middleware for automatic audit logging
 */
export class AuditMiddleware {
  private auditSystem: AuditSystem;
  private eventEmitter: EventEmitter;
  private config: AuditMiddlewareConfig;

  constructor(auditSystem: AuditSystem, config?: Partial<AuditMiddlewareConfig>) {
    this.auditSystem = auditSystem;
    this.eventEmitter = auditSystem.getEventEmitter();
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };
  }

  /**
   * Create Express middleware function
   */
  public middleware() {
    return async (req: any, res: any, next: any) => {
      if (!this.config.enabled) {
        return next();
      }

      // Check if route should be excluded
      if (this.shouldExcludeRoute(req.path)) {
        return next();
      }

      // Capture response
      const originalSend = res.send;
      res.send = function (data: any) {
        // Log the request after response is sent
        this.logRequest(req, res, data).catch((error: any) => {
          console.error('Error logging audit event:', error);
        });

        return originalSend.call(this, data);
      };

      next();
    };
  }

  /**
   * Log a request as an audit event
   */
  private async logRequest(req: any, res: any, responseData: any): Promise<void> {
    try {
      // Extract actor and action information
      const actor = this.config.extractActor ? this.config.extractActor(req) : this.extractDefaultActor(req);
      const action = this.config.extractAction ? this.config.extractAction(req) : this.extractDefaultAction(req);

      // Get tenant ID from request
      const tenantId = req.tenantId || 'default';

      // Emit audit event
      await this.eventEmitter.emit('api-gateway', tenantId, actor, action, {
        originalState: undefined,
        newState: {
          statusCode: res.statusCode,
          method: req.method,
          path: req.path,
          responseSize: responseData ? JSON.stringify(responseData).length : 0,
        },
      });
    } catch (error) {
      console.error('Error in audit middleware:', error);
    }
  }

  /**
   * Extract default actor information from request
   */
  private extractDefaultActor(req: any): Actor {
    return {
      userId: req.userId || 'anonymous',
      role: req.role || 'user',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    };
  }

  /**
   * Extract default action information from request
   */
  private extractDefaultAction(req: any): Action {
    const method = req.method.toUpperCase();
    let actionType = 'READ';

    if (method === 'POST') {
      actionType = 'CREATE';
    } else if (method === 'PUT' || method === 'PATCH') {
      actionType = 'UPDATE';
    } else if (method === 'DELETE') {
      actionType = 'DELETE';
    }

    return {
      type: actionType,
      entityType: 'API_Request',
      entityId: req.path,
    };
  }

  /**
   * Check if a route should be excluded from audit logging
   */
  private shouldExcludeRoute(path: string): boolean {
    if (this.config.includeRoutes) {
      return !this.config.includeRoutes.some((route) => path.startsWith(route));
    }

    if (this.config.excludeRoutes) {
      return this.config.excludeRoutes.some((route) => path.startsWith(route));
    }

    return false;
  }
}
