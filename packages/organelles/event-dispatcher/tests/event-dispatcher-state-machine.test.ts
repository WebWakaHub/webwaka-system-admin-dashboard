/**
 * EventDispatcher State Machine — Unit Tests
 * Organelle: ORG-EM-EVENT_DISPATCHER-v0.1.0
 */

import { EventDispatcherStateMachine } from "../src/state-machine";
import { EventDispatcherState } from "../src/types";

describe("EventDispatcherStateMachine", () => {
  let sm: EventDispatcherStateMachine;

  beforeEach(() => {
    sm = new EventDispatcherStateMachine();
  });

  it("should start in IDLE state", () => {
    expect(sm.getState()).toBe(EventDispatcherState.IDLE);
  });

  it("should allow IDLE → PROCESSING", () => {
    expect(sm.canTransition(EventDispatcherState.PROCESSING)).toBe(true);
    sm.transition(EventDispatcherState.PROCESSING);
    expect(sm.getState()).toBe(EventDispatcherState.PROCESSING);
  });

  it("should allow PROCESSING → COMPLETED", () => {
    sm.transition(EventDispatcherState.PROCESSING);
    sm.transition(EventDispatcherState.COMPLETED);
    expect(sm.getState()).toBe(EventDispatcherState.COMPLETED);
  });

  it("should allow PROCESSING → ERROR", () => {
    sm.transition(EventDispatcherState.PROCESSING);
    sm.transition(EventDispatcherState.ERROR);
    expect(sm.getState()).toBe(EventDispatcherState.ERROR);
  });

  it("should allow ERROR → IDLE via reset", () => {
    sm.transition(EventDispatcherState.PROCESSING);
    sm.transition(EventDispatcherState.ERROR);
    sm.reset();
    expect(sm.getState()).toBe(EventDispatcherState.IDLE);
  });

  it("should reject invalid transitions", () => {
    expect(() => sm.transition(EventDispatcherState.COMPLETED)).toThrow();
  });

  it("should maintain transition history", () => {
    sm.transition(EventDispatcherState.PROCESSING);
    sm.transition(EventDispatcherState.COMPLETED);
    const history = sm.getHistory();
    expect(history).toHaveLength(2);
    expect(history[0].from).toBe(EventDispatcherState.IDLE);
    expect(history[0].to).toBe(EventDispatcherState.PROCESSING);
  });

  it("should allow IDLE → TERMINATED", () => {
    sm.transition(EventDispatcherState.TERMINATED);
    expect(sm.getState()).toBe(EventDispatcherState.TERMINATED);
  });

  it("should not allow transitions from TERMINATED", () => {
    sm.transition(EventDispatcherState.TERMINATED);
    expect(sm.canTransition(EventDispatcherState.IDLE)).toBe(false);
  });
});
