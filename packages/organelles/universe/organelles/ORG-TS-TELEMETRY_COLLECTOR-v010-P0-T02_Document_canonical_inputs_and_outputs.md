# ORG-TS-TELEMETRY_COLLECTOR-v0.1.0 — Canonical Inputs & Outputs

## Input Commands
| Command | Fields | Description |
|---------|--------|-------------|
| IngestMetric | metric_name, value, labels, timestamp | Ingest a single metric data point |
| IngestTrace | trace_id, span_id, operation, attributes, start_time, end_time | Ingest a trace span |
| IngestLog | level, message, context, timestamp | Ingest a log entry |
| IngestBatch | signals[] | Ingest a batch of mixed signals |
| ConfigureSink | sink_id, sink_type, endpoint, credentials | Register a forwarding sink |
| SetRetentionPolicy | signal_type, ttl_seconds | Set retention TTL for a signal type |
| FlushBuffer | signal_type? | Force flush buffered signals |

## Output Types
| Output | Fields | Description |
|--------|--------|-------------|
| IngestionReceipt | receipt_id, signal_count, accepted, rejected | Acknowledgment of ingested signals |
| AggregatedMetric | metric_name, window, rollup_fn, value, labels | Aggregated metric result |
| CollectorHealth | status, buffer_utilization, throughput_rps, sink_statuses | Collector health snapshot |
| ForwardingResult | sink_id, signals_forwarded, errors | Result of forwarding to a sink |

## Error Codes
| Code | Name | Description |
|------|------|-------------|
| TC-001 | SIGNAL_NOT_FOUND | Referenced signal does not exist |
| TC-002 | INVALID_SIGNAL | Signal fails schema validation |
| TC-003 | BUFFER_OVERFLOW | Buffer capacity exceeded, backpressure applied |
| TC-004 | SINK_UNAVAILABLE | Forwarding sink is unreachable |
| TC-005 | RETENTION_VIOLATION | Signal exceeds retention TTL |
| TC-006 | INVALID_SINK_CONFIG | Sink configuration is invalid |
| TC-007 | DUPLICATE_SIGNAL | Duplicate signal detected (idempotency) |
| TC-008 | SCHEMA_MISMATCH | Signal does not match registered schema |

## Lifecycle Events
| Event | Trigger | Payload |
|-------|---------|---------|
| SignalIngested | Signal accepted | signal_type, signal_id |
| BatchIngested | Batch accepted | batch_id, count |
| BufferFlushed | Flush completed | signal_type, count |
| SignalForwarded | Forwarding complete | sink_id, count |
| SinkRegistered | New sink configured | sink_id, sink_type |
| BackpressureApplied | Buffer threshold exceeded | buffer_utilization |
