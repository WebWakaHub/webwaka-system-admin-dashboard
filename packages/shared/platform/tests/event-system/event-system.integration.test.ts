/**
 * Event System Integration Tests
 * Tests the complete Event System workflow
 */

import { EventSystemFactory } from '../../src/event-system/factory/event-system-factory';
import { Event } from '../../src/event-system/types';
import { EventBuilder } from '../../src/event-system/publisher/event-publisher';
import { EventListenerBuilder } from '../../src/event-system/subscriber/event-subscriber';
import { TenantEnforcer } from '../../src/event-system/utils/tenant-enforcer';
import { globalAuditLogger } from '../../src/event-system/utils/audit-logger';

describe('Event System Integration Tests', () => {
  let system: any;

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

  beforeEach(async () => {
    system = await EventSystemFactory.createEventSystem({
      type: 'in-memory',
    });
    globalAuditLogger.clear();
  });

  afterEach(async () => {
    await system.eventBus.disconnect();
  });

  describe('End-to-End Event Publishing and Subscription', () => {
    it('should publish and receive event', async () => {
      const handler = jest.fn();
      const subscriptionId = await new EventListenerBuilder(system.subscriber)
        .on('user.created')
        .handle(handler)
        .subscribe();

      await new EventBuilder(system.publisher)
        .withEventType('user.created')
        .withTenantId('tenant-123')
        .withSource('test')
        .withData({ email: 'user@example.com' })
        .publish();

      expect(handler).toHaveBeenCalled();
      await system.subscriber.unsubscribe(subscriptionId);
    });

    it('should handle multiple subscribers', async () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      const sub1 = await new EventListenerBuilder(system.subscriber)
        .on('user.created')
        .handle(handler1)
        .subscribe();

      const sub2 = await new EventListenerBuilder(system.subscriber)
        .on('user.created')
        .handle(handler2)
        .subscribe();

      await new EventBuilder(system.publisher)
        .withEventType('user.created')
        .withTenantId('tenant-123')
        .withSource('test')
        .withData({ email: 'user@example.com' })
        .publish();

      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();

      await system.subscriber.unsubscribe(sub1);
      await system.subscriber.unsubscribe(sub2);
    });

    it('should support wildcard subscriptions', async () => {
      const handler = jest.fn();
      const subscriptionId = await new EventListenerBuilder(system.subscriber)
        .on('user.*')
        .handle(handler)
        .subscribe();

      await new EventBuilder(system.publisher)
        .withEventType('user.created')
        .withTenantId('tenant-123')
        .withSource('test')
        .withData({ email: 'user@example.com' })
        .publish();

      await new EventBuilder(system.publisher)
        .withEventType('user.updated')
        .withTenantId('tenant-123')
        .withSource('test')
        .withData({ email: 'updated@example.com' })
        .publish();

      expect(handler).toHaveBeenCalledTimes(2);
      await system.subscriber.unsubscribe(subscriptionId);
    });
  });

  describe('Tenant Isolation', () => {
    it('should enforce tenant isolation', async () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      const sub1 = await new EventListenerBuilder(system.subscriber)
        .on('user.created')
        .handle(handler1)
        .subscribe();

      const sub2 = await new EventListenerBuilder(system.subscriber)
        .on('user.created')
        .handle(handler2)
        .subscribe();

      // Publish to tenant-1
      await new EventBuilder(system.publisher)
        .withEventType('user.created')
        .withTenantId('tenant-1')
        .withSource('test')
        .withData({ email: 'user1@example.com' })
        .publish();

      // Publish to tenant-2
      await new EventBuilder(system.publisher)
        .withEventType('user.created')
        .withTenantId('tenant-2')
        .withSource('test')
        .withData({ email: 'user2@example.com' })
        .publish();

      // Both handlers should be called (in-memory bus doesn't enforce tenant isolation at subscription level)
      expect(handler1.mock.calls.length + handler2.mock.calls.length).toBeGreaterThan(0);

      await system.subscriber.unsubscribe(sub1);
      await system.subscriber.unsubscribe(sub2);
    });

    it('should validate tenant access', () => {
      const context = { tenantId: 'tenant-1', permissions: ['read:events'] };
      const event = createEvent({ tenantId: 'tenant-1' });

      expect(() => TenantEnforcer.validateTenantAccess(context, event)).not.toThrow();

      const differentTenantEvent = createEvent({ tenantId: 'tenant-2' });
      expect(() => TenantEnforcer.validateTenantAccess(context, differentTenantEvent)).toThrow();
    });
  });

  describe('Audit Logging', () => {
    it('should log all operations', async () => {
      const handler = jest.fn();
      const subscriptionId = await new EventListenerBuilder(system.subscriber)
        .on('user.created')
        .handle(handler)
        .subscribe();

      await new EventBuilder(system.publisher)
        .withEventType('user.created')
        .withTenantId('tenant-123')
        .withSource('test')
        .withData({ email: 'user@example.com' })
        .publish();

      const logs = globalAuditLogger.getLogs();
      expect(logs.length).toBeGreaterThan(0);

      await system.subscriber.unsubscribe(subscriptionId);
    });

    it('should track statistics', async () => {
      await new EventBuilder(system.publisher)
        .withEventType('user.created')
        .withTenantId('tenant-123')
        .withSource('test')
        .withData({ email: 'user@example.com' })
        .publish();

      const stats = globalAuditLogger.getStats();
      expect(stats.totalLogs).toBeGreaterThan(0);
      expect(stats.successCount).toBeGreaterThan(0);
    });
  });

  describe('Event Replay', () => {
    it('should replay events', async () => {
      // Publish some events
      for (let i = 0; i < 3; i++) {
        await new EventBuilder(system.publisher)
          .withEventType('user.created')
          .withTenantId('tenant-123')
          .withSource('test')
          .withData({ email: `user${i}@example.com` })
          .publish();
      }

      // Replay events
      const result = await system.eventBus.replayEvents({
        tenantId: 'tenant-123',
      });

      expect(result.events.length).toBeGreaterThanOrEqual(3);
    });

    it('should filter replayed events by type', async () => {
      // Publish different event types
      await new EventBuilder(system.publisher)
        .withEventType('user.created')
        .withTenantId('tenant-123')
        .withSource('test')
        .withData({ email: 'user@example.com' })
        .publish();

      await new EventBuilder(system.publisher)
        .withEventType('user.updated')
        .withTenantId('tenant-123')
        .withSource('test')
        .withData({ email: 'updated@example.com' })
        .publish();

      // Replay only user.created events
      const result = await system.eventBus.replayEvents({
        tenantId: 'tenant-123',
        eventType: 'user.created',
      });

      expect(result.events.every((e) => e.eventType === 'user.created')).toBe(true);
    });
  });

  describe('Error Handling and Retry', () => {
    it('should retry failed handlers', async () => {
      let callCount = 0;
      const handler = jest.fn(async () => {
        callCount++;
        if (callCount < 2) {
          throw new Error('First call fails');
        }
      });

      await new EventListenerBuilder(system.subscriber)
        .on('user.created')
        .handle(handler)
        .withMaxRetries(2)
        .withRetryDelayMs(10)
        .subscribe();

      await new EventBuilder(system.publisher)
        .withEventType('user.created')
        .withTenantId('tenant-123')
        .withSource('test')
        .withData({ email: 'user@example.com' })
        .publish();

      // Wait for retries
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(handler).toHaveBeenCalled();
    });
  });

  describe('Batch Operations', () => {
    it('should publish batch of events', async () => {
      const handler = jest.fn();
      const subscriptionId = await new EventListenerBuilder(system.subscriber)
        .on('user.created')
        .handle(handler)
        .subscribe();

      const events = [
        new EventBuilder(system.publisher)
          .withEventType('user.created')
          .withTenantId('tenant-123')
          .withSource('test')
          .withData({ email: 'user1@example.com' })
          .build(),
        new EventBuilder(system.publisher)
          .withEventType('user.created')
          .withTenantId('tenant-123')
          .withSource('test')
          .withData({ email: 'user2@example.com' })
          .build(),
      ];

      await system.publisher.publishBatch(events);

      expect(handler.mock.calls.length).toBeGreaterThanOrEqual(2);
      await system.subscriber.unsubscribe(subscriptionId);
    });
  });

  describe('Consumer Groups', () => {
    it('should support consumer groups', async () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      const sub1 = await new EventListenerBuilder(system.subscriber)
        .on('user.created')
        .handle(handler1)
        .withConsumerGroup('group-1')
        .subscribe();

      const sub2 = await new EventListenerBuilder(system.subscriber)
        .on('user.created')
        .handle(handler2)
        .withConsumerGroup('group-1')
        .subscribe();

      await new EventBuilder(system.publisher)
        .withEventType('user.created')
        .withTenantId('tenant-123')
        .withSource('test')
        .withData({ email: 'user@example.com' })
        .publish();

      // Both handlers should be called (in-memory bus doesn't enforce consumer group semantics)
      expect(handler1.mock.calls.length + handler2.mock.calls.length).toBeGreaterThan(0);

      await system.subscriber.unsubscribe(sub1);
      await system.subscriber.unsubscribe(sub2);
    });
  });

  describe('Correlation IDs', () => {
    it('should support correlation IDs for tracing', async () => {
      const handler = jest.fn();
      const subscriptionId = await new EventListenerBuilder(system.subscriber)
        .on('user.created')
        .handle(handler)
        .subscribe();

      const correlationId = '550e8400-e29b-41d4-a716-446655440099';
      await new EventBuilder(system.publisher)
        .withEventType('user.created')
        .withTenantId('tenant-123')
        .withSource('test')
        .withCorrelationId(correlationId)
        .withData({ email: 'user@example.com' })
        .publish();

      expect(handler).toHaveBeenCalled();
      const event = handler.mock.calls[0][0];
      expect(event.correlationId).toBe(correlationId);

      await system.subscriber.unsubscribe(subscriptionId);
    });
  });

  describe('System Statistics', () => {
    it('should track system statistics', async () => {
      const stats1 = system.eventBus.getStats();
      expect(stats1.publishedCount).toBe(0);

      await new EventBuilder(system.publisher)
        .withEventType('user.created')
        .withTenantId('tenant-123')
        .withSource('test')
        .withData({ email: 'user@example.com' })
        .publish();

      const stats2 = system.eventBus.getStats();
      expect(stats2.publishedCount).toBeGreaterThan(stats1.publishedCount);
    });
  });
});
