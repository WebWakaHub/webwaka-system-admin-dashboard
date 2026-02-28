/**
 * AuditLogger — State Machine
 * Organelle: ORG-LG-AUDIT_LOGGER-v0.1.0
 */

import { AuditLoggerState } from "./types";

interface Transition {
  from: AuditLoggerState;
  to: AuditLoggerState;
  guard?: () => boolean;
}

export class AuditLoggerStateMachine {
  private currentState: AuditLoggerState;
  private readonly transitions: Transition[];
  private readonly history: Array<{ from: AuditLoggerState; to: AuditLoggerState; timestamp: number }>;

  constructor(initialState: AuditLoggerState = AuditLoggerState.IDLE) {
    this.currentState = initialState;
    this.history = [];
    this.transitions = [
      { from: AuditLoggerState.IDLE, to: AuditLoggerState.PROCESSING },
      { from: AuditLoggerState.PROCESSING, to: AuditLoggerState.COMPLETED },
      { from: AuditLoggerState.PROCESSING, to: AuditLoggerState.ERROR },
      { from: AuditLoggerState.COMPLETED, to: AuditLoggerState.IDLE },
      { from: AuditLoggerState.ERROR, to: AuditLoggerState.IDLE },
      { from: AuditLoggerState.IDLE, to: AuditLoggerState.TERMINATED },
    ];
  }

  getState(): AuditLoggerState {
    return this.currentState;
  }

  canTransition(to: AuditLoggerState): boolean {
    return this.transitions.some(
      (t) => t.from === this.currentState && t.to === to && (!t.guard || t.guard())
    );
  }

  transition(to: AuditLoggerState): void {
    if (!this.canTransition(to)) {
      throw new Error(`Invalid transition: ${this.currentState} → ${to}`);
    }
    this.history.push({ from: this.currentState, to, timestamp: Date.now() });
    this.currentState = to;
  }

  getHistory(): ReadonlyArray<{ from: AuditLoggerState; to: AuditLoggerState; timestamp: number }> {
    return [...this.history];
  }

  reset(): void {
    if (this.currentState === AuditLoggerState.ERROR || this.currentState === AuditLoggerState.COMPLETED) {
      this.transition(AuditLoggerState.IDLE);
    }
  }
}
