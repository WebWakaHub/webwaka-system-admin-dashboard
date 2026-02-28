/**
 * WebWaka Event System - Event Bus Tests
 * 
 * Comprehensive unit tests for the Event Bus implementation.
 * Tests cover subscription management, event routing, filtering,
 * tenant isolation, and error handling.
 * 
 * @module @webwaka/event-system/tests
 * @author webwakaagent4 (Core Platform Engineer)
 */

import { v4 as uuidv4 } from '../utils/uuid';
import { EventBus, createEventBus } from '../event-bus';
import { Event, EventHandler } from '../types';

describe('EventBus', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus({ debug: false });
  });

  afterEach(() => {
    eventBus.clearSubscriptions();
  });

  describe('Subscription Management', () => {
    it('should create a subscription and return a subscription handle', () => {
      const handler: EventHandler = jest.fn();
      const subscription = eventBus.subscribe({ eventType: 'user.created' }, handler);

      expect(subscription).toBeDefined();
      expect(subscription.id).toBeDefined();
      expect(subscription.eventType).toBe('user.created');
      expect(subscription.handler).toBe(handler);
      expect(typeof subscription.unsubscribe).toBe('function');
    });

    it('should increment active subscriptions count when subscribing', () => {
      const handler: EventHandler = jest.fn();
      
      expect(eventBus.getStats().activeSubscriptions).toBe(0);
      
      eventBus.subscribe({ eventType: 'user.created' }, handler);
      expect(eventBus.getStats().activeSubscriptions).toBe(1);
      
      eventBus.subscribe({ eventType: 'user.updated' }, handler);
      expect(eventBus.getStats().activeSubscriptions).toBe(2);
    });

    it('should unsubscribe using subscription handle', () => {
      const handler: EventHandler = jest.fn();
      const subscription = eventBus.subscribe({ eventType: 'user.created' }, handler);

      expect(eventBus.getStats().activeSubscriptions).toBe(1);

      subscription.unsubscribe();

      expect(eventBus.getStats().activeSubscriptions).toBe(0);
    });

    it('should unsubscribe using subscription ID', () => {
      const handler: EventHandler = jest.fn();
      const subscription = eventBus.subscribe({ eventType: 'user.created' }, handler);

      expect(eventBus.getStats().activeSubscriptions).toBe(1);

      const removed = eventBus.unsubscribe(subscription.id);

      expect(removed).toBe(true);
      expect(eventBus.getStats().activeSubscriptions).toBe(0);
    });

    it('should return false when unsubscribing non-existent subscription', () => {
      const removed = eventBus.unsubscribe('non-existent-id');
      expect(removed).toBe(false);
    });

    it('should clear all subscriptions', () => {
      const handler: EventHandler = jest.fn();
      
      eventBus.subscribe({ eventType: 'user.created' }, handler);
      eventBus.subscribe({ eventType: 'user.updated' }, handler);
      eventBus.subscribe({ eventType: 'order.placed' }, handler);

      expect(eventBus.getStats().activeSubscriptions).toBe(3);

      eventBus.clearSubscriptions();

      expect(eventBus.getStats().activeSubscriptions).toBe(0);
    });

    it('should get all active subscriptions', () => {
      const handler: EventHandler = jest.fn();
      
      eventBus.subscribe({ eventType: 'user.created' }, handler);
      eventBus.subscribe({ eventType: 'user.updated', tenantId: 'tenant-123' }, handler);

      const subscriptions = eventBus.getSubscriptions();

      expect(subscriptions).toHaveLength(2);
      expect(subscriptions[0]).toHaveProperty('id');
      expect(subscriptions[0]).toHaveProperty('eventType');
      expect(subscriptions[1]).toHaveProperty('tenantId', 'tenant-123');
    });
  });

  describe('Event Publishing', () => {
    it('should publish event to matching subscriber', () => {
      const handler: EventHandler = jest.fn();
      eventBus.subscribe({ eventType: 'user.created' }, handler);

      const event: Event = createTestEvent('user.created');
      const deliveredCount = eventBus.publish(event);

      expect(deliveredCount).toBe(1);
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(event);
    });

    it('should publish event to multiple matching subscribers', () => {
      const handler1: EventHandler = jest.fn();
      const handler2: EventHandler = jest.fn();
      const handler3: EventHandler = jest.fn();

      eventBus.subscribe({ eventType: 'user.created' }, handler1);
      eventBus.subscribe({ eventType: 'user.created' }, handler2);
      eventBus.subscribe({ eventType: 'user.created' }, handler3);

      const event: Event = createTestEvent('user.created');
      const deliveredCount = eventBus.publish(event);

      expect(deliveredCount).toBe(3);
      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
      expect(handler3).toHaveBeenCalledTimes(1);
    });

    it('should not publish event to non-matching subscribers', () => {
      const handler: EventHandler = jest.fn();
      eventBus.subscribe({ eventType: 'user.updated' }, handler);

      const event: Event = createTestEvent('user.created');
      const deliveredCount = eventBus.publish(event);

      expect(deliveredCount).toBe(0);
      expect(handler).not.toHaveBeenCalled();
    });

    it('should increment events published counter', () => {
      const handler: EventHandler = jest.fn();
      eventBus.subscribe({ eventType: 'user.created' }, handler);

      expect(eventBus.getStats().eventsPublished).toBe(0);

      eventBus.publish(createTestEvent('user.created'));
      expect(eventBus.getStats().eventsPublished).toBe(1);

      eventBus.publish(createTestEvent('user.created'));
      expect(eventBus.getStats().eventsPublished).toBe(2);
    });

    it('should increment events delivered counter', () => {
      const handler: EventHandler = jest.fn();
      eventBus.subscribe({ eventType: 'user.created' }, handler);
      eventBus.subscribe({ eventType: 'user.created' }, handler);

      expect(eventBus.getStats().eventsDelivered).toBe(0);

      eventBus.publish(createTestEvent('user.created'));
      expect(eventBus.getStats().eventsDelivered).toBe(2);
    });

    it('should handle async event publishing', async () => {
      const handler: EventHandler = jest.fn().mockResolvedValue(undefined);
      eventBus.subscribe({ eventType: 'user.created' }, handler);

      const event: Event = createTestEvent('user.created');
      const deliveredCount = await eventBus.publishAsync(event);

      expect(deliveredCount).toBe(1);
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(event);
    });
  });

  describe('Event Routing and Pattern Matching', () => {
    it('should match exact event type', () => {
      const handler: EventHandler = jest.fn();
      eventBus.subscribe({ eventType: 'user.created' }, handler);

      eventBus.publish(createTestEvent('user.created'));
      expect(handler).toHaveBeenCalledTimes(1);

      eventBus.publish(createTestEvent('user.updated'));
      expect(handler).toHaveBeenCalledTimes(1); // Still 1, not called again
    });

    it('should match wildcard pattern (user.*)', () => {
      const handler: EventHandler = jest.fn();
      eventBus.subscribe({ eventType: 'user.*' }, handler);

      eventBus.publish(createTestEvent('user.created'));
      expect(handler).toHaveBeenCalledTimes(1);

      eventBus.publish(createTestEvent('user.updated'));
      expect(handler).toHaveBeenCalledTimes(2);

      eventBus.publish(createTestEvent('user.deleted'));
      expect(handler).toHaveBeenCalledTimes(3);

      eventBus.publish(createTestEvent('order.created'));
      expect(handler).toHaveBeenCalledTimes(3); // Not called for order events
    });

    it('should match global wildcard (*)', () => {
      const handler: EventHandler = jest.fn();
      eventBus.subscribe({ eventType: '*' }, handler);

      eventBus.publish(createTestEvent('user.created'));
      eventBus.publish(createTestEvent('order.placed'));
      eventBus.publish(createTestEvent('payment.processed'));

      expect(handler).toHaveBeenCalledTimes(3);
    });

    it('should match nested wildcard patterns', () => {
      const handler: EventHandler = jest.fn();
      eventBus.subscribe({ eventType: 'user.*.email' }, handler);

      eventBus.publish(createTestEvent('user.created.email'));
      expect(handler).toHaveBeenCalledTimes(1);

      eventBus.publish(createTestEvent('user.updated.email'));
      expect(handler).toHaveBeenCalledTimes(2);

      eventBus.publish(createTestEvent('user.created.sms'));
      expect(handler).toHaveBeenCalledTimes(2); // Not called for sms
    });

    it('should not match pattern with more parts than event', () => {
      const handler: EventHandler = jest.fn();
      eventBus.subscribe({ eventType: 'user.created.email.sent' }, handler);

      eventBus.publish(createTestEvent('user.created'));
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('Tenant Isolation', () => {
    it('should deliver event only to subscribers with matching tenant', () => {
      const handler1: EventHandler = jest.fn();
      const handler2: EventHandler = jest.fn();

      eventBus.subscribe({ eventType: 'user.created', tenantId: 'tenant-123' }, handler1);
      eventBus.subscribe({ eventType: 'user.created', tenantId: 'tenant-456' }, handler2);

      const event: Event = createTestEvent('user.created', 'tenant-123');
      eventBus.publish(event);

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).not.toHaveBeenCalled();
    });

    it('should deliver event to subscribers without tenant filter', () => {
      const handler: EventHandler = jest.fn();
      eventBus.subscribe({ eventType: 'user.created' }, handler);

      const event1: Event = createTestEvent('user.created', 'tenant-123');
      const event2: Event = createTestEvent('user.created', 'tenant-456');

      eventBus.publish(event1);
      eventBus.publish(event2);

      expect(handler).toHaveBeenCalledTimes(2);
    });

    it('should enforce tenant isolation for wildcard subscriptions', () => {
      const handler: EventHandler = jest.fn();
      eventBus.subscribe({ eventType: 'user.*', tenantId: 'tenant-123' }, handler);

      eventBus.publish(createTestEvent('user.created', 'tenant-123'));
      expect(handler).toHaveBeenCalledTimes(1);

      eventBus.publish(createTestEvent('user.updated', 'tenant-456'));
      expect(handler).toHaveBeenCalledTimes(1); // Not called for different tenant
    });
  });

  describe('Event Filtering', () => {
    it('should apply custom filter function', () => {
      const handler: EventHandler = jest.fn();
      const filter = (event: Event) => event.data.priority === 'high';

      eventBus.subscribe({ eventType: 'user.created', filter }, handler);

      const highPriorityEvent: Event = createTestEvent('user.created', 'tenant-123', {
        priority: 'high',
      });
      const lowPriorityEvent: Event = createTestEvent('user.created', 'tenant-123', {
        priority: 'low',
      });

      eventBus.publish(highPriorityEvent);
      expect(handler).toHaveBeenCalledTimes(1);

      eventBus.publish(lowPriorityEvent);
      expect(handler).toHaveBeenCalledTimes(1); // Not called for low priority
    });

    it('should increment filtered events counter', () => {
      const handler: EventHandler = jest.fn();
      const filter = (event: Event) => event.data.priority === 'high';

      eventBus.subscribe({ eventType: 'user.created', filter }, handler);

      expect(eventBus.getStats().eventsFiltered).toBe(0);

      eventBus.publish(createTestEvent('user.created', 'tenant-123', { priority: 'low' }));
      expect(eventBus.getStats().eventsFiltered).toBe(1);

      eventBus.publish(createTestEvent('user.created', 'tenant-123', { priority: 'low' }));
      expect(eventBus.getStats().eventsFiltered).toBe(2);
    });

    it('should combine tenant filter and custom filter', () => {
      const handler: EventHandler = jest.fn();
      const filter = (event: Event) => event.data.verified === true;

      eventBus.subscribe(
        { eventType: 'user.created', tenantId: 'tenant-123', filter },
        handler
      );

      // Should be delivered (tenant matches, verified=true)
      eventBus.publish(
        createTestEvent('user.created', 'tenant-123', { verified: true })
      );
      expect(handler).toHaveBeenCalledTimes(1);

      // Should not be delivered (tenant doesn't match)
      eventBus.publish(
        createTestEvent('user.created', 'tenant-456', { verified: true })
      );
      expect(handler).toHaveBeenCalledTimes(1);

      // Should not be delivered (tenant matches, but verified=false)
      eventBus.publish(
        createTestEvent('user.created', 'tenant-123', { verified: false })
      );
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle handler errors gracefully', () => {
      const errorHandler: EventHandler = jest.fn().mockImplementation(() => {
        throw new Error('Handler error');
      });
      const successHandler: EventHandler = jest.fn();

      eventBus.subscribe({ eventType: 'user.created' }, errorHandler);
      eventBus.subscribe({ eventType: 'user.created' }, successHandler);

      const event: Event = createTestEvent('user.created');
      const deliveredCount = eventBus.publish(event);

      // Should still deliver to success handler despite error in first handler
      expect(deliveredCount).toBe(1);
      expect(errorHandler).toHaveBeenCalledTimes(1);
      expect(successHandler).toHaveBeenCalledTimes(1);
      expect(eventBus.getStats().deliveryErrors).toBe(1);
    });

    it('should validate event structure - missing eventId', () => {
      const event = {
        eventType: 'user.created',
        eventVersion: '1.0',
        timestamp: new Date().toISOString(),
        tenantId: 'tenant-123',
        source: 'test',
        data: {},
      } as any;

      expect(() => eventBus.publish(event)).toThrow('Event must have an eventId');
    });

    it('should validate event structure - missing eventType', () => {
      const event = {
        eventId: uuidv4(),
        eventVersion: '1.0',
        timestamp: new Date().toISOString(),
        tenantId: 'tenant-123',
        source: 'test',
        data: {},
      } as any;

      expect(() => eventBus.publish(event)).toThrow('Event must have an eventType');
    });

    it('should validate event structure - missing tenantId', () => {
      const event = {
        eventId: uuidv4(),
        eventType: 'user.created',
        eventVersion: '1.0',
        timestamp: new Date().toISOString(),
        source: 'test',
        data: {},
      } as any;

      expect(() => eventBus.publish(event)).toThrow(
        'Event must have a tenantId (tenant isolation required)'
      );
    });

    it('should validate event structure - missing data', () => {
      const event = {
        eventId: uuidv4(),
        eventType: 'user.created',
        eventVersion: '1.0',
        timestamp: new Date().toISOString(),
        tenantId: 'tenant-123',
        source: 'test',
      } as any;

      expect(() => eventBus.publish(event)).toThrow('Event must have a data payload');
    });
  });

  describe('Statistics', () => {
    it('should track event bus statistics', () => {
      const handler: EventHandler = jest.fn();
      eventBus.subscribe({ eventType: 'user.created' }, handler);
      eventBus.subscribe({ eventType: 'user.updated' }, handler);

      const stats1 = eventBus.getStats();
      expect(stats1.eventsPublished).toBe(0);
      expect(stats1.eventsDelivered).toBe(0);
      expect(stats1.activeSubscriptions).toBe(2);

      eventBus.publish(createTestEvent('user.created'));
      eventBus.publish(createTestEvent('user.updated'));

      const stats2 = eventBus.getStats();
      expect(stats2.eventsPublished).toBe(2);
      expect(stats2.eventsDelivered).toBe(2);
      expect(stats2.activeSubscriptions).toBe(2);
    });

    it('should reset statistics', () => {
      const handler: EventHandler = jest.fn();
      eventBus.subscribe({ eventType: 'user.created' }, handler);

      eventBus.publish(createTestEvent('user.created'));

      expect(eventBus.getStats().eventsPublished).toBe(1);
      expect(eventBus.getStats().eventsDelivered).toBe(1);

      eventBus.resetStats();

      const stats = eventBus.getStats();
      expect(stats.eventsPublished).toBe(0);
      expect(stats.eventsDelivered).toBe(0);
      expect(stats.activeSubscriptions).toBe(1); // Subscriptions not cleared
    });
  });

  describe('Factory Function', () => {
    it('should create event bus using factory function', () => {
      const bus = createEventBus({ debug: true });
      expect(bus).toBeInstanceOf(EventBus);
    });

    it('should create event bus with default config', () => {
      const bus = createEventBus();
      expect(bus).toBeInstanceOf(EventBus);
    });
  });

  describe('Additional Edge Cases', () => {
    it('should handle double wildcard pattern (**)', () => {
      const handler: EventHandler = jest.fn();
      eventBus.subscribe({ eventType: 'user.**' }, handler);

      eventBus.publish(createTestEvent('user.created'));
      eventBus.publish(createTestEvent('user.created.email'));
      eventBus.publish(createTestEvent('user.created.email.sent'));
      eventBus.publish(createTestEvent('order.created'));

      expect(handler).toHaveBeenCalledTimes(3);
    });

    it('should handle wildcard at end of pattern', () => {
      const handler: EventHandler = jest.fn();
      eventBus.subscribe({ eventType: 'user.created.*' }, handler);

      eventBus.publish(createTestEvent('user.created.email'));
      expect(handler).toHaveBeenCalledTimes(1);

      eventBus.publish(createTestEvent('user.created.sms'));
      expect(handler).toHaveBeenCalledTimes(2);

      eventBus.publish(createTestEvent('user.created'));
      expect(handler).toHaveBeenCalledTimes(2); // Not called for exact match
    });

    it('should handle async handler errors', async () => {
      const errorHandler: EventHandler = jest.fn().mockRejectedValue(new Error('Async error'));
      const successHandler: EventHandler = jest.fn().mockResolvedValue(undefined);

      eventBus.subscribe({ eventType: 'user.created' }, errorHandler);
      eventBus.subscribe({ eventType: 'user.created' }, successHandler);

      const event: Event = createTestEvent('user.created');
      const deliveredCount = await eventBus.publishAsync(event);

      expect(deliveredCount).toBe(1);
      expect(errorHandler).toHaveBeenCalledTimes(1);
      expect(successHandler).toHaveBeenCalledTimes(1);
      expect(eventBus.getStats().deliveryErrors).toBe(1);
    });

    it('should validate event structure - missing eventVersion', () => {
      const event = {
        eventId: uuidv4(),
        eventType: 'user.created',
        timestamp: new Date().toISOString(),
        tenantId: 'tenant-123',
        source: 'test',
        data: {},
      } as any;

      expect(() => eventBus.publish(event)).toThrow('Event must have an eventVersion');
    });

    it('should validate event structure - missing timestamp', () => {
      const event = {
        eventId: uuidv4(),
        eventType: 'user.created',
        eventVersion: '1.0',
        tenantId: 'tenant-123',
        source: 'test',
        data: {},
      } as any;

      expect(() => eventBus.publish(event)).toThrow('Event must have a timestamp');
    });

    it('should validate event structure - missing source', () => {
      const event = {
        eventId: uuidv4(),
        eventType: 'user.created',
        eventVersion: '1.0',
        timestamp: new Date().toISOString(),
        tenantId: 'tenant-123',
        data: {},
      } as any;

      expect(() => eventBus.publish(event)).toThrow('Event must have a source');
    });

    it('should handle multiple wildcard parts in pattern', () => {
      const handler: EventHandler = jest.fn();
      eventBus.subscribe({ eventType: '*.*.email' }, handler);

      eventBus.publish(createTestEvent('user.created.email'));
      expect(handler).toHaveBeenCalledTimes(1);

      eventBus.publish(createTestEvent('order.placed.email'));
      expect(handler).toHaveBeenCalledTimes(2);

      eventBus.publish(createTestEvent('user.created.sms'));
      expect(handler).toHaveBeenCalledTimes(2); // Not called for sms
    });

    it('should handle debug logging when enabled', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const debugBus = new EventBus({ debug: true });
      const handler: EventHandler = jest.fn();

      debugBus.subscribe({ eventType: 'user.created' }, handler);
      debugBus.publish(createTestEvent('user.created'));
      debugBus.clearSubscriptions();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle filter that filters all events', () => {
      const handler: EventHandler = jest.fn();
      const filter = () => false; // Filter out all events

      eventBus.subscribe({ eventType: 'user.created', filter }, handler);

      eventBus.publish(createTestEvent('user.created'));
      eventBus.publish(createTestEvent('user.created'));

      expect(handler).not.toHaveBeenCalled();
      expect(eventBus.getStats().eventsFiltered).toBe(2);
    });

    it('should handle empty data object', () => {
      const handler: EventHandler = jest.fn();
      eventBus.subscribe({ eventType: 'user.created' }, handler);

      const event: Event = createTestEvent('user.created', 'tenant-123', {});
      eventBus.publish(event);

      expect(handler).toHaveBeenCalledWith(event);
    });
  });
});

/**
 * Helper function to create test events
 */
function createTestEvent(
  eventType: string,
  tenantId: string = 'test-tenant',
  data: any = {}
): Event {
  return {
    eventId: uuidv4(),
    eventType,
    eventVersion: '1.0',
    timestamp: new Date().toISOString(),
    tenantId,
    source: 'test-module',
    data,
  };
}
