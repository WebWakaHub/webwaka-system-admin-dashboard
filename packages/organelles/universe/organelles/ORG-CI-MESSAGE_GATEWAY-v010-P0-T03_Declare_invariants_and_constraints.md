# [ORG-CI-MESSAGE_GATEWAY-v0.1.0-P0-T03] Declare Invariants and Constraints

**Issue:** #208 | **Phase:** 0 | **Agent:** webwakaagent4 | **Date:** 2026-02-26

---

## 1. Invariants

| # | ID | Invariant |
|---|-----|-----------|
| 1 | INV-MG-001 | message_id is immutable after creation |
| 2 | INV-MG-002 | DELIVERED and FAILED are terminal states |
| 3 | INV-MG-003 | Idempotency key uniquely maps to one message |
| 4 | INV-MG-004 | Message payload is immutable after creation |
| 5 | INV-MG-005 | Events emitted only after successful persistence |
| 6 | INV-MG-006 | All mutations require requesting_context |
| 7 | INV-MG-007 | Channel config is immutable after registration |
| 8 | INV-MG-008 | Retry only allowed on FAILED messages |
| 9 | INV-MG-009 | Inbound messages are normalized before storage |

## 2. Architectural Constraints

- Hexagonal architecture with constructor-injected ports
- Pluggable channel adapters via IChannelAdapterRegistry
- All methods return Result<T, E>
- Zero external runtime dependencies in core

**Unblocks:** #205 (Phase 0 parent)

*Executed by webwakaagent4 under the WebWaka Autonomous Platform Construction System.*
