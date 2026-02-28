/**
 * In-Memory Event Bus Tests
 */

import { InMemoryEventBus } from '../../src/event-system/bus/in-memory-event-bus';
import { Event } from '../../src/event-system/types';
import { ConnectionError, EventPublishError, SubscriptionError } from '../../src/event-system/errors';

describe('InMemoryEventBus', () => {
  let eventBus: InMemoryEventBus;

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
    eventBus = new InMemoryEventBus();
  });

  describe('Connection Management', () => {
    it('should connect successfully', async () => {
      expect(eventBus.isConnected()).toBe(false);
      await eventBus.connect();
      expect(eventBus.isConnected()).toBe(true);
    });

    it('should throw error if already connected', async () => {
      await eventBus.connect();
      await expect(eventBus.connect()).rejects.toThrow(ConnectionError);
    });

    it('should disconnect successfully', async () => {
      await eventBus.connect();
      expect(eventBus.isConnected()).toBe(true);
      await eventBus.disconnect();
      expect(eventBus.isConnected()).toBe(false);
    });

    it('should throw error if disconnecting when not connected', async () => {
      await expect(eventBus.disconnect()).rejects.toThrow(ConnectionError);
    });
  });

  describe('Publishing', () => {
    beforeEach(async () => {
      await eventBus.connect();
    });

    afterEach(async () => {
      await eventBus.disconnect();
    });

    it('should publish an event', async () => {
      const event = createEvent();
      await eventBus.publish(event);
      const events = eventBus.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toEqual(event);
    });

    it('should throw error if publishing when not connected', async () => {
      await eventBus.disconnect();
      const event = createEvent();
      await expect(eventBus.publish(event)).rejects.toThrow(ConnectionError);
    });

    it('should throw error if event is invalid', async () => {
      const invalidEvent = { eventType: 'test' } as any;
      await expect(eventBus.publish(invalidEvent)).rejects.toThrow(EventPublishError);
    });

    it('should publish batch of events', async () => {
      const events = [createEvent(), createEvent({ eventId: '550e8400-e29b-41d4-a716-446655440002' })];
      await eventBus.publishBatch(events);
      const publishedEvents = eventBus.getEvents();
      expect(publishedEvents).toHaveLength(2);
    });
  });

  describe('Subscription', () => {
    beforeEach(async () => {
      await eventBus.connect();
    });

    afterEach(async () => {
      await eventBus.disconnect();
    });

    it('should subscribe to events', async () => {
      const handler = jest.fn();
      const subscriptionId = await eventBus.subscribe('user.created', handler);
      expect(subscriptionId).toBeDefined();
      expect(subscriptionId).toMatch(/^sub-/);
    });

    it('should deliver events to subscribers', async () => {
      const handler = jest.fn();
      await eventBus.subscribe('user.created', handler);
      const event = createEvent();
      await eventBus.publish(event);
      expect(handler).toHaveBeenCalledWith(event);
    });

    it('should support wildcard subscriptions', async () => {
      const handler = jest.fn();
      await eventBus.subscribe('user.*', handler);
      const event1 = createEvent({ eventType: 'user.created' });
      const event2 = createEvent({ eventType: 'user.updated', eventId: '550e8400-e29b-41d4-a716-446655440002' });
      await eventBus.publish(event1);
      await eventBus.publish(event2);
      expect(handler).toHaveBeenCalledTimes(2);
    });

    it('should unsubscribe from events', async () => {
      const handler = jest.fn();
      const subscriptionId = await eventBus.subscribe('user.created', handler);
      await eventBus.unsubscribe(subscriptionId);
      const event = createEvent();
      await eventBus.publish(event);
      expect(handler).not.toHaveBeenCalled();
    });

    it('should throw error when unsubscribing from non-existent subscription', async () => {
      await expect(eventBus.unsubscribe('non-existent')).rejects.toThrow(SubscriptionError);
    });

    it('should throw error if subscribing when not connected', async () => {
      await eventBus.disconnect();
      const handler = jest.fn();
      await expect(eventBus.subscribe('user.created', handler)).rejects.toThrow(ConnectionError);
    });
  });

  describe('Statistics', () => {
    beforeEach(async () => {
      await eventBus.connect();
    });

    afterEach(async () => {
      await eventBus.disconnect();
    });

    it('should track published event count', async () => {
      const event = createEvent();
      await eventBus.publish(event);
      const stats = eventBus.getStats();
      expect(stats.publishedCount).toBe(1);
    });

    it('should track subscription count', async () => {
      const handler = jest.fn();
      await eventBus.subscribe('user.created', handler);
      const stats = eventBus.getStats();
      expect(stats.subscribedCount).toBe(1);
    });

    it('should track failed count', async () => {
      const stats = eventBus.getStats();
      expect(stats.failedCount).toBeGreaterThanOrEqual(0);
    });

    it('should track uptime', async () => {
      const stats = eventBus.getStats();
      expect(stats.uptime).toBeGreaterThan(0);
    });
  });

  describe('Event Retrieval', () => {
    beforeEach(async () => {
      await eventBus.connect();
    });

    afterEach(async () => {
      await eventBus.disconnect();
    });

    it('should get all events', async () => {
      const event1 = createEvent();
      const event2 = createEvent({ eventId: '550e8400-e29b-41d4-a716-446655440002' });
      await eventBus.publish(event1);
      await eventBus.publish(event2);
      const events = eventBus.getEvents();
      expect(events).toHaveLength(2);
    });

    it('should get events by tenant', async () => {
      const tenantId1 = '550e8400-e29b-41d4-a716-446655440001';
      const tenantId2 = '550e8400-e29b-41d4-a716-446655440099';
      const event1 = createEvent({ tenantId: tenantId1 });
      const event2 = createEvent({ tenantId: tenantId2, eventId: '550e8400-e29b-41d4-a716-446655440002' });
      await eventBus.publish(event1);
      await eventBus.publish(event2);
      const events = eventBus.getEventsByTenant(tenantId1);
      expect(events).toHaveLength(1);
      expect(events[0].tenantId).toBe(tenantId1);
    });

    it('should clear all events and subscriptions', async () => {
      const handler = jest.fn();
      await eventBus.subscribe('user.created', handler);
      const event = createEvent();
      await eventBus.publish(event);
      eventBus.clear();
      expect(eventBus.getEvents()).toHaveLength(0);
      expect(eventBus.getStats().subscribedCount).toBe(0);
    });
  });

  describe('Event Replay', () => {
    beforeEach(async () => {
      await eventBus.connect();
    });

    afterEach(async () => {
      await eventBus.disconnect();
    });

    it('should replay events for a tenant', async () => {
      const tenantId = '550e8400-e29b-41d4-a716-446655440001';
      const event1 = createEvent({ tenantId });
      const event2 = createEvent({ tenantId, eventId: '550e8400-e29b-41d4-a716-446655440002' });
      await eventBus.publish(event1);
      await eventBus.publish(event2);
      const result = await eventBus.replayEvents({ tenantId });
      expect(result.events).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.hasMore).toBe(false);
    });

    it('should filter replayed events by event type', async () => {
      const tenantId = '550e8400-e29b-41d4-a716-446655440001';
      const event1 = createEvent({ tenantId, eventType: 'user.created' });
      const event2 = createEvent({ tenantId, eventType: 'user.updated', eventId: '550e8400-e29b-41d4-a716-446655440002' });
      await eventBus.publish(event1);
      await eventBus.publish(event2);
      const result = await eventBus.replayEvents({ tenantId, eventType: 'user.created' });
      expect(result.events).toHaveLength(1);
      expect(result.events[0].eventType).toBe('user.created');
    });
  });
});
