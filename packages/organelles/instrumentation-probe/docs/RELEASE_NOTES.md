# ORG-IN-INSTRUMENTATION_PROBE-v0.1.0 — Release Notes

> **Agent:** webwakaagent4 (Engineering & Delivery)
> **Issue:** webwaka-organelle-universe#492 (P6-T02)

## Version 0.1.0 — Initial Release

### Summary

The Instrumentation Probe organelle delivers observability primitives for the WebWaka platform. It provides metrics registration, distributed tracing with W3C Trace Context, structured logging, and offline-first telemetry buffering.

### Features

- **Metric Registry** — Bounded LRU metric storage (max 1000 metrics) with counter, histogram, and gauge types
- **Distributed Tracing** — W3C Trace Context compliant inject/extract with automatic span lifecycle
- **Structured Logging** — Typed log events with severity levels and tenant tagging
- **Offline Buffers** — Dual-environment support (IndexedDB for browser, FileSystem for Node.js)
- **Adaptive Emission** — Network-tier-aware batch sizing (broadband/narrow/offline)
- **Multi-Tenant Isolation** — Automatic tenant tagging via context port
- **State Machine** — 5-state lifecycle (UNINITIALIZED → ACTIVE → DEGRADED → DRAINING → SHUTDOWN)
- **Health Monitoring** — Self-reporting health status with configurable thresholds

### Constitutional Compliance

All 8 invariants (INV-IN-P01 through INV-IN-P08) verified and enforced at runtime.

### Breaking Changes

None — initial release.

### Known Limitations

- No support for legacy B3/Jaeger trace context formats (planned for v0.2.0)
- Maximum 1000 concurrent metrics per registry instance
- Offline buffer limited to 10MB per instance
