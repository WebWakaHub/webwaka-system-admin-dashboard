/**
 * RecordStore State Machine — Unit Tests
 * Organelle: ORG-DP-RECORD_STORE-v0.1.0
 */

import { RecordStoreStateMachine } from "../src/state-machine";
import { RecordStoreState } from "../src/types";

describe("RecordStoreStateMachine", () => {
  let sm: RecordStoreStateMachine;

  beforeEach(() => {
    sm = new RecordStoreStateMachine();
  });

  it("should start in IDLE state", () => {
    expect(sm.getState()).toBe(RecordStoreState.IDLE);
  });

  it("should allow IDLE → PROCESSING", () => {
    expect(sm.canTransition(RecordStoreState.PROCESSING)).toBe(true);
    sm.transition(RecordStoreState.PROCESSING);
    expect(sm.getState()).toBe(RecordStoreState.PROCESSING);
  });

  it("should allow PROCESSING → COMPLETED", () => {
    sm.transition(RecordStoreState.PROCESSING);
    sm.transition(RecordStoreState.COMPLETED);
    expect(sm.getState()).toBe(RecordStoreState.COMPLETED);
  });

  it("should allow PROCESSING → ERROR", () => {
    sm.transition(RecordStoreState.PROCESSING);
    sm.transition(RecordStoreState.ERROR);
    expect(sm.getState()).toBe(RecordStoreState.ERROR);
  });

  it("should allow ERROR → IDLE via reset", () => {
    sm.transition(RecordStoreState.PROCESSING);
    sm.transition(RecordStoreState.ERROR);
    sm.reset();
    expect(sm.getState()).toBe(RecordStoreState.IDLE);
  });

  it("should reject invalid transitions", () => {
    expect(() => sm.transition(RecordStoreState.COMPLETED)).toThrow();
  });

  it("should maintain transition history", () => {
    sm.transition(RecordStoreState.PROCESSING);
    sm.transition(RecordStoreState.COMPLETED);
    const history = sm.getHistory();
    expect(history).toHaveLength(2);
    expect(history[0].from).toBe(RecordStoreState.IDLE);
    expect(history[0].to).toBe(RecordStoreState.PROCESSING);
  });

  it("should allow IDLE → TERMINATED", () => {
    sm.transition(RecordStoreState.TERMINATED);
    expect(sm.getState()).toBe(RecordStoreState.TERMINATED);
  });

  it("should not allow transitions from TERMINATED", () => {
    sm.transition(RecordStoreState.TERMINATED);
    expect(sm.canTransition(RecordStoreState.IDLE)).toBe(false);
  });
});
