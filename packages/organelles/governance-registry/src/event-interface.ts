/**
 * GovernanceRegistry — Event Interface
 * Organelle: ORG-RG-GOVERNANCE_REGISTRY-v0.1.0
 */

import { GovernanceRegistryEvent } from "./types";

type EventHandler = (event: GovernanceRegistryEvent) => void;

export interface IGovernanceRegistryEvents {
  emit(event: GovernanceRegistryEvent): void;
  subscribe(handler: EventHandler): () => void;
  getEventCount(): number;
}

export class GovernanceRegistryEventBus implements IGovernanceRegistryEvents {
  private readonly handlers: Set<EventHandler>;
  private eventCount: number;
  private readonly eventLog: GovernanceRegistryEvent[];

  constructor() {
    this.handlers = new Set();
    this.eventCount = 0;
    this.eventLog = [];
  }

  emit(event: GovernanceRegistryEvent): void {
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

  getEventLog(): ReadonlyArray<GovernanceRegistryEvent> {
    return [...this.eventLog];
  }
}
