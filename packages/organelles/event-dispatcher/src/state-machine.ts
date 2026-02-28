/**
 * EventDispatcher — State Machine
 * Organelle: ORG-EM-EVENT_DISPATCHER-v0.1.0
 */

import { EventDispatcherState } from "./types";

interface Transition {
  from: EventDispatcherState;
  to: EventDispatcherState;
  guard?: () => boolean;
}

export class EventDispatcherStateMachine {
  private currentState: EventDispatcherState;
  private readonly transitions: Transition[];
  private readonly history: Array<{ from: EventDispatcherState; to: EventDispatcherState; timestamp: number }>;

  constructor(initialState: EventDispatcherState = EventDispatcherState.IDLE) {
    this.currentState = initialState;
    this.history = [];
    this.transitions = [
      { from: EventDispatcherState.IDLE, to: EventDispatcherState.PROCESSING },
      { from: EventDispatcherState.PROCESSING, to: EventDispatcherState.COMPLETED },
      { from: EventDispatcherState.PROCESSING, to: EventDispatcherState.ERROR },
      { from: EventDispatcherState.COMPLETED, to: EventDispatcherState.IDLE },
      { from: EventDispatcherState.ERROR, to: EventDispatcherState.IDLE },
      { from: EventDispatcherState.IDLE, to: EventDispatcherState.TERMINATED },
    ];
  }

  getState(): EventDispatcherState {
    return this.currentState;
  }

  canTransition(to: EventDispatcherState): boolean {
    return this.transitions.some(
      (t) => t.from === this.currentState && t.to === to && (!t.guard || t.guard())
    );
  }

  transition(to: EventDispatcherState): void {
    if (!this.canTransition(to)) {
      throw new Error(`Invalid transition: ${this.currentState} → ${to}`);
    }
    this.history.push({ from: this.currentState, to, timestamp: Date.now() });
    this.currentState = to;
  }

  getHistory(): ReadonlyArray<{ from: EventDispatcherState; to: EventDispatcherState; timestamp: number }> {
    return [...this.history];
  }

  reset(): void {
    if (this.currentState === EventDispatcherState.ERROR || this.currentState === EventDispatcherState.COMPLETED) {
      this.transition(EventDispatcherState.IDLE);
    }
  }
}
