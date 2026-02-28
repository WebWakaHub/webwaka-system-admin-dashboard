/**
 * SchedulerExecutor State Machine — Unit Tests
 * Organelle: ORG-ES-SCHEDULER_EXECUTOR-v0.1.0
 */

import { SchedulerExecutorStateMachine } from "../src/state-machine";
import { SchedulerExecutorState } from "../src/types";

describe("SchedulerExecutorStateMachine", () => {
  let sm: SchedulerExecutorStateMachine;

  beforeEach(() => {
    sm = new SchedulerExecutorStateMachine();
  });

  it("should start in IDLE state", () => {
    expect(sm.getState()).toBe(SchedulerExecutorState.IDLE);
  });

  it("should allow IDLE → PROCESSING", () => {
    expect(sm.canTransition(SchedulerExecutorState.PROCESSING)).toBe(true);
    sm.transition(SchedulerExecutorState.PROCESSING);
    expect(sm.getState()).toBe(SchedulerExecutorState.PROCESSING);
  });

  it("should allow PROCESSING → COMPLETED", () => {
    sm.transition(SchedulerExecutorState.PROCESSING);
    sm.transition(SchedulerExecutorState.COMPLETED);
    expect(sm.getState()).toBe(SchedulerExecutorState.COMPLETED);
  });

  it("should allow PROCESSING → ERROR", () => {
    sm.transition(SchedulerExecutorState.PROCESSING);
    sm.transition(SchedulerExecutorState.ERROR);
    expect(sm.getState()).toBe(SchedulerExecutorState.ERROR);
  });

  it("should allow ERROR → IDLE via reset", () => {
    sm.transition(SchedulerExecutorState.PROCESSING);
    sm.transition(SchedulerExecutorState.ERROR);
    sm.reset();
    expect(sm.getState()).toBe(SchedulerExecutorState.IDLE);
  });

  it("should reject invalid transitions", () => {
    expect(() => sm.transition(SchedulerExecutorState.COMPLETED)).toThrow();
  });

  it("should maintain transition history", () => {
    sm.transition(SchedulerExecutorState.PROCESSING);
    sm.transition(SchedulerExecutorState.COMPLETED);
    const history = sm.getHistory();
    expect(history).toHaveLength(2);
    expect(history[0].from).toBe(SchedulerExecutorState.IDLE);
    expect(history[0].to).toBe(SchedulerExecutorState.PROCESSING);
  });

  it("should allow IDLE → TERMINATED", () => {
    sm.transition(SchedulerExecutorState.TERMINATED);
    expect(sm.getState()).toBe(SchedulerExecutorState.TERMINATED);
  });

  it("should not allow transitions from TERMINATED", () => {
    sm.transition(SchedulerExecutorState.TERMINATED);
    expect(sm.canTransition(SchedulerExecutorState.IDLE)).toBe(false);
  });
});
