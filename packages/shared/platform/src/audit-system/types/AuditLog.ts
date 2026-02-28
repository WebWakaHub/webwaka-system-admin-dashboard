/**
 * Audit System Type Definitions
 * Core types for the Audit System module
 */

/**
 * Actor information - who performed the action
 */
export interface Actor {
  userId: string;
  role: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Action information - what action was performed
 */
export interface Action {
  type: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'PERMISSION_CHANGE' | string;
  entityType: string;
  entityId: string;
}

/**
 * Details of the change
 */
export interface ChangeDetails {
  originalState?: Record<string, any>;
  newState?: Record<string, any>;
  changes?: Array<{
    field: string;
    old: any;
    new: any;
  }>;
}

/**
 * Core AuditLog entity
 */
export interface AuditLog {
  logId: string;
  timestamp: Date;
  tenantId: string;
  actor: Actor;
  action: Action;
  details?: ChangeDetails;
  traceId?: string;
}

/**
 * Raw audit event from the Event Bus
 */
export interface AuditEvent {
  eventType: string;
  eventId: string;
  timestamp: string;
  sourceModule: string;
  tenantId: string;
  actor: Actor;
  action: Action;
  details?: ChangeDetails;
  traceId?: string;
}

/**
 * Query parameters for audit log retrieval
 */
export interface AuditLogQuery {
  tenantId: string;
  userId?: string;
  entityType?: string;
  entityId?: string;
  actionType?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

/**
 * Query result with pagination
 */
export interface AuditLogQueryResult {
  logs: AuditLog[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}
