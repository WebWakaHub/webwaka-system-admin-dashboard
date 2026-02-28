/**
 * Event Bus Service
 * Implements event-driven architecture using Redis pub/sub and PostgreSQL persistence
 */

import { Event } from '@prisma/client';
import Redis from 'ioredis';
import { db } from '../../shared/database';
import { logger } from '../../shared/logger';

export interface PublishEventInput {
  tenantId?: string;
  eventType: string;
  eventVersion?: string;
  aggregateId?: string;
  aggregateType?: string;
  payload: Record<string, any>;
  metadata?: Record<string, any>;
  userId?: string;
}

export type EventHandler = (event: Event) => Promise<void> | void;

export class EventBusService {
  private redis: Redis;
  private subscriber: Redis;
  private handlers: Map<string, EventHandler[]> = new Map();
  private isInitialized = false;

  constructor() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    this.redis = new Redis(redisUrl);
    this.subscriber = new Redis(redisUrl);
  }

  /**
   * Initialize event bus
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Set up subscriber
      this.subscriber.on('message', async (channel, message) => {
        try {
          const event = JSON.parse(message) as Event;
          await this.handleEvent(event);
        } catch (error) {
          logger.error('Failed to handle event message', { error, channel, message });
        }
      });

      this.isInitialized = true;
      logger.info('Event bus initialized');
    } catch (error) {
      logger.error('Failed to initialize event bus', { error });
      throw error;
    }
  }

  /**
   * Publish event to event bus
   */
  async publishEvent(input: PublishEventInput): Promise<Event> {
    try {
      // Persist event to database
      const event = await db.event.create({
        data: {
          tenantId: input.tenantId,
          eventType: input.eventType,
          eventVersion: input.eventVersion || '1.0',
          aggregateId: input.aggregateId,
          aggregateType: input.aggregateType,
          payload: input.payload,
          metadata: input.metadata || {},
          userId: input.userId,
        },
      });

      // Publish to Redis for real-time subscribers
      const channel = this.getChannelName(input.eventType, input.tenantId);
      await this.redis.publish(channel, JSON.stringify(event));

      logger.info('Event published', {
        eventId: event.id,
        eventType: event.eventType,
        tenantId: event.tenantId,
      });

      return event;
    } catch (error) {
      logger.error('Failed to publish event', { error, input });
      throw error;
    }
  }

  /**
   * Subscribe to event type
   */
  async subscribe(eventType: string, handler: EventHandler, tenantId?: string): Promise<void> {
    try {
      // Add handler to handlers map
      const key = this.getHandlerKey(eventType, tenantId);
      const handlers = this.handlers.get(key) || [];
      handlers.push(handler);
      this.handlers.set(key, handlers);

      // Subscribe to Redis channel
      const channel = this.getChannelName(eventType, tenantId);
      await this.subscriber.subscribe(channel);

      logger.info('Subscribed to event', { eventType, tenantId, channel });
    } catch (error) {
      logger.error('Failed to subscribe to event', { error, eventType, tenantId });
      throw error;
    }
  }

  /**
   * Unsubscribe from event type
   */
  async unsubscribe(eventType: string, tenantId?: string): Promise<void> {
    try {
      // Remove handlers
      const key = this.getHandlerKey(eventType, tenantId);
      this.handlers.delete(key);

      // Unsubscribe from Redis channel
      const channel = this.getChannelName(eventType, tenantId);
      await this.subscriber.unsubscribe(channel);

      logger.info('Unsubscribed from event', { eventType, tenantId, channel });
    } catch (error) {
      logger.error('Failed to unsubscribe from event', { error, eventType, tenantId });
      throw error;
    }
  }

  /**
   * Handle incoming event
   */
  private async handleEvent(event: Event): Promise<void> {
    try {
      // Get handlers for this event type
      const key = this.getHandlerKey(event.eventType, event.tenantId || undefined);
      const handlers = this.handlers.get(key) || [];

      // Also get global handlers (no tenant filter)
      const globalKey = this.getHandlerKey(event.eventType);
      const globalHandlers = this.handlers.get(globalKey) || [];

      // Execute all handlers
      const allHandlers = [...handlers, ...globalHandlers];
      await Promise.all(allHandlers.map((handler) => handler(event)));

      // Mark event as processed
      await db.event.update({
        where: { id: event.id },
        data: { processed: true },
      });

      logger.debug('Event handled', { eventId: event.id, eventType: event.eventType });
    } catch (error) {
      logger.error('Failed to handle event', { error, event });
    }
  }

  /**
   * Get events from database
   */
  async getEvents(params: {
    tenantId?: string;
    eventType?: string;
    aggregateId?: string;
    skip?: number;
    take?: number;
  }): Promise<{ events: Event[]; total: number }> {
    try {
      const { tenantId, eventType, aggregateId, skip = 0, take = 10 } = params;

      const where: any = {};
      if (tenantId) where.tenantId = tenantId;
      if (eventType) where.eventType = eventType;
      if (aggregateId) where.aggregateId = aggregateId;

      const [events, total] = await Promise.all([
        db.event.findMany({
          where,
          skip,
          take,
          orderBy: { publishedAt: 'desc' },
        }),
        db.event.count({ where }),
      ]);

      return { events, total };
    } catch (error) {
      logger.error('Failed to get events', { error, params });
      throw error;
    }
  }

  /**
   * Replay events for aggregate
   */
  async replayEvents(aggregateId: string, aggregateType: string): Promise<Event[]> {
    try {
      const events = await db.event.findMany({
        where: {
          aggregateId,
          aggregateType,
        },
        orderBy: { publishedAt: 'asc' },
      });

      logger.info('Events replayed', { aggregateId, aggregateType, count: events.length });
      return events;
    } catch (error) {
      logger.error('Failed to replay events', { error, aggregateId, aggregateType });
      throw error;
    }
  }

  /**
   * Get channel name for event type and tenant
   */
  private getChannelName(eventType: string, tenantId?: string): string {
    return tenantId ? `events:${tenantId}:${eventType}` : `events:global:${eventType}`;
  }

  /**
   * Get handler key for event type and tenant
   */
  private getHandlerKey(eventType: string, tenantId?: string): string {
    return tenantId ? `${tenantId}:${eventType}` : `global:${eventType}`;
  }

  /**
   * Disconnect from Redis
   */
  async disconnect(): Promise<void> {
    await this.redis.quit();
    await this.subscriber.quit();
    logger.info('Event bus disconnected');
  }
}

// Export singleton instance
export const eventBusService = new EventBusService();
