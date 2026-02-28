/**
 * PolicyDefinition — State Machine
 * Organelle: ORG-CP-POLICY_DEFINITION-v0.1.0
 */

import { PolicyDefinitionState } from "./types";

interface Transition {
  from: PolicyDefinitionState;
  to: PolicyDefinitionState;
  guard?: () => boolean;
}

export class PolicyDefinitionStateMachine {
  private currentState: PolicyDefinitionState;
  private readonly transitions: Transition[];
  private readonly history: Array<{ from: PolicyDefinitionState; to: PolicyDefinitionState; timestamp: number }>;

  constructor(initialState: PolicyDefinitionState = PolicyDefinitionState.IDLE) {
    this.currentState = initialState;
    this.history = [];
    this.transitions = [
      { from: PolicyDefinitionState.IDLE, to: PolicyDefinitionState.PROCESSING },
      { from: PolicyDefinitionState.PROCESSING, to: PolicyDefinitionState.COMPLETED },
      { from: PolicyDefinitionState.PROCESSING, to: PolicyDefinitionState.ERROR },
      { from: PolicyDefinitionState.COMPLETED, to: PolicyDefinitionState.IDLE },
      { from: PolicyDefinitionState.ERROR, to: PolicyDefinitionState.IDLE },
      { from: PolicyDefinitionState.IDLE, to: PolicyDefinitionState.TERMINATED },
    ];
  }

  getState(): PolicyDefinitionState {
    return this.currentState;
  }

  canTransition(to: PolicyDefinitionState): boolean {
    return this.transitions.some(
      (t) => t.from === this.currentState && t.to === to && (!t.guard || t.guard())
    );
  }

  transition(to: PolicyDefinitionState): void {
    if (!this.canTransition(to)) {
      throw new Error(`Invalid transition: ${this.currentState} → ${to}`);
    }
    this.history.push({ from: this.currentState, to, timestamp: Date.now() });
    this.currentState = to;
  }

  getHistory(): ReadonlyArray<{ from: PolicyDefinitionState; to: PolicyDefinitionState; timestamp: number }> {
    return [...this.history];
  }

  reset(): void {
    if (this.currentState === PolicyDefinitionState.ERROR || this.currentState === PolicyDefinitionState.COMPLETED) {
      this.transition(PolicyDefinitionState.IDLE);
    }
  }
}
