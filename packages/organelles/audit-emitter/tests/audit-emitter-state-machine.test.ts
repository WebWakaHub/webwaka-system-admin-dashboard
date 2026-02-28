import { AuditEmitterStateMachine } from "../src/state-machine";
import { AuditEmitterState } from "../src/types";

describe("AuditEmitterStateMachine", () => {
  let sm: AuditEmitterStateMachine;
  beforeEach(() => { sm = new AuditEmitterStateMachine(); });

  it("should start in IDLE", () => { expect(sm.getState()).toBe(AuditEmitterState.IDLE); });
  it("should allow IDLE → PROCESSING", () => { sm.transition(AuditEmitterState.PROCESSING); expect(sm.getState()).toBe(AuditEmitterState.PROCESSING); });
  it("should allow PROCESSING → COMPLETED", () => { sm.transition(AuditEmitterState.PROCESSING); sm.transition(AuditEmitterState.COMPLETED); expect(sm.getState()).toBe(AuditEmitterState.COMPLETED); });
  it("should allow PROCESSING → ERROR", () => { sm.transition(AuditEmitterState.PROCESSING); sm.transition(AuditEmitterState.ERROR); expect(sm.getState()).toBe(AuditEmitterState.ERROR); });
  it("should allow ERROR → IDLE via reset", () => { sm.transition(AuditEmitterState.PROCESSING); sm.transition(AuditEmitterState.ERROR); sm.reset(); expect(sm.getState()).toBe(AuditEmitterState.IDLE); });
  it("should reject invalid transitions", () => { expect(() => sm.transition(AuditEmitterState.COMPLETED)).toThrow(); });
  it("should maintain history", () => { sm.transition(AuditEmitterState.PROCESSING); sm.transition(AuditEmitterState.COMPLETED); expect(sm.getHistory()).toHaveLength(2); });
});
