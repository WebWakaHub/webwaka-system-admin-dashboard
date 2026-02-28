/**
 * Unit tests for AuditSystemError classes
 */

import {
  AuditSystemError,
  InvalidAuditEventError,
  AuditLogStorageError,
  AuditLogQueryError,
  UnauthorizedAuditAccessError,
} from '../../../src/audit-system/errors/AuditSystemError';

describe('AuditSystemError', () => {
  it('should create an error with message and code', () => {
    const error = new AuditSystemError('Test error', 'TEST_ERROR');

    expect(error.message).toBe('Test error');
    expect(error.code).toBe('TEST_ERROR');
    expect(error.name).toBe('AuditSystemError');
  });

  it('should have a stack trace', () => {
    const error = new AuditSystemError('Test error', 'TEST_ERROR');

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('AuditSystemError');
  });
});

describe('InvalidAuditEventError', () => {
  it('should create an InvalidAuditEventError', () => {
    const error = new InvalidAuditEventError('Event type is required');

    expect(error.message).toBe('Event type is required');
    expect(error.code).toBe('INVALID_AUDIT_EVENT');
    expect(error.name).toBe('InvalidAuditEventError');
  });

  it('should inherit from AuditSystemError', () => {
    const error = new InvalidAuditEventError('Event type is required');

    expect(error instanceof AuditSystemError).toBe(true);
  });
});

describe('AuditLogStorageError', () => {
  it('should create an AuditLogStorageError', () => {
    const error = new AuditLogStorageError('Failed to store audit log');

    expect(error.message).toBe('Failed to store audit log');
    expect(error.code).toBe('AUDIT_LOG_STORAGE_ERROR');
    expect(error.name).toBe('AuditLogStorageError');
  });

  it('should inherit from AuditSystemError', () => {
    const error = new AuditLogStorageError('Failed to store audit log');

    expect(error instanceof AuditSystemError).toBe(true);
  });
});

describe('AuditLogQueryError', () => {
  it('should create an AuditLogQueryError', () => {
    const error = new AuditLogQueryError('Failed to query audit logs');

    expect(error.message).toBe('Failed to query audit logs');
    expect(error.code).toBe('AUDIT_LOG_QUERY_ERROR');
    expect(error.name).toBe('AuditLogQueryError');
  });

  it('should inherit from AuditSystemError', () => {
    const error = new AuditLogQueryError('Failed to query audit logs');

    expect(error instanceof AuditSystemError).toBe(true);
  });
});

describe('UnauthorizedAuditAccessError', () => {
  it('should create an UnauthorizedAuditAccessError', () => {
    const error = new UnauthorizedAuditAccessError('User does not have permission');

    expect(error.message).toBe('User does not have permission');
    expect(error.code).toBe('UNAUTHORIZED_AUDIT_ACCESS');
    expect(error.name).toBe('UnauthorizedAuditAccessError');
  });

  it('should inherit from AuditSystemError', () => {
    const error = new UnauthorizedAuditAccessError('User does not have permission');

    expect(error instanceof AuditSystemError).toBe(true);
  });
});
