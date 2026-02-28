/**
 * CompositionModeler State Machine — Unit Tests
 * Organelle: ORG-CM-COMPOSITION_MODELER-v0.1.0
 */

import { CompositionModelerStateMachine } from "../src/state-machine";
import { CompositionModelerState } from "../src/types";

describe("CompositionModelerStateMachine", () => {
  let sm: CompositionModelerStateMachine;

  beforeEach(() => {
    sm = new CompositionModelerStateMachine();
  });

  it("should start in IDLE state", () => {
    expect(sm.getState()).toBe(CompositionModelerState.IDLE);
  });

  it("should allow IDLE → PROCESSING", () => {
    expect(sm.canTransition(CompositionModelerState.PROCESSING)).toBe(true);
    sm.transition(CompositionModelerState.PROCESSING);
    expect(sm.getState()).toBe(CompositionModelerState.PROCESSING);
  });

  it("should allow PROCESSING → COMPLETED", () => {
    sm.transition(CompositionModelerState.PROCESSING);
    sm.transition(CompositionModelerState.COMPLETED);
    expect(sm.getState()).toBe(CompositionModelerState.COMPLETED);
  });

  it("should allow PROCESSING → ERROR", () => {
    sm.transition(CompositionModelerState.PROCESSING);
    sm.transition(CompositionModelerState.ERROR);
    expect(sm.getState()).toBe(CompositionModelerState.ERROR);
  });

  it("should allow ERROR → IDLE via reset", () => {
    sm.transition(CompositionModelerState.PROCESSING);
    sm.transition(CompositionModelerState.ERROR);
    sm.reset();
    expect(sm.getState()).toBe(CompositionModelerState.IDLE);
  });

  it("should reject invalid transitions", () => {
    expect(() => sm.transition(CompositionModelerState.COMPLETED)).toThrow();
  });

  it("should maintain transition history", () => {
    sm.transition(CompositionModelerState.PROCESSING);
    sm.transition(CompositionModelerState.COMPLETED);
    const history = sm.getHistory();
    expect(history).toHaveLength(2);
    expect(history[0].from).toBe(CompositionModelerState.IDLE);
    expect(history[0].to).toBe(CompositionModelerState.PROCESSING);
  });

  it("should allow IDLE → TERMINATED", () => {
    sm.transition(CompositionModelerState.TERMINATED);
    expect(sm.getState()).toBe(CompositionModelerState.TERMINATED);
  });

  it("should not allow transitions from TERMINATED", () => {
    sm.transition(CompositionModelerState.TERMINATED);
    expect(sm.canTransition(CompositionModelerState.IDLE)).toBe(false);
  });
});
