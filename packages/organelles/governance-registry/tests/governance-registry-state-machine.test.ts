/**
 * GovernanceRegistry State Machine — Unit Tests
 * Organelle: ORG-RG-GOVERNANCE_REGISTRY-v0.1.0
 */

import { GovernanceRegistryStateMachine } from "../src/state-machine";
import { GovernanceRegistryState } from "../src/types";

describe("GovernanceRegistryStateMachine", () => {
  let sm: GovernanceRegistryStateMachine;

  beforeEach(() => {
    sm = new GovernanceRegistryStateMachine();
  });

  it("should start in IDLE state", () => {
    expect(sm.getState()).toBe(GovernanceRegistryState.IDLE);
  });

  it("should allow IDLE → PROCESSING", () => {
    expect(sm.canTransition(GovernanceRegistryState.PROCESSING)).toBe(true);
    sm.transition(GovernanceRegistryState.PROCESSING);
    expect(sm.getState()).toBe(GovernanceRegistryState.PROCESSING);
  });

  it("should allow PROCESSING → COMPLETED", () => {
    sm.transition(GovernanceRegistryState.PROCESSING);
    sm.transition(GovernanceRegistryState.COMPLETED);
    expect(sm.getState()).toBe(GovernanceRegistryState.COMPLETED);
  });

  it("should allow PROCESSING → ERROR", () => {
    sm.transition(GovernanceRegistryState.PROCESSING);
    sm.transition(GovernanceRegistryState.ERROR);
    expect(sm.getState()).toBe(GovernanceRegistryState.ERROR);
  });

  it("should allow ERROR → IDLE via reset", () => {
    sm.transition(GovernanceRegistryState.PROCESSING);
    sm.transition(GovernanceRegistryState.ERROR);
    sm.reset();
    expect(sm.getState()).toBe(GovernanceRegistryState.IDLE);
  });

  it("should reject invalid transitions", () => {
    expect(() => sm.transition(GovernanceRegistryState.COMPLETED)).toThrow();
  });

  it("should maintain transition history", () => {
    sm.transition(GovernanceRegistryState.PROCESSING);
    sm.transition(GovernanceRegistryState.COMPLETED);
    const history = sm.getHistory();
    expect(history).toHaveLength(2);
    expect(history[0].from).toBe(GovernanceRegistryState.IDLE);
    expect(history[0].to).toBe(GovernanceRegistryState.PROCESSING);
  });

  it("should allow IDLE → TERMINATED", () => {
    sm.transition(GovernanceRegistryState.TERMINATED);
    expect(sm.getState()).toBe(GovernanceRegistryState.TERMINATED);
  });

  it("should not allow transitions from TERMINATED", () => {
    sm.transition(GovernanceRegistryState.TERMINATED);
    expect(sm.canTransition(GovernanceRegistryState.IDLE)).toBe(false);
  });
});
