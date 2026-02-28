/**
 * ValidationEngine — Event Interface
 * Organelle: ORG-FV-VALIDATION_ENGINE-v0.1.0
 */

import { ValidationEngineEvent } from "./types";

type EventHandler = (event: ValidationEngineEvent) => void;

export interface IValidationEngineEvents {
  emit(event: ValidationEngineEvent): void;
  subscribe(handler: EventHandler): () => void;
  getEventCount(): number;
}

export class ValidationEngineEventBus implements IValidationEngineEvents {
  private readonly handlers: Set<EventHandler>;
  private eventCount: number;
  private readonly eventLog: ValidationEngineEvent[];

  constructor() {
    this.handlers = new Set();
    this.eventCount = 0;
    this.eventLog = [];
  }

  emit(event: ValidationEngineEvent): void {
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

  getEventLog(): ReadonlyArray<ValidationEngineEvent> {
    return [...this.eventLog];
  }
}
