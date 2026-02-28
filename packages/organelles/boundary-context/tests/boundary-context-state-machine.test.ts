import { BoundaryContextStateMachine } from "../src/state-machine";
import { BoundaryContextState } from "../src/types";

describe("BoundaryContextStateMachine", () => {
  let sm: BoundaryContextStateMachine;
  beforeEach(() => { sm = new BoundaryContextStateMachine(); });

  it("should start in IDLE", () => { expect(sm.getState()).toBe(BoundaryContextState.IDLE); });
  it("should allow IDLE to PROCESSING", () => { sm.transition(BoundaryContextState.PROCESSING); expect(sm.getState()).toBe(BoundaryContextState.PROCESSING); });
  it("should allow PROCESSING to COMPLETED", () => { sm.transition(BoundaryContextState.PROCESSING); sm.transition(BoundaryContextState.COMPLETED); expect(sm.getState()).toBe(BoundaryContextState.COMPLETED); });
  it("should allow PROCESSING to ERROR", () => { sm.transition(BoundaryContextState.PROCESSING); sm.transition(BoundaryContextState.ERROR); expect(sm.getState()).toBe(BoundaryContextState.ERROR); });
  it("should allow ERROR to IDLE via reset", () => { sm.transition(BoundaryContextState.PROCESSING); sm.transition(BoundaryContextState.ERROR); sm.reset(); expect(sm.getState()).toBe(BoundaryContextState.IDLE); });
  it("should reject invalid transitions", () => { expect(() => sm.transition(BoundaryContextState.COMPLETED)).toThrow(); });
  it("should maintain history", () => { sm.transition(BoundaryContextState.PROCESSING); sm.transition(BoundaryContextState.COMPLETED); expect(sm.getHistory()).toHaveLength(2); });
  it("should allow IDLE to TERMINATED", () => { sm.transition(BoundaryContextState.TERMINATED); expect(sm.getState()).toBe(BoundaryContextState.TERMINATED); });
});
