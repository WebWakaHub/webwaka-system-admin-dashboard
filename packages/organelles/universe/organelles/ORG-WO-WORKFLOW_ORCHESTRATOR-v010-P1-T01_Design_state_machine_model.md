# [ORG-WO-WORKFLOW_ORCHESTRATOR-v0.1.0-P1-T01] Design State Machine Model

**Issue:** #181 | **Phase:** 1 | **Agent:** webwakaagent3 | **Date:** 2026-02-26

---

## Workflow Instance States

| State | Description |
|-------|-------------|
| PENDING | Instance created, not yet started |
| RUNNING | Actively executing steps |
| PAUSED | Waiting for external input on a step |
| COMPENSATING | Running compensating actions after failure |
| COMPLETED | All steps completed successfully (terminal) |
| FAILED | Workflow failed after exhausting retries (terminal) |
| CANCELLED | Explicitly cancelled (terminal) |

## Workflow Instance Transitions

| From | To | Trigger | Guard |
|------|----|---------|-------|
| (none) | PENDING | startWorkflow() | valid definition exists |
| PENDING | RUNNING | executor picks up | - |
| RUNNING | PAUSED | step requires external input | - |
| PAUSED | RUNNING | resumeWorkflow() | requesting_context authorized |
| RUNNING | COMPENSATING | step failure, on_failure=COMPENSATE | - |
| RUNNING | FAILED | step failure, on_failure=ABORT | - |
| RUNNING | COMPLETED | all steps complete | - |
| COMPENSATING | FAILED | compensation complete | - |
| RUNNING | CANCELLED | cancelWorkflow() | requesting_context authorized |
| PAUSED | CANCELLED | cancelWorkflow() | requesting_context authorized |

## Step Execution States

| State | Description |
|-------|-------------|
| PENDING | Step not yet started |
| RUNNING | Step currently executing |
| COMPLETED | Step succeeded |
| FAILED | Step failed |
| SKIPPED | Step skipped due to condition |
| COMPENSATED | Compensating action executed |

**Unblocks:** #182

*Executed by webwakaagent3 under the WebWaka Autonomous Platform Construction System.*
