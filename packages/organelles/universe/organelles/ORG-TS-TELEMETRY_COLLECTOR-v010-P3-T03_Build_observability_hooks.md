# ORG-TS-TELEMETRY_COLLECTOR-v0.1.0 — Observability Hooks

## Self-Telemetry Metrics
| Metric | Type | Description |
|--------|------|-------------|
| tc.signals.ingested.count | Counter | Total signals ingested |
| tc.signals.rejected.count | Counter | Signals rejected (validation/backpressure) |
| tc.buffer.utilization | Gauge | Current buffer utilization percentage |
| tc.buffer.flush.duration_ms | Histogram | Time to flush buffer |
| tc.sink.forward.count | Counter | Signals forwarded per sink |
| tc.sink.forward.errors | Counter | Forwarding errors per sink |
| tc.aggregation.window.duration_ms | Histogram | Aggregation computation time |
| tc.backpressure.active | Gauge | 1 if backpressure active, 0 otherwise |

## ITelemetryObservabilityPort
Meta-observability for the collector itself — records self-metrics, traces, and logs about its own operation.
