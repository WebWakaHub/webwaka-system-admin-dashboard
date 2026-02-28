/**
 * TelemetryCollector State Machine — Unit Tests
 * Organelle: ORG-TS-TELEMETRY_COLLECTOR-v0.1.0
 */

import { TelemetryCollectorStateMachine } from "../src/state-machine";
import { TelemetryCollectorState } from "../src/types";

describe("TelemetryCollectorStateMachine", () => {
  let sm: TelemetryCollectorStateMachine;

  beforeEach(() => {
    sm = new TelemetryCollectorStateMachine();
  });

  it("should start in IDLE state", () => {
    expect(sm.getState()).toBe(TelemetryCollectorState.IDLE);
  });

  it("should allow IDLE → PROCESSING", () => {
    expect(sm.canTransition(TelemetryCollectorState.PROCESSING)).toBe(true);
    sm.transition(TelemetryCollectorState.PROCESSING);
    expect(sm.getState()).toBe(TelemetryCollectorState.PROCESSING);
  });

  it("should allow PROCESSING → COMPLETED", () => {
    sm.transition(TelemetryCollectorState.PROCESSING);
    sm.transition(TelemetryCollectorState.COMPLETED);
    expect(sm.getState()).toBe(TelemetryCollectorState.COMPLETED);
  });

  it("should allow PROCESSING → ERROR", () => {
    sm.transition(TelemetryCollectorState.PROCESSING);
    sm.transition(TelemetryCollectorState.ERROR);
    expect(sm.getState()).toBe(TelemetryCollectorState.ERROR);
  });

  it("should allow ERROR → IDLE via reset", () => {
    sm.transition(TelemetryCollectorState.PROCESSING);
    sm.transition(TelemetryCollectorState.ERROR);
    sm.reset();
    expect(sm.getState()).toBe(TelemetryCollectorState.IDLE);
  });

  it("should reject invalid transitions", () => {
    expect(() => sm.transition(TelemetryCollectorState.COMPLETED)).toThrow();
  });

  it("should maintain transition history", () => {
    sm.transition(TelemetryCollectorState.PROCESSING);
    sm.transition(TelemetryCollectorState.COMPLETED);
    const history = sm.getHistory();
    expect(history).toHaveLength(2);
    expect(history[0].from).toBe(TelemetryCollectorState.IDLE);
    expect(history[0].to).toBe(TelemetryCollectorState.PROCESSING);
  });

  it("should allow IDLE → TERMINATED", () => {
    sm.transition(TelemetryCollectorState.TERMINATED);
    expect(sm.getState()).toBe(TelemetryCollectorState.TERMINATED);
  });

  it("should not allow transitions from TERMINATED", () => {
    sm.transition(TelemetryCollectorState.TERMINATED);
    expect(sm.canTransition(TelemetryCollectorState.IDLE)).toBe(false);
  });
});
