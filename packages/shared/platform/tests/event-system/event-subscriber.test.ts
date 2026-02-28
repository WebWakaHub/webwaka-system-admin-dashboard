/**
 * Event Subscriber Tests
 */

import { DefaultEventSubscriber, EventListenerBuilder } from '../../src/event-system/subscriber/event-subscriber';
import { InMemoryEventBus } from '../../src/event-system/bus/in-memory-event-bus';
import { Event } from '../../src/event-system/types';
import { SubscriptionError } from '../../src/event-system/errors';

describe('Event Subscriber', () => {
  let eventBus: InMemoryEventBus;
  let subscriber: DefaultEventSubscriber;

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
    subscriber = new DefaultEventSubscriber(eventBus);
  });

  afterEach(async () => {
    await eventBus.disconnect();
  });

  describe('DefaultEventSubscriber', () => {
    it('should subscribe to events', async () => {
      const handler = jest.fn();
      const subscriptionId = await subscriber.subscribe('user.created', handler);
      expect(subscriptionId).toBeDefined();
      expect(subscriptionId).toMatch(/^sub-/);
    });

    it('should receive published events', async () => {
      const handler = jest.fn();
      await subscriber.subscribe('user.created', handler);
      const event = createEvent();
      await eventBus.publish(event);
      expect(handler).toHaveBeenCalledWith(event);
    });

    it('should unsubscribe from events', async () => {
      const handler = jest.fn();
      const subscriptionId = await subscriber.subscribe('user.created', handler);
      await subscriber.unsubscribe(subscriptionId);
      const event = createEvent();
      await eventBus.publish(event);
      expect(handler).not.toHaveBeenCalled();
    });

    it('should throw error when unsubscribing from non-existent subscription', async () => {
      await expect(subscriber.unsubscribe('non-existent')).rejects.toThrow(SubscriptionError);
    });

    it('should get all subscriptions', async () => {
      const handler = jest.fn();
      await subscriber.subscribe('user.created', handler);
      await subscriber.subscribe('user.updated', handler);
      const subscriptions = subscriber.getSubscriptions();
      expect(subscriptions).toHaveLength(2);
    });

    it('should retry failed handlers', async () => {
      let callCount = 0;
      const handler = jest.fn(async () => {
        callCount++;
        if (callCount < 2) {
          throw new Error('First call fails');
        }
      });

      await subscriber.subscribe('user.created', handler, { maxRetries: 2, retryDelayMs: 10 });
      const event = createEvent();
      await eventBus.publish(event);

      // Wait for retries to complete
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(handler).toHaveBeenCalled();
    });
  });

  describe('EventListenerBuilder', () => {
    it('should build and subscribe to events', async () => {
      const handler = jest.fn();
      const builder = new EventListenerBuilder(subscriber);
      const subscriptionId = await builder
        .on('user.created')
        .handle(handler)
        .subscribe();

      expect(subscriptionId).toBeDefined();
      const event = createEvent();
      await eventBus.publish(event);
      expect(handler).toHaveBeenCalledWith(event);
    });

    it('should set consumer group', async () => {
      const handler = jest.fn();
      const builder = new EventListenerBuilder(subscriber);
      const subscriptionId = await builder
        .on('user.created')
        .handle(handler)
        .withConsumerGroup('notifications-group')
        .subscribe();

      expect(subscriptionId).toBeDefined();
    });

    it('should set start position to now', async () => {
      // Publish an event before subscribing
      const oldEvent = createEvent({ eventId: '550e8400-e29b-41d4-a716-446655440099' });
      await eventBus.publish(oldEvent);

      const handler = jest.fn();
      const builder = new EventListenerBuilder(subscriber);
      await builder
        .on('user.created')
        .handle(handler)
        .startFrom('now')
        .subscribe();

      // Publish a new event
      const newEvent = createEvent();
      await eventBus.publish(newEvent);

      // Handler should only be called for the new event
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(newEvent);
    });

    it('should set max retries', async () => {
      const handler = jest.fn();
      const builder = new EventListenerBuilder(subscriber);
      const subscriptionId = await builder
        .on('user.created')
        .handle(handler)
        .withMaxRetries(5)
        .subscribe();

      expect(subscriptionId).toBeDefined();
    });

    it('should set retry delay', async () => {
      const handler = jest.fn();
      const builder = new EventListenerBuilder(subscriber);
      const subscriptionId = await builder
        .on('user.created')
        .handle(handler)
        .withRetryDelayMs(500)
        .subscribe();

      expect(subscriptionId).toBeDefined();
    });

    it('should throw error if event type is missing', async () => {
      const handler = jest.fn();
      const builder = new EventListenerBuilder(subscriber);
      await expect(builder.handle(handler).subscribe()).rejects.toThrow(SubscriptionError);
    });

    it('should throw error if handler is missing', async () => {
      const builder = new EventListenerBuilder(subscriber);
      await expect(builder.on('user.created').subscribe()).rejects.toThrow(SubscriptionError);
    });

    it('should chain multiple options', async () => {
      const handler = jest.fn();
      const builder = new EventListenerBuilder(subscriber);
      const subscriptionId = await builder
        .on('user.created')
        .handle(handler)
        .withConsumerGroup('test-group')
        .withMaxRetries(3)
        .withRetryDelayMs(100)
        .subscribe();

      expect(subscriptionId).toBeDefined();
      const event = createEvent();
      await eventBus.publish(event);
      expect(handler).toHaveBeenCalledWith(event);
    });
  });
});
