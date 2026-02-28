/**
 * RecordStore — State Machine
 * Organelle: ORG-DP-RECORD_STORE-v0.1.0
 */

import { RecordStoreState } from "./types";

interface Transition {
  from: RecordStoreState;
  to: RecordStoreState;
  guard?: () => boolean;
}

export class RecordStoreStateMachine {
  private currentState: RecordStoreState;
  private readonly transitions: Transition[];
  private readonly history: Array<{ from: RecordStoreState; to: RecordStoreState; timestamp: number }>;

  constructor(initialState: RecordStoreState = RecordStoreState.IDLE) {
    this.currentState = initialState;
    this.history = [];
    this.transitions = [
      { from: RecordStoreState.IDLE, to: RecordStoreState.PROCESSING },
      { from: RecordStoreState.PROCESSING, to: RecordStoreState.COMPLETED },
      { from: RecordStoreState.PROCESSING, to: RecordStoreState.ERROR },
      { from: RecordStoreState.COMPLETED, to: RecordStoreState.IDLE },
      { from: RecordStoreState.ERROR, to: RecordStoreState.IDLE },
      { from: RecordStoreState.IDLE, to: RecordStoreState.TERMINATED },
    ];
  }

  getState(): RecordStoreState {
    return this.currentState;
  }

  canTransition(to: RecordStoreState): boolean {
    return this.transitions.some(
      (t) => t.from === this.currentState && t.to === to && (!t.guard || t.guard())
    );
  }

  transition(to: RecordStoreState): void {
    if (!this.canTransition(to)) {
      throw new Error(`Invalid transition: ${this.currentState} → ${to}`);
    }
    this.history.push({ from: this.currentState, to, timestamp: Date.now() });
    this.currentState = to;
  }

  getHistory(): ReadonlyArray<{ from: RecordStoreState; to: RecordStoreState; timestamp: number }> {
    return [...this.history];
  }

  reset(): void {
    if (this.currentState === RecordStoreState.ERROR || this.currentState === RecordStoreState.COMPLETED) {
      this.transition(RecordStoreState.IDLE);
    }
  }
}
