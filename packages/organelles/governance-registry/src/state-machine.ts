/**
 * GovernanceRegistry — State Machine
 * Organelle: ORG-RG-GOVERNANCE_REGISTRY-v0.1.0
 */

import { GovernanceRegistryState } from "./types";

interface Transition {
  from: GovernanceRegistryState;
  to: GovernanceRegistryState;
  guard?: () => boolean;
}

export class GovernanceRegistryStateMachine {
  private currentState: GovernanceRegistryState;
  private readonly transitions: Transition[];
  private readonly history: Array<{ from: GovernanceRegistryState; to: GovernanceRegistryState; timestamp: number }>;

  constructor(initialState: GovernanceRegistryState = GovernanceRegistryState.IDLE) {
    this.currentState = initialState;
    this.history = [];
    this.transitions = [
      { from: GovernanceRegistryState.IDLE, to: GovernanceRegistryState.PROCESSING },
      { from: GovernanceRegistryState.PROCESSING, to: GovernanceRegistryState.COMPLETED },
      { from: GovernanceRegistryState.PROCESSING, to: GovernanceRegistryState.ERROR },
      { from: GovernanceRegistryState.COMPLETED, to: GovernanceRegistryState.IDLE },
      { from: GovernanceRegistryState.ERROR, to: GovernanceRegistryState.IDLE },
      { from: GovernanceRegistryState.IDLE, to: GovernanceRegistryState.TERMINATED },
    ];
  }

  getState(): GovernanceRegistryState {
    return this.currentState;
  }

  canTransition(to: GovernanceRegistryState): boolean {
    return this.transitions.some(
      (t) => t.from === this.currentState && t.to === to && (!t.guard || t.guard())
    );
  }

  transition(to: GovernanceRegistryState): void {
    if (!this.canTransition(to)) {
      throw new Error(`Invalid transition: ${this.currentState} → ${to}`);
    }
    this.history.push({ from: this.currentState, to, timestamp: Date.now() });
    this.currentState = to;
  }

  getHistory(): ReadonlyArray<{ from: GovernanceRegistryState; to: GovernanceRegistryState; timestamp: number }> {
    return [...this.history];
  }

  reset(): void {
    if (this.currentState === GovernanceRegistryState.ERROR || this.currentState === GovernanceRegistryState.COMPLETED) {
      this.transition(GovernanceRegistryState.IDLE);
    }
  }
}
