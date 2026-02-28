/**
 * Event Bus
 * Abstract interface for event publishing
 * Production implementation will use NATS
 */

import { EventPayload } from './types';

export interface EventBus {
  publish(eventType: string, payload: Record<string, unknown>): Promise<void>;
  subscribe(eventType: string, handler: (payload: Record<string, unknown>) => Promise<void>): void;
  unsubscribe(eventType: string): void;
}

/**
 * In-memory Event Bus for development and testing
 */
export class InMemoryEventBus implements EventBus {
  private handlers: Map<string, Array<(payload: Record<string, unknown>) => Promise<void>>> =
    new Map();
  private events: Array<{ eventType: string; payload: Record<string, unknown> }> = [];

  async publish(eventType: string, payload: Record<string, unknown>): Promise<void> {
    this.events.push({ eventType, payload });

    const handlers = this.handlers.get(eventType) || [];
    for (const handler of handlers) {
      try {
        await handler(payload);
      } catch (error) {
        console.error(`Error handling event ${eventType}:`, error);
      }
    }
  }

  subscribe(
    eventType: string,
    handler: (payload: Record<string, unknown>) => Promise<void>
  ): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  unsubscribe(eventType: string): void {
    this.handlers.delete(eventType);
  }

  /**
   * Get all published events (for testing)
   */
  getEvents(): Array<{ eventType: string; payload: Record<string, unknown> }> {
    return this.events;
  }

  /**
   * Clear all events and handlers (for testing)
   */
  clear(): void {
    this.handlers.clear();
    this.events = [];
  }
}
