# [ORG-IN-INSTRUMENTATION_PROBE-v0.1.0-P0-T02] Specification Task 2

**Structure:** ORG-IN-INSTRUMENTATION_PROBE-v0.1.0
**Layer:** Organelle
**Issue:** webwaka-organelle-universe#468
**Repository:** WebWakaHub/webwaka-organelle-universe
**Type:** Specification
**Phase:** P0 — Specification | Task: T02
**Executing Agent:** webwakaagent4 (Engineering & Delivery)
**Depends On:** #467 (P0-T01 — Purpose & Scope)
**Unblocks:** #469 (P0-T03 — Invariants & Constraints)

---

## 1. Canonical Inputs

The Instrumentation Probe receives the following canonical inputs from its host component and the execution environment:

### 1.1 Execution Context (Required)

| Field | Type | Description |
|:---|:---|:---|
| `tenantId` | `string` | Tenant identifier for multi-tenant telemetry isolation |
| `correlationId` | `string` | Request-scoped correlation ID for distributed tracing |
| `actorId` | `string` | Identity of the user or system actor initiating the operation |
| `traceParent` | `string \| null` | W3C `traceparent` header from incoming request (null if root span) |
| `traceState` | `string \| null` | W3C `tracestate` header for vendor-specific trace context |
| `sessionId` | `string \| null` | Client session ID for session-scoped metric aggregation |

### 1.2 Probe Configuration (Required at initialization)

| Field | Type | Default | Description |
|:---|:---|:---|:---|
| `componentName` | `string` | — | Canonical name of the host component (e.g., `cel-cmdprocess`) |
| `layer` | `enum` | — | Biological layer: `organelle`, `cell`, `tissue`, `organ`, `system` |
| `mode` | `enum` | `saas` | Operational mode: `saas`, `enterprise`, `offline` |
| `emissionInterval` | `number` | `10000` | Metric flush interval in milliseconds (30000 in offline mode) |
| `bufferMaxSize` | `number` | `10485760` | Max offline buffer size in bytes (10MB default) |
| `healthCheckInterval` | `number` | `30000` | Health probe interval in milliseconds |
| `enableTracing` | `boolean` | `true` | Whether distributed tracing is enabled |
| `enableMetrics` | `boolean` | `true` | Whether metric collection is enabled |
| `enableLogging` | `boolean` | `true` | Whether structured logging is enabled |
| `samplingRate` | `number` | `1.0` | Trace sampling rate (0.0 to 1.0) |

### 1.3 Lifecycle Hooks (Provided by host)

The host component provides lifecycle hooks that the probe attaches to:

| Hook | Trigger | Data Provided |
|:---|:---|:---|
| `onOperationStart` | Before an operation begins | Operation name, input metadata |
| `onOperationEnd` | After an operation completes | Duration, result status, output metadata |
| `onOperationError` | When an operation fails | Error type, error message, stack trace |
| `onStateChange` | When host state transitions | Previous state, new state |
| `onHealthCheck` | When health probe fires | Component readiness, liveness status |

---

## 2. Canonical Outputs

The Instrumentation Probe emits the following canonical outputs through its telemetry port:

### 2.1 Metrics

All metrics follow the naming convention `webwaka.<layer>.<component>.<metric>`.

| Metric Name Pattern | Type | Unit | Description |
|:---|:---|:---|:---|
| `webwaka.<layer>.<component>.operation.duration` | Histogram | milliseconds | Operation execution time distribution |
| `webwaka.<layer>.<component>.operation.count` | Counter | count | Total operations executed |
| `webwaka.<layer>.<component>.operation.error_count` | Counter | count | Total failed operations |
| `webwaka.<layer>.<component>.operation.error_rate` | Gauge | ratio (0-1) | Current error rate (rolling window) |
| `webwaka.<layer>.<component>.health.status` | Gauge | enum (0/1/2) | Health: 0=down, 1=degraded, 2=healthy |
| `webwaka.<layer>.<component>.health.latency` | Gauge | milliseconds | Last health check response time |
| `webwaka.<layer>.<component>.queue.depth` | Gauge | count | Current internal queue depth |
| `webwaka.<layer>.<component>.memory.usage` | Gauge | bytes | Component memory footprint |

### 2.2 Trace Spans

| Field | Type | Description |
|:---|:---|:---|
| `traceId` | `string` | 128-bit trace identifier (hex-encoded) |
| `spanId` | `string` | 64-bit span identifier (hex-encoded) |
| `parentSpanId` | `string \| null` | Parent span for nested operations |
| `operationName` | `string` | Canonical operation name |
| `startTime` | `number` | Unix timestamp in microseconds |
| `duration` | `number` | Span duration in microseconds |
| `status` | `enum` | `OK`, `ERROR`, `UNSET` |
| `attributes` | `Record<string, string>` | Key-value span attributes |
| `events` | `SpanEvent[]` | Timestamped events within the span |

### 2.3 Structured Log Events

| Field | Type | Description |
|:---|:---|:---|
| `timestamp` | `string` | ISO 8601 timestamp |
| `level` | `enum` | `DEBUG`, `INFO`, `WARN`, `ERROR`, `FATAL` |
| `message` | `string` | Human-readable log message |
| `tenantId` | `string` | Tenant context |
| `correlationId` | `string` | Request correlation |
| `component` | `string` | Source component name |
| `layer` | `string` | Biological layer |
| `attributes` | `Record<string, unknown>` | Structured context data |

### 2.4 Health Status

| Field | Type | Description |
|:---|:---|:---|
| `componentName` | `string` | Host component identifier |
| `status` | `enum` | `HEALTHY`, `DEGRADED`, `UNHEALTHY` |
| `liveness` | `boolean` | Whether the component is alive |
| `readiness` | `boolean` | Whether the component can accept work |
| `startupComplete` | `boolean` | Whether initialization has finished |
| `lastCheckTime` | `string` | ISO 8601 timestamp of last check |
| `latencyMs` | `number` | Health check response time |
| `details` | `Record<string, unknown>` | Component-specific health details |

---

## 3. Port Interface Summary

The Instrumentation Probe communicates exclusively through the following port interfaces:

| Port | Direction | Protocol | Description |
|:---|:---|:---|:---|
| `ITelemetryEmitterPort` | Output | Push (async) | Emits metrics, traces, and logs to the backend |
| `IHealthReporterPort` | Output | Pull (sync) | Reports health status on demand |
| `IProbeConfigPort` | Input | Pull (sync) | Receives configuration from the host |
| `ILifecycleHookPort` | Input | Push (callback) | Receives lifecycle events from the host |
| `IOfflineBufferPort` | Internal | Read/Write | Manages local telemetry buffer in offline mode |

---

## 4. Execution Metadata

**Executed by:** webwakaagent4 (Engineering & Delivery Department)
**Agent PAT:** webwakaagent4-specific PAT used for all operations
**Date:** 2026-02-26
**Protocol:** WebWaka Autonomous Execution Protocol (Steps 1-8)
**Constitutional Compliance:** Verified against all 8 core doctrines
**Status:** COMPLETE
