/**
 * Event Bus Unit Tests
 */

import { InMemoryEventBus } from '../../src/shared/event-bus';

describe('InMemoryEventBus', () => {
  let eventBus: InMemoryEventBus;

  beforeEach(() => {
    eventBus = new InMemoryEventBus();
  });

  describe('publish', () => {
    it('should publish an event', async () => {
      const eventType = 'test.event';
      const payload = { key: 'value' };

      await eventBus.publish(eventType, payload);

      const events = eventBus.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe(eventType);
      expect(events[0].payload).toEqual(payload);
    });

    it('should publish multiple events', async () => {
      const event1 = { eventType: 'test.event1', payload: { key: 'value1' } };
      const event2 = { eventType: 'test.event2', payload: { key: 'value2' } };

      await eventBus.publish(event1.eventType, event1.payload);
      await eventBus.publish(event2.eventType, event2.payload);

      const events = eventBus.getEvents();
      expect(events).toHaveLength(2);
      expect(events[0].eventType).toBe('test.event1');
      expect(events[1].eventType).toBe('test.event2');
    });

    it('should preserve event order', async () => {
      for (let i = 0; i < 10; i++) {
        await eventBus.publish(`test.event${i}`, { index: i });
      }

      const events = eventBus.getEvents();
      expect(events).toHaveLength(10);
      events.forEach((event, index) => {
        expect((event.payload as any).index).toBe(index);
      });
    });

    it('should call subscribed handlers', async () => {
      const handler = jest.fn();
      const payload = { key: 'value' };

      eventBus.subscribe('test.event', handler);
      await eventBus.publish('test.event', payload);

      expect(handler).toHaveBeenCalledWith(payload);
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should call multiple handlers for same event type', async () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const payload = { key: 'value' };

      eventBus.subscribe('test.event', handler1);
      eventBus.subscribe('test.event', handler2);
      await eventBus.publish('test.event', payload);

      expect(handler1).toHaveBeenCalledWith(payload);
      expect(handler2).toHaveBeenCalledWith(payload);
    });

    it('should not call handlers for different event type', async () => {
      const handler = jest.fn();

      eventBus.subscribe('test.event1', handler);
      await eventBus.publish('test.event2', { key: 'value' });

      expect(handler).not.toHaveBeenCalled();
    });

    it('should continue calling other handlers if one throws', async () => {
      const handler1 = jest.fn(async () => {
        throw new Error('Handler error');
      });
      const handler2 = jest.fn();

      eventBus.subscribe('test.event', handler1);
      eventBus.subscribe('test.event', handler2);

      // Should not throw
      await expect(eventBus.publish('test.event', { key: 'value' })).resolves.toBeUndefined();

      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });
  });

  describe('getEvents', () => {
    it('should return empty array initially', () => {
      const events = eventBus.getEvents();
      expect(events).toEqual([]);
    });

    it('should return all published events', async () => {
      await eventBus.publish('test.event1', { key: 'value1' });
      await eventBus.publish('test.event2', { key: 'value2' });

      const events = eventBus.getEvents();
      expect(events).toHaveLength(2);
    });

    it('should return all published events', async () => {
      await eventBus.publish('test.event', { key: 'value' });

      const events = eventBus.getEvents();
      expect(events).toHaveLength(1);
    });
  });

  describe('subscribe', () => {
    it('should register event handler', async () => {
      const handler = jest.fn();

      eventBus.subscribe('test.event', handler);
      await eventBus.publish('test.event', { key: 'value' });

      expect(handler).toHaveBeenCalled();
    });

    it('should register multiple handlers for same event', async () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      eventBus.subscribe('test.event', handler1);
      eventBus.subscribe('test.event', handler2);
      await eventBus.publish('test.event', { key: 'value' });

      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });

    it('should handle async handlers', async () => {
      const handler = jest.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      eventBus.subscribe('test.event', handler);
      await eventBus.publish('test.event', { key: 'value' });

      expect(handler).toHaveBeenCalled();
    });
  });

  describe('unsubscribe', () => {
    it('should remove all handlers for event type', async () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      eventBus.subscribe('test.event', handler1);
      eventBus.subscribe('test.event', handler2);
      eventBus.unsubscribe('test.event');
      await eventBus.publish('test.event', { key: 'value' });

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });

    it('should not affect other event types', async () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      eventBus.subscribe('test.event1', handler1);
      eventBus.subscribe('test.event2', handler2);
      eventBus.unsubscribe('test.event1');

      await eventBus.publish('test.event1', { key: 'value' });
      await eventBus.publish('test.event2', { key: 'value' });

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });
  });

  describe('clear', () => {
    it('should clear all events', async () => {
      await eventBus.publish('test.event1', { key: 'value1' });
      await eventBus.publish('test.event2', { key: 'value2' });

      expect(eventBus.getEvents()).toHaveLength(2);

      eventBus.clear();

      expect(eventBus.getEvents()).toHaveLength(0);
    });

    it('should clear all handlers', async () => {
      const handler = jest.fn();

      eventBus.subscribe('test.event', handler);
      eventBus.clear();
      await eventBus.publish('test.event', { key: 'value' });

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('event data', () => {
    it('should preserve event payload data types', async () => {
      const payload = {
        string: 'value',
        number: 42,
        boolean: true,
        array: [1, 2, 3],
        object: { nested: 'value' },
        null: null,
      };

      await eventBus.publish('test.event', payload);

      const events = eventBus.getEvents();
      expect(events[0].payload.string).toBe('value');
      expect(events[0].payload.number).toBe(42);
      expect(events[0].payload.boolean).toBe(true);
      expect(events[0].payload.array).toEqual([1, 2, 3]);
      expect(events[0].payload.object).toEqual({ nested: 'value' });
      expect(events[0].payload.null).toBe(null);
    });
  });

  describe('concurrent operations', () => {
    it('should handle concurrent publish operations', async () => {
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(eventBus.publish('test.event', { index: i }));
      }

      await Promise.all(promises);

      expect(eventBus.getEvents()).toHaveLength(10);
    });

    it('should handle concurrent publish and subscribe', async () => {
      const handler = jest.fn();
      eventBus.subscribe('test.event', handler);

      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(eventBus.publish('test.event', { index: i }));
      }

      await Promise.all(promises);

      expect(handler).toHaveBeenCalledTimes(10);
      expect(eventBus.getEvents()).toHaveLength(10);
    });
  });

  describe('memory management', () => {
    it('should handle large number of events', async () => {
      for (let i = 0; i < 1000; i++) {
        await eventBus.publish('test.event', { index: i });
      }

      const events = eventBus.getEvents();
      expect(events).toHaveLength(1000);
    });

    it('should clear events to free memory', async () => {
      for (let i = 0; i < 1000; i++) {
        await eventBus.publish('test.event', { index: i });
      }

      eventBus.clear();

      const events = eventBus.getEvents();
      expect(events).toHaveLength(0);
    });
  });

  describe('error handling', () => {
    it('should log errors from handlers', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const handler = jest.fn(async () => {
        throw new Error('Handler error');
      });

      eventBus.subscribe('test.event', handler);
      await eventBus.publish('test.event', { key: 'value' });

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('event filtering', () => {
    it('should filter events by type', async () => {
      await eventBus.publish('plugin.installed', { pluginId: '1' });
      await eventBus.publish('plugin.activated', { pluginId: '1' });
      await eventBus.publish('plugin.installed', { pluginId: '2' });

      const events = eventBus.getEvents();
      const installedEvents = events.filter((e) => e.eventType === 'plugin.installed');

      expect(installedEvents).toHaveLength(2);
    });
  });
});
