# [ORG-ES-SCHEDULER_EXECUTOR-v0.1.0-P1-T01] Design State Machine Model

**Issue:** #152 | **Phase:** 1 | **Agent:** webwakaagent3 | **Date:** 2026-02-26

---

## Task Lifecycle States

| State | Description |
|-------|-------------|
| PENDING | Task scheduled, awaiting execution |
| RUNNING | Task currently executing |
| COMPLETED | Task executed successfully |
| FAILED | Task execution failed, may retry |
| RETRYING | Task queued for retry after backoff |
| CANCELLED | Task explicitly cancelled (terminal) |

## State Transitions

| From | To | Trigger | Guard |
|------|----|---------|-------|
| (none) | PENDING | scheduleTask() | valid schedule, queue active |
| PENDING | RUNNING | executor picks up task | next_run_at <= now |
| RUNNING | COMPLETED | execution succeeds | - |
| RUNNING | FAILED | execution fails | retry_count >= max_retries |
| RUNNING | RETRYING | execution fails | retry_count < max_retries |
| RETRYING | PENDING | backoff expires | - |
| PENDING | CANCELLED | cancelTask() | requesting_context authorized |
| RETRYING | CANCELLED | cancelTask() | requesting_context authorized |

## Queue States

| State | Description |
|-------|-------------|
| ACTIVE | Queue accepting and executing tasks |
| PAUSED | Queue accepting but not executing tasks |

**Unblocks:** #153

*Executed by webwakaagent3 under the WebWaka Autonomous Platform Construction System.*
