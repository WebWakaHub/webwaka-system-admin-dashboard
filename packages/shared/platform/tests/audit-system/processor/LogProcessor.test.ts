/**
 * Unit tests for LogProcessor
 */

import { LogProcessor } from '../../../src/audit-system/processor/LogProcessor';
import { AuditEvent } from '../../../src/audit-system/types/AuditLog';
import { InvalidAuditEventError } from '../../../src/audit-system/errors/AuditSystemError';

describe('LogProcessor', () => {
  let processor: LogProcessor;

  beforeEach(() => {
    processor = new LogProcessor();
  });

  describe('processEvent', () => {
    it('should successfully process a valid audit event', () => {
      const event: AuditEvent = {
        eventType: 'audit.action.performed',
        eventId: 'event-123',
        timestamp: new Date().toISOString(),
        sourceModule: 'products-service',
        tenantId: 'tenant-123',
        actor: {
          userId: 'user-123',
          role: 'admin',
          ipAddress: '192.168.1.100',
        },
        action: {
          type: 'UPDATE',
          entityType: 'Product',
          entityId: 'product-456',
        },
        details: {
          originalState: { price: 100 },
          newState: { price: 150 },
        },
      };

      const auditLog = processor.processEvent(event);

      expect(auditLog).toBeDefined();
      expect(auditLog.logId).toBeDefined();
      expect(auditLog.timestamp).toEqual(new Date(event.timestamp));
      expect(auditLog.tenantId).toBe('tenant-123');
      expect(auditLog.actor.userId).toBe('user-123');
      expect(auditLog.action.type).toBe('UPDATE');
    });

    it('should throw InvalidAuditEventError when eventType is missing', () => {
      const event: any = {
        eventId: 'event-123',
        timestamp: new Date().toISOString(),
        sourceModule: 'products-service',
        tenantId: 'tenant-123',
        actor: { userId: 'user-123', role: 'admin' },
        action: { type: 'UPDATE', entityType: 'Product', entityId: 'product-456' },
      };

      expect(() => processor.processEvent(event)).toThrow(InvalidAuditEventError);
    });

    it('should throw InvalidAuditEventError when tenantId is missing', () => {
      const event: any = {
        eventType: 'audit.action.performed',
        eventId: 'event-123',
        timestamp: new Date().toISOString(),
        sourceModule: 'products-service',
        actor: { userId: 'user-123', role: 'admin' },
        action: { type: 'UPDATE', entityType: 'Product', entityId: 'product-456' },
      };

      expect(() => processor.processEvent(event)).toThrow(InvalidAuditEventError);
    });

    it('should throw InvalidAuditEventError when actor.userId is missing', () => {
      const event: any = {
        eventType: 'audit.action.performed',
        eventId: 'event-123',
        timestamp: new Date().toISOString(),
        sourceModule: 'products-service',
        tenantId: 'tenant-123',
        actor: { role: 'admin' },
        action: { type: 'UPDATE', entityType: 'Product', entityId: 'product-456' },
      };

      expect(() => processor.processEvent(event)).toThrow(InvalidAuditEventError);
    });

    it('should throw InvalidAuditEventError when action.type is missing', () => {
      const event: any = {
        eventType: 'audit.action.performed',
        eventId: 'event-123',
        timestamp: new Date().toISOString(),
        sourceModule: 'products-service',
        tenantId: 'tenant-123',
        actor: { userId: 'user-123', role: 'admin' },
        action: { entityType: 'Product', entityId: 'product-456' },
      };

      expect(() => processor.processEvent(event)).toThrow(InvalidAuditEventError);
    });

    it('should throw InvalidAuditEventError when timestamp is invalid', () => {
      const event: any = {
        eventType: 'audit.action.performed',
        eventId: 'event-123',
        timestamp: 'invalid-date',
        sourceModule: 'products-service',
        tenantId: 'tenant-123',
        actor: { userId: 'user-123', role: 'admin' },
        action: { type: 'UPDATE', entityType: 'Product', entityId: 'product-456' },
      };

      expect(() => processor.processEvent(event)).toThrow(InvalidAuditEventError);
    });
  });

  describe('calculateHash', () => {
    it('should calculate a consistent hash for the same audit log', () => {
      const auditLog = {
        logId: 'log-123',
        timestamp: new Date('2026-02-10T10:00:00Z'),
        tenantId: 'tenant-123',
        actor: { userId: 'user-123', role: 'admin' },
        action: { type: 'UPDATE', entityType: 'Product', entityId: 'product-456' },
      };

      const hash1 = processor.calculateHash(auditLog as any);
      const hash2 = processor.calculateHash(auditLog as any);

      expect(hash1).toBe(hash2);
    });

    it('should calculate different hashes for different audit logs', () => {
      const auditLog1 = {
        logId: 'log-123',
        timestamp: new Date('2026-02-10T10:00:00Z'),
        tenantId: 'tenant-123',
        actor: { userId: 'user-123', role: 'admin' },
        action: { type: 'UPDATE', entityType: 'Product', entityId: 'product-456' },
      };

      const auditLog2 = {
        logId: 'log-124',
        timestamp: new Date('2026-02-10T10:00:00Z'),
        tenantId: 'tenant-123',
        actor: { userId: 'user-123', role: 'admin' },
        action: { type: 'UPDATE', entityType: 'Product', entityId: 'product-456' },
      };

      const hash1 = processor.calculateHash(auditLog1 as any);
      const hash2 = processor.calculateHash(auditLog2 as any);

      expect(hash1).not.toBe(hash2);
    });
  });
});
