# BoundaryContext Organelle

**Organelle ID:** ORG-TB-BOUNDARY_CONTEXT-v0.1.0
**Version:** 0.1.0
**Layer:** Organelle (Biological Hierarchy)

## Overview

The BoundaryContext organelle provides a self-contained functional unit within the WebWaka biological hierarchy. It manages bounded contexts, defining clear boundaries between different domain areas and ensuring proper context isolation.

## Quick Start

```typescript
import { BoundaryContextOrchestrator } from "@webwaka/organelle-boundary-context";

const orch = new BoundaryContextOrchestrator({ id: "my-boundary-context", name: "My BoundaryContext", maxConcurrency: 5, timeoutMs: 30000, retryPolicy: { maxRetries: 3, backoffMs: 100, backoffMultiplier: 2 } });
const result = await orch.execute({ type: "DEFINE_BOUNDARY", payload: { name: "user-domain" }, correlationId: "corr-001", timestamp: Date.now() });
```

## API

| Method | Returns | Description |
|:-------|:--------|:------------|
| `execute(cmd)` | `Promise<Result>` | Execute command |
| `query(q)` | `QueryResult` | Query state |
| `getState()` | `State` | Current state |
| `getMetrics()` | `Metrics` | Operation metrics |
| `getTelemetry()` | `Telemetry` | Telemetry data |

## Testing

```bash
npm test
```
