import { ResultValidatorState } from "./types";

interface Transition { from: ResultValidatorState; to: ResultValidatorState; guard?: () => boolean; }

export class ResultValidatorStateMachine {
  private currentState: ResultValidatorState;
  private readonly transitions: Transition[];
  private readonly history: Array<{ from: ResultValidatorState; to: ResultValidatorState; timestamp: number }>;

  constructor(initialState: ResultValidatorState = ResultValidatorState.IDLE) {
    this.currentState = initialState;
    this.history = [];
    this.transitions = [
      { from: ResultValidatorState.IDLE, to: ResultValidatorState.PROCESSING },
      { from: ResultValidatorState.PROCESSING, to: ResultValidatorState.COMPLETED },
      { from: ResultValidatorState.PROCESSING, to: ResultValidatorState.ERROR },
      { from: ResultValidatorState.COMPLETED, to: ResultValidatorState.IDLE },
      { from: ResultValidatorState.ERROR, to: ResultValidatorState.IDLE },
      { from: ResultValidatorState.IDLE, to: ResultValidatorState.TERMINATED },
    ];
  }

  getState(): ResultValidatorState { return this.currentState; }
  canTransition(to: ResultValidatorState): boolean { return this.transitions.some(t => t.from === this.currentState && t.to === to && (!t.guard || t.guard())); }
  transition(to: ResultValidatorState): void { if (!this.canTransition(to)) throw new Error(`Invalid: ${this.currentState} → ${to}`); this.history.push({ from: this.currentState, to, timestamp: Date.now() }); this.currentState = to; }
  getHistory() { return [...this.history]; }
  reset(): void { if (this.currentState === ResultValidatorState.ERROR || this.currentState === ResultValidatorState.COMPLETED) this.transition(ResultValidatorState.IDLE); }
}
