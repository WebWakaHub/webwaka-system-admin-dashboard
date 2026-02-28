# BoundaryContext — Architectural Design

## Component Diagram

```
┌─────────────────────────────────────┐
│       BoundaryContextOrchestrator              │
│  ┌──────────┐  ┌────────────────┐  │
│  │  State    │  │  BoundaryContextEntity    │  │
│  │  Machine  │  │  (Core Logic)  │  │
│  └──────────┘  └────────────────┘  │
│  ┌──────────┐  ┌──────┐  ┌──────┐  │
│  │ Storage  │  │Events│  │ Obs. │  │
│  └──────────┘  └──────┘  └──────┘  │
└─────────────────────────────────────┘
```

## Design Principles

- Single Responsibility: Each component handles one concern
- Dependency Injection: All dependencies injected via constructor
- Interface Segregation: Minimal interfaces per consumer
