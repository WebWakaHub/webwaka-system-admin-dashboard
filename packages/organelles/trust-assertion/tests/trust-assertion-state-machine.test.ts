/**
 * TrustAssertion State Machine — Unit Tests
 * Organelle: ORG-ST-TRUST_ASSERTION-v0.1.0
 */

import { TrustAssertionStateMachine } from "../src/state-machine";
import { TrustAssertionState } from "../src/types";

describe("TrustAssertionStateMachine", () => {
  let sm: TrustAssertionStateMachine;

  beforeEach(() => {
    sm = new TrustAssertionStateMachine();
  });

  it("should start in IDLE state", () => {
    expect(sm.getState()).toBe(TrustAssertionState.IDLE);
  });

  it("should allow IDLE → PROCESSING", () => {
    expect(sm.canTransition(TrustAssertionState.PROCESSING)).toBe(true);
    sm.transition(TrustAssertionState.PROCESSING);
    expect(sm.getState()).toBe(TrustAssertionState.PROCESSING);
  });

  it("should allow PROCESSING → COMPLETED", () => {
    sm.transition(TrustAssertionState.PROCESSING);
    sm.transition(TrustAssertionState.COMPLETED);
    expect(sm.getState()).toBe(TrustAssertionState.COMPLETED);
  });

  it("should allow PROCESSING → ERROR", () => {
    sm.transition(TrustAssertionState.PROCESSING);
    sm.transition(TrustAssertionState.ERROR);
    expect(sm.getState()).toBe(TrustAssertionState.ERROR);
  });

  it("should allow ERROR → IDLE via reset", () => {
    sm.transition(TrustAssertionState.PROCESSING);
    sm.transition(TrustAssertionState.ERROR);
    sm.reset();
    expect(sm.getState()).toBe(TrustAssertionState.IDLE);
  });

  it("should reject invalid transitions", () => {
    expect(() => sm.transition(TrustAssertionState.COMPLETED)).toThrow();
  });

  it("should maintain transition history", () => {
    sm.transition(TrustAssertionState.PROCESSING);
    sm.transition(TrustAssertionState.COMPLETED);
    const history = sm.getHistory();
    expect(history).toHaveLength(2);
    expect(history[0].from).toBe(TrustAssertionState.IDLE);
    expect(history[0].to).toBe(TrustAssertionState.PROCESSING);
  });

  it("should allow IDLE → TERMINATED", () => {
    sm.transition(TrustAssertionState.TERMINATED);
    expect(sm.getState()).toBe(TrustAssertionState.TERMINATED);
  });

  it("should not allow transitions from TERMINATED", () => {
    sm.transition(TrustAssertionState.TERMINATED);
    expect(sm.canTransition(TrustAssertionState.IDLE)).toBe(false);
  });
});
