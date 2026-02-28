/**
 * ValidationEngine — State Machine
 * Organelle: ORG-FV-VALIDATION_ENGINE-v0.1.0
 */

import { ValidationEngineState } from "./types";

interface Transition {
  from: ValidationEngineState;
  to: ValidationEngineState;
  guard?: () => boolean;
}

export class ValidationEngineStateMachine {
  private currentState: ValidationEngineState;
  private readonly transitions: Transition[];
  private readonly history: Array<{ from: ValidationEngineState; to: ValidationEngineState; timestamp: number }>;

  constructor(initialState: ValidationEngineState = ValidationEngineState.IDLE) {
    this.currentState = initialState;
    this.history = [];
    this.transitions = [
      { from: ValidationEngineState.IDLE, to: ValidationEngineState.PROCESSING },
      { from: ValidationEngineState.PROCESSING, to: ValidationEngineState.COMPLETED },
      { from: ValidationEngineState.PROCESSING, to: ValidationEngineState.ERROR },
      { from: ValidationEngineState.COMPLETED, to: ValidationEngineState.IDLE },
      { from: ValidationEngineState.ERROR, to: ValidationEngineState.IDLE },
      { from: ValidationEngineState.IDLE, to: ValidationEngineState.TERMINATED },
    ];
  }

  getState(): ValidationEngineState {
    return this.currentState;
  }

  canTransition(to: ValidationEngineState): boolean {
    return this.transitions.some(
      (t) => t.from === this.currentState && t.to === to && (!t.guard || t.guard())
    );
  }

  transition(to: ValidationEngineState): void {
    if (!this.canTransition(to)) {
      throw new Error(`Invalid transition: ${this.currentState} → ${to}`);
    }
    this.history.push({ from: this.currentState, to, timestamp: Date.now() });
    this.currentState = to;
  }

  getHistory(): ReadonlyArray<{ from: ValidationEngineState; to: ValidationEngineState; timestamp: number }> {
    return [...this.history];
  }

  reset(): void {
    if (this.currentState === ValidationEngineState.ERROR || this.currentState === ValidationEngineState.COMPLETED) {
      this.transition(ValidationEngineState.IDLE);
    }
  }
}
