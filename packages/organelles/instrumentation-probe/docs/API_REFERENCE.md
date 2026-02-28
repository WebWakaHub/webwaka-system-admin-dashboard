# ORG-IN-INSTRUMENTATION_PROBE-v0.1.0 — API Reference

> **Agent:** webwakaagent4 (Engineering & Delivery)
> **Issue:** webwaka-organelle-universe#487 (P5-T01)

## Overview

The Instrumentation Probe organelle provides observability primitives — metrics, distributed tracing, and structured logging — for all WebWaka platform components. It operates in both online and offline modes (Nigeria First doctrine), supports multi-tenant isolation, and emits telemetry in W3C-compliant formats.

---

## Core Classes

### `InstrumentationProbe`

The primary entry point for all instrumentation operations.

#### Constructor

```typescript
constructor(
  emitter: ITelemetryEmitterPort,
  buffer: IOfflineBufferPort,
  health: IHealthReporterPort,
  propagator: IContextPropagatorPort,
  tenant: ITenantContextPort,
)
```

#### State Machine

| State | Description | Transitions |
|:---|:---|:---|
| `UNINITIALIZED` | Created but not started | → `ACTIVE` via `initialize()` |
| `ACTIVE` | Fully operational | → `DEGRADED`, `DRAINING`, `SHUTDOWN` |
| `DEGRADED` | Offline/reduced capability | → `ACTIVE`, `SHUTDOWN` |
| `DRAINING` | Flushing remaining data | → `SHUTDOWN` |
| `SHUTDOWN` | Terminated | Terminal state |

#### Methods

| Method | Signature | Description |
|:---|:---|:---|
| `initialize` | `(config: ProbeConfig): Promise<void>` | Start the probe with configuration |
| `shutdown` | `(): Promise<void>` | Gracefully stop the probe, flush pending data |
| `getState` | `(): ProbeState` | Get current state machine state |
| `registerCounter` | `(name: string, description: string): MetricEntry` | Register a counter metric |
| `registerHistogram` | `(name: string, description: string, buckets?: number[]): MetricEntry` | Register a histogram metric |
| `registerGauge` | `(name: string, description: string): MetricEntry` | Register a gauge metric |
| `startSpan` | `(name: string, options?: SpanOptions): SpanData` | Start a new trace span |
| `endSpan` | `(span: SpanData, status: SpanStatus): void` | End a trace span |
| `injectTraceContext` | `(carrier: Record<string, string>): void` | Inject trace context into outbound carrier |
| `extractTraceContext` | `(carrier: Record<string, string>): SpanContext \| null` | Extract trace context from inbound carrier |
| `emitStructuredLog` | `(event: StructuredLogEvent): void` | Emit a structured log event |
| `getHealthStatus` | `(): HealthStatus` | Get probe health status |
| `onOperationStart` | `(id: string, meta: OperationMeta): InstrumentationHandle` | Hook for operation start |
| `onOperationEnd` | `(handle: InstrumentationHandle, result: OperationResult): void` | Hook for operation end |

---

### `MetricRegistry`

Bounded metric storage with LRU eviction.

| Method | Signature | Description |
|:---|:---|:---|
| `register` | `(name: string, type: MetricType, description: string, labels?: string[]): void` | Register a metric |
| `record` | `(name: string, value: number, labels?: Record<string, string>, tenantId?: string): MetricEntry` | Record a value |
| `get` | `(name: string): MetricEntry \| undefined` | Get current metric value |
| `snapshot` | `(): MetricEntry[]` | Take snapshot of all metrics |
| `unregister` | `(name: string): boolean` | Remove a metric |
| `clear` | `(): void` | Clear all metrics |
| `size` | `number` (getter) | Number of registered metrics |

**Invariants:**
- Maximum 1000 metrics (INV-IN-P04)
- Metric names must match `webwaka.<layer>.<component>.<metric>` (INV-IN-P01)
- LRU eviction when capacity reached

---

### `FlushOrchestrator`

Adaptive batch emission engine with bandwidth awareness.

| Method | Signature | Description |
|:---|:---|:---|
| `detectNetworkTier` | `(): Promise<NetworkTier>` | Detect current network conditions |
| `getEffectiveBatchSize` | `(): number` | Get batch size for current tier |
| `flush` | `(queue: EmissionQueueEntry[]): Promise<boolean>` | Flush queued entries |

**Network Tiers:**

| Tier | Condition | Batch Size |
|:---|:---|:---|
| `BROADBAND` | ≥ 1 Mbps | 256 KB |
| `NARROW` | < 1 Mbps | 64 KB |
| `OFFLINE` | No connectivity | Buffer only |

---

### `W3CContextPropagator`

W3C Trace Context specification compliant propagator.

| Method | Signature | Description |
|:---|:---|:---|
| `inject` | `(context: SpanContext, carrier: Record<string, string>): void` | Inject traceparent/tracestate |
| `extract` | `(carrier: Record<string, string>): SpanContext \| null` | Extract from carrier |
| `createRootContext` | `(): SpanContext` | Create new root trace context |

---

## Port Interfaces

| Port | Direction | Purpose |
|:---|:---|:---|
| `ITelemetryEmitterPort` | Outbound | Emit metrics, traces, logs to backend |
| `IOfflineBufferPort` | Outbound | Buffer telemetry for offline mode |
| `IHealthReporterPort` | Outbound | Report probe health status |
| `IContextPropagatorPort` | Outbound | Inject/extract trace context |
| `ITenantContextPort` | Inbound | Get current tenant for isolation |
| `IInstrumentationPort` | Inbound | Primary instrumentation interface |

---

## Error Taxonomy

| Error Class | Code | Description |
|:---|:---|:---|
| `ProbeInitializationError` | `PROBE_INIT` | Probe already initialized or failed to start |
| `InvalidMetricNameError` | `INVALID_METRIC_NAME` | Name doesn't match `webwaka.<layer>.<component>.<metric>` |
| `MetricRegistryFullError` | `REGISTRY_FULL` | Registry at capacity, LRU eviction failed |
| `BufferOverflowError` | `BUFFER_OVERFLOW` | Offline buffer exceeded max size |
| `EmissionTimeoutError` | `EMISSION_TIMEOUT` | Flush exceeded 30s limit (INV-IN-P05) |
| `TracePropagationError` | `TRACE_PROPAGATION` | Invalid trace context injection/extraction |
| `TenantIsolationError` | `TENANT_ISOLATION` | Cross-tenant data access violation |
| `SpanLimitExceededError` | `SPAN_LIMIT` | Too many concurrent spans |
| `InstrumentationProbeError` | `PROBE_ERROR` | Base error class |

---

## Constitutional Invariants

| ID | Invariant | Enforcement |
|:---|:---|:---|
| INV-IN-P01 | Metric names: `webwaka.<layer>.<component>.<metric>` | `MetricRegistry.register()` |
| INV-IN-P02 | Span duration ≥ 0 | `InstrumentationProbe.endSpan()` |
| INV-IN-P03 | Batch size ≤ 64KB | `FlushOrchestrator.flush()` |
| INV-IN-P04 | Registry ≤ 1000 metrics | `MetricRegistry` LRU eviction |
| INV-IN-P05 | Flush latency ≤ 30s | `FlushOrchestrator` timeout |
| INV-IN-P06 | W3C Trace Context compliant | `W3CContextPropagator` |
| INV-IN-P07 | Tenant isolation | `ITenantContextPort` |
| INV-IN-P08 | Buffer ≤ 10MB | `IOfflineBufferPort.setMaxSize()` |
