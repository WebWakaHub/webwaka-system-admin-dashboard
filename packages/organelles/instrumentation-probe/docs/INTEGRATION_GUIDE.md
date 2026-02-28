# ORG-IN-INSTRUMENTATION_PROBE-v0.1.0 — Integration Guide

> **Agent:** webwakaagent4 (Engineering & Delivery)
> **Issue:** webwaka-organelle-universe#488 (P5-T02)

## Quick Start

### Installation

```bash
npm install @webwaka/organelle-instrumentation-probe
```

### Basic Usage

```typescript
import {
  InstrumentationProbe,
  W3CContextPropagator,
  FileSystemOfflineBuffer,
} from '@webwaka/organelle-instrumentation-probe';

// 1. Create adapter instances
const emitter = new YourTelemetryEmitter('https://telemetry.webwaka.com');
const buffer = new FileSystemOfflineBuffer('/tmp/webwaka-buffer');
const health = new YourHealthReporter();
const propagator = new W3CContextPropagator();
const tenant = new YourTenantContext();

// 2. Create and initialize probe
const probe = new InstrumentationProbe(emitter, buffer, health, propagator, tenant);
await probe.initialize({ offlineMode: false });

// 3. Register metrics
const requestCounter = probe.registerCounter(
  'webwaka.runtime.database.requests',
  'Total database requests',
);

// 4. Start a span
const span = probe.startSpan('database-query');

// 5. Record metric
probe.recordMetric('webwaka.runtime.database.requests', 1, { engine: 'postgresql' });

// 6. End span
probe.endSpan(span, SpanStatus.OK);

// 7. Shutdown gracefully
await probe.shutdown();
```

## Integration Patterns

### Pattern 1: Cell-Level Integration

Each cell creates its own probe instance with shared emitter:

```typescript
class AuthenticationCell {
  private probe: InstrumentationProbe;

  constructor(sharedEmitter: ITelemetryEmitterPort) {
    this.probe = new InstrumentationProbe(
      sharedEmitter,
      new FileSystemOfflineBuffer('/tmp/auth-buffer'),
      new CellHealthReporter('auth'),
      new W3CContextPropagator(),
      new TenantContextAdapter(),
    );
  }

  async initialize(): Promise<void> {
    await this.probe.initialize({});
    this.probe.registerCounter('webwaka.cell.auth.login_attempts', 'Login attempts');
    this.probe.registerHistogram('webwaka.cell.auth.login_latency', 'Login latency', [50, 100, 250, 500, 1000]);
  }

  async login(credentials: Credentials): Promise<AuthResult> {
    const handle = this.probe.onOperationStart('login', {
      component: 'auth',
      layer: 'cell',
      operation: 'login',
    });

    try {
      const result = await this.performLogin(credentials);
      this.probe.onOperationEnd(handle, { success: true, duration: Date.now() - handle.startTime });
      return result;
    } catch (error) {
      this.probe.onOperationEnd(handle, { success: false, duration: Date.now() - handle.startTime });
      throw error;
    }
  }
}
```

### Pattern 2: Cross-Service Trace Propagation

```typescript
// Service A — Outbound
const span = probe.startSpan('call-service-b');
const headers: Record<string, string> = {};
probe.injectTraceContext(headers);
const response = await fetch('https://service-b.webwaka.com/api', { headers });
probe.endSpan(span, SpanStatus.OK);

// Service B — Inbound
const inboundContext = probe.extractTraceContext(request.headers);
const childSpan = probe.startSpan('handle-request', { parentContext: inboundContext });
// ... process request ...
probe.endSpan(childSpan, SpanStatus.OK);
```

### Pattern 3: Offline-First (Nigeria First Doctrine)

```typescript
// Browser environment with IndexedDB buffer
import { IndexedDBOfflineBuffer } from '@webwaka/organelle-instrumentation-probe';

const buffer = new IndexedDBOfflineBuffer(10 * 1024 * 1024); // 10MB
const probe = new InstrumentationProbe(emitter, buffer, health, propagator, tenant);

await probe.initialize({ offlineMode: true });

// Telemetry is automatically buffered when offline
// and flushed when connectivity returns
```

### Pattern 4: Multi-Tenant Isolation

```typescript
// Tenant context adapter
class WebWakaTenantContext implements ITenantContextPort {
  getCurrentTenantId(): string | null {
    return RequestContext.current?.tenantId ?? null;
  }

  validateTenantAccess(tenantId: string): boolean {
    return RequestContext.current?.tenantId === tenantId;
  }

  getTenantConfig(tenantId: string): TenantConfig {
    return TenantRegistry.getConfig(tenantId);
  }
}

// All metrics automatically tagged with tenant ID
probe.recordMetric('webwaka.tissue.api.requests', 1, { endpoint: '/users' });
// → tenantId: 'tenant-123' (from context)
```

## Configuration Reference

| Parameter | Type | Default | Description |
|:---|:---|:---|:---|
| `offlineMode` | `boolean` | `false` | Start in degraded/offline mode |
| `maxMetrics` | `number` | `1000` | Maximum registered metrics (INV-IN-P04) |
| `maxBufferBytes` | `number` | `10485760` | Maximum offline buffer size (INV-IN-P08) |
| `flushIntervalMs` | `number` | `30000` | Auto-flush interval |
| `batchSizeBytes` | `number` | `65536` | Maximum batch size (INV-IN-P03) |

## Adapter Implementations

| Adapter | Environment | Purpose |
|:---|:---|:---|
| `W3CContextPropagator` | Universal | W3C Trace Context injection/extraction |
| `IndexedDBOfflineBuffer` | Browser | IndexedDB-based offline telemetry buffer |
| `FileSystemOfflineBuffer` | Node.js | Filesystem-based offline telemetry buffer |

## Troubleshooting

| Symptom | Cause | Resolution |
|:---|:---|:---|
| `ProbeInitializationError` | Double init | Call `initialize()` only once per probe |
| `InvalidMetricNameError` | Bad format | Use `webwaka.<layer>.<component>.<metric>` |
| `MetricRegistryFullError` | 1000+ metrics | Unregister unused metrics or increase limit |
| `BufferOverflowError` | Buffer full | Increase `maxBufferBytes` or flush more often |
| `EmissionTimeoutError` | Slow network | Check connectivity, reduce batch size |
