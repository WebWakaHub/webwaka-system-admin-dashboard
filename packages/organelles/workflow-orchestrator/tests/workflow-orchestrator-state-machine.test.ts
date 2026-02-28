/**
 * WorkflowOrchestrator State Machine — Unit Tests
 * Organelle: ORG-WO-WORKFLOW_ORCHESTRATOR-v0.1.0
 */

import { WorkflowOrchestratorStateMachine } from "../src/state-machine";
import { WorkflowOrchestratorState } from "../src/types";

describe("WorkflowOrchestratorStateMachine", () => {
  let sm: WorkflowOrchestratorStateMachine;

  beforeEach(() => {
    sm = new WorkflowOrchestratorStateMachine();
  });

  it("should start in IDLE state", () => {
    expect(sm.getState()).toBe(WorkflowOrchestratorState.IDLE);
  });

  it("should allow IDLE → PROCESSING", () => {
    expect(sm.canTransition(WorkflowOrchestratorState.PROCESSING)).toBe(true);
    sm.transition(WorkflowOrchestratorState.PROCESSING);
    expect(sm.getState()).toBe(WorkflowOrchestratorState.PROCESSING);
  });

  it("should allow PROCESSING → COMPLETED", () => {
    sm.transition(WorkflowOrchestratorState.PROCESSING);
    sm.transition(WorkflowOrchestratorState.COMPLETED);
    expect(sm.getState()).toBe(WorkflowOrchestratorState.COMPLETED);
  });

  it("should allow PROCESSING → ERROR", () => {
    sm.transition(WorkflowOrchestratorState.PROCESSING);
    sm.transition(WorkflowOrchestratorState.ERROR);
    expect(sm.getState()).toBe(WorkflowOrchestratorState.ERROR);
  });

  it("should allow ERROR → IDLE via reset", () => {
    sm.transition(WorkflowOrchestratorState.PROCESSING);
    sm.transition(WorkflowOrchestratorState.ERROR);
    sm.reset();
    expect(sm.getState()).toBe(WorkflowOrchestratorState.IDLE);
  });

  it("should reject invalid transitions", () => {
    expect(() => sm.transition(WorkflowOrchestratorState.COMPLETED)).toThrow();
  });

  it("should maintain transition history", () => {
    sm.transition(WorkflowOrchestratorState.PROCESSING);
    sm.transition(WorkflowOrchestratorState.COMPLETED);
    const history = sm.getHistory();
    expect(history).toHaveLength(2);
    expect(history[0].from).toBe(WorkflowOrchestratorState.IDLE);
    expect(history[0].to).toBe(WorkflowOrchestratorState.PROCESSING);
  });

  it("should allow IDLE → TERMINATED", () => {
    sm.transition(WorkflowOrchestratorState.TERMINATED);
    expect(sm.getState()).toBe(WorkflowOrchestratorState.TERMINATED);
  });

  it("should not allow transitions from TERMINATED", () => {
    sm.transition(WorkflowOrchestratorState.TERMINATED);
    expect(sm.canTransition(WorkflowOrchestratorState.IDLE)).toBe(false);
  });
});
