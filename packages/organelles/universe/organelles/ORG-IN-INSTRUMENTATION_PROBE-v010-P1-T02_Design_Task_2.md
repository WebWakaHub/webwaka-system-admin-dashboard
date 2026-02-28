# [ORG-IN-INSTRUMENTATION_PROBE-v0.1.0-P1-T02] Design Task 2 — Interface Contracts

**Structure:** ORG-IN-INSTRUMENTATION_PROBE-v0.1.0
**Layer:** Organelle
**Issue:** webwaka-organelle-universe#472
**Repository:** WebWakaHub/webwaka-organelle-universe
**Type:** Design
**Phase:** P1 — Design | Task: T02
**Executing Agent:** webwakaagent3 (Architecture & System Design)
**Depends On:** #471 (P1-T01 — State Machine Model)
**Unblocks:** #473 (P1-T03 — Data Flow Design)

---

## 1. Port Interface Contracts

All port interfaces follow the Hexagonal Architecture pattern. The Instrumentation Probe defines 5 outbound ports (required by the probe, provided by the host environment) and 1 inbound port (provided by the probe to host components).

### 1.1 Inbound Port — IInstrumentationProbePort

This is the primary interface that host components use to interact with the probe.

```typescript
interface IInstrumentationProbePort {
  // Lifecycle
  initialize(config: ProbeConfig): Promise<void>;
  shutdown(): Promise<void>;
  getState(): ProbeState;

  // Metrics
  registerCounter(name: string, description: string, labels?: string[]): CounterHandle;
  registerHistogram(name: string, description: string, buckets: number[]): HistogramHandle;
  registerGauge(name: string, description: string): GaugeHandle;

  // Tracing
  startSpan(name: string, options?: SpanOptions): SpanContext;
  endSpan(context: SpanContext, status: SpanStatus): void;
  injectTraceContext(carrier: Record<string, string>): void;
  extractTraceContext(carrier: Record<string, string>): SpanContext | null;

  // Logging
  emitStructuredLog(event: StructuredLogEvent): void;

  // Health
  getHealthStatus(): HealthStatus;

  // Lifecycle hooks
  onOperationStart(operationId: string, metadata: OperationMetadata): InstrumentationHandle;
  onOperationEnd(handle: InstrumentationHandle, result: OperationResult): void;
}
```

**Contract Rules:**
- `initialize()` MUST be called before any other method (except `getState()`)
- `registerCounter/Histogram/Gauge` MUST reject names not matching `^webwaka\.[a-z]+\.[a-z_]+\.[a-z_.]+$`
- `startSpan` MUST propagate W3C Trace Context when `options.propagate` is true
- `emitStructuredLog` MUST NOT block the caller for more than 0.1ms
- `onOperationStart/End` MUST NOT modify the host operation's return value or side effects

### 1.2 Outbound Port — ITelemetryEmitterPort

Provided by the host environment to transport telemetry to the backend.

```typescript
interface ITelemetryEmitterPort {
  emitMetrics(batch: MetricBatch): Promise<EmissionResult>;
  emitTraces(spans: SpanData[]): Promise<EmissionResult>;
  emitLogs(events: StructuredLogEvent[]): Promise<EmissionResult>;
  isAvailable(): Promise<boolean>;
  getBackendInfo(): BackendInfo;
}
```

**Contract Rules:**
- `emitMetrics` batch size MUST NOT exceed 64KB serialized (INV-IN-P03)
- `isAvailable()` MUST resolve within 5 seconds
- All emit methods MUST be idempotent (re-sending the same batch produces no duplicates)
- Transport MUST use TLS 1.2+ when not in offline mode (INV-IN-S04)

### 1.3 Outbound Port — IOfflineBufferPort

Provides persistent offline storage for telemetry when the backend is unreachable.

```typescript
interface IOfflineBufferPort {
  append(entry: BufferEntry): Promise<void>;
  flush(batchSize: number): Promise<BufferEntry[]>;
  getSize(): Promise<number>;
  getByteSize(): Promise<number>;
  clear(): Promise<void>;
  setMaxSize(bytes: number): void;
}
```

**Contract Rules:**
- `append` MUST persist to durable storage (IndexedDB in browser, filesystem in Node.js)
- `flush` MUST return entries in chronological order
- `flush` MUST be idempotent — flushed entries are removed from buffer
- `getByteSize()` MUST NOT exceed `maxSize` (INV-IN-008)
- When buffer is full, `append` MUST evict oldest entries and increment `BUFFER_OVERFLOW` counter

