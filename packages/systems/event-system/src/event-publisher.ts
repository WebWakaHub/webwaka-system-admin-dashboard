/**
 * WebWaka Event System - Event Publisher
 * 
 * Provides a high-level API for publishing events to the Event Bus.
 * Handles event construction, validation, serialization, and metadata injection.
 * 
 * Key Features:
 * - Simple publishing API
 * - Automatic metadata injection (eventId, timestamp, eventVersion)
 * - Event validation before publishing
 * - JSON serialization
 * - Builder pattern for easy event construction
 * - Type-safe event data handling
 * 
 * @module @webwaka/event-system/event-publisher
 * @author webwakaagent4 (Core Platform Engineer)
 */

import { v4 as uuidv4 } from './utils/uuid';
import { Event, EventBusConfig } from './types';
import { EventBus } from './event-bus';

/**
 * Event Publisher Configuration
 */
export interface EventPublisherConfig {
  /** Default event version to use if not specified */
  defaultEventVersion?: string;
  
  /** Source identifier for events (e.g., module name) */
  source: string;
  
  /** Default tenant ID (optional, can be overridden per event) */
  defaultTenantId?: string;
  
  /** Enable debug logging */
  debug?: boolean;
  
  /** Event bus configuration */
  eventBusConfig?: EventBusConfig;
}

/**
 * Event Data for Publishing
 * 
 * Simplified event structure for publishing. The publisher will
 * automatically inject eventId, timestamp, and eventVersion.
 */
export interface PublishEventData<T = any> {
  /** Event type in format: domain.entity.action */
  eventType: string;
  
  /** Tenant ID (required for tenant isolation) */
  tenantId: string;
  
  /** Event-specific payload */
  data: T;
  
  /** Optional user ID */
  userId?: string;
  
  /** Optional correlation ID for tracing */
  correlationId?: string;
  
  /** Optional event version (defaults to config.defaultEventVersion) */
  eventVersion?: string;
}

/**
 * Event Publisher Statistics
 */
export interface EventPublisherStats {
  /** Total number of events published */
  eventsPublished: number;
  
  /** Total number of events that failed validation */
  validationErrors: number;
  
  /** Total number of publishing errors */
  publishingErrors: number;
  
  /** Total bytes serialized */
  bytesSerialized: number;
}

/**
 * EventPublisher Class
 * 
 * High-level API for publishing events to the Event Bus.
 * Handles validation, serialization, and metadata injection.
 */
export class EventPublisher {
  private eventBus: EventBus;
  private config: Required<EventPublisherConfig>;
  private stats: EventPublisherStats;

  /**
   * Create a new EventPublisher instance
   * 
   * @param config - Publisher configuration
   * @param eventBus - Optional EventBus instance (creates new one if not provided)
   */
  constructor(config: EventPublisherConfig, eventBus?: EventBus) {
    this.config = {
      defaultEventVersion: '1.0',
      defaultTenantId: '',
      debug: false,
      eventBusConfig: {},
      ...config,
    };

    this.eventBus = eventBus || new EventBus(this.config.eventBusConfig);

    this.stats = {
      eventsPublished: 0,
      validationErrors: 0,
      publishingErrors: 0,
      bytesSerialized: 0,
    };
  }

  /**
   * Publish an event to the Event Bus
   * 
   * @param eventData - Event data to publish
   * @returns Number of subscribers that received the event
   * @throws Error if event validation fails
   * 
   * @example
   * ```typescript
   * const publisher = new EventPublisher({ source: 'identity-module' });
   * 
   * const deliveredCount = publisher.publish({
   *   eventType: 'user.created',
   *   tenantId: 'tenant-123',
   *   data: {
   *     userId: 'user-456',
   *     email: 'test@example.com'
   *   }
   * });
   * 
   * console.log(`Event delivered to ${deliveredCount} subscribers`);
   * ```
   */
  publish<T = any>(eventData: PublishEventData<T>): number {
    try {
      // Build complete event with metadata
      const event = this.buildEvent(eventData);

      // Validate event structure
      this.validateEvent(event);

      // Serialize event (for statistics)
      const serialized = this.serializeEvent(event);
      this.stats.bytesSerialized += serialized.length;

      // Publish to event bus
      const deliveredCount = this.eventBus.publish(event);

      this.stats.eventsPublished++;

      if (this.config.debug) {
        console.log(
          `[EventPublisher] Published event ${event.eventType} (${event.eventId}) to ${deliveredCount} subscribers`
        );
      }

      return deliveredCount;
    } catch (error) {
      this.stats.publishingErrors++;
      throw error;
    }
  }

