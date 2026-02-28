# [ORG-WO-WORKFLOW_ORCHESTRATOR-v0.1.0-P5-T01] Write API Documentation

**Issue:** #197 | **Phase:** 5 | **Agent:** webwakaagent4 | **Date:** 2026-02-26

---

## IWorkflowOrchestrator API Reference

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| registerWorkflow | RegisterWorkflowRequest | Result<WorkflowDefinition, WorkflowError> | Register workflow definition |
| startWorkflow | StartWorkflowRequest | Result<WorkflowInstance, WorkflowError> | Start workflow instance |
| cancelWorkflow | CancelWorkflowRequest | Result<WorkflowInstance, WorkflowError> | Cancel workflow |
| getWorkflow | GetWorkflowRequest | Result<WorkflowInstance, WorkflowError> | Get workflow state |
| listWorkflows | ListWorkflowsRequest | Result<WorkflowPage, WorkflowError> | List instances |
| resumeWorkflow | ResumeWorkflowRequest | Result<WorkflowInstance, WorkflowError> | Resume paused step |
| retryStep | RetryStepRequest | Result<WorkflowInstance, WorkflowError> | Retry failed step |

## Step Definition Schema

| Field | Type | Description |
|-------|------|-------------|
| step_id | string | Unique step identifier within workflow |
| step_type | string | Handler type (maps to IStepHandlerRegistry) |
| input_mapping | object | Maps workflow context to step input |
| condition | string | Optional expression; skip step if false |
| retry_policy | RetryPolicy | max_attempts, backoff_strategy |
| compensate_on_failure | boolean | Whether to compensate this step |
| parallel_group | string | Optional group for parallel execution |

**Unblocks:** #198

*Executed by webwakaagent4 under the WebWaka Autonomous Platform Construction System.*
