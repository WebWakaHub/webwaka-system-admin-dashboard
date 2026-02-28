/**
 * Event Publisher
 * Publishes events to the Event Bus
 */

import { Event, EventPublisher, EventBus } from '../types';
import { EventPublishError } from '../errors';
import { validateEventOrThrow } from '../utils/event-validator';
import { generateEventId, generateTimestamp } from '../utils/id-generator';

/**
 * Event Publisher implementation
 * Provides a simple API for publishing events
 */
export class DefaultEventPublisher implements EventPublisher {
  constructor(private eventBus: EventBus) {}

  /**
   * Publish a single event
   */
  async publish(event: Event): Promise<void> {
    try {
      // Validate event
      validateEventOrThrow(event);

      // Publish to event bus
      await this.eventBus.publish(event);
    } catch (error) {
      throw new EventPublishError(
        `Failed to publish event ${event.eventType}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Publish multiple events in batch
   */
  async publishBatch(events: Event[]): Promise<void> {
    try {
      // Validate all events
      events.forEach((event) => validateEventOrThrow(event));

      // Publish all events
      await this.eventBus.publishBatch(events);
    } catch (error) {
      throw new EventPublishError(
        `Failed to publish batch: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

/**
 * Event Builder
 * Fluent API for building and publishing events
 */
export class EventBuilder {
  private event: Partial<Event> = {};

  constructor(private publisher: EventPublisher) {
    this.event.eventId = generateEventId();
    this.event.timestamp = generateTimestamp();
  }

  /**
   * Set the event type
   */
  withEventType(eventType: string): this {
    this.event.eventType = eventType;
    return this;
  }

  /**
   * Set the event version
   */
  withEventVersion(version: string = '1.0'): this {
    this.event.eventVersion = version;
    return this;
  }

  /**
   * Set the tenant ID
   */
  withTenantId(tenantId: string): this {
    this.event.tenantId = tenantId;
    return this;
  }

  /**
   * Set the user ID
   */
  withUserId(userId: string): this {
    this.event.userId = userId;
    return this;
  }

  /**
   * Set the source module
   */
  withSource(source: string): this {
    this.event.source = source;
    return this;
  }

  /**
   * Set the correlation ID
   */
  withCorrelationId(correlationId: string): this {
    this.event.correlationId = correlationId;
    return this;
  }

  /**
   * Set the event data
   */
  withData(data: Record<string, unknown>): this {
    this.event.data = data;
    return this;
  }

  /**
   * Add a field to the event data
   */
  addDataField(key: string, value: unknown): this {
    if (!this.event.data) {
      this.event.data = {};
    }
    this.event.data[key] = value;
    return this;
  }

  /**
   * Build and publish the event
   */
  async publish(): Promise<void> {
    if (!this.event.eventType) {
      throw new EventPublishError('Event type is required');
    }
    if (!this.event.tenantId) {
      throw new EventPublishError('Tenant ID is required');
    }
    if (!this.event.source) {
      throw new EventPublishError('Source is required');
    }

    const event = {
      eventId: this.event.eventId!,
      eventType: this.event.eventType,
      eventVersion: this.event.eventVersion || '1.0',
      timestamp: this.event.timestamp!,
      tenantId: this.event.tenantId,
      userId: this.event.userId,
      source: this.event.source,
      correlationId: this.event.correlationId,
      data: this.event.data || {},
    } as Event;

    await this.publisher.publish(event);
  }

  /**
   * Build the event without publishing
   */
  build(): Event {
    if (!this.event.eventType) {
      throw new EventPublishError('Event type is required');
    }
    if (!this.event.tenantId) {
      throw new EventPublishError('Tenant ID is required');
    }
    if (!this.event.source) {
      throw new EventPublishError('Source is required');
    }

    return {
      eventId: this.event.eventId!,
      eventType: this.event.eventType,
      eventVersion: this.event.eventVersion || '1.0',
      timestamp: this.event.timestamp!,
      tenantId: this.event.tenantId,
      userId: this.event.userId,
      source: this.event.source,
      correlationId: this.event.correlationId,
      data: this.event.data || {},
    };
  }
}
