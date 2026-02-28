/**
 * AuditLogger State Machine — Unit Tests
 * Organelle: ORG-LG-AUDIT_LOGGER-v0.1.0
 */

import { AuditLoggerStateMachine } from "../src/state-machine";
import { AuditLoggerState } from "../src/types";

describe("AuditLoggerStateMachine", () => {
  let sm: AuditLoggerStateMachine;

  beforeEach(() => {
    sm = new AuditLoggerStateMachine();
  });

  it("should start in IDLE state", () => {
    expect(sm.getState()).toBe(AuditLoggerState.IDLE);
  });

  it("should allow IDLE → PROCESSING", () => {
    expect(sm.canTransition(AuditLoggerState.PROCESSING)).toBe(true);
    sm.transition(AuditLoggerState.PROCESSING);
    expect(sm.getState()).toBe(AuditLoggerState.PROCESSING);
  });

  it("should allow PROCESSING → COMPLETED", () => {
    sm.transition(AuditLoggerState.PROCESSING);
    sm.transition(AuditLoggerState.COMPLETED);
    expect(sm.getState()).toBe(AuditLoggerState.COMPLETED);
  });

  it("should allow PROCESSING → ERROR", () => {
    sm.transition(AuditLoggerState.PROCESSING);
    sm.transition(AuditLoggerState.ERROR);
    expect(sm.getState()).toBe(AuditLoggerState.ERROR);
  });

  it("should allow ERROR → IDLE via reset", () => {
    sm.transition(AuditLoggerState.PROCESSING);
    sm.transition(AuditLoggerState.ERROR);
    sm.reset();
    expect(sm.getState()).toBe(AuditLoggerState.IDLE);
  });

  it("should reject invalid transitions", () => {
    expect(() => sm.transition(AuditLoggerState.COMPLETED)).toThrow();
  });

  it("should maintain transition history", () => {
    sm.transition(AuditLoggerState.PROCESSING);
    sm.transition(AuditLoggerState.COMPLETED);
    const history = sm.getHistory();
    expect(history).toHaveLength(2);
    expect(history[0].from).toBe(AuditLoggerState.IDLE);
    expect(history[0].to).toBe(AuditLoggerState.PROCESSING);
  });

  it("should allow IDLE → TERMINATED", () => {
    sm.transition(AuditLoggerState.TERMINATED);
    expect(sm.getState()).toBe(AuditLoggerState.TERMINATED);
  });

  it("should not allow transitions from TERMINATED", () => {
    sm.transition(AuditLoggerState.TERMINATED);
    expect(sm.canTransition(AuditLoggerState.IDLE)).toBe(false);
  });
});
