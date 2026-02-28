/**
 * DiscoveryRegistry — State Machine
 * Organelle: ORG-OD-DISCOVERY_REGISTRY-v0.1.0
 */

import { DiscoveryRegistryState } from "./types";

interface Transition {
  from: DiscoveryRegistryState;
  to: DiscoveryRegistryState;
  guard?: () => boolean;
}

export class DiscoveryRegistryStateMachine {
  private currentState: DiscoveryRegistryState;
  private readonly transitions: Transition[];
  private readonly history: Array<{ from: DiscoveryRegistryState; to: DiscoveryRegistryState; timestamp: number }>;

  constructor(initialState: DiscoveryRegistryState = DiscoveryRegistryState.IDLE) {
    this.currentState = initialState;
    this.history = [];
    this.transitions = [
      { from: DiscoveryRegistryState.IDLE, to: DiscoveryRegistryState.PROCESSING },
      { from: DiscoveryRegistryState.PROCESSING, to: DiscoveryRegistryState.COMPLETED },
      { from: DiscoveryRegistryState.PROCESSING, to: DiscoveryRegistryState.ERROR },
      { from: DiscoveryRegistryState.COMPLETED, to: DiscoveryRegistryState.IDLE },
      { from: DiscoveryRegistryState.ERROR, to: DiscoveryRegistryState.IDLE },
      { from: DiscoveryRegistryState.IDLE, to: DiscoveryRegistryState.TERMINATED },
    ];
  }

  getState(): DiscoveryRegistryState {
    return this.currentState;
  }

  canTransition(to: DiscoveryRegistryState): boolean {
    return this.transitions.some(
      (t) => t.from === this.currentState && t.to === to && (!t.guard || t.guard())
    );
  }

  transition(to: DiscoveryRegistryState): void {
    if (!this.canTransition(to)) {
      throw new Error(`Invalid transition: ${this.currentState} → ${to}`);
    }
    this.history.push({ from: this.currentState, to, timestamp: Date.now() });
    this.currentState = to;
  }

  getHistory(): ReadonlyArray<{ from: DiscoveryRegistryState; to: DiscoveryRegistryState; timestamp: number }> {
    return [...this.history];
  }

  reset(): void {
    if (this.currentState === DiscoveryRegistryState.ERROR || this.currentState === DiscoveryRegistryState.COMPLETED) {
      this.transition(DiscoveryRegistryState.IDLE);
    }
  }
}
