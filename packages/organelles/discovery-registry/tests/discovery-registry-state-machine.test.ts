/**
 * DiscoveryRegistry State Machine — Unit Tests
 * Organelle: ORG-OD-DISCOVERY_REGISTRY-v0.1.0
 */

import { DiscoveryRegistryStateMachine } from "../src/state-machine";
import { DiscoveryRegistryState } from "../src/types";

describe("DiscoveryRegistryStateMachine", () => {
  let sm: DiscoveryRegistryStateMachine;

  beforeEach(() => {
    sm = new DiscoveryRegistryStateMachine();
  });

  it("should start in IDLE state", () => {
    expect(sm.getState()).toBe(DiscoveryRegistryState.IDLE);
  });

  it("should allow IDLE → PROCESSING", () => {
    expect(sm.canTransition(DiscoveryRegistryState.PROCESSING)).toBe(true);
    sm.transition(DiscoveryRegistryState.PROCESSING);
    expect(sm.getState()).toBe(DiscoveryRegistryState.PROCESSING);
  });

  it("should allow PROCESSING → COMPLETED", () => {
    sm.transition(DiscoveryRegistryState.PROCESSING);
    sm.transition(DiscoveryRegistryState.COMPLETED);
    expect(sm.getState()).toBe(DiscoveryRegistryState.COMPLETED);
  });

  it("should allow PROCESSING → ERROR", () => {
    sm.transition(DiscoveryRegistryState.PROCESSING);
    sm.transition(DiscoveryRegistryState.ERROR);
    expect(sm.getState()).toBe(DiscoveryRegistryState.ERROR);
  });

  it("should allow ERROR → IDLE via reset", () => {
    sm.transition(DiscoveryRegistryState.PROCESSING);
    sm.transition(DiscoveryRegistryState.ERROR);
    sm.reset();
    expect(sm.getState()).toBe(DiscoveryRegistryState.IDLE);
  });

  it("should reject invalid transitions", () => {
    expect(() => sm.transition(DiscoveryRegistryState.COMPLETED)).toThrow();
  });

  it("should maintain transition history", () => {
    sm.transition(DiscoveryRegistryState.PROCESSING);
    sm.transition(DiscoveryRegistryState.COMPLETED);
    const history = sm.getHistory();
    expect(history).toHaveLength(2);
    expect(history[0].from).toBe(DiscoveryRegistryState.IDLE);
    expect(history[0].to).toBe(DiscoveryRegistryState.PROCESSING);
  });

  it("should allow IDLE → TERMINATED", () => {
    sm.transition(DiscoveryRegistryState.TERMINATED);
    expect(sm.getState()).toBe(DiscoveryRegistryState.TERMINATED);
  });

  it("should not allow transitions from TERMINATED", () => {
    sm.transition(DiscoveryRegistryState.TERMINATED);
    expect(sm.canTransition(DiscoveryRegistryState.IDLE)).toBe(false);
  });
});
