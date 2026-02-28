/**
 * WebWaka Event System - Core Types
 * 
 * Defines the standard event structure and related types for the Event System.
 * All events in the WebWaka platform MUST adhere to these types.
 * 
 * @module @webwaka/event-system/types
 * @author webwakaagent4 (Core Platform Engineer)
 */

/**
 * Standard Event Structure
 * 
 * All events in the WebWaka platform follow this standardized structure
 * to ensure consistency and enable reliable event processing.
 */
export interface Event<T = any> {
  /** Unique identifier for the event (UUID v4) */
  eventId: string;
  
  /** Event type in format: domain.entity.action (e.g., identity.user.created) */
  eventType: string;
  
  /** Version of the event schema (e.g., "1.0") */
  eventVersion: string;
  
  /** ISO 8601 timestamp of when the event occurred */
  timestamp: string;
  
  /** UUID of the tenant this event belongs to (MANDATORY) */
  tenantId: string;
  
  /** UUID of the user who initiated the action (optional) */
  userId?: string;
  
  /** Name of the module that published the event */
  source: string;
  
  /** UUID used to trace a request across multiple services and events */
  correlationId?: string;
  
  /** Event-specific payload */
  data: T;
}

/**
 * Event Filter Function
 * 
 * A function that determines whether an event should be delivered to a subscriber.
 * Returns true if the event matches the filter criteria.
 */
export type EventFilter<T = any> = (event: Event<T>) => boolean;

/**
 * Event Handler Function
 * 
 * A function that processes an event when it is delivered to a subscriber.
 * Can be synchronous or asynchronous.
 */
export type EventHandler<T = any> = (event: Event<T>) => void | Promise<void>;

/**
 * Subscription Configuration
 * 
 * Configuration options for subscribing to events.
 */
export interface SubscriptionConfig {
  /** Event type pattern to subscribe to (supports wildcards, e.g., "user.*") */
  eventType: string;
  
  /** Optional filter function for additional event filtering */
  filter?: EventFilter;
  
  /** Optional tenant ID to filter events by tenant */
  tenantId?: string;
}

/**
 * Subscription Handle
 * 
 * Represents an active subscription that can be unsubscribed.
 */
export interface Subscription {
  /** Unique identifier for the subscription */
  id: string;
  
  /** Event type pattern this subscription is listening to */
  eventType: string;
  
  /** Optional tenant ID filter */
  tenantId?: string;
  
  /** Event handler function */
  handler: EventHandler;
  
  /** Optional filter function */
  filter?: EventFilter;
  
  /** Unsubscribe from this subscription */
  unsubscribe: () => void;
}

/**
 * Event Bus Statistics
 * 
 * Metrics and statistics about the event bus.
 */
export interface EventBusStats {
  /** Total number of events published */
  eventsPublished: number;
  
  /** Total number of events delivered */
  eventsDelivered: number;
  
  /** Total number of active subscriptions */
  activeSubscriptions: number;
  
  /** Total number of events filtered out */
  eventsFiltered: number;
  
  /** Total number of delivery errors */
  deliveryErrors: number;
}

/**
 * Event Bus Configuration
 * 
 * Configuration options for the Event Bus.
 */
export interface EventBusConfig {
  /** Enable debug logging */
  debug?: boolean;
  
  /** Maximum number of concurrent event deliveries */
  maxConcurrentDeliveries?: number;
  
  /** Timeout for event delivery (milliseconds) */
  deliveryTimeout?: number;
}
