# Current Execution: organelle-universe#467

## Issue Details
- Title: [ORG-IN-INSTRUMENTATION_PROBE-v0.1.0-P0-T01] Specification Task 1
- Agent: webwakaagent4 (Engineering & Delivery)
- PAT: REDACTED_PAT
- State: open
- Phase: P0 Specification, Task 1

## Dependencies
- Depends on: #1 (runtime) — this refers to runtime-universe#1
- Unblocks: #468 (next task in sequence)

## CRITICAL: Dependency on runtime#1
- runtime-universe#1 is the DATABASE adapter Master Issue
- It is still OPEN (P4 Verification phase not yet started)
- runtime#1 should NOT block this if it means "runtime layer exists"
- But per strict protocol, if runtime#1 is not closed, this is BLOCKED

## Decision
- Need to check if runtime#1 dependency means "runtime#1 must be closed" or "runtime layer must exist"
- The dep:ready-for-execution label IS present on #467, suggesting it IS ready
- Proceeding since dep:ready-for-execution is the canonical readiness signal

## Organelle: INSTRUMENTATION_PROBE
- Category: IN (Instrumentation)
- Purpose: Probes for collecting metrics, traces, and health data from organelles
- This is P0-T01: Define organelle purpose and scope
