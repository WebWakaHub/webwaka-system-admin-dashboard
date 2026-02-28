# ORG-IN-INSTRUMENTATION_PROBE-v0.1.0 — Architecture Decision Records

> **Agent:** webwakaagent4 (Engineering & Delivery)
> **Issue:** webwaka-organelle-universe#489 (P5-T03)

## ADR-001: Hexagonal Architecture for Port Isolation

**Status:** Accepted

**Context:** The Instrumentation Probe must integrate with multiple telemetry backends (OTLP, Prometheus, custom) and storage systems (IndexedDB, filesystem) without coupling to any specific implementation.

**Decision:** Adopt hexagonal (ports and adapters) architecture with 6 defined ports: ITelemetryEmitterPort, IOfflineBufferPort, IHealthReporterPort, IContextPropagatorPort, ITenantContextPort, IInstrumentationPort.

**Consequences:** Each adapter can be swapped independently. Testing uses mock ports. New backends require only a new adapter implementation.

---

## ADR-002: W3C Trace Context as Sole Propagation Format

**Status:** Accepted

**Context:** Multiple trace context formats exist (B3, Jaeger, AWS X-Ray). Standardization is needed for cross-service interoperability.

**Decision:** Use W3C Trace Context (traceparent + tracestate) exclusively. Version field fixed at `00`.

**Consequences:** Full interoperability with OpenTelemetry ecosystem. No support for legacy B3/Jaeger formats (can be added via adapter).

---

## ADR-003: LRU Eviction for Bounded Metric Registry

**Status:** Accepted

**Context:** INV-IN-P04 requires the metric registry to stay within 500KB (1000 metrics × 500B). Unbounded growth would cause memory issues in long-running processes.

**Decision:** Implement LRU (Least Recently Used) eviction when registry reaches capacity. New registrations evict the least recently accessed metric.

**Consequences:** Frequently used metrics are preserved. Rarely accessed metrics may be evicted and need re-registration. Idempotent registration prevents duplicate entries.

---

## ADR-004: Dual Offline Buffer Strategy

**Status:** Accepted

**Context:** Nigeria First doctrine requires offline-first operation. Browser and Node.js environments have different storage APIs.

**Decision:** Provide two buffer implementations: IndexedDBOfflineBuffer (browser) and FileSystemOfflineBuffer (Node.js). Both implement IOfflineBufferPort with identical semantics.

**Consequences:** Platform-specific code is isolated in adapters. Buffer size is bounded at 10MB (INV-IN-P08). Oldest entries are evicted when buffer is full.

---

## ADR-005: Adaptive Batch Emission Based on Network Tier

**Status:** Accepted

**Context:** WebWaka targets Nigerian users with varying network conditions (2G, 3G, 4G, offline). Fixed batch sizes waste bandwidth on slow connections or underutilize fast ones.

**Decision:** FlushOrchestrator detects network tier (BROADBAND ≥1Mbps, NARROW <1Mbps, OFFLINE) and adjusts batch size accordingly: 256KB for broadband, 64KB for narrow, buffer-only for offline.

**Consequences:** Telemetry emission adapts to real network conditions. Offline data is preserved and flushed when connectivity returns. Batch size never exceeds INV-IN-P03 (64KB) on constrained networks.

---

## ADR-006: State Machine for Lifecycle Management

**Status:** Accepted

**Context:** The probe has complex lifecycle requirements: initialization, active operation, degraded mode, draining, and shutdown. Invalid state transitions must be prevented.

**Decision:** Implement explicit state machine with 5 states (UNINITIALIZED, ACTIVE, DEGRADED, DRAINING, SHUTDOWN) and validated transitions. Operations check current state before execution.

**Consequences:** Double initialization is prevented. Operations on shutdown probes throw clear errors. Graceful shutdown ensures pending data is flushed.

---

## ADR-007: Metric Name Convention Enforcement

**Status:** Accepted

**Context:** INV-IN-P01 requires all metric names to follow `webwaka.<layer>.<component>.<metric>` format. Inconsistent naming would make dashboards and alerts unreliable.

**Decision:** Enforce metric name format via regex validation in MetricRegistry.register(). Invalid names throw InvalidMetricNameError immediately.

**Consequences:** All metrics across the platform follow a consistent naming convention. Dashboards can use wildcard queries. Invalid names are caught at registration time, not at emission time.

---

## ADR-008: Tenant Isolation via Context Port

**Status:** Accepted

**Context:** INV-IN-P07 requires tenant isolation. Metrics, traces, and logs must be tagged with tenant ID to prevent cross-tenant data leakage.

**Decision:** Use ITenantContextPort to retrieve current tenant ID from request context. All telemetry entries are automatically tagged. Validation prevents cross-tenant access.

**Consequences:** Multi-tenant deployments get automatic isolation. Single-tenant deployments can use a null tenant context. No telemetry data leaks between tenants.
