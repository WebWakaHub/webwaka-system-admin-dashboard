/**
 * AuditLogger — Event Interface
 * Organelle: ORG-LG-AUDIT_LOGGER-v0.1.0
 */

import { AuditLoggerEvent } from "./types";

type EventHandler = (event: AuditLoggerEvent) => void;

export interface IAuditLoggerEvents {
  emit(event: AuditLoggerEvent): void;
  subscribe(handler: EventHandler): () => void;
  getEventCount(): number;
}

export class AuditLoggerEventBus implements IAuditLoggerEvents {
  private readonly handlers: Set<EventHandler>;
  private eventCount: number;
  private readonly eventLog: AuditLoggerEvent[];

  constructor() {
    this.handlers = new Set();
    this.eventCount = 0;
    this.eventLog = [];
  }

  emit(event: AuditLoggerEvent): void {
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

  getEventLog(): ReadonlyArray<AuditLoggerEvent> {
    return [...this.eventLog];
  }
}
