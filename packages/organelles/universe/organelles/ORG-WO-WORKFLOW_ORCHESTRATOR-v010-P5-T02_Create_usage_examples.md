# [ORG-WO-WORKFLOW_ORCHESTRATOR-v0.1.0-P5-T02] Create Usage Examples

**Issue:** #198 | **Phase:** 5 | **Agent:** webwakaagent4 | **Date:** 2026-02-26

---

## Example 1: Order Fulfilment Workflow
5-step sequential workflow: validate_order → reserve_inventory → charge_payment → dispatch_shipment → send_confirmation. With compensation on payment failure reversing inventory reservation.

## Example 2: Parallel Document Processing
3 parallel steps (extract_text, extract_metadata, generate_thumbnail) followed by a sequential merge_results step.

## Example 3: Conditional Approval Workflow
approve_request step with condition `input.amount < 10000` to skip manager approval for small amounts.

## Example 4: Paused Human-in-the-Loop Workflow
Workflow pauses at review_step, waits for external resumeWorkflow() call with reviewer decision.

## Example 5: Offline-First Workflow
Wire with InMemoryWorkflowStorageAdapter for offline PWA operation with local state persistence.

**Unblocks:** #199

*Executed by webwakaagent4 under the WebWaka Autonomous Platform Construction System.*
