/**
 * WorkflowOrchestrator — Event Interface
 * Organelle: ORG-WO-WORKFLOW_ORCHESTRATOR-v0.1.0
 */

import { WorkflowOrchestratorEvent } from "./types";

type EventHandler = (event: WorkflowOrchestratorEvent) => void;

export interface IWorkflowOrchestratorEvents {
  emit(event: WorkflowOrchestratorEvent): void;
  subscribe(handler: EventHandler): () => void;
  getEventCount(): number;
}

export class WorkflowOrchestratorEventBus implements IWorkflowOrchestratorEvents {
  private readonly handlers: Set<EventHandler>;
  private eventCount: number;
  private readonly eventLog: WorkflowOrchestratorEvent[];

  constructor() {
    this.handlers = new Set();
    this.eventCount = 0;
    this.eventLog = [];
  }

  emit(event: WorkflowOrchestratorEvent): void {
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

  getEventLog(): ReadonlyArray<WorkflowOrchestratorEvent> {
    return [...this.eventLog];
  }
}
