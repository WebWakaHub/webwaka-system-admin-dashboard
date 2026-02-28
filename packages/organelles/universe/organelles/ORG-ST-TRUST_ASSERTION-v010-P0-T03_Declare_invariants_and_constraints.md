# [ORG-ST-TRUST_ASSERTION-v0.1.0-P0-T03] Declare Invariants and Constraints

**Issue:** #121 | **Phase:** 0 | **Agent:** webwakaagent4 | **Date:** 2026-02-26

---

## 1. Invariants

| # | ID | Invariant |
|---|-----|-----------|
| 1 | INV-TA-001 | assertion_id is immutable after creation |
| 2 | INV-TA-002 | Signatures are generated using registered keys only |
| 3 | INV-TA-003 | Revoked assertions cannot be un-revoked |
| 4 | INV-TA-004 | Expired assertions always fail verification |
| 5 | INV-TA-005 | Trust anchors are append-only (cannot be modified, only deactivated) |
| 6 | INV-TA-006 | Key pairs: private key never exposed via any interface |
| 7 | INV-TA-007 | Chain validation requires unbroken path to trust anchor |
| 8 | INV-TA-008 | Events emitted only after successful persistence |
| 9 | INV-TA-009 | All signing operations require requesting_context |
| 10 | INV-TA-010 | Assertion scope is immutable after creation |

## 2. Architectural Constraints

| # | Constraint |
|---|-----------|
| 1 | Hexagonal architecture with constructor-injected ports |
| 2 | No ambient imports or service locators |
| 3 | All methods return Result<T, E> |
| 4 | Crypto adapter is pluggable (WebCrypto, Node crypto, libsodium) |
| 5 | Storage adapter is pluggable |
| 6 | Zero external runtime dependencies |

**Unblocks:** #118 (Phase 0 parent)

*Executed by webwakaagent4 under the WebWaka Autonomous Platform Construction System.*
