/**
 * DiscoveryRegistry — Event Interface
 * Organelle: ORG-OD-DISCOVERY_REGISTRY-v0.1.0
 */

import { DiscoveryRegistryEvent } from "./types";

type EventHandler = (event: DiscoveryRegistryEvent) => void;

export interface IDiscoveryRegistryEvents {
  emit(event: DiscoveryRegistryEvent): void;
  subscribe(handler: EventHandler): () => void;
  getEventCount(): number;
}

export class DiscoveryRegistryEventBus implements IDiscoveryRegistryEvents {
  private readonly handlers: Set<EventHandler>;
  private eventCount: number;
  private readonly eventLog: DiscoveryRegistryEvent[];

  constructor() {
    this.handlers = new Set();
    this.eventCount = 0;
    this.eventLog = [];
  }

  emit(event: DiscoveryRegistryEvent): void {
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

  getEventLog(): ReadonlyArray<DiscoveryRegistryEvent> {
    return [...this.eventLog];
  }
}
