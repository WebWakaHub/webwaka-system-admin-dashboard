# InstrumentationProbe Organelle

**Organelle ID:** ORG-IN-INSTRUMENTATION_PROBE-v0.1.0
**Version:** 0.1.0
**Layer:** Organelle (AI Cognitive Fabric)

## Overview

The InstrumentationProbe organelle provides a self-contained functional unit within the WebWaka AI Cognitive Fabric.

## Quick Start

```typescript
import { InstrumentationProbeOrchestrator } from "@webwaka/organelle-instrumentation-probe";

const orch = new InstrumentationProbeOrchestrator({ id: "my-instrumentation-probe", name: "My InstrumentationProbe", maxConcurrency: 5, timeoutMs: 30000, retryPolicy: { maxRetries: 3, backoffMs: 100, backoffMultiplier: 2 } });
const result = await orch.execute({ type: "CREATE", payload: { name: "example" }, correlationId: "corr-001", timestamp: Date.now() });
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