  /**
   * Publish an event asynchronously to the Event Bus
   * 
   * @param eventData - Event data to publish
   * @returns Promise that resolves to the number of subscribers that received the event
   * @throws Error if event validation fails
   */
  async publishAsync<T = any>(eventData: PublishEventData<T>): Promise<number> {
    try {
      // Build complete event with metadata
      const event = this.buildEvent(eventData);

      // Validate event structure
      this.validateEvent(event);

      // Serialize event (for statistics)
      const serialized = this.serializeEvent(event);
      this.stats.bytesSerialized += serialized.length;

      // Publish to event bus asynchronously
      const deliveredCount = await this.eventBus.publishAsync(event);

      this.stats.eventsPublished++;

      if (this.config.debug) {
        console.log(
          `[EventPublisher] Published event ${event.eventType} (${event.eventId}) to ${deliveredCount} subscribers (async)`
        );
      }

      return deliveredCount;
    } catch (error) {
      this.stats.publishingErrors++;
      throw error;
    }
  }

  /**
   * Create an event builder for constructing events with a fluent API
   * 
   * @param eventType - Event type
   * @returns EventBuilder instance
   * 
   * @example
   * ```typescript
   * const publisher = new EventPublisher({ source: 'identity-module' });
   * 
   * publisher.event('user.created')
   *   .tenant('tenant-123')
   *   .user('user-456')
   *   .data({ email: 'test@example.com' })
   *   .publish();
   * ```
   */
  event<T = any>(eventType: string): EventBuilder<T> {
    return new EventBuilder<T>(this, eventType);
  }

  /**
   * Get publisher statistics
   * 
   * @returns Publisher statistics
   */
  getStats(): EventPublisherStats {
    return { ...this.stats };
  }

  /**
   * Reset publisher statistics
   */
  resetStats(): void {
    this.stats = {
      eventsPublished: 0,
      validationErrors: 0,
      publishingErrors: 0,
      bytesSerialized: 0,
    };
  }

  /**
   * Get the underlying EventBus instance
   * 
   * @returns EventBus instance
   */
  getEventBus(): EventBus {
    return this.eventBus;
  }

  /**
   * Build a complete event from event data
   * 
   * @param eventData - Event data to build from
   * @returns Complete event with metadata
   */
  private buildEvent<T = any>(eventData: PublishEventData<T>): Event<T> {
    const tenantId = eventData.tenantId || this.config.defaultTenantId;

    if (!tenantId) {
      throw new Error('tenantId is required (either in event data or config)');
    }

    return {
      eventId: uuidv4(),
      eventType: eventData.eventType,
      eventVersion: eventData.eventVersion || this.config.defaultEventVersion,
      timestamp: new Date().toISOString(),
      tenantId,
      userId: eventData.userId,
      source: this.config.source,
      correlationId: eventData.correlationId,
      data: eventData.data,
    };
  }

