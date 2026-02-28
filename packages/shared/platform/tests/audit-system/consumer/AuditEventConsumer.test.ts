/**
 * Unit tests for AuditEventConsumer
 */

import { AuditEventConsumer } from '../../../src/audit-system/consumer/AuditEventConsumer';
import { AuditDataStore } from '../../../src/audit-system/store/AuditDataStore';
import { AuditEvent } from '../../../src/audit-system/types/AuditLog';

describe('AuditEventConsumer', () => {
  let consumer: AuditEventConsumer;
  let dataStore: AuditDataStore;

  beforeEach(() => {
    dataStore = new AuditDataStore();
    consumer = new AuditEventConsumer(dataStore);
  });

  describe('start and stop', () => {
    it('should start the consumer', async () => {
      await consumer.start();

      expect(consumer.isConsumerRunning()).toBe(true);
    });

    it('should stop the consumer', async () => {
      await consumer.start();
      await consumer.stop();

      expect(consumer.isConsumerRunning()).toBe(false);
    });

    it('should not start if already running', async () => {
      await consumer.start();
      await consumer.start();

      expect(consumer.isConsumerRunning()).toBe(true);
    });
  });

  describe('processEvent', () => {
    beforeEach(async () => {
      await consumer.start();
    });

    it('should process a valid audit event', async () => {
      const event: AuditEvent = {
        eventType: 'audit.action.performed',
        eventId: 'event-123',
        timestamp: new Date().toISOString(),
        sourceModule: 'products-service',
        tenantId: 'tenant-123',
        actor: { userId: 'user-123', role: 'admin' },
        action: { type: 'CREATE', entityType: 'Product', entityId: 'product-456' },
      };

      await consumer.processEvent(event);

      const count = await dataStore.getTotalAuditLogCount();
      expect(count).toBe(1);
    });

    it('should queue events when consumer is not running', async () => {
      await consumer.stop();

      const event: AuditEvent = {
        eventType: 'audit.action.performed',
        eventId: 'event-123',
        timestamp: new Date().toISOString(),
        sourceModule: 'products-service',
        tenantId: 'tenant-123',
        actor: { userId: 'user-123', role: 'admin' },
        action: { type: 'CREATE', entityType: 'Product', entityId: 'product-456' },
      };

      await consumer.processEvent(event);

      expect(consumer.getQueueSize()).toBe(1);
    });

    it('should process queued events when started', async () => {
      await consumer.stop();

      const event1: AuditEvent = {
        eventType: 'audit.action.performed',
        eventId: 'event-123',
        timestamp: new Date().toISOString(),
        sourceModule: 'products-service',
        tenantId: 'tenant-123',
        actor: { userId: 'user-123', role: 'admin' },
        action: { type: 'CREATE', entityType: 'Product', entityId: 'product-456' },
      };

      const event2: AuditEvent = {
        eventType: 'audit.action.performed',
        eventId: 'event-124',
        timestamp: new Date().toISOString(),
        sourceModule: 'products-service',
        tenantId: 'tenant-123',
        actor: { userId: 'user-124', role: 'user' },
        action: { type: 'UPDATE', entityType: 'Product', entityId: 'product-456' },
      };

      await consumer.processEvent(event1);
      await consumer.processEvent(event2);

      expect(consumer.getQueueSize()).toBe(2);

      await consumer.start();

      expect(consumer.getQueueSize()).toBe(0);
      const count = await dataStore.getTotalAuditLogCount();
      expect(count).toBe(2);
    });
  });

  describe('getQueueSize', () => {
    it('should return 0 when queue is empty', () => {
      expect(consumer.getQueueSize()).toBe(0);
    });

    it('should return the correct queue size', async () => {
      await consumer.stop();

      const event: AuditEvent = {
        eventType: 'audit.action.performed',
        eventId: 'event-123',
        timestamp: new Date().toISOString(),
        sourceModule: 'products-service',
        tenantId: 'tenant-123',
        actor: { userId: 'user-123', role: 'admin' },
        action: { type: 'CREATE', entityType: 'Product', entityId: 'product-456' },
      };

      await consumer.processEvent(event);
      await consumer.processEvent(event);

      expect(consumer.getQueueSize()).toBe(2);
    });
  });

  describe('isConsumerRunning', () => {
    it('should return false when consumer is not running', () => {
      expect(consumer.isConsumerRunning()).toBe(false);
    });

    it('should return true when consumer is running', async () => {
      await consumer.start();

      expect(consumer.isConsumerRunning()).toBe(true);
    });
  });
});
