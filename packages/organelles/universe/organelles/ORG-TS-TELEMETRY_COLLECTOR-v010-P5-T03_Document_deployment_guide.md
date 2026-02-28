# ORG-TS-TELEMETRY_COLLECTOR-v0.1.0 — Deployment Guide

## Prerequisites
- Node.js >= 18.0.0
- PostgreSQL 15+ (for signal persistence)
- Configured forwarding sinks (Prometheus, Grafana Loki, Jaeger)

## Database Schema
```sql
CREATE TABLE telemetry_signals (
  signal_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_type VARCHAR(10) NOT NULL CHECK (signal_type IN ('METRIC', 'TRACE', 'LOG')),
  payload JSONB NOT NULL,
  correlation_id VARCHAR(255) NOT NULL,
  organelle_id VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE telemetry_sinks (
  sink_id VARCHAR(100) PRIMARY KEY,
  sink_type VARCHAR(50) NOT NULL,
  endpoint TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'CONNECTED',
  last_forward_at TIMESTAMPTZ
);

CREATE TABLE telemetry_aggregations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name VARCHAR(255) NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  window_end TIMESTAMPTZ NOT NULL,
  rollup_fn VARCHAR(10) NOT NULL,
  value DOUBLE PRECISION NOT NULL,
  labels JSONB DEFAULT '{}'
);

CREATE INDEX idx_signals_type_ts ON telemetry_signals(signal_type, created_at);
CREATE INDEX idx_signals_correlation ON telemetry_signals(correlation_id);
CREATE INDEX idx_aggregations_metric ON telemetry_aggregations(metric_name, window_start);
```

## Environment Variables
| Variable | Default | Description |
|----------|---------|-------------|
| TC_BUFFER_CAPACITY | 100000 | Maximum buffered signals |
| TC_FLUSH_INTERVAL_MS | 10000 | Flush interval in milliseconds |
| TC_BATCH_SIZE | 1000 | Maximum batch size |
| TC_RETENTION_TTL_S | 3600 | Default retention TTL |
| TC_BACKPRESSURE_HIGH | 0.8 | High watermark for backpressure |
| TC_BACKPRESSURE_LOW | 0.6 | Low watermark to resume |
