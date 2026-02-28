/**
 * WebWaka Event System - Event Bus
 * 
 * Core event routing and subscription management for the Event System.
 * Provides an in-memory implementation suitable for development and testing.
 * 
 * Key Features:
 * - Subscription management (subscribe/unsubscribe)
 * - Event routing with pattern matching
 * - Wildcard support (e.g., "user.*" matches "user.created", "user.updated")
 * - Tenant isolation
 * - Custom event filtering
 * - Thread-safe subscription management
 * 
 * @module @webwaka/event-system/event-bus
 * @author webwakaagent4 (Core Platform Engineer)
 */

import { v4 as uuidv4 } from './utils/uuid';
import {
  Event,
  EventHandler,
  EventFilter,
  Subscription,
  SubscriptionConfig,
  EventBusStats,
  EventBusConfig,
} from './types';

/**
 * EventBus Class
 * 
 * In-memory event bus implementation for development and testing.
 * Provides synchronous event delivery with subscription management,
 * routing, filtering, and tenant isolation.
 */
export class EventBus {
  private subscriptions: Map<string, Subscription>;
  private stats: EventBusStats;
  private config: EventBusConfig;

  /**
   * Create a new EventBus instance
   * 
   * @param config - Configuration options for the event bus
   */
  constructor(config: EventBusConfig = {}) {
    this.subscriptions = new Map();
    this.stats = {
      eventsPublished: 0,
      eventsDelivered: 0,
      activeSubscriptions: 0,
      eventsFiltered: 0,
      deliveryErrors: 0,
    };
    this.config = {
      debug: false,
      maxConcurrentDeliveries: 100,
      deliveryTimeout: 5000,
      ...config,
    };
  }

  /**
   * Subscribe to events matching the specified pattern
   * 
   * @param config - Subscription configuration
   * @param handler - Event handler function
   * @returns Subscription handle that can be used to unsubscribe
   * 
   * @example
   * ```typescript
   * const subscription = eventBus.subscribe(
   *   { eventType: 'user.created', tenantId: 'tenant-123' },
   *   (event) => console.log('User created:', event.data)
   * );
   * 
   * // Later, unsubscribe
   * subscription.unsubscribe();
   * ```
   */
  subscribe(config: SubscriptionConfig, handler: EventHandler): Subscription {
    const subscriptionId = uuidv4();

    const subscription: Subscription = {
      id: subscriptionId,
      eventType: config.eventType,
      tenantId: config.tenantId,
      handler,
      filter: config.filter,
      unsubscribe: () => this.unsubscribe(subscriptionId),
    };

    this.subscriptions.set(subscriptionId, subscription);
    this.stats.activeSubscriptions = this.subscriptions.size;

    if (this.config.debug) {
      console.log(`[EventBus] Subscription created: ${subscriptionId} for ${config.eventType}`);
    }

    return subscription;
  }

  /**
   * Unsubscribe from events
   * 
   * @param subscriptionId - ID of the subscription to remove
   * @returns true if subscription was found and removed, false otherwise
   */
  unsubscribe(subscriptionId: string): boolean {
    const removed = this.subscriptions.delete(subscriptionId);
    this.stats.activeSubscriptions = this.subscriptions.size;

    if (this.config.debug && removed) {
      console.log(`[EventBus] Subscription removed: ${subscriptionId}`);
    }

    return removed;
  }

  /**
   * Publish an event to all matching subscribers
   * 
   * @param event - Event to publish
   * @returns Number of subscribers that received the event
   * 
   * @example
   * ```typescript
   * const event: Event = {
   *   eventId: uuidv4(),
   *   eventType: 'user.created',
   *   eventVersion: '1.0',
   *   timestamp: new Date().toISOString(),
   *   tenantId: 'tenant-123',
   *   source: 'identity-module',
   *   data: { userId: 'user-456', email: 'test@example.com' }
   * };
   * 
   * const deliveredCount = eventBus.publish(event);
   * console.log(`Event delivered to ${deliveredCount} subscribers`);
   * ```
   */
  publish(event: Event): number {
    this.stats.eventsPublished++;

    // Validate event structure
    this.validateEvent(event);

    // Find matching subscriptions
    const matchingSubscriptions = this.findMatchingSubscriptions(event);

    if (this.config.debug) {
      console.log(
        `[EventBus] Publishing event ${event.eventType} (${event.eventId}) to ${matchingSubscriptions.length} subscribers`
      );
    }

    // Deliver event to all matching subscribers
    let deliveredCount = 0;
    for (const subscription of matchingSubscriptions) {
      try {
        // Apply custom filter if provided
        if (subscription.filter && !subscription.filter(event)) {
          this.stats.eventsFiltered++;
          if (this.config.debug) {
            console.log(`[EventBus] Event filtered by subscription ${subscription.id}`);
          }
          continue;
        }

        // Deliver event
        subscription.handler(event);
        deliveredCount++;
        this.stats.eventsDelivered++;

        if (this.config.debug) {
          console.log(`[EventBus] Event delivered to subscription ${subscription.id}`);
        }
      } catch (error) {
        this.stats.deliveryErrors++;
        console.error(
          `[EventBus] Error delivering event ${event.eventId} to subscription ${subscription.id}:`,
          error
        );
      }
    }

    return deliveredCount;
  }

