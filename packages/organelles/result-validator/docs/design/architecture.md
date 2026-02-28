# ResultValidator — Architectural Design

## Component Diagram

```
┌─────────────────────────────────┐
│       ResultValidatorOrchestrator          │
│  ┌──────────┐  ┌────────────┐  │
│  │  State    │  │  Entity    │  │
│  │  Machine  │  │  (Logic)   │  │
│  └──────────┘  └────────────┘  │
│  ┌──────┐  ┌──────┐  ┌──────┐  │
│  │Store │  │Events│  │ Obs. │  │
│  └──────┘  └──────┘  └──────┘  │
└─────────────────────────────────┘
```
