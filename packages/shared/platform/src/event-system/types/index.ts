/**
 * Event System Types
 * Defines the core types for the Event System module
 */

/**
 * Standard Event Schema
 * All events in the WebWaka platform MUST adhere to this structure
 */
export interface Event {
  eventId: string; // UUID v4
  eventType: string; // Format: domain.entity.action (e.g., identity.user.created)
  eventVersion: string; // e.g., "1.0"
  timestamp: string; // ISO 8601 timestamp
  tenantId: string; // UUID - MANDATORY for tenant isolation
  userId?: string; // UUID - optional, user who initiated the action
  source: string; // Module name that published the event
  correlationId?: string; // UUID for tracing across services
  data: Record<string, unknown>; // Event-specific payload
}

/**
 * Event Publisher interface
 * Used by services to publish events to the Event Bus
 */
export interface EventPublisher {
  publish(event: Event): Promise<void>;
  publishBatch(events: Event[]): Promise<void>;
}

/**
 * Event Subscriber interface
 * Used by services to subscribe to and process events
 */
export interface EventSubscriber {
  subscribe(
    eventType: string,
    handler: (event: Event) => Promise<void>,
    options?: SubscriptionOptions
  ): Promise<string>; // Returns subscription ID
  unsubscribe(subscriptionId: string): Promise<void>;
}

/**
 * Subscription options
 */
export interface SubscriptionOptions {
  consumerGroup?: string; // For load balancing across multiple subscribers
  startFrom?: 'now' | 'beginning' | Date; // Where to start consuming from
  maxRetries?: number; // Number of times to retry failed messages
  retryDelayMs?: number; // Delay between retries in milliseconds
}

/**
 * Event Bus interface
 * Core abstraction for event-driven communication
 */
export interface EventBus extends EventPublisher, EventSubscriber {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  getStats(): EventBusStats;
}

/**
 * Event Bus statistics
 */
export interface EventBusStats {
  publishedCount: number;
  subscribedCount: number;
  failedCount: number;
  uptime: number; // milliseconds
}

/**
 * Event validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

/**
 * Event replay options
 */
export interface EventReplayOptions {
  tenantId: string;
  eventType?: string; // Optional filter by event type
  startTime?: Date;
  endTime?: Date;
  limit?: number;
}

/**
 * Replayed events result
 */
export interface ReplayedEventsResult {
  events: Event[];
  total: number;
  hasMore: boolean;
}
