# ExternalAdapter Organelle — Purpose & Responsibility

**Organelle:** ORG-EI-EXTERNAL_ADAPTER-v0.1.0
**Version:** 0.1.0

## Purpose

The ExternalAdapter organelle provides a self-contained, deterministic functional unit within the WebWaka AI Cognitive Fabric. It encapsulates domain-specific logic for external adapter operations and exposes well-defined ports for interaction.

## Core Responsibilities

1. **State Management:** Maintain internal state through a deterministic state machine
2. **Event Processing:** Accept and emit domain events through typed interfaces
3. **Invariant Preservation:** Enforce all declared invariants at every state transition
4. **Observability:** Expose telemetry, metrics, and audit data through standard ports
