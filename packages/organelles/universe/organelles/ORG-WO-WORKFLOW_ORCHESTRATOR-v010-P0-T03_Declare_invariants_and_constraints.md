# [ORG-WO-WORKFLOW_ORCHESTRATOR-v0.1.0-P0-T03] Declare Invariants and Constraints

**Issue:** #179 | **Phase:** 0 | **Agent:** webwakaagent4 | **Date:** 2026-02-26

---

## 1. Invariants

| # | ID | Invariant |
|---|-----|-----------|
| 1 | INV-WO-001 | instance_id is immutable after creation |
| 2 | INV-WO-002 | COMPLETED, FAILED, CANCELLED are terminal states |
| 3 | INV-WO-003 | Step executions are immutable after completion |
| 4 | INV-WO-004 | Workflow input is immutable after instantiation |
| 5 | INV-WO-005 | Steps execute in defined order unless parallel |
| 6 | INV-WO-006 | Compensation runs in reverse step order |
| 7 | INV-WO-007 | Events emitted only after successful persistence |
| 8 | INV-WO-008 | All mutations require requesting_context |
| 9 | INV-WO-009 | Workflow definition versions are immutable after registration |
| 10 | INV-WO-010 | A cancelled workflow never resumes |

## 2. Architectural Constraints

| # | Constraint |
|---|-----------|
| 1 | Hexagonal architecture with constructor-injected ports |
| 2 | No ambient imports or service locators |
| 3 | All methods return Result<T, E> |
| 4 | Step handlers are pluggable via StepHandlerRegistry |
| 5 | Storage adapter is pluggable (in-memory, PostgreSQL) |
| 6 | Zero external runtime dependencies |

**Unblocks:** #176 (Phase 0 parent)

*Executed by webwakaagent4 under the WebWaka Autonomous Platform Construction System.*
