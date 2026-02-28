# ExternalAdapter — Architectural Design

## Component Diagram

```
┌─────────────────────────────────┐
│       ExternalAdapterOrchestrator          │
│  ┌──────────┐  ┌────────────┐  │
│  │  State    │  │  Entity    │  │
│  │  Machine  │  │  (Logic)   │  │
│  └──────────┘  └────────────┘  │
│  ┌──────┐  ┌──────┐  ┌──────┐  │
│  │Store │  │Events│  │ Obs. │  │
│  └──────┘  └──────┘  └──────┘  │
└─────────────────────────────────┘
```
