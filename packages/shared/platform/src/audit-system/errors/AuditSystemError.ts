/**
 * Audit System Error Classes
 */

/**
 * Base error class for Audit System errors
 */
export class AuditSystemError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AuditSystemError';
  }
}

/**
 * Error thrown when an audit event is invalid
 */
export class InvalidAuditEventError extends AuditSystemError {
  constructor(message: string, details?: Record<string, any>) {
    super('INVALID_AUDIT_EVENT', message, 400, details);
    this.name = 'InvalidAuditEventError';
  }
}

/**
 * Error thrown when audit log storage fails
 */
export class AuditLogStorageError extends AuditSystemError {
  constructor(message: string, details?: Record<string, any>) {
    super('AUDIT_LOG_STORAGE_ERROR', message, 500, details);
    this.name = 'AuditLogStorageError';
  }
}

/**
 * Error thrown when audit log query fails
 */
export class AuditLogQueryError extends AuditSystemError {
  constructor(message: string, details?: Record<string, any>) {
    super('AUDIT_LOG_QUERY_ERROR', message, 500, details);
    this.name = 'AuditLogQueryError';
  }
}

/**
 * Error thrown when unauthorized access is attempted
 */
export class UnauthorizedAuditAccessError extends AuditSystemError {
  constructor(message: string, details?: Record<string, any>) {
    super('UNAUTHORIZED_AUDIT_ACCESS', message, 403, details);
    this.name = 'UnauthorizedAuditAccessError';
  }
}
