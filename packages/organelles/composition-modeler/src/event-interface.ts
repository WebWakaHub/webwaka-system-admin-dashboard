/**
 * CompositionModeler — Event Interface
 * Organelle: ORG-CM-COMPOSITION_MODELER-v0.1.0
 */

import { CompositionModelerEvent } from "./types";

type EventHandler = (event: CompositionModelerEvent) => void;

export interface ICompositionModelerEvents {
  emit(event: CompositionModelerEvent): void;
  subscribe(handler: EventHandler): () => void;
  getEventCount(): number;
}

export class CompositionModelerEventBus implements ICompositionModelerEvents {
  private readonly handlers: Set<EventHandler>;
  private eventCount: number;
  private readonly eventLog: CompositionModelerEvent[];

  constructor() {
    this.handlers = new Set();
    this.eventCount = 0;
    this.eventLog = [];
  }

  emit(event: CompositionModelerEvent): void {
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

  getEventLog(): ReadonlyArray<CompositionModelerEvent> {
    return [...this.eventLog];
  }
}