  /**
   * Validate event structure
   * 
   * @param event - Event to validate
   * @throws Error if event is invalid
   */
  private validateEvent(event: Event): void {
    try {
      if (!event.eventId) {
        throw new Error('Event must have an eventId');
      }

      if (!event.eventType) {
        throw new Error('Event must have an eventType');
      }

      if (!this.isValidEventType(event.eventType)) {
        throw new Error(
          `Invalid eventType format: ${event.eventType}. Expected format: domain.entity.action`
        );
      }

      if (!event.eventVersion) {
        throw new Error('Event must have an eventVersion');
      }

      if (!event.timestamp) {
        throw new Error('Event must have a timestamp');
      }

      if (!this.isValidISO8601(event.timestamp)) {
        throw new Error(`Invalid timestamp format: ${event.timestamp}. Expected ISO 8601 format`);
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

      if (typeof event.data !== 'object') {
        throw new Error('Event data must be an object');
      }
    } catch (error) {
      this.stats.validationErrors++;
      throw error;
    }
  }

  /**
   * Validate event type format (domain.entity.action)
   * 
   * @param eventType - Event type to validate
   * @returns true if valid, false otherwise
   */
  private isValidEventType(eventType: string): boolean {
    // Event type should be in format: domain.entity.action
    // e.g., "identity.user.created", "order.payment.processed"
    const parts = eventType.split('.');
    return parts.length >= 2 && parts.every((part) => part.length > 0);
  }

  /**
   * Validate ISO 8601 timestamp format
   * 
   * @param timestamp - Timestamp to validate
   * @returns true if valid, false otherwise
   */
  private isValidISO8601(timestamp: string): boolean {
    // Basic ISO 8601 validation
    const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
    return iso8601Regex.test(timestamp);
  }

  /**
   * Serialize event to JSON string
   * 
   * @param event - Event to serialize
   * @returns JSON string
   */
  private serializeEvent(event: Event): string {
    return JSON.stringify(event);
  }
}

/**
 * EventBuilder Class
 * 
 * Fluent API for building and publishing events.
 */
export class EventBuilder<T = any> {
  private publisher: EventPublisher;
  private eventData: Partial<PublishEventData<T>>;

  /**
   * Create a new EventBuilder instance
   * 
   * @param publisher - EventPublisher instance
   * @param eventType - Event type
   */
  constructor(publisher: EventPublisher, eventType: string) {
    this.publisher = publisher;
    this.eventData = { eventType };
  }

  /**
   * Set tenant ID
   * 
   * @param tenantId - Tenant ID
   * @returns this
   */
  tenant(tenantId: string): this {
    this.eventData.tenantId = tenantId;
    return this;
  }

  /**
   * Set user ID
   * 
   * @param userId - User ID
   * @returns this
   */
  user(userId: string): this {
    this.eventData.userId = userId;
    return this;
  }

  /**
   * Set correlation ID
   * 
   * @param correlationId - Correlation ID
   * @returns this
   */
  correlation(correlationId: string): this {
    this.eventData.correlationId = correlationId;
    return this;
  }

  /**
   * Set event version
   * 
   * @param eventVersion - Event version
   * @returns this
   */
  version(eventVersion: string): this {
    this.eventData.eventVersion = eventVersion;
    return this;
  }

  /**
   * Set event data
   * 
   * @param data - Event data
   * @returns this
   */
  data(data: T): this {
    this.eventData.data = data;
    return this;
  }

  /**
   * Publish the event
   * 
   * @returns Number of subscribers that received the event
   * @throws Error if event validation fails
   */
  publish(): number {
    if (!this.eventData.tenantId) {
      throw new Error('tenantId is required');
    }

    if (!this.eventData.data) {
      throw new Error('data is required');
    }

    return this.publisher.publish(this.eventData as PublishEventData<T>);
  }

  /**
   * Publish the event asynchronously
   * 
   * @returns Promise that resolves to the number of subscribers that received the event
   * @throws Error if event validation fails
   */
  async publishAsync(): Promise<number> {
    if (!this.eventData.tenantId) {
      throw new Error('tenantId is required');
    }

    if (!this.eventData.data) {
      throw new Error('data is required');
    }

    return this.publisher.publishAsync(this.eventData as PublishEventData<T>);
  }

  /**
   * Build the event data without publishing
   * 
   * @returns Event data
   */
  build(): PublishEventData<T> {
    if (!this.eventData.tenantId) {
      throw new Error('tenantId is required');
    }

    if (!this.eventData.data) {
      throw new Error('data is required');
    }

    return this.eventData as PublishEventData<T>;
  }
}

/**
 * Create a new EventPublisher instance
 * 
 * @param config - Publisher configuration
 * @param eventBus - Optional EventBus instance
 * @returns New EventPublisher instance
 */
export function createEventPublisher(
  config: EventPublisherConfig,
  eventBus?: EventBus
): EventPublisher {
  return new EventPublisher(config, eventBus);
}
