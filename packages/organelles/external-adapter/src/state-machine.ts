import { ExternalAdapterState } from "./types";

interface Transition { from: ExternalAdapterState; to: ExternalAdapterState; guard?: () => boolean; }

export class ExternalAdapterStateMachine {
  private currentState: ExternalAdapterState;
  private readonly transitions: Transition[];
  private readonly history: Array<{ from: ExternalAdapterState; to: ExternalAdapterState; timestamp: number }>;

  constructor(initialState: ExternalAdapterState = ExternalAdapterState.IDLE) {
    this.currentState = initialState;
    this.history = [];
    this.transitions = [
      { from: ExternalAdapterState.IDLE, to: ExternalAdapterState.PROCESSING },
      { from: ExternalAdapterState.PROCESSING, to: ExternalAdapterState.COMPLETED },
      { from: ExternalAdapterState.PROCESSING, to: ExternalAdapterState.ERROR },
      { from: ExternalAdapterState.COMPLETED, to: ExternalAdapterState.IDLE },
      { from: ExternalAdapterState.ERROR, to: ExternalAdapterState.IDLE },
      { from: ExternalAdapterState.IDLE, to: ExternalAdapterState.TERMINATED },
    ];
  }

  getState(): ExternalAdapterState { return this.currentState; }
  canTransition(to: ExternalAdapterState): boolean { return this.transitions.some(t => t.from === this.currentState && t.to === to && (!t.guard || t.guard())); }
  transition(to: ExternalAdapterState): void { if (!this.canTransition(to)) throw new Error(`Invalid: ${this.currentState} → ${to}`); this.history.push({ from: this.currentState, to, timestamp: Date.now() }); this.currentState = to; }
  getHistory() { return [...this.history]; }
  reset(): void { if (this.currentState === ExternalAdapterState.ERROR || this.currentState === ExternalAdapterState.COMPLETED) this.transition(ExternalAdapterState.IDLE); }
}
