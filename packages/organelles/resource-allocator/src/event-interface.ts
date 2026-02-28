/**
 * ResourceAllocator — Event Interface
 * Organelle: ORG-RA-RESOURCE_ALLOCATOR-v0.1.0
 */

import { ResourceAllocatorEvent } from "./types";

type EventHandler = (event: ResourceAllocatorEvent) => void;

export interface IResourceAllocatorEvents {
  emit(event: ResourceAllocatorEvent): void;
  subscribe(handler: EventHandler): () => void;
  getEventCount(): number;
}

export class ResourceAllocatorEventBus implements IResourceAllocatorEvents {
  private readonly handlers: Set<EventHandler>;
  private eventCount: number;
  private readonly eventLog: ResourceAllocatorEvent[];

  constructor() {
    this.handlers = new Set();
    this.eventCount = 0;
    this.eventLog = [];
  }

  emit(event: ResourceAllocatorEvent): void {
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

  getEventLog(): ReadonlyArray<ResourceAllocatorEvent> {
    return [...this.eventLog];
  }
}
