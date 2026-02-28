/**
 * EventDispatcher — Event Interface
 * Organelle: ORG-EM-EVENT_DISPATCHER-v0.1.0
 */

import { EventDispatcherEvent } from "./types";

type EventHandler = (event: EventDispatcherEvent) => void;

export interface IEventDispatcherEvents {
  emit(event: EventDispatcherEvent): void;
  subscribe(handler: EventHandler): () => void;
  getEventCount(): number;
}

export class EventDispatcherEventBus implements IEventDispatcherEvents {
  private readonly handlers: Set<EventHandler>;
  private eventCount: number;
  private readonly eventLog: EventDispatcherEvent[];

  constructor() {
    this.handlers = new Set();
    this.eventCount = 0;
    this.eventLog = [];
  }

  emit(event: EventDispatcherEvent): void {
    this.eventCount++;
    this.eventLog.push(event);
    for (const handler of this.handlers) {
      try {
        handler(event);
      } catch (error) {
        console.error(`Event handler error:`, error);
      }
    }
  }

  subscribe(handler: EventHandler): () => void {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  getEventCount(): number {
    return this.eventCount;
  }

  getEventLog(): ReadonlyArray<EventDispatcherEvent> {
    return [...this.eventLog];
  }
}
