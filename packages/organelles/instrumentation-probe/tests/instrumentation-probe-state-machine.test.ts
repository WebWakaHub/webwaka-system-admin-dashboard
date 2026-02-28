import { InstrumentationProbeStateMachine } from "../src/state-machine";
import { InstrumentationProbeState } from "../src/types";

describe("InstrumentationProbeStateMachine", () => {
  let sm: InstrumentationProbeStateMachine;
  beforeEach(() => { sm = new InstrumentationProbeStateMachine(); });

  it("should start in IDLE", () => { expect(sm.getState()).toBe(InstrumentationProbeState.IDLE); });
  it("should allow IDLE → PROCESSING", () => { sm.transition(InstrumentationProbeState.PROCESSING); expect(sm.getState()).toBe(InstrumentationProbeState.PROCESSING); });
  it("should allow PROCESSING → COMPLETED", () => { sm.transition(InstrumentationProbeState.PROCESSING); sm.transition(InstrumentationProbeState.COMPLETED); expect(sm.getState()).toBe(InstrumentationProbeState.COMPLETED); });
  it("should allow PROCESSING → ERROR", () => { sm.transition(InstrumentationProbeState.PROCESSING); sm.transition(InstrumentationProbeState.ERROR); expect(sm.getState()).toBe(InstrumentationProbeState.ERROR); });
  it("should allow ERROR → IDLE via reset", () => { sm.transition(InstrumentationProbeState.PROCESSING); sm.transition(InstrumentationProbeState.ERROR); sm.reset(); expect(sm.getState()).toBe(InstrumentationProbeState.IDLE); });
  it("should reject invalid transitions", () => { expect(() => sm.transition(InstrumentationProbeState.COMPLETED)).toThrow(); });
  it("should maintain history", () => { sm.transition(InstrumentationProbeState.PROCESSING); sm.transition(InstrumentationProbeState.COMPLETED); expect(sm.getHistory()).toHaveLength(2); });
});
