import { InstrumentationProbeState } from "./types";

interface Transition { from: InstrumentationProbeState; to: InstrumentationProbeState; guard?: () => boolean; }

export class InstrumentationProbeStateMachine {
  private currentState: InstrumentationProbeState;
  private readonly transitions: Transition[];
  private readonly history: Array<{ from: InstrumentationProbeState; to: InstrumentationProbeState; timestamp: number }>;

  constructor(initialState: InstrumentationProbeState = InstrumentationProbeState.IDLE) {
    this.currentState = initialState;
    this.history = [];
    this.transitions = [
      { from: InstrumentationProbeState.IDLE, to: InstrumentationProbeState.PROCESSING },
      { from: InstrumentationProbeState.PROCESSING, to: InstrumentationProbeState.COMPLETED },
      { from: InstrumentationProbeState.PROCESSING, to: InstrumentationProbeState.ERROR },
      { from: InstrumentationProbeState.COMPLETED, to: InstrumentationProbeState.IDLE },
      { from: InstrumentationProbeState.ERROR, to: InstrumentationProbeState.IDLE },
      { from: InstrumentationProbeState.IDLE, to: InstrumentationProbeState.TERMINATED },
    ];
  }

  getState(): InstrumentationProbeState { return this.currentState; }
  canTransition(to: InstrumentationProbeState): boolean { return this.transitions.some(t => t.from === this.currentState && t.to === to && (!t.guard || t.guard())); }
  transition(to: InstrumentationProbeState): void { if (!this.canTransition(to)) throw new Error(`Invalid: ${this.currentState} → ${to}`); this.history.push({ from: this.currentState, to, timestamp: Date.now() }); this.currentState = to; }
  getHistory() { return [...this.history]; }
  reset(): void { if (this.currentState === InstrumentationProbeState.ERROR || this.currentState === InstrumentationProbeState.COMPLETED) this.transition(InstrumentationProbeState.IDLE); }
}