  /**
   * Publish an event asynchronously to all matching subscribers
   * 
   * @param event - Event to publish
   * @returns Promise that resolves to the number of subscribers that received the event
   */
  async publishAsync(event: Event): Promise<number> {
    this.stats.eventsPublished++;

    // Validate event structure
    this.validateEvent(event);

    // Find matching subscriptions
    const matchingSubscriptions = this.findMatchingSubscriptions(event);

    if (this.config.debug) {
      console.log(
        `[EventBus] Publishing event ${event.eventType} (${event.eventId}) to ${matchingSubscriptions.length} subscribers (async)`
      );
    }

    // Deliver event to all matching subscribers asynchronously
    const deliveryPromises = matchingSubscriptions.map(async (subscription) => {
      try {
        // Apply custom filter if provided
        if (subscription.filter && !subscription.filter(event)) {
          this.stats.eventsFiltered++;
          if (this.config.debug) {
            console.log(`[EventBus] Event filtered by subscription ${subscription.id}`);
          }
          return false;
        }

        // Deliver event
        await subscription.handler(event);
        this.stats.eventsDelivered++;

        if (this.config.debug) {
          console.log(`[EventBus] Event delivered to subscription ${subscription.id}`);
        }

        return true;
      } catch (error) {
        this.stats.deliveryErrors++;
        console.error(
          `[EventBus] Error delivering event ${event.eventId} to subscription ${subscription.id}:`,
          error
        );
        return false;
      }
    });

    const results = await Promise.all(deliveryPromises);
    return results.filter((delivered) => delivered).length;
  }

  /**
   * Get current event bus statistics
   * 
   * @returns Event bus statistics
   */
  getStats(): EventBusStats {
    return { ...this.stats };
  }

  /**
   * Reset event bus statistics
   */
  resetStats(): void {
    this.stats = {
      eventsPublished: 0,
      eventsDelivered: 0,
      activeSubscriptions: this.subscriptions.size,
      eventsFiltered: 0,
      deliveryErrors: 0,
    };
  }

  /**
   * Clear all subscriptions
   */
  clearSubscriptions(): void {
    this.subscriptions.clear();
    this.stats.activeSubscriptions = 0;

    if (this.config.debug) {
      console.log('[EventBus] All subscriptions cleared');
    }
  }

  /**
   * Get all active subscriptions (for debugging/monitoring)
   * 
   * @returns Array of subscription information
   */
  getSubscriptions(): Array<{ id: string; eventType: string; tenantId?: string }> {
    return Array.from(this.subscriptions.values()).map((sub) => ({
      id: sub.id,
      eventType: sub.eventType,
      tenantId: sub.tenantId,
    }));
  }

  /**
   * Find all subscriptions that match the given event
   * 
   * @param event - Event to match against subscriptions
   * @returns Array of matching subscriptions
   */
  private findMatchingSubscriptions(event: Event): Subscription[] {
    const matching: Subscription[] = [];

    for (const subscription of this.subscriptions.values()) {
      // Check tenant isolation
      if (subscription.tenantId && subscription.tenantId !== event.tenantId) {
        continue;
      }

      // Check event type pattern matching
      if (this.matchesPattern(event.eventType, subscription.eventType)) {
        matching.push(subscription);
      }
    }

    return matching;
  }

  /**
   * Check if an event type matches a subscription pattern
   * 
   * Supports wildcards:
   * - "user.*" matches "user.created", "user.updated", etc.
   * - "*" matches all event types
   * - "user.*.email" matches "user.created.email", "user.updated.email", etc.
   * 
   * @param eventType - Actual event type
   * @param pattern - Subscription pattern (may contain wildcards)
   * @returns true if event type matches pattern
   */
  private matchesPattern(eventType: string, pattern: string): boolean {
    // Exact match
    if (eventType === pattern) {
      return true;
    }

    // Wildcard match
    if (pattern === '*') {
      return true;
    }

    // Pattern matching with wildcards
    const eventParts = eventType.split('.');
    const patternParts = pattern.split('.');

    // If pattern has more parts than event, it can't match
    if (patternParts.length > eventParts.length) {
      return false;
    }

    // Check each part
    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i];
      const eventPart = eventParts[i];

      if (patternPart === '*') {
        // Wildcard matches any single part
        continue;
      }

      if (patternPart === '**') {
        // Double wildcard matches any remaining parts
        return true;
      }

      if (patternPart !== eventPart) {
        return false;
      }
    }

    // If pattern ends with wildcard, it matches
    if (patternParts[patternParts.length - 1] === '*') {
      return true;
    }

    // Otherwise, lengths must match
    return patternParts.length === eventParts.length;
  }

  /**
   * Validate event structure
   * 
   * @param event - Event to validate
   * @throws Error if event is invalid
   */
  private validateEvent(event: Event): void {
    if (!event.eventId) {
      throw new Error('Event must have an eventId');
    }

    if (!event.eventType) {
      throw new Error('Event must have an eventType');
    }

    if (!event.eventVersion) {
      throw new Error('Event must have an eventVersion');
    }

    if (!event.timestamp) {
      throw new Error('Event must have a timestamp');
    }

    if (!event.tenantId) {
      throw new Error('Event must have a tenantId (tenant isolation required)');
    }

    if (!event.source) {
      throw new Error('Event must have a source');
    }

    if (event.data === undefined || event.data === null) {
      throw new Error('Event must have a data payload');
    }
  }
}

/**
 * Create a new EventBus instance
 * 
 * @param config - Configuration options
 * @returns New EventBus instance
 */
export function createEventBus(config?: EventBusConfig): EventBus {
  return new EventBus(config);
}
