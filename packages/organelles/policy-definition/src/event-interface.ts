/**
 * PolicyDefinition — Event Interface
 * Organelle: ORG-CP-POLICY_DEFINITION-v0.1.0
 */

import { PolicyDefinitionEvent } from "./types";

type EventHandler = (event: PolicyDefinitionEvent) => void;

export interface IPolicyDefinitionEvents {
  emit(event: PolicyDefinitionEvent): void;
  subscribe(handler: EventHandler): () => void;
  getEventCount(): number;
}

export class PolicyDefinitionEventBus implements IPolicyDefinitionEvents {
  private readonly handlers: Set<EventHandler>;
  private eventCount: number;
  private readonly eventLog: PolicyDefinitionEvent[];

  constructor() {
    this.handlers = new Set();
    this.eventCount = 0;
    this.eventLog = [];
  }

  emit(event: PolicyDefinitionEvent): void {
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

  getEventLog(): ReadonlyArray<PolicyDefinitionEvent> {
    return [...this.eventLog];
  }
}
