/**
 * TelemetryCollector — Event Interface
 * Organelle: ORG-TS-TELEMETRY_COLLECTOR-v0.1.0
 */

import { TelemetryCollectorEvent } from "./types";

type EventHandler = (event: TelemetryCollectorEvent) => void;

export interface ITelemetryCollectorEvents {
  emit(event: TelemetryCollectorEvent): void;
  subscribe(handler: EventHandler): () => void;
  getEventCount(): number;
}

export class TelemetryCollectorEventBus implements ITelemetryCollectorEvents {
  private readonly handlers: Set<EventHandler>;
  private eventCount: number;
  private readonly eventLog: TelemetryCollectorEvent[];

  constructor() {
    this.handlers = new Set();
    this.eventCount = 0;
    this.eventLog = [];
  }

  emit(event: TelemetryCollectorEvent): void {
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

  getEventLog(): ReadonlyArray<TelemetryCollectorEvent> {
    return [...this.eventLog];
  }
}
