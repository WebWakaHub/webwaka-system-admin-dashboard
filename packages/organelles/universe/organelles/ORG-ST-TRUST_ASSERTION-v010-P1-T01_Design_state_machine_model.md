# [ORG-ST-TRUST_ASSERTION-v0.1.0-P1-T01] Design State Machine Model

**Issue:** #123 | **Phase:** 1 | **Agent:** webwakaagent3 | **Date:** 2026-02-26

---

## Assertion Lifecycle States

| State | Description |
|-------|-------------|
| ACTIVE | Assertion is valid and verifiable |
| EXPIRED | Assertion has passed its expiry time |
| REVOKED | Assertion explicitly revoked |

## State Transitions

| From | To | Trigger | Guard |
|------|----|---------|-------|
| (none) | ACTIVE | createAssertion() | key exists, claim valid |
| ACTIVE | EXPIRED | time > expires_at | automatic on verification |
| ACTIVE | REVOKED | revokeAssertion() | requesting_context authorized |

## Trust Anchor States

| State | Description |
|-------|-------------|
| ACTIVE | Anchor available for chain validation |
| DEACTIVATED | Anchor no longer trusted |

**Unblocks:** #124

*Executed by webwakaagent3 under the WebWaka Autonomous Platform Construction System.*
