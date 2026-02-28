/**
 * TrustAssertion — State Machine
 * Organelle: ORG-ST-TRUST_ASSERTION-v0.1.0
 */

import { TrustAssertionState } from "./types";

interface Transition {
  from: TrustAssertionState;
  to: TrustAssertionState;
  guard?: () => boolean;
}

export class TrustAssertionStateMachine {
  private currentState: TrustAssertionState;
  private readonly transitions: Transition[];
  private readonly history: Array<{ from: TrustAssertionState; to: TrustAssertionState; timestamp: number }>;

  constructor(initialState: TrustAssertionState = TrustAssertionState.IDLE) {
    this.currentState = initialState;
    this.history = [];
    this.transitions = [
      { from: TrustAssertionState.IDLE, to: TrustAssertionState.PROCESSING },
      { from: TrustAssertionState.PROCESSING, to: TrustAssertionState.COMPLETED },
      { from: TrustAssertionState.PROCESSING, to: TrustAssertionState.ERROR },
      { from: TrustAssertionState.COMPLETED, to: TrustAssertionState.IDLE },
      { from: TrustAssertionState.ERROR, to: TrustAssertionState.IDLE },
      { from: TrustAssertionState.IDLE, to: TrustAssertionState.TERMINATED },
    ];
  }

  getState(): TrustAssertionState {
    return this.currentState;
  }

  canTransition(to: TrustAssertionState): boolean {
    return this.transitions.some(
      (t) => t.from === this.currentState && t.to === to && (!t.guard || t.guard())
    );
  }

  transition(to: TrustAssertionState): void {
    if (!this.canTransition(to)) {
      throw new Error(`Invalid transition: ${this.currentState} → ${to}`);
    }
    this.history.push({ from: this.currentState, to, timestamp: Date.now() });
    this.currentState = to;
  }

  getHistory(): ReadonlyArray<{ from: TrustAssertionState; to: TrustAssertionState; timestamp: number }> {
    return [...this.history];
  }

  reset(): void {
    if (this.currentState === TrustAssertionState.ERROR || this.currentState === TrustAssertionState.COMPLETED) {
      this.transition(TrustAssertionState.IDLE);
    }
  }
}
