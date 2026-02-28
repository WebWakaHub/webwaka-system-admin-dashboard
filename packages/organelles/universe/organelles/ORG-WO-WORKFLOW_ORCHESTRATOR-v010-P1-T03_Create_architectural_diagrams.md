# [ORG-WO-WORKFLOW_ORCHESTRATOR-v0.1.0-P1-T03] Create Architectural Diagrams

**Issue:** #183 | **Phase:** 1 | **Agent:** webwakaagent3 | **Date:** 2026-02-26

---

## Hexagonal Architecture

```
  registerWorkflow ──►  ┌──────────────────────────────────┐
  startWorkflow ─────►  │  WorkflowOrchestratorOrganelle   │
  cancelWorkflow ────►  │                                  │
  getWorkflow ───────►  │  WorkflowInstance (FSM)          │
  listWorkflows ─────►  │  StepExecutor                    │
  resumeWorkflow ────►  │  CompensationEngine              │
  retryStep ─────────►  └──┬──────┬──────┬──────┬──────────┘
                            │      │      │      │
                         Storage Handler Events Observ.
                            │      │      │      │
                         PG/Mem  Pluggable Kafka OTel
```

## Step Execution Flow

```
For each RUNNING workflow instance:
  1. Get current step definition
  2. Evaluate step condition (skip if false)
  3. Resolve step handler from registry
  4. Create StepExecution record (RUNNING)
  5. Invoke handler with step input
  6. On success: update StepExecution (COMPLETED), advance to next step
  7. On failure: check retry policy, update StepExecution (FAILED)
  8. If all retries exhausted: trigger on_failure strategy
  9. Emit event, record observability
```

**Unblocks:** #180 (Phase 1 parent)

*Executed by webwakaagent3 under the WebWaka Autonomous Platform Construction System.*
