# ORG-RG-GOVERNANCE_REGISTRY-v0.1.0 — P1-T03: Create Architectural Diagrams

## Hexagonal Architecture
```
                    ┌─────────────────────────────────────────┐
                    │       Governance Registry Organelle      │
  ┌──────────┐     │  ┌───────────────────────────────────┐  │     ┌──────────┐
  │Governance │────▶│  │     GovernanceOrchestrator        │  │────▶│  Storage  │
  │Management │     │  │                                   │  │     │   Port   │
  │   Port    │     │  │  ┌─────────────┐ ┌────────────┐  │  │     └──────────┘
  └──────────┘     │  │  │  Rule       │ │ Amendment  │  │  │     ┌──────────┐
  ┌──────────┐     │  │  │  Entity     │ │ Processor  │  │  │────▶│  Event   │
  │Governance │────▶│  │  │  (FSM)     │ │ (Quorum)   │  │  │     │   Port   │
  │  Query    │     │  │  └─────────────┘ └────────────┘  │  │     └──────────┘
  │   Port    │     │  │  ┌─────────────┐ ┌────────────┐  │  │     ┌──────────┐
  └──────────┘     │  │  │ Compliance  │ │ Version    │  │  │────▶│Observ.   │
                    │  │  │  Binder     │ │ Tracker    │  │  │     │   Port   │
                    │  │  └─────────────┘ └────────────┘  │  │     └──────────┘
                    │  └───────────────────────────────────┘  │
                    └─────────────────────────────────────────┘
```

## State Machine Diagram
```
  ┌───────┐  activate   ┌────────┐  deprecate  ┌────────────┐
  │ DRAFT │────────────▶│ ACTIVE │────────────▶│ DEPRECATED │
  └───┬───┘             └────┬───┘             └──────┬─────┘
      │ edit                 │ archive (emergency)    │ archive
      └──▶DRAFT              ▼                        ▼
                        ┌──────────┐            ┌──────────┐
                        │ ARCHIVED │            │ ARCHIVED │
                        └──────────┘            └──────────┘
```
