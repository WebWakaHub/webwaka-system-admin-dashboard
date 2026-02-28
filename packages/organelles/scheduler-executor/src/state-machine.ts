/**
 * SchedulerExecutor — State Machine
 * Organelle: ORG-ES-SCHEDULER_EXECUTOR-v0.1.0
 */

import { SchedulerExecutorState } from "./types";

interface Transition {
  from: SchedulerExecutorState;
  to: SchedulerExecutorState;
  guard?: () => boolean;
}

export class SchedulerExecutorStateMachine {
  private currentState: SchedulerExecutorState;
  private readonly transitions: Transition[];
  private readonly history: Array<{ from: SchedulerExecutorState; to: SchedulerExecutorState; timestamp: number }>;

  constructor(initialState: SchedulerExecutorState = SchedulerExecutorState.IDLE) {
    this.currentState = initialState;
    this.history = [];
    this.transitions = [
      { from: SchedulerExecutorState.IDLE, to: SchedulerExecutorState.PROCESSING },
      { from: SchedulerExecutorState.PROCESSING, to: SchedulerExecutorState.COMPLETED },
      { from: SchedulerExecutorState.PROCESSING, to: SchedulerExecutorState.ERROR },
      { from: SchedulerExecutorState.COMPLETED, to: SchedulerExecutorState.IDLE },
      { from: SchedulerExecutorState.ERROR, to: SchedulerExecutorState.IDLE },
      { from: SchedulerExecutorState.IDLE, to: SchedulerExecutorState.TERMINATED },
    ];
  }

  getState(): SchedulerExecutorState {
    return this.currentState;
  }

  canTransition(to: SchedulerExecutorState): boolean {
    return this.transitions.some(
      (t) => t.from === this.currentState && t.to === to && (!t.guard || t.guard())
    );
  }

  transition(to: SchedulerExecutorState): void {
    if (!this.canTransition(to)) {
      throw new Error(`Invalid transition: ${this.currentState} → ${to}`);
    }
    this.history.push({ from: this.currentState, to, timestamp: Date.now() });
    this.currentState = to;
  }

  getHistory(): ReadonlyArray<{ from: SchedulerExecutorState; to: SchedulerExecutorState; timestamp: number }> {
    return [...this.history];
  }

  reset(): void {
    if (this.currentState === SchedulerExecutorState.ERROR || this.currentState === SchedulerExecutorState.COMPLETED) {
      this.transition(SchedulerExecutorState.IDLE);
    }
  }
}
