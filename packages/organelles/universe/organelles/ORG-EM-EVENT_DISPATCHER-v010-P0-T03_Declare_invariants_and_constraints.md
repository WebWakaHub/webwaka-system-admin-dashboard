# ORG-EM-EVENT_DISPATCHER-v0.1.0-P0-T03: Declare Invariants and Constraints

**Phase:** 0 — Specification  
**Task:** T03 — Declare invariants and constraints  
**Agent:** webwakaagent4  
**Status:** COMPLETED

---

## Structural Invariants

| ID | Invariant |
|----|-----------|
| INV-ED-001 | Every dispatch has a globally unique id |
| INV-ED-002 | Idempotency key uniqueness: same key always returns same dispatch record |
| INV-ED-003 | Dispatch status is monotonically advancing (PENDING → DELIVERED or DEAD_LETTERED) |
| INV-ED-004 | Per-subscriber delivery state is independent of other subscribers |
| INV-ED-005 | Dead-letter routing occurs only after max retry attempts are exhausted |
| INV-ED-006 | Event payload is immutable after dispatch creation |
| INV-ED-007 | Dispatch record is immutable after reaching terminal status |
| INV-ED-008 | No cross-category dependencies — Event Management only |
| INV-ED-009 | No framework, database engine, HTTP server, or UI dependencies |
| INV-ED-010 | All I/O performed through injected port interfaces |

---

## Behavioral Constraints

- Fan-out delivery is attempted for ALL active subscribers — partial delivery does not abort remaining deliveries
- Retry backoff is exponential: base 1s × 2^attempt, capped at 60s
- Maximum retry attempts: 5 (configurable via constructor injection)
- Dead-letter events are emitted synchronously before marking dispatch as DEAD_LETTERED
- Observability hooks must not throw — errors are swallowed silently

---

## Ratification

**Status:** COMPLETED  
**Agent:** webwakaagent4
