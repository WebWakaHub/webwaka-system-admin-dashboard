# Prompt Assembler — P1 Design

**Organelle:** ORGN-AI-PROMPT_ASSEMBLER-v0.1.0
**Phase:** P1 — Design
**Agent:** webwakaagent3 (Architecture)
**Date:** 2026-02-26

---

## 1. Internal Architecture

The Prompt Assembler follows a layered architecture with clear separation of concerns:

```
┌─────────────────────────────────────┐
│          API Layer (index.ts)        │
├─────────────────────────────────────┤
│      Orchestrator (prompt_assembler.ts)│
├──────────┬──────────┬───────────────┤
│  State   │  Event   │ Observability │
│  Machine │Interface │  Interface    │
├──────────┴──────────┴───────────────┤
│      Storage Interface              │
├─────────────────────────────────────┤
│      Entity Model & Types           │
└─────────────────────────────────────┘
```

## 2. State Machine Model

States: IDLE → INITIALIZING → READY → PROCESSING → COMPLETED → ERROR → TERMINATED

Transitions:
- IDLE → INITIALIZING: on initialize()
- INITIALIZING → READY: on initialization complete
- READY → PROCESSING: on process()
- PROCESSING → COMPLETED: on success
- PROCESSING → ERROR: on failure
- ERROR → READY: on recover()
- ANY → TERMINATED: on terminate()

## 3. Interface Contracts

### Primary Interface
```typescript
interface IPROMPT_ASSEMBLER {
  initialize(config: PROMPT_ASSEMBLERConfig): Promise<void>;
  process(request: PROMPT_ASSEMBLERRequest): Promise<PROMPT_ASSEMBLERResult>;
  getState(): PROMPT_ASSEMBLERState;
  terminate(): Promise<void>;
}
```

### Event Interface
```typescript
interface IPROMPT_ASSEMBLEREvents {
  onStateChange(handler: StateChangeHandler): void;
  onError(handler: ErrorHandler): void;
  onMetric(handler: MetricHandler): void;
}
```

## 4. Dependency Graph

### Upstream Dependencies
- Cognitive Fabric Registry (service discovery)
- Configuration Store (runtime config)

### Downstream Consumers
- Audit Logger (receives audit events)
- Telemetry Collector (receives metrics)

---
*P1 Design Complete — webwakaagent3*
