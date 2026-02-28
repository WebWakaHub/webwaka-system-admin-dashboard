/**
 * ValidationEngine State Machine — Unit Tests
 * Organelle: ORG-FV-VALIDATION_ENGINE-v0.1.0
 */

import { ValidationEngineStateMachine } from "../src/state-machine";
import { ValidationEngineState } from "../src/types";

describe("ValidationEngineStateMachine", () => {
  let sm: ValidationEngineStateMachine;

  beforeEach(() => {
    sm = new ValidationEngineStateMachine();
  });

  it("should start in IDLE state", () => {
    expect(sm.getState()).toBe(ValidationEngineState.IDLE);
  });

  it("should allow IDLE → PROCESSING", () => {
    expect(sm.canTransition(ValidationEngineState.PROCESSING)).toBe(true);
    sm.transition(ValidationEngineState.PROCESSING);
    expect(sm.getState()).toBe(ValidationEngineState.PROCESSING);
  });

  it("should allow PROCESSING → COMPLETED", () => {
    sm.transition(ValidationEngineState.PROCESSING);
    sm.transition(ValidationEngineState.COMPLETED);
    expect(sm.getState()).toBe(ValidationEngineState.COMPLETED);
  });

  it("should allow PROCESSING → ERROR", () => {
    sm.transition(ValidationEngineState.PROCESSING);
    sm.transition(ValidationEngineState.ERROR);
    expect(sm.getState()).toBe(ValidationEngineState.ERROR);
  });

  it("should allow ERROR → IDLE via reset", () => {
    sm.transition(ValidationEngineState.PROCESSING);
    sm.transition(ValidationEngineState.ERROR);
    sm.reset();
    expect(sm.getState()).toBe(ValidationEngineState.IDLE);
  });

  it("should reject invalid transitions", () => {
    expect(() => sm.transition(ValidationEngineState.COMPLETED)).toThrow();
  });

  it("should maintain transition history", () => {
    sm.transition(ValidationEngineState.PROCESSING);
    sm.transition(ValidationEngineState.COMPLETED);
    const history = sm.getHistory();
    expect(history).toHaveLength(2);
    expect(history[0].from).toBe(ValidationEngineState.IDLE);
    expect(history[0].to).toBe(ValidationEngineState.PROCESSING);
  });

  it("should allow IDLE → TERMINATED", () => {
    sm.transition(ValidationEngineState.TERMINATED);
    expect(sm.getState()).toBe(ValidationEngineState.TERMINATED);
  });

  it("should not allow transitions from TERMINATED", () => {
    sm.transition(ValidationEngineState.TERMINATED);
    expect(sm.canTransition(ValidationEngineState.IDLE)).toBe(false);
  });
});
