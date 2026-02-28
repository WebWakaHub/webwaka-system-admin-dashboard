/**
 * CompositionModeler — State Machine
 * Organelle: ORG-CM-COMPOSITION_MODELER-v0.1.0
 */

import { CompositionModelerState } from "./types";

interface Transition {
  from: CompositionModelerState;
  to: CompositionModelerState;
  guard?: () => boolean;
}

export class CompositionModelerStateMachine {
  private currentState: CompositionModelerState;
  private readonly transitions: Transition[];
  private readonly history: Array<{ from: CompositionModelerState; to: CompositionModelerState; timestamp: number }>;

  constructor(initialState: CompositionModelerState = CompositionModelerState.IDLE) {
    this.currentState = initialState;
    this.history = [];
    this.transitions = [
      { from: CompositionModelerState.IDLE, to: CompositionModelerState.PROCESSING },
      { from: CompositionModelerState.PROCESSING, to: CompositionModelerState.COMPLETED },
      { from: CompositionModelerState.PROCESSING, to: CompositionModelerState.ERROR },
      { from: CompositionModelerState.COMPLETED, to: CompositionModelerState.IDLE },
      { from: CompositionModelerState.ERROR, to: CompositionModelerState.IDLE },
      { from: CompositionModelerState.IDLE, to: CompositionModelerState.TERMINATED },
    ];
  }

  getState(): CompositionModelerState {
    return this.currentState;
  }

  canTransition(to: CompositionModelerState): boolean {
    return this.transitions.some(
      (t) => t.from === this.currentState && t.to === to && (!t.guard || t.guard())
    );
  }

  transition(to: CompositionModelerState): void {
    if (!this.canTransition(to)) {
      throw new Error(`Invalid transition: ${this.currentState} → ${to}`);
    }
    this.history.push({ from: this.currentState, to, timestamp: Date.now() });
    this.currentState = to;
  }

  getHistory(): ReadonlyArray<{ from: CompositionModelerState; to: CompositionModelerState; timestamp: number }> {
    return [...this.history];
  }

  reset(): void {
    if (this.currentState === CompositionModelerState.ERROR || this.currentState === CompositionModelerState.COMPLETED) {
      this.transition(CompositionModelerState.IDLE);
    }
  }
}
