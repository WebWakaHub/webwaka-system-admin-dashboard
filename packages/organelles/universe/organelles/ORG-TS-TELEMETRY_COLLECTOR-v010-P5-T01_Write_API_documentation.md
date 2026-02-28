# ORG-TS-TELEMETRY_COLLECTOR-v0.1.0 — API Documentation

## TelemetryOrchestrator API

### Signal Ingestion
| Method | Input | Output | Errors |
|--------|-------|--------|--------|
| `ingestMetric(cmd)` | IngestMetricCommand | IngestionReceipt | TC-002, TC-003 |
| `ingestTrace(cmd)` | IngestTraceCommand | IngestionReceipt | TC-002, TC-003 |
| `ingestLog(cmd)` | IngestLogCommand | IngestionReceipt | TC-002, TC-003 |
| `ingestBatch(cmd)` | IngestBatchCommand | IngestionReceipt | TC-002, TC-003 |

### Management
| Method | Input | Output | Errors |
|--------|-------|--------|--------|
| `configureSink(cmd)` | ConfigureSinkCommand | void | TC-006 |
| `setRetentionPolicy(cmd)` | SetRetentionPolicyCommand | void | — |
| `flushBuffer(type?)` | string? | ForwardingResult | TC-004 |

### Query
| Method | Input | Output |
|--------|-------|--------|
| `getCollectorHealth()` | — | CollectorHealth |
| `getAggregatedMetrics(query)` | MetricQuery | AggregatedMetric[] |
| `getBufferStatus()` | — | BufferStatus |
