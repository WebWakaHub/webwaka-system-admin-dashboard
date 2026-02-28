import { ResultValidatorStateMachine } from "../src/state-machine";
import { ResultValidatorState } from "../src/types";

describe("ResultValidatorStateMachine", () => {
  let sm: ResultValidatorStateMachine;
  beforeEach(() => { sm = new ResultValidatorStateMachine(); });

  it("should start in IDLE", () => { expect(sm.getState()).toBe(ResultValidatorState.IDLE); });
  it("should allow IDLE → PROCESSING", () => { sm.transition(ResultValidatorState.PROCESSING); expect(sm.getState()).toBe(ResultValidatorState.PROCESSING); });
  it("should allow PROCESSING → COMPLETED", () => { sm.transition(ResultValidatorState.PROCESSING); sm.transition(ResultValidatorState.COMPLETED); expect(sm.getState()).toBe(ResultValidatorState.COMPLETED); });
  it("should allow PROCESSING → ERROR", () => { sm.transition(ResultValidatorState.PROCESSING); sm.transition(ResultValidatorState.ERROR); expect(sm.getState()).toBe(ResultValidatorState.ERROR); });
  it("should allow ERROR → IDLE via reset", () => { sm.transition(ResultValidatorState.PROCESSING); sm.transition(ResultValidatorState.ERROR); sm.reset(); expect(sm.getState()).toBe(ResultValidatorState.IDLE); });
  it("should reject invalid transitions", () => { expect(() => sm.transition(ResultValidatorState.COMPLETED)).toThrow(); });
  it("should maintain history", () => { sm.transition(ResultValidatorState.PROCESSING); sm.transition(ResultValidatorState.COMPLETED); expect(sm.getHistory()).toHaveLength(2); });
});
