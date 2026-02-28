/**
 * SchedulerExecutor — Event Interface
 * Organelle: ORG-ES-SCHEDULER_EXECUTOR-v0.1.0
 */

import { SchedulerExecutorEvent } from "./types";

type EventHandler = (event: SchedulerExecutorEvent) => void;

export interface ISchedulerExecutorEvents {
  emit(event: SchedulerExecutorEvent): void;
  subscribe(handler: EventHandler): () => void;
  getEventCount(): number;
}

export class SchedulerExecutorEventBus implements ISchedulerExecutorEvents {
  private readonly handlers: Set<EventHandler>;
  private eventCount: number;
  private readonly eventLog: SchedulerExecutorEvent[];

  constructor() {
    this.handlers = new Set();
    this.eventCount = 0;
    this.eventLog = [];
  }

  emit(event: SchedulerExecutorEvent): void {
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

  getEventLog(): ReadonlyArray<SchedulerExecutorEvent> {
    return [...this.eventLog];
  }
}
