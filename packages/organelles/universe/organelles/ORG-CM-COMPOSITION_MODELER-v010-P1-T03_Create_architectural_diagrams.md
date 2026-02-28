# ORG-CM-COMPOSITION_MODELER-v0.1.0 — P1-T03: Create Architectural Diagrams

## Hexagonal Architecture
```
                    ┌─────────────────────────────────────────┐
                    │        Composition Modeler Organelle     │
  ┌──────────┐     │  ┌───────────────────────────────────┐  │     ┌──────────┐
  │Composition│────▶│  │     CompositionOrchestrator       │  │────▶│  Storage  │
  │Management │     │  │                                   │  │     │   Port   │
  │   Port    │     │  │  ┌─────────────┐ ┌────────────┐  │  │     └──────────┘
  └──────────┘     │  │  │Composition  │ │ Dependency │  │  │     ┌──────────┐
  ┌──────────┐     │  │  │  Entity     │ │ Resolver   │  │  │────▶│  Event   │
  │Composition│────▶│  │  │  (FSM)     │ │ (Kahn's)   │  │  │     │   Port   │
  │  Query    │     │  │  └─────────────┘ └────────────┘  │  │     └──────────┘
  │   Port    │     │  │  ┌─────────────┐ ┌────────────┐  │  │     ┌──────────┐
  └──────────┘     │  │  │Port Compat  │ │ Topology   │  │  │────▶│Observ.   │
                    │  │  │ Checker     │ │ Validator  │  │  │     │   Port   │
                    │  │  └─────────────┘ └────────────┘  │  │     └──────────┘
                    │  └───────────────────────────────────┘  │
                    └─────────────────────────────────────────┘
```

## State Machine Diagram
```
  ┌───────┐  validate_success  ┌───────────┐  deploy  ┌──────────┐
  │ DRAFT │───────────────────▶│ VALIDATED │────────▶│ DEPLOYED │
  │       │◀───────────────────│           │         │          │
  └───┬───┘    invalidate      └─────┬─────┘         └────┬─────┘
      │                              │ archive             │ archive
      │          modify              ▼                     ▼
      └──────────┐            ┌──────────┐          ┌──────────┐
                 │            │ ARCHIVED │◀─────────│ ARCHIVED │
                 └───▶DRAFT   └──────────┘          └──────────┘
```