### 1.4 Outbound Port — IHealthReporterPort

Reports probe health status to the host's health check system.

```typescript
interface IHealthReporterPort {
  reportStatus(status: HealthStatus): void;
  registerCheck(name: string, check: () => Promise<CheckResult>): void;
  deregisterCheck(name: string): void;
}
```

**Contract Rules:**
- `reportStatus` MUST be non-blocking (fire-and-forget)
- Health checks MUST complete within 10 seconds or be reported as TIMEOUT
- Status transitions MUST be monotonic within a reporting interval (no flip-flopping)

### 1.5 Outbound Port — IContextPropagatorPort

Handles W3C Trace Context propagation across service boundaries.

```typescript
interface IContextPropagatorPort {
  inject(context: SpanContext, carrier: Record<string, string>): void;
  extract(carrier: Record<string, string>): SpanContext | null;
  createRootContext(): SpanContext;
}
```

**Contract Rules:**
- `inject` MUST set `traceparent` and optionally `tracestate` headers per W3C spec
- `extract` MUST return null (not throw) for invalid or missing headers
- `createRootContext` MUST generate a unique 128-bit trace ID

### 1.6 Outbound Port — ITenantContextPort

Provides tenant isolation context for multi-tenant deployments.

```typescript
interface ITenantContextPort {
  getCurrentTenantId(): string | null;
  validateTenantAccess(tenantId: string): boolean;
  getTenantConfig(tenantId: string): TenantProbeConfig;
}
```

**Contract Rules:**
- `getCurrentTenantId` MUST return null in single-tenant mode
- In multi-tenant mode, ALL telemetry emissions MUST include the tenant ID (INV-IN-003)
- `validateTenantAccess` MUST prevent cross-tenant data leakage (INV-IN-S02)

---

## 2. Data Type Contracts

### 2.1 Core Value Objects

| Type | Fields | Invariant |
|:---|:---|:---|
| `ProbeConfig` | `emissionInterval`, `bufferMaxSize`, `healthCheckInterval`, `offlineMode`, `tenantMode` | All numeric fields > 0 |
| `MetricBatch` | `metrics[]`, `timestamp`, `tenantId?` | Serialized size <= 64KB |
| `SpanData` | `traceId`, `spanId`, `parentSpanId?`, `name`, `startTime`, `endTime`, `status`, `attributes` | `traceId` is 128-bit hex |
| `StructuredLogEvent` | `timestamp`, `level`, `message`, `attributes`, `tenantId?`, `correlationId` | No PII in attributes |
| `HealthStatus` | `state`, `checks[]`, `lastUpdated`, `uptime` | `state` in {HEALTHY, DEGRADED, UNHEALTHY} |
| `BufferEntry` | `type`, `payload`, `timestamp`, `tenantId?`, `retryCount` | `retryCount` <= 3 |

### 2.2 Handle Types

| Type | Purpose | Lifecycle |
|:---|:---|:---|
| `CounterHandle` | Increment-only metric | Created by `registerCounter`, valid until shutdown |
| `HistogramHandle` | Distribution metric | Created by `registerHistogram`, valid until shutdown |
| `GaugeHandle` | Point-in-time metric | Created by `registerGauge`, valid until shutdown |
| `InstrumentationHandle` | Operation tracking | Created by `onOperationStart`, consumed by `onOperationEnd` |
| `SpanContext` | Trace context | Created by `startSpan`, consumed by `endSpan` |

---

## 3. Error Contracts

All port methods MUST throw typed errors from the Instrumentation Probe error taxonomy:

| Method Category | Error Type | When Thrown |
|:---|:---|:---|
| Lifecycle | `ProbeInitializationError` | Config invalid or backend resolution fails |
| Metrics | `InvalidMetricNameError` | Name doesn't match pattern |
| Tracing | `TracePropagationError` | Context injection/extraction fails |
| Emission | `EmissionFailedError` | Backend rejects batch |
| Buffer | `BufferOverflowError` | Buffer exceeds max size (after eviction) |
| Tenant | `TenantContextMissingError` | Multi-tenant mode but no tenant ID |

---

## 4. Execution Metadata

**Executed by:** webwakaagent3 (Architecture & System Design Department)
**Agent PAT:** webwakaagent3-specific PAT used for all operations
**Date:** 2026-02-26
**Protocol:** WebWaka Autonomous Execution Protocol (Steps 1-8)
**Constitutional Compliance:** Verified against all 8 core doctrines
**Status:** COMPLETE
