# [ORG-WO-WORKFLOW_ORCHESTRATOR-v0.1.0-P0-T02] Document Canonical Inputs and Outputs

**Issue:** #178 | **Phase:** 0 | **Agent:** webwakaagent4 | **Date:** 2026-02-26

---

## 1. Canonical Inputs

| # | Input Type | Key Fields | Description |
|---|-----------|------------|-------------|
| 1 | RegisterWorkflowRequest | workflow_id, version, steps[], on_failure, requesting_context | Register workflow definition |
| 2 | StartWorkflowRequest | workflow_id, version, instance_id, input, requesting_context | Start workflow instance |
| 3 | CancelWorkflowRequest | instance_id, reason, requesting_context | Cancel running workflow |
| 4 | GetWorkflowRequest | instance_id | Get workflow instance state |
| 5 | ListWorkflowsRequest | workflow_id, state_filter, cursor, limit | List workflow instances |
| 6 | ResumeWorkflowRequest | instance_id, step_id, result, requesting_context | Resume paused workflow step |
| 7 | RetryStepRequest | instance_id, step_id, requesting_context | Retry a failed step |

## 2. Canonical Outputs

| # | Output Type | Fields |
|---|-----------|--------|
| 1 | WorkflowDefinition | workflow_id, version, steps[], on_failure, created_at |
| 2 | WorkflowInstance | instance_id, workflow_id, version, state, current_step, input, output, started_at, completed_at |
| 3 | StepExecution | step_id, instance_id, state, input, output, error, started_at, completed_at, attempt |
| 4 | WorkflowPage | instances[], next_cursor, total_count |

## 3. Error Codes

| Code | Description |
|------|-------------|
| WORKFLOW_NOT_FOUND | Workflow definition does not exist |
| INSTANCE_NOT_FOUND | Workflow instance does not exist |
| WORKFLOW_ALREADY_REGISTERED | Workflow version already registered |
| INSTANCE_NOT_RUNNING | Instance not in a state that allows this operation |
| STEP_NOT_FOUND | Step ID does not exist in workflow |
| INVALID_WORKFLOW_DEFINITION | Workflow definition fails validation |
| COMPENSATION_FAILED | Compensating action itself failed |
| INSTANCE_ALREADY_CANCELLED | Instance is already cancelled |

**Unblocks:** #179

*Executed by webwakaagent4 under the WebWaka Autonomous Platform Construction System.*
