/**
 * Event Publisher Tests
 */

import { DefaultEventPublisher, EventBuilder } from '../../src/event-system/publisher/event-publisher';
import { InMemoryEventBus } from '../../src/event-system/bus/in-memory-event-bus';
import { Event } from '../../src/event-system/types';
import { EventPublishError } from '../../src/event-system/errors';

describe('Event Publisher', () => {
  let eventBus: InMemoryEventBus;
  let publisher: DefaultEventPublisher;

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
    eventBus = new InMemoryEventBus();
    await eventBus.connect();
    publisher = new DefaultEventPublisher(eventBus);
  });

  afterEach(async () => {
    await eventBus.disconnect();
  });

  describe('DefaultEventPublisher', () => {
    it('should publish a valid event', async () => {
      const event = createEvent();
      await publisher.publish(event);
      const events = eventBus.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toEqual(event);
    });

    it('should throw error if event is invalid', async () => {
      const invalidEvent = { eventType: 'test' } as any;
      await expect(publisher.publish(invalidEvent)).rejects.toThrow(EventPublishError);
    });

    it('should publish batch of events', async () => {
      const events = [createEvent(), createEvent({ eventId: '550e8400-e29b-41d4-a716-446655440002' })];
      await publisher.publishBatch(events);
      const publishedEvents = eventBus.getEvents();
      expect(publishedEvents).toHaveLength(2);
    });

    it('should throw error if batch contains invalid event', async () => {
      const events = [createEvent(), { eventType: 'test' } as any];
      await expect(publisher.publishBatch(events)).rejects.toThrow(EventPublishError);
    });
  });

  describe('EventBuilder', () => {
    it('should build and publish a valid event', async () => {
      const builder = new EventBuilder(publisher);
      await builder
        .withEventType('user.created')
        .withTenantId('550e8400-e29b-41d4-a716-446655440001')
        .withSource('test-module')
        .withData({ email: 'test@example.com' })
        .publish();

      const events = eventBus.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe('user.created');
      expect(events[0].tenantId).toBe('550e8400-e29b-41d4-a716-446655440001');
    });

    it('should set event version', async () => {
      const builder = new EventBuilder(publisher);
      await builder
        .withEventType('user.created')
        .withEventVersion('2.0')
        .withTenantId('550e8400-e29b-41d4-a716-446655440001')
        .withSource('test-module')
        .publish();

      const events = eventBus.getEvents();
      expect(events[0].eventVersion).toBe('2.0');
    });

    it('should set user ID', async () => {
      const builder = new EventBuilder(publisher);
      await builder
        .withEventType('user.created')
        .withTenantId('550e8400-e29b-41d4-a716-446655440001')
        .withUserId('550e8400-e29b-41d4-a716-446655440099')
        .withSource('test-module')
        .publish();

      const events = eventBus.getEvents();
      expect(events[0].userId).toBe('550e8400-e29b-41d4-a716-446655440099');
    });

    it('should set correlation ID', async () => {
      const builder = new EventBuilder(publisher);
      const correlationId = '550e8400-e29b-41d4-a716-446655440099';
      await builder
        .withEventType('user.created')
        .withTenantId('550e8400-e29b-41d4-a716-446655440001')
        .withCorrelationId(correlationId)
        .withSource('test-module')
        .publish();

      const events = eventBus.getEvents();
      expect(events[0].correlationId).toBe(correlationId);
    });

    it('should add data fields', async () => {
      const builder = new EventBuilder(publisher);
      await builder
        .withEventType('user.created')
        .withTenantId('550e8400-e29b-41d4-a716-446655440001')
        .withSource('test-module')
        .addDataField('email', 'test@example.com')
        .addDataField('firstName', 'John')
        .publish();

      const events = eventBus.getEvents();
      expect(events[0].data.email).toBe('test@example.com');
      expect(events[0].data.firstName).toBe('John');
    });

    it('should throw error if event type is missing', async () => {
      const builder = new EventBuilder(publisher);
      await expect(
        builder
          .withTenantId('550e8400-e29b-41d4-a716-446655440001')
          .withSource('test-module')
          .publish()
      ).rejects.toThrow(EventPublishError);
    });

    it('should throw error if tenant ID is missing', async () => {
      const builder = new EventBuilder(publisher);
      await expect(
        builder
          .withEventType('user.created')
          .withSource('test-module')
          .publish()
      ).rejects.toThrow(EventPublishError);
    });

    it('should throw error if source is missing', async () => {
      const builder = new EventBuilder(publisher);
      await expect(
        builder
          .withEventType('user.created')
          .withTenantId('550e8400-e29b-41d4-a716-446655440001')
          .publish()
      ).rejects.toThrow(EventPublishError);
    });

    it('should build event without publishing', () => {
      const builder = new EventBuilder(publisher);
      const event = builder
        .withEventType('user.created')
        .withTenantId('550e8400-e29b-41d4-a716-446655440001')
        .withSource('test-module')
        .withData({ email: 'test@example.com' })
        .build();

      expect(event.eventType).toBe('user.created');
      expect(event.tenantId).toBe('550e8400-e29b-41d4-a716-446655440001');
      expect(event.source).toBe('test-module');
      expect(event.data.email).toBe('test@example.com');
    });

    it('should auto-generate event ID and timestamp', async () => {
      const builder = new EventBuilder(publisher);
      const event = builder
        .withEventType('user.created')
        .withTenantId('550e8400-e29b-41d4-a716-446655440001')
        .withSource('test-module')
        .build();

      expect(event.eventId).toBeDefined();
      expect(event.eventId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
      expect(event.timestamp).toBeDefined();
      expect(event.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
    });
  });
});
