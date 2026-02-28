/**
 * PolicyDefinition State Machine — Unit Tests
 * Organelle: ORG-CP-POLICY_DEFINITION-v0.1.0
 */

import { PolicyDefinitionStateMachine } from "../src/state-machine";
import { PolicyDefinitionState } from "../src/types";

describe("PolicyDefinitionStateMachine", () => {
  let sm: PolicyDefinitionStateMachine;

  beforeEach(() => {
    sm = new PolicyDefinitionStateMachine();
  });

  it("should start in IDLE state", () => {
    expect(sm.getState()).toBe(PolicyDefinitionState.IDLE);
  });

  it("should allow IDLE → PROCESSING", () => {
    expect(sm.canTransition(PolicyDefinitionState.PROCESSING)).toBe(true);
    sm.transition(PolicyDefinitionState.PROCESSING);
    expect(sm.getState()).toBe(PolicyDefinitionState.PROCESSING);
  });

  it("should allow PROCESSING → COMPLETED", () => {
    sm.transition(PolicyDefinitionState.PROCESSING);
    sm.transition(PolicyDefinitionState.COMPLETED);
    expect(sm.getState()).toBe(PolicyDefinitionState.COMPLETED);
  });

  it("should allow PROCESSING → ERROR", () => {
    sm.transition(PolicyDefinitionState.PROCESSING);
    sm.transition(PolicyDefinitionState.ERROR);
    expect(sm.getState()).toBe(PolicyDefinitionState.ERROR);
  });

  it("should allow ERROR → IDLE via reset", () => {
    sm.transition(PolicyDefinitionState.PROCESSING);
    sm.transition(PolicyDefinitionState.ERROR);
    sm.reset();
    expect(sm.getState()).toBe(PolicyDefinitionState.IDLE);
  });

  it("should reject invalid transitions", () => {
    expect(() => sm.transition(PolicyDefinitionState.COMPLETED)).toThrow();
  });

  it("should maintain transition history", () => {
    sm.transition(PolicyDefinitionState.PROCESSING);
    sm.transition(PolicyDefinitionState.COMPLETED);
    const history = sm.getHistory();
    expect(history).toHaveLength(2);
    expect(history[0].from).toBe(PolicyDefinitionState.IDLE);
    expect(history[0].to).toBe(PolicyDefinitionState.PROCESSING);
  });

  it("should allow IDLE → TERMINATED", () => {
    sm.transition(PolicyDefinitionState.TERMINATED);
    expect(sm.getState()).toBe(PolicyDefinitionState.TERMINATED);
  });

  it("should not allow transitions from TERMINATED", () => {
    sm.transition(PolicyDefinitionState.TERMINATED);
    expect(sm.canTransition(PolicyDefinitionState.IDLE)).toBe(false);
  });
});
