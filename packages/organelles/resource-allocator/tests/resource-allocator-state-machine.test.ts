/**
 * ResourceAllocator State Machine — Unit Tests
 * Organelle: ORG-RA-RESOURCE_ALLOCATOR-v0.1.0
 */

import { ResourceAllocatorStateMachine } from "../src/state-machine";
import { ResourceAllocatorState } from "../src/types";

describe("ResourceAllocatorStateMachine", () => {
  let sm: ResourceAllocatorStateMachine;

  beforeEach(() => {
    sm = new ResourceAllocatorStateMachine();
  });

  it("should start in IDLE state", () => {
    expect(sm.getState()).toBe(ResourceAllocatorState.IDLE);
  });

  it("should allow IDLE → PROCESSING", () => {
    expect(sm.canTransition(ResourceAllocatorState.PROCESSING)).toBe(true);
    sm.transition(ResourceAllocatorState.PROCESSING);
    expect(sm.getState()).toBe(ResourceAllocatorState.PROCESSING);
  });

  it("should allow PROCESSING → COMPLETED", () => {
    sm.transition(ResourceAllocatorState.PROCESSING);
    sm.transition(ResourceAllocatorState.COMPLETED);
    expect(sm.getState()).toBe(ResourceAllocatorState.COMPLETED);
  });

  it("should allow PROCESSING → ERROR", () => {
    sm.transition(ResourceAllocatorState.PROCESSING);
    sm.transition(ResourceAllocatorState.ERROR);
    expect(sm.getState()).toBe(ResourceAllocatorState.ERROR);
  });

  it("should allow ERROR → IDLE via reset", () => {
    sm.transition(ResourceAllocatorState.PROCESSING);
    sm.transition(ResourceAllocatorState.ERROR);
    sm.reset();
    expect(sm.getState()).toBe(ResourceAllocatorState.IDLE);
  });

  it("should reject invalid transitions", () => {
    expect(() => sm.transition(ResourceAllocatorState.COMPLETED)).toThrow();
  });

  it("should maintain transition history", () => {
    sm.transition(ResourceAllocatorState.PROCESSING);
    sm.transition(ResourceAllocatorState.COMPLETED);
    const history = sm.getHistory();
    expect(history).toHaveLength(2);
    expect(history[0].from).toBe(ResourceAllocatorState.IDLE);
    expect(history[0].to).toBe(ResourceAllocatorState.PROCESSING);
  });

  it("should allow IDLE → TERMINATED", () => {
    sm.transition(ResourceAllocatorState.TERMINATED);
    expect(sm.getState()).toBe(ResourceAllocatorState.TERMINATED);
  });

  it("should not allow transitions from TERMINATED", () => {
    sm.transition(ResourceAllocatorState.TERMINATED);
    expect(sm.canTransition(ResourceAllocatorState.IDLE)).toBe(false);
  });
});
