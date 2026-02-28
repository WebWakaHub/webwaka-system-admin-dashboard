# ORG-LG-AUDIT_LOGGER-v0.1.0 — Observability Hooks

## Self-Monitoring Metrics
| Metric | Type | Description |
|--------|------|-------------|
| al.events.recorded.count | Counter | Total audit events recorded |
| al.events.rejected.count | Counter | Events rejected (validation) |
| al.hash.computation.duration_ms | Histogram | Hash computation time |
| al.integrity.verification.duration_ms | Histogram | Verification duration |
| al.storage.entries.total | Gauge | Total entries in log |
| al.storage.utilization | Gauge | Storage utilization percentage |
| al.export.duration_ms | Histogram | Export operation time |
| al.retention.archived.count | Counter | Entries archived |
