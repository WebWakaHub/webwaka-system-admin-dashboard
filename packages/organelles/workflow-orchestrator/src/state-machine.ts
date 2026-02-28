/**
 * WorkflowOrchestrator — State Machine
 * Organelle: ORG-WO-WORKFLOW_ORCHESTRATOR-v0.1.0
 */

import { WorkflowOrchestratorState } from "./types";

interface Transition {
  from: WorkflowOrchestratorState;
  to: WorkflowOrchestratorState;
  guard?: () => boolean;
}

export class WorkflowOrchestratorStateMachine {
  private currentState: WorkflowOrchestratorState;
  private readonly transitions: Transition[];
  private readonly history: Array<{ from: WorkflowOrchestratorState; to: WorkflowOrchestratorState; timestamp: number }>;

  constructor(initialState: WorkflowOrchestratorState = WorkflowOrchestratorState.IDLE) {
    this.currentState = initialState;
    this.history = [];
    this.transitions = [
      { from: WorkflowOrchestratorState.IDLE, to: WorkflowOrchestratorState.PROCESSING },
      { from: WorkflowOrchestratorState.PROCESSING, to: WorkflowOrchestratorState.COMPLETED },
      { from: WorkflowOrchestratorState.PROCESSING, to: WorkflowOrchestratorState.ERROR },
      { from: WorkflowOrchestratorState.COMPLETED, to: WorkflowOrchestratorState.IDLE },
      { from: WorkflowOrchestratorState.ERROR, to: WorkflowOrchestratorState.IDLE },
      { from: WorkflowOrchestratorState.IDLE, to: WorkflowOrchestratorState.TERMINATED },
    ];
  }

  getState(): WorkflowOrchestratorState {
    return this.currentState;
  }

  canTransition(to: WorkflowOrchestratorState): boolean {
    return this.transitions.some(
      (t) => t.from === this.currentState && t.to === to && (!t.guard || t.guard())
    );
  }

  transition(to: WorkflowOrchestratorState): void {
    if (!this.canTransition(to)) {
      throw new Error(`Invalid transition: ${this.currentState} → ${to}`);
    }
    this.history.push({ from: this.currentState, to, timestamp: Date.now() });
    this.currentState = to;
  }

  getHistory(): ReadonlyArray<{ from: WorkflowOrchestratorState; to: WorkflowOrchestratorState; timestamp: number }> {
    return [...this.history];
  }

  reset(): void {
    if (this.currentState === WorkflowOrchestratorState.ERROR || this.currentState === WorkflowOrchestratorState.COMPLETED) {
      this.transition(WorkflowOrchestratorState.IDLE);
    }
  }
}
