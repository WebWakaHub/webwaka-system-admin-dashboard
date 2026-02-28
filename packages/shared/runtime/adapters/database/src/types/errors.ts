/**
 * RUNTIME-ADAPTER-DATABASE-v0.1.0
 * Error Types — Canonical database error model
 *
 * Issue: webwaka-runtime-universe#18 (P3-T01)
 */

export enum DatabaseErrorCode {
  NOT_FOUND = 'NOT_FOUND',
  DUPLICATE_KEY = 'DUPLICATE_KEY',
  CONCURRENT_MODIFICATION = 'CONCURRENT_MODIFICATION',
  DEADLOCK = 'DEADLOCK',
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  POOL_EXHAUSTED = 'POOL_EXHAUSTED',
  QUERY_TIMEOUT = 'QUERY_TIMEOUT',
  TENANT_VIOLATION = 'TENANT_VIOLATION',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  MIGRATION_FAILED = 'MIGRATION_FAILED',
  SYNC_CONFLICT = 'SYNC_CONFLICT',
  SYNC_FAILED = 'SYNC_FAILED',
  UNKNOWN = 'UNKNOWN',
}

export class DatabaseError extends Error {
  public readonly code: DatabaseErrorCode;
  public readonly cause?: Error;
  public readonly metadata: Record<string, unknown>;

  constructor(
    code: DatabaseErrorCode,
    message: string,
    cause?: Error,
    metadata: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = 'DatabaseError';
    this.code = code;
    this.cause = cause;
    this.metadata = metadata;
  }

  public toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      metadata: this.metadata,
    };
  }
}
