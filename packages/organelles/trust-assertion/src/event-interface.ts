/**
 * TrustAssertion — Event Interface
 * Organelle: ORG-ST-TRUST_ASSERTION-v0.1.0
 */

import { TrustAssertionEvent } from "./types";

type EventHandler = (event: TrustAssertionEvent) => void;

export interface ITrustAssertionEvents {
  emit(event: TrustAssertionEvent): void;
  subscribe(handler: EventHandler): () => void;
  getEventCount(): number;
}

export class TrustAssertionEventBus implements ITrustAssertionEvents {
  private readonly handlers: Set<EventHandler>;
  private eventCount: number;
  private readonly eventLog: TrustAssertionEvent[];

  constructor() {
    this.handlers = new Set();
    this.eventCount = 0;
    this.eventLog = [];
  }

  emit(event: TrustAssertionEvent): void {
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

  getEventLog(): ReadonlyArray<TrustAssertionEvent> {
    return [...this.eventLog];
  }
}
