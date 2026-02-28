import { AuditEmitterState } from "./types";

interface Transition { from: AuditEmitterState; to: AuditEmitterState; guard?: () => boolean; }

export class AuditEmitterStateMachine {
  private currentState: AuditEmitterState;
  private readonly transitions: Transition[];
  private readonly history: Array<{ from: AuditEmitterState; to: AuditEmitterState; timestamp: number }>;

  constructor(initialState: AuditEmitterState = AuditEmitterState.IDLE) {
    this.currentState = initialState;
    this.history = [];
    this.transitions = [
      { from: AuditEmitterState.IDLE, to: AuditEmitterState.PROCESSING },
      { from: AuditEmitterState.PROCESSING, to: AuditEmitterState.COMPLETED },
      { from: AuditEmitterState.PROCESSING, to: AuditEmitterState.ERROR },
      { from: AuditEmitterState.COMPLETED, to: AuditEmitterState.IDLE },
      { from: AuditEmitterState.ERROR, to: AuditEmitterState.IDLE },
      { from: AuditEmitterState.IDLE, to: AuditEmitterState.TERMINATED },
    ];
  }

  getState(): AuditEmitterState { return this.currentState; }
  canTransition(to: AuditEmitterState): boolean { return this.transitions.some(t => t.from === this.currentState && t.to === to && (!t.guard || t.guard())); }
  transition(to: AuditEmitterState): void { if (!this.canTransition(to)) throw new Error(`Invalid: ${this.currentState} → ${to}`); this.history.push({ from: this.currentState, to, timestamp: Date.now() }); this.currentState = to; }
  getHistory() { return [...this.history]; }
  reset(): void { if (this.currentState === AuditEmitterState.ERROR || this.currentState === AuditEmitterState.COMPLETED) this.transition(AuditEmitterState.IDLE); }
}
