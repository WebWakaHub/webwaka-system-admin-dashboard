# ORG-TS-TELEMETRY_COLLECTOR-v0.1.0 — Interface Contracts

## Primary Ports (Driving)
### ITelemetryIngestionPort
```typescript
interface ITelemetryIngestionPort {
  ingestMetric(cmd: IngestMetricCommand): Promise<IngestionReceipt>;
  ingestTrace(cmd: IngestTraceCommand): Promise<IngestionReceipt>;
  ingestLog(cmd: IngestLogCommand): Promise<IngestionReceipt>;
  ingestBatch(cmd: IngestBatchCommand): Promise<IngestionReceipt>;
}
```

### ITelemetryQueryPort
```typescript
interface ITelemetryQueryPort {
  getCollectorHealth(): Promise<CollectorHealth>;
  getAggregatedMetrics(query: MetricQuery): Promise<AggregatedMetric[]>;
  getBufferStatus(): Promise<BufferStatus>;
}
```

### ITelemetryManagementPort
```typescript
interface ITelemetryManagementPort {
  configureSink(cmd: ConfigureSinkCommand): Promise<void>;
  setRetentionPolicy(cmd: SetRetentionPolicyCommand): Promise<void>;
  flushBuffer(signalType?: string): Promise<ForwardingResult>;
}
```

## Secondary Ports (Driven)
### ISignalStoragePort — Persist buffered signals
### ISignalForwardingPort — Forward signals to external sinks
### ITelemetryEventPort — Emit lifecycle events
### ITelemetryObservabilityPort — Self-telemetry (meta-metrics)
