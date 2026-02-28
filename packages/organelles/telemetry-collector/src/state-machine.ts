/**
 * TelemetryCollector — State Machine
 * Organelle: ORG-TS-TELEMETRY_COLLECTOR-v0.1.0
 */

import { TelemetryCollectorState } from "./types";

interface Transition {
  from: TelemetryCollectorState;
  to: TelemetryCollectorState;
  guard?: () => boolean;
}

export class TelemetryCollectorStateMachine {
  private currentState: TelemetryCollectorState;
  private readonly transitions: Transition[];
  private readonly history: Array<{ from: TelemetryCollectorState; to: TelemetryCollectorState; timestamp: number }>;

  constructor(initialState: TelemetryCollectorState = TelemetryCollectorState.IDLE) {
    this.currentState = initialState;
    this.history = [];
    this.transitions = [
      { from: TelemetryCollectorState.IDLE, to: TelemetryCollectorState.PROCESSING },
      { from: TelemetryCollectorState.PROCESSING, to: TelemetryCollectorState.COMPLETED },
      { from: TelemetryCollectorState.PROCESSING, to: TelemetryCollectorState.ERROR },
      { from: TelemetryCollectorState.COMPLETED, to: TelemetryCollectorState.IDLE },
      { from: TelemetryCollectorState.ERROR, to: TelemetryCollectorState.IDLE },
      { from: TelemetryCollectorState.IDLE, to: TelemetryCollectorState.TERMINATED },
    ];
  }

  getState(): TelemetryCollectorState {
    return this.currentState;
  }

  canTransition(to: TelemetryCollectorState): boolean {
    return this.transitions.some(
      (t) => t.from === this.currentState && t.to === to && (!t.guard || t.guard())
    );
  }

  transition(to: TelemetryCollectorState): void {
    if (!this.canTransition(to)) {
      throw new Error(`Invalid transition: ${this.currentState} → ${to}`);
    }
    this.history.push({ from: this.currentState, to, timestamp: Date.now() });
    this.currentState = to;
  }

  getHistory(): ReadonlyArray<{ from: TelemetryCollectorState; to: TelemetryCollectorState; timestamp: number }> {
    return [...this.history];
  }

  reset(): void {
    if (this.currentState === TelemetryCollectorState.ERROR || this.currentState === TelemetryCollectorState.COMPLETED) {
      this.transition(TelemetryCollectorState.IDLE);
    }
  }
}
