import { ExternalAdapterStateMachine } from "../src/state-machine";
import { ExternalAdapterState } from "../src/types";

describe("ExternalAdapterStateMachine", () => {
  let sm: ExternalAdapterStateMachine;
  beforeEach(() => { sm = new ExternalAdapterStateMachine(); });

  it("should start in IDLE", () => { expect(sm.getState()).toBe(ExternalAdapterState.IDLE); });
  it("should allow IDLE → PROCESSING", () => { sm.transition(ExternalAdapterState.PROCESSING); expect(sm.getState()).toBe(ExternalAdapterState.PROCESSING); });
  it("should allow PROCESSING → COMPLETED", () => { sm.transition(ExternalAdapterState.PROCESSING); sm.transition(ExternalAdapterState.COMPLETED); expect(sm.getState()).toBe(ExternalAdapterState.COMPLETED); });
  it("should allow PROCESSING → ERROR", () => { sm.transition(ExternalAdapterState.PROCESSING); sm.transition(ExternalAdapterState.ERROR); expect(sm.getState()).toBe(ExternalAdapterState.ERROR); });
  it("should allow ERROR → IDLE via reset", () => { sm.transition(ExternalAdapterState.PROCESSING); sm.transition(ExternalAdapterState.ERROR); sm.reset(); expect(sm.getState()).toBe(ExternalAdapterState.IDLE); });
  it("should reject invalid transitions", () => { expect(() => sm.transition(ExternalAdapterState.COMPLETED)).toThrow(); });
  it("should maintain history", () => { sm.transition(ExternalAdapterState.PROCESSING); sm.transition(ExternalAdapterState.COMPLETED); expect(sm.getHistory()).toHaveLength(2); });
});
