# ORG-TS-TELEMETRY_COLLECTOR-v0.1.0 — Storage Interfaces

## ISignalStoragePort
```typescript
interface ISignalStoragePort {
  storeSignal(signal: TelemetrySignal): Promise<void>;
  storeSignalBatch(signals: TelemetrySignal[]): Promise<void>;
  querySignals(query: SignalQuery): Promise<TelemetrySignal[]>;
  deleteExpired(ttlSeconds: number): Promise<number>;
}
```

## ISignalForwardingPort
```typescript
interface ISignalForwardingPort {
  forward(sinkId: string, signals: TelemetrySignal[]): Promise<ForwardingResult>;
  checkSinkHealth(sinkId: string): Promise<SinkHealth>;
}
```

## Database Schema
- `telemetry_signals` — signal_id, signal_type, payload (JSONB), timestamp, correlation_id, organelle_id
- `telemetry_sinks` — sink_id, sink_type, endpoint, status, last_forward_at
- `telemetry_aggregations` — metric_name, window_start, window_end, rollup_fn, value, labels
