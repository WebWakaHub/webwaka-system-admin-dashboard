/**
 * Audit Logger Tests
 */

import { AuditLogger, AuditLogEntry } from '../../src/event-system/utils/audit-logger';
import { Event } from '../../src/event-system/types';

describe('Audit Logger', () => {
  let auditLogger: AuditLogger;

  const createEvent = (overrides?: Partial<Event>): Event => ({
    eventId: '550e8400-e29b-41d4-a716-446655440000',
    eventType: 'user.created',
    eventVersion: '1.0',
    timestamp: '2026-02-09T10:00:00Z',
    tenantId: '550e8400-e29b-41d4-a716-446655440001',
    source: 'test-module',
    data: { email: 'test@example.com' },
    ...overrides,
  });

  beforeEach(() => {
    auditLogger = new AuditLogger();
  });

  describe('Basic Logging', () => {
    it('should log an operation', () => {
      const entry: AuditLogEntry = {
        timestamp: new Date().toISOString(),
        operation: 'publish',
        tenantId: 'tenant-123',
        status: 'success',
      };

      auditLogger.log(entry);
      const logs = auditLogger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0]).toEqual(entry);
    });

    it('should log multiple operations', () => {
      auditLogger.log({
        timestamp: new Date().toISOString(),
        operation: 'publish',
        tenantId: 'tenant-123',
        status: 'success',
      });

      auditLogger.log({
        timestamp: new Date().toISOString(),
        operation: 'subscribe',
        tenantId: 'tenant-123',
        status: 'success',
      });

      const logs = auditLogger.getLogs();
      expect(logs).toHaveLength(2);
    });

    it('should include error details', () => {
      auditLogger.log({
        timestamp: new Date().toISOString(),
        operation: 'publish',
        tenantId: 'tenant-123',
        status: 'failure',
        error: 'Connection failed',
      });

      const logs = auditLogger.getLogs();
      expect(logs[0].error).toBe('Connection failed');
    });
  });

  describe('Publish Logging', () => {
    it('should log successful publish', () => {
      const event = createEvent();
      auditLogger.logPublish(event, 'success');
      const logs = auditLogger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].operation).toBe('publish');
      expect(logs[0].status).toBe('success');
    });

    it('should log failed publish', () => {
      const event = createEvent();
      auditLogger.logPublish(event, 'failure', 'Event validation failed');
      const logs = auditLogger.getLogs();
      expect(logs[0].status).toBe('failure');
      expect(logs[0].error).toBe('Event validation failed');
    });
  });

  describe('Subscribe Logging', () => {
    it('should log successful subscribe', () => {
      auditLogger.logSubscribe('tenant-123', 'user.created', 'sub-123', 'success');
      const logs = auditLogger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].operation).toBe('subscribe');
      expect(logs[0].status).toBe('success');
    });

    it('should log failed subscribe', () => {
      auditLogger.logSubscribe('tenant-123', 'user.created', 'sub-123', 'failure', 'Invalid event type');
      const logs = auditLogger.getLogs();
      expect(logs[0].status).toBe('failure');
      expect(logs[0].error).toBe('Invalid event type');
    });
  });

  describe('Unsubscribe Logging', () => {
    it('should log successful unsubscribe', () => {
      auditLogger.logUnsubscribe('tenant-123', 'sub-123', 'success');
      const logs = auditLogger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].operation).toBe('unsubscribe');
    });
  });

  describe('Replay Logging', () => {
    it('should log successful replay', () => {
      auditLogger.logReplay('tenant-123', 100, 'success');
      const logs = auditLogger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].operation).toBe('replay');
      expect(logs[0].details).toEqual({ eventCount: 100 });
    });
  });

  describe('Connection Logging', () => {
    it('should log successful connect', () => {
      auditLogger.logConnect('success');
      const logs = auditLogger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].operation).toBe('connect');
    });

    it('should log failed disconnect', () => {
      auditLogger.logDisconnect('failure', 'Already disconnected');
      const logs = auditLogger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].operation).toBe('disconnect');
      expect(logs[0].error).toBe('Already disconnected');
    });
  });

  describe('Query Operations', () => {
    beforeEach(() => {
      auditLogger.logPublish(createEvent({ tenantId: 'tenant-1' }), 'success');
      auditLogger.logPublish(createEvent({ tenantId: 'tenant-2' }), 'success');
      auditLogger.logSubscribe('tenant-1', 'user.created', 'sub-1', 'success');
      auditLogger.logSubscribe('tenant-2', 'user.created', 'sub-2', 'success');
    });

    it('should get logs by tenant', () => {
      const logs = auditLogger.getLogsByTenant('tenant-1');
      expect(logs).toHaveLength(2);
      expect(logs.every((log) => log.tenantId === 'tenant-1')).toBe(true);
    });

    it('should get logs by operation', () => {
      const logs = auditLogger.getLogsByOperation('publish');
      expect(logs).toHaveLength(2);
      expect(logs.every((log) => log.operation === 'publish')).toBe(true);
    });

    it('should get logs by tenant and operation', () => {
      const logs = auditLogger.getLogsByTenantAndOperation('tenant-1', 'publish');
      expect(logs).toHaveLength(1);
      expect(logs[0].operation).toBe('publish');
      expect(logs[0].tenantId).toBe('tenant-1');
    });

    it('should get logs by time range', () => {
      const startTime = new Date(Date.now() - 1000);
      const endTime = new Date(Date.now() + 1000);
      const logs = auditLogger.getLogsByTimeRange(startTime, endTime);
      expect(logs.length).toBeGreaterThan(0);
    });
  });

  describe('Statistics', () => {
    beforeEach(() => {
      auditLogger.logPublish(createEvent(), 'success');
      auditLogger.logPublish(createEvent(), 'failure', 'Error');
      auditLogger.logSubscribe('tenant-123', 'user.created', 'sub-1', 'success');
    });

    it('should calculate statistics', () => {
      const stats = auditLogger.getStats();
      expect(stats.totalLogs).toBe(3);
      expect(stats.successCount).toBe(2);
      expect(stats.failureCount).toBe(1);
      expect(stats.operationCounts.publish).toBe(2);
      expect(stats.operationCounts.subscribe).toBe(1);
    });
  });

  describe('Log Management', () => {
    it('should clear all logs', () => {
      auditLogger.logPublish(createEvent(), 'success');
      expect(auditLogger.getLogs()).toHaveLength(1);
      auditLogger.clear();
      expect(auditLogger.getLogs()).toHaveLength(0);
    });

    it('should maintain max log limit', () => {
      // Log more than max (10000)
      for (let i = 0; i < 10100; i++) {
        auditLogger.log({
          timestamp: new Date().toISOString(),
          operation: 'publish',
          tenantId: 'tenant-123',
          status: 'success',
        });
      }

      // Should keep only last 10000
      const logs = auditLogger.getLogs();
      expect(logs.length).toBeLessThanOrEqual(10000);
    });
  });
});
