/**
 * Event System Factory Tests
 */

import { EventSystemFactory } from '../../src/event-system/factory/event-system-factory';
import { InMemoryEventBus } from '../../src/event-system/bus/in-memory-event-bus';
import { NatsEventBus } from '../../src/event-system/bus/nats-event-bus';
import { DefaultEventPublisher } from '../../src/event-system/publisher/event-publisher';
import { DefaultEventSubscriber } from '../../src/event-system/subscriber/event-subscriber';

describe('Event System Factory', () => {
  describe('createEventBus', () => {
    it('should create in-memory event bus by default', () => {
      const eventBus = EventSystemFactory.createEventBus({ type: 'in-memory' });
      expect(eventBus).toBeInstanceOf(InMemoryEventBus);
    });

    it('should create NATS event bus', () => {
      const eventBus = EventSystemFactory.createEventBus({
        type: 'nats',
        nats: { servers: ['nats://localhost:4222'] },
      });
      expect(eventBus).toBeInstanceOf(NatsEventBus);
    });

    it('should throw error if NATS config is missing', () => {
      expect(() => {
        EventSystemFactory.createEventBus({ type: 'nats' });
      }).toThrow('NATS configuration is required for NATS event bus');
    });
  });

  describe('createEventPublisher', () => {
    it('should create event publisher', () => {
      const eventBus = EventSystemFactory.createEventBus({ type: 'in-memory' });
      const publisher = EventSystemFactory.createEventPublisher(eventBus);
      expect(publisher).toBeInstanceOf(DefaultEventPublisher);
    });
  });

  describe('createEventSubscriber', () => {
    it('should create event subscriber', () => {
      const eventBus = EventSystemFactory.createEventBus({ type: 'in-memory' });
      const subscriber = EventSystemFactory.createEventSubscriber(eventBus);
      expect(subscriber).toBeInstanceOf(DefaultEventSubscriber);
    });
  });

  describe('createEventSystem', () => {
    it('should create complete event system', async () => {
      const system = await EventSystemFactory.createEventSystem({ type: 'in-memory' });
      expect(system.eventBus).toBeInstanceOf(InMemoryEventBus);
      expect(system.publisher).toBeInstanceOf(DefaultEventPublisher);
      expect(system.subscriber).toBeInstanceOf(DefaultEventSubscriber);
      expect(system.eventBus.isConnected()).toBe(true);
      await system.eventBus.disconnect();
    });

    it('should connect event bus automatically', async () => {
      const system = await EventSystemFactory.createEventSystem({ type: 'in-memory' });
      expect(system.eventBus.isConnected()).toBe(true);
      await system.eventBus.disconnect();
    });

    it('should support NATS configuration', async () => {
      const system = await EventSystemFactory.createEventSystem({
        type: 'nats',
        nats: { servers: ['nats://localhost:4222'] },
      });
      expect(system.eventBus).toBeInstanceOf(NatsEventBus);
      expect(system.publisher).toBeInstanceOf(DefaultEventPublisher);
      expect(system.subscriber).toBeInstanceOf(DefaultEventSubscriber);
      await system.eventBus.disconnect();
    });
  });
});
