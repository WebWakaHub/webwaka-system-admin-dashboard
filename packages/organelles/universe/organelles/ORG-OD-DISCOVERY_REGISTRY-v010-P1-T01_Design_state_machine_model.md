# ORG-OD-DISCOVERY_REGISTRY-v010-P1-T01: Design State Machine Model

**Acting under Canonical Role: Core Platform Architect**
**Agent: webwakaagent3 — Architecture & System Design**
**Phase: 1 (Design) | Task: T01**

---

## Pre-Execution Checklist

| Check | Status |
|-------|--------|
| Impacted Layer | Organelle |
| Impacted Invariants | INV-S01 through INV-B05 |
| Dependency Awareness | Depends on P0 specification artifacts |
| Phase Alignment | Phase 1 — Design |
| Cross-Category Violation | None |

---

## 1. Service Entry Lifecycle

```
[REGISTERED] --heartbeat--> [REGISTERED] (TTL reset)
[REGISTERED] --ttl_expired--> [EXPIRED]
[REGISTERED] --deregister--> [DEREGISTERED]
[EXPIRED] --re_register--> [REGISTERED]
[EXPIRED] --deregister--> [DEREGISTERED]
[DEREGISTERED] --> (terminal)
```

### State Definitions

| State | Description | Allowed Transitions |
|-------|-------------|-------------------|
| REGISTERED | Service is active and discoverable | heartbeat, ttl_expired, deregister |
| EXPIRED | Service TTL has lapsed, not discoverable | re_register, deregister |
| DEREGISTERED | Service permanently removed | None (terminal) |

### Transition Guards

| Transition | Guard Condition | Side Effects |
|-----------|----------------|--------------|
| register | Valid capabilities, unique ID | Emit ServiceRegistered, index capabilities |
| heartbeat | Service in REGISTERED state | Reset TTL, emit ServiceHealthChanged |
| ttl_expired | Current time > registration_time + TTL | Emit ServiceHealthChanged, remove from discovery |
| re_register | Service in EXPIRED state, valid capabilities | Emit ServiceRegistered, re-index |
| deregister | Service in REGISTERED or EXPIRED state | Emit ServiceDeregistered, remove from index |

## 2. Health Status Sub-Model

| Status | Description |
|--------|-------------|
| HEALTHY | Heartbeat received within TTL window |
| DEGRADED | Heartbeat delayed beyond 80% of TTL |
| UNHEALTHY | No heartbeat, TTL not yet expired |
| EXPIRED | TTL fully expired |
