# ORG-OD-DISCOVERY_REGISTRY-v010-P1-T03: Create Architectural Diagrams

**Acting under Canonical Role: Core Platform Architect**
**Agent: webwakaagent3 — Architecture & System Design**
**Phase: 1 (Design) | Task: T03**

---

## 1. Hexagonal Architecture Diagram

```
                    ┌─────────────────────────────────────┐
                    │     Discovery Registry Organelle     │
                    │                                     │
  ┌──────────┐     │  ┌─────────────────────────────┐   │
  │ Register │────▶│  │    Registration Handler      │   │
  │ Service  │     │  └──────────┬──────────────────┘   │
  └──────────┘     │             │                       │
                    │             ▼                       │
  ┌──────────┐     │  ┌─────────────────────────────┐   │     ┌──────────┐
  │ Discover │────▶│  │   Service Entry Entity       │───│────▶│ Storage  │
  │ Services │     │  │   (State Machine Core)       │   │     │  Port    │
  └──────────┘     │  └──────────┬──────────────────┘   │     └──────────┘
                    │             │                       │
  ┌──────────┐     │             ▼                       │     ┌──────────┐
  │ Heartbeat│────▶│  ┌─────────────────────────────┐   │────▶│  Event   │
  │          │     │  │   Capability Index            │   │     │  Port    │
  └──────────┘     │  └─────────────────────────────┘   │     └──────────┘
                    │                                     │
                    │                                     │     ┌──────────┐
                    │                                     │────▶│Observ.   │
                    │                                     │     │  Port    │
                    └─────────────────────────────────────┘     └──────────┘
```

## 2. State Machine Diagram

```
  ┌────────────┐   register    ┌──────────────┐
  │            │──────────────▶│  REGISTERED   │◀──┐
  │  (start)   │               │              │   │ heartbeat
  └────────────┘               └──┬───┬───────┘───┘
                                  │   │
                     ttl_expired  │   │ deregister
                                  ▼   ▼
                          ┌──────────────────┐
                          │    EXPIRED       │
                          └──────┬───────────┘
                                 │ deregister
                                 ▼
                          ┌──────────────────┐
                          │  DEREGISTERED    │
                          │   (terminal)     │
                          └──────────────────┘
```

## 3. Data Flow Diagram

```
Client ──▶ RegisterServiceCommand ──▶ RegistrationHandler ──▶ ServiceEntry.register()
                                                                    │
                                                    ┌───────────────┼───────────────┐
                                                    ▼               ▼               ▼
                                              StoragePort     EventPort      ObservabilityPort
                                              (persist)    (ServiceRegistered)  (metrics)
```
