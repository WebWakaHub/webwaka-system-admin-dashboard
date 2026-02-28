/**
 * Event Subscriber
 * Subscribes to and processes events from the Event Bus
 */

import { Event, EventSubscriber, SubscriptionOptions, EventBus } from '../types';
import { SubscriptionError } from '../errors';

/**
 * Event Handler type
 */
export type EventHandler = (event: Event) => Promise<void>;

/**
 * Event Subscriber implementation
 * Provides a simple API for subscribing to events
 */
export class DefaultEventSubscriber implements EventSubscriber {
  private subscriptionMap: Map<string, { eventType: string; tenantId?: string }> = new Map();

  constructor(private eventBus: EventBus) {}

  /**
   * Subscribe to events
   */
  async subscribe(
    eventType: string,
    handler: EventHandler,
    options?: SubscriptionOptions
  ): Promise<string> {
    try {
      // Create a wrapped handler that includes additional logic
      const wrappedHandler = this.createWrappedHandler(handler, options);

      // Subscribe to the event bus
      const subscriptionId = await this.eventBus.subscribe(eventType, wrappedHandler, options);

      // Track the subscription
      this.subscriptionMap.set(subscriptionId, {
        eventType,
        tenantId: options?.consumerGroup, // Use consumer group as tenant identifier if available
      });

      return subscriptionId;
    } catch (error) {
      throw new SubscriptionError(
        `Failed to subscribe to ${eventType}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Unsubscribe from events
   */
  async unsubscribe(subscriptionId: string): Promise<void> {
    try {
      await this.eventBus.unsubscribe(subscriptionId);
      this.subscriptionMap.delete(subscriptionId);
    } catch (error) {
      throw new SubscriptionError(
        `Failed to unsubscribe ${subscriptionId}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get all active subscriptions
   */
  getSubscriptions(): Array<{ id: string; eventType: string; tenantId?: string }> {
    return Array.from(this.subscriptionMap.entries()).map(([id, info]) => ({
      id,
      ...info,
    }));
  }

  /**
   * Create a wrapped handler that includes additional logic
   */
  private createWrappedHandler(handler: EventHandler, options?: SubscriptionOptions): EventHandler {
    return async (event: Event) => {
      let retries = 0;
      const maxRetries = options?.maxRetries || 3;
      const retryDelayMs = options?.retryDelayMs || 1000;

      while (retries <= maxRetries) {
        try {
          await handler(event);
          return; // Success
        } catch (error) {
          retries++;
          if (retries > maxRetries) {
            console.error(`Handler failed after ${maxRetries} retries:`, error);
            throw error;
          }
          // Wait before retrying
          await this.delay(retryDelayMs * retries);
        }
      }
    };
  }

  /**
   * Helper to delay execution
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Event Listener Builder
 * Fluent API for setting up event listeners
 */
export class EventListenerBuilder {
  private eventType: string = '';
  private handler: EventHandler | null = null;
  private options: SubscriptionOptions = {};

  constructor(private subscriber: EventSubscriber) {}

  /**
   * Set the event type to listen for
   */
  on(eventType: string): this {
    this.eventType = eventType;
    return this;
  }

  /**
   * Set the event handler
   */
  handle(handler: EventHandler): this {
    this.handler = handler;
    return this;
  }

  /**
   * Set consumer group for load balancing
   */
  withConsumerGroup(group: string): this {
    this.options.consumerGroup = group;
    return this;
  }

  /**
   * Set where to start consuming from
   */
  startFrom(position: 'now' | 'beginning' | Date): this {
    this.options.startFrom = position;
    return this;
  }

  /**
   * Set max retries
   */
  withMaxRetries(maxRetries: number): this {
    this.options.maxRetries = maxRetries;
    return this;
  }

  /**
   * Set retry delay
   */
  withRetryDelayMs(delayMs: number): this {
    this.options.retryDelayMs = delayMs;
    return this;
  }

  /**
   * Subscribe with the configured settings
   */
  async subscribe(): Promise<string> {
    if (!this.eventType) {
      throw new SubscriptionError('Event type is required');
    }
    if (!this.handler) {
      throw new SubscriptionError('Handler is required');
    }

    return this.subscriber.subscribe(this.eventType, this.handler, this.options);
  }
}
