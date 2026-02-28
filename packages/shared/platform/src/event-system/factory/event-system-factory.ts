/**
 * Event System Factory
 * Creates Event System instances based on configuration
 */

import { EventBus, EventPublisher, EventSubscriber } from '../types';
import { InMemoryEventBus } from '../bus/in-memory-event-bus';
import { NatsEventBus, NatsEventBusConfig } from '../bus/nats-event-bus';
import { DefaultEventPublisher } from '../publisher/event-publisher';
import { DefaultEventSubscriber } from '../subscriber/event-subscriber';

/**
 * Event System configuration
 */
export interface EventSystemConfig {
  type: 'in-memory' | 'nats';
  nats?: NatsEventBusConfig;
}

/**
 * Event System Factory
 */
export class EventSystemFactory {
  /**
   * Create an Event Bus instance
   */
  static createEventBus(config: EventSystemConfig): EventBus {
    if (config.type === 'nats') {
      if (!config.nats) {
        throw new Error('NATS configuration is required for NATS event bus');
      }
      return new NatsEventBus(config.nats);
    }

    // Default to in-memory
    return new InMemoryEventBus();
  }

  /**
   * Create an Event Publisher instance
   */
  static createEventPublisher(eventBus: EventBus): EventPublisher {
    return new DefaultEventPublisher(eventBus);
  }

  /**
   * Create an Event Subscriber instance
   */
  static createEventSubscriber(eventBus: EventBus): EventSubscriber {
    return new DefaultEventSubscriber(eventBus);
  }

  /**
   * Create a complete Event System with publisher and subscriber
   */
  static async createEventSystem(config: EventSystemConfig): Promise<{
    eventBus: EventBus;
    publisher: EventPublisher;
    subscriber: EventSubscriber;
  }> {
    const eventBus = this.createEventBus(config);
    const publisher = this.createEventPublisher(eventBus);
    const subscriber = this.createEventSubscriber(eventBus);

    // Connect the event bus
    await eventBus.connect();

    return {
      eventBus,
      publisher,
      subscriber,
    };
  }
}
