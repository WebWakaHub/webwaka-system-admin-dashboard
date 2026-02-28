/**
 * RecordStore — Event Interface
 * Organelle: ORG-DP-RECORD_STORE-v0.1.0
 */

import { RecordStoreEvent } from "./types";

type EventHandler = (event: RecordStoreEvent) => void;

export interface IRecordStoreEvents {
  emit(event: RecordStoreEvent): void;
  subscribe(handler: EventHandler): () => void;
  getEventCount(): number;
}

export class RecordStoreEventBus implements IRecordStoreEvents {
  private readonly handlers: Set<EventHandler>;
  private eventCount: number;
  private readonly eventLog: RecordStoreEvent[];

  constructor() {
    this.handlers = new Set();
    this.eventCount = 0;
    this.eventLog = [];
  }

  emit(event: RecordStoreEvent): void {
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

  getEventLog(): ReadonlyArray<RecordStoreEvent> {
    return [...this.eventLog];
  }
}
