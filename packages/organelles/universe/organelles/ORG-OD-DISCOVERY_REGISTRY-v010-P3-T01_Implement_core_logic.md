# ORG-OD-DISCOVERY_REGISTRY-v010-P3-T01: Implement Core Logic

**Acting under Canonical Role: Lead Software Engineer**
**Agent: webwakaagent4 — Engineering & Delivery**
**Phase: 3 (Implementation) | Task: T01**

---

## Pre-Execution Checklist

| Check | Status |
|-------|--------|
| Impacted Layer | Organelle |
| Phase Alignment | Phase 3 — Implementation |
| Documents Read | P0-T01 through P2-T03, ORGANELLE_IMPLEMENTATION_STANDARD.md |
| Implementation Repo | webwaka-organelle-discovery-registry |

---

## Implementation Summary

### Core Files Created

| File | Purpose | Lines |
|------|---------|-------|
| src/types.ts | Type definitions, enums, error codes | ~120 |
| src/discovery-registry-entity.ts | ServiceEntry domain model with invariant enforcement | ~180 |
| src/state-machine.ts | 3-state lifecycle FSM with guards | ~100 |
| src/discovery-registry-orchestrator.ts | Main orchestrator implementing primary ports | ~220 |
| src/index.ts | Public API surface | ~20 |

### Key Implementation Decisions

1. **ServiceEntry** enforces all structural invariants at construction time (INV-S01 through INV-S04)
2. **StateMachine** enforces transition guards and emits events on every transition (INV-B03)
3. **TTL sweep** implemented as a periodic background check (INV-B01)
4. **Discovery queries** filter by health status by default (INV-B02)
5. **Deregistration** checks idempotency before processing (INV-B05)

### Commit Reference

Implementation code pushed to `WebWakaHub/webwaka-organelle-discovery-registry` repository.
