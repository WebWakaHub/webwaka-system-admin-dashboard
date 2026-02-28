# [ORG-ES-SCHEDULER_EXECUTOR-v0.1.0-P0-T02] Document Canonical Inputs and Outputs

**Issue:** #149 | **Phase:** 0 | **Agent:** webwakaagent4 | **Date:** 2026-02-26

---

## 1. Canonical Inputs

| # | Input Type | Key Fields | Description |
|---|-----------|------------|-------------|
| 1 | ScheduleTaskRequest | task_id, payload, schedule_type (ONCE/CRON/DELAY), schedule_expr, priority, max_retries, backoff_strategy, requesting_context | Schedule a task |
| 2 | CancelTaskRequest | task_id, requesting_context | Cancel a pending/recurring task |
| 3 | GetTaskRequest | task_id | Get task state and history |
| 4 | ListTasksRequest | queue_id, state_filter, cursor, limit | List tasks |
| 5 | RetryTaskRequest | task_id, requesting_context | Manually trigger retry |
| 6 | PauseQueueRequest | queue_id, requesting_context | Pause a queue |
| 7 | ResumeQueueRequest | queue_id, requesting_context | Resume a paused queue |

## 2. Canonical Outputs

| # | Output Type | Fields |
|---|-----------|--------|
| 1 | ScheduledTask | task_id, queue_id, payload, state, priority, schedule_type, schedule_expr, next_run_at, retry_count, max_retries, created_at |
| 2 | ExecutionRecord | execution_id, task_id, started_at, completed_at, result, error, attempt_number |
| 3 | TaskPage | tasks[], next_cursor, total_count |
| 4 | QueueStatus | queue_id, state, pending_count, running_count, paused |

## 3. Error Codes

| Code | Description |
|------|-------------|
| TASK_NOT_FOUND | Task ID does not exist |
| TASK_ALREADY_CANCELLED | Task is already in CANCELLED state |
| TASK_ALREADY_COMPLETED | Task is already in COMPLETED state |
| INVALID_CRON_EXPRESSION | Cron expression cannot be parsed |
| INVALID_SCHEDULE | Schedule parameters are invalid |
| QUEUE_NOT_FOUND | Queue ID does not exist |
| QUEUE_PAUSED | Task cannot be scheduled to a paused queue |
| MAX_RETRIES_EXCEEDED | Task has exhausted all retry attempts |

**Unblocks:** #150

*Executed by webwakaagent4 under the WebWaka Autonomous Platform Construction System.*
