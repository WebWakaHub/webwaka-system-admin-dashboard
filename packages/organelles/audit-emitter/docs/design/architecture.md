# AuditEmitter — Architectural Design

## Component Diagram

```
┌─────────────────────────────────┐
│       AuditEmitterOrchestrator          │
│  ┌──────────┐  ┌────────────┐  │
│  │  State    │  │  Entity    │  │
│  │  Machine  │  │  (Logic)   │  │
│  └──────────┘  └────────────┘  │
│  ┌──────┐  ┌──────┐  ┌──────┐  │
│  │Store │  │Events│  │ Obs. │  │
│  └──────┘  └──────┘  └──────┘  │
└─────────────────────────────────┘
```
