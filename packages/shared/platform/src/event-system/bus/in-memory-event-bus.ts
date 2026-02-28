/**
 * In-Memory Event Bus
 * Development and testing implementation of the Event Bus
 * Used when NATS is not available or for local development
 */

import { Event, EventBus, SubscriptionOptions, EventBusStats, ReplayedEventsResult, EventReplayOptions } from '../types';
import { EventPublishError, SubscriptionError, ConnectionError } from '../errors';
import { validateEventOrThrow } from '../utils/event-validator';
import { generateSubscriptionId } from '../utils/id-generator';

interface Subscription {
  id: string;
  eventType: string;
  handler: (event: Event) => Promise<void>;
  options?: SubscriptionOptions;
  tenantId?: string;
}

/**
 * In-Memory Event Bus implementation
 * Stores events in memory and delivers them to subscribers
 */
export class InMemoryEventBus implements EventBus {
  private subscriptions: Map<string, Subscription> = new Map();
  private events: Event[] = [];
  private connected = false;
  private publishedCount = 0;
  private failedCount = 0;
  private startTime = 0;

  async connect(): Promise<void> {
    if (this.connected) {
      throw new ConnectionError('Event bus is already connected');
    }
    this.connected = true;
    this.startTime = Date.now();
  }

  async disconnect(): Promise<void> {
    if (!this.connected) {
      throw new ConnectionError('Event bus is not connected');
    }
    this.subscriptions.clear();
    this.events = [];
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }

  async publish(event: Event): Promise<void> {
    if (!this.connected) {
      throw new ConnectionError('Event bus is not connected');
    }

    try {
      // Validate event
      validateEventOrThrow(event);

      // Store event
      this.events.push(event);
      this.publishedCount++;

      // Deliver to subscribers
      const relevantSubscriptions = Array.from(this.subscriptions.values()).filter(
        (sub) => this.matchesEventType(sub.eventType, event.eventType) && this.checkTenantAccess(sub, event)
      );

      for (const subscription of relevantSubscriptions) {
        try {
          await subscription.handler(event);
        } catch (error) {
          console.error(`Error in subscription handler for ${subscription.eventType}:`, error);
          this.failedCount++;
        }
      }
    } catch (error) {
      this.failedCount++;
      throw new EventPublishError(`Failed to publish event: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async publishBatch(events: Event[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }

  async subscribe(
    eventType: string,
    handler: (event: Event) => Promise<void>,
    options?: SubscriptionOptions
  ): Promise<string> {
    if (!this.connected) {
      throw new ConnectionError('Event bus is not connected');
    }

    const subscriptionId = generateSubscriptionId();
    const subscription: Subscription = {
      id: subscriptionId,
      eventType,
      handler,
      options,
    };

    this.subscriptions.set(subscriptionId, subscription);

    // If starting from 'beginning', replay existing events
    if (options?.startFrom === 'beginning') {
      const relevantEvents = this.events.filter((e) => this.matchesEventType(eventType, e.eventType));
      for (const event of relevantEvents) {
        try {
          await handler(event);
        } catch (error) {
          console.error(`Error replaying event ${event.eventType}:`, error);
        }
      }
    }

    return subscriptionId;
  }

  async unsubscribe(subscriptionId: string): Promise<void> {
    if (!this.subscriptions.has(subscriptionId)) {
      throw new SubscriptionError(`Subscription not found: ${subscriptionId}`);
    }
    this.subscriptions.delete(subscriptionId);
  }

  getStats(): EventBusStats {
    return {
      publishedCount: this.publishedCount,
      subscribedCount: this.subscriptions.size,
      failedCount: this.failedCount,
      uptime: Date.now() - this.startTime,
    };
  }

  /**
   * Get all published events (for testing)
   */
  getEvents(): Event[] {
    return [...this.events];
  }

  /**
   * Get events for a specific tenant (for testing and replay)
   */
  getEventsByTenant(tenantId: string): Event[] {
    return this.events.filter((e) => e.tenantId === tenantId);
  }

  /**
   * Clear all events and subscriptions (for testing)
   */
  clear(): void {
    this.subscriptions.clear();
    this.events = [];
    this.publishedCount = 0;
    this.failedCount = 0;
  }

  /**
   * Replay events for a tenant
   */
  async replayEvents(options: EventReplayOptions): Promise<ReplayedEventsResult> {
    let filtered = this.events.filter((e) => e.tenantId === options.tenantId);

    if (options.eventType) {
      filtered = filtered.filter((e) => this.matchesEventType(options.eventType!, e.eventType));
    }

    if (options.startTime) {
      const startTimestamp = options.startTime.toISOString();
      filtered = filtered.filter((e) => e.timestamp >= startTimestamp);
    }

    if (options.endTime) {
      const endTimestamp = options.endTime.toISOString();
      filtered = filtered.filter((e) => e.timestamp <= endTimestamp);
    }

    const total = filtered.length;
    const limit = options.limit || total;
    const events = filtered.slice(0, limit);

    return {
      events,
      total,
      hasMore: limit < total,
    };
  }

  /**
   * Check if event type matches subscription pattern (supports wildcards)
   */
  private matchesEventType(pattern: string, eventType: string): boolean {
    if (pattern === '*') return true;
    if (pattern === eventType) return true;

    // Support wildcard patterns like 'user.*'
    if (pattern.endsWith('.*')) {
      const prefix = pattern.slice(0, -2);
      return eventType.startsWith(prefix + '.');
    }

    return false;
  }

  /**
   * Check tenant access (for security)
   */
  private checkTenantAccess(subscription: Subscription, event: Event): boolean {
    // If subscription has a tenant ID, only deliver events for that tenant
    if (subscription.tenantId && subscription.tenantId !== event.tenantId) {
      return false;
    }
    return true;
  }
}
