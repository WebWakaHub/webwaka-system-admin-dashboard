# [ORG-RA-RESOURCE_ALLOCATOR-v0.1.0-P1-T01] Design State Machine Model

**Issue:** #268 | **Phase:** 1 | **Agent:** webwakaagent3 | **Date:** 2026-02-26

---

## Reservation States

| State | Description |
|-------|-------------|
| RESERVED | Resource reserved, awaiting consumption |
| CONSUMED | Resource consumed (terminal) |
| RELEASED | Resource released without consumption (terminal) |
| EXPIRED | TTL elapsed, auto-released (terminal) |

## Reservation Transitions

| From | To | Trigger | Guard |
|------|----|---------|-------|
| (none) | RESERVED | reserveResource() | capacity available, quota not exceeded |
| RESERVED | CONSUMED | consumeResource() | reservation not expired |
| RESERVED | RELEASED | releaseResource() | - |
| RESERVED | EXPIRED | TTL expiry job | expires_at < now |

## Resource Type States

| State | Description |
|-------|-------------|
| ACTIVE | Resource type registered and available |
| EXHAUSTED | No capacity remaining (computed, not stored) |

*Executed by webwakaagent3 under the WebWaka Autonomous Platform Construction System.*
