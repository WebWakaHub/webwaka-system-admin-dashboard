# ORG-TS-TELEMETRY_COLLECTOR-v0.1.0 — Usage Examples

## Example 1: Ingest a Metric
```typescript
const receipt = await collector.ingestMetric({
  metric_name: 'organelle.subject_registry.lookup.duration_ms',
  value: 42.5,
  labels: { organelle_id: 'ORG-IA-SUBJECT_REGISTRY', operation: 'lookup' },
  timestamp: new Date(),
  correlation_id: 'corr-abc-123'
});
```

## Example 2: Ingest a Trace Span
```typescript
const receipt = await collector.ingestTrace({
  trace_id: 'trace-001', span_id: 'span-001',
  operation: 'SubjectRegistry.registerSubject',
  attributes: { subject_type: 'INDIVIDUAL' },
  start_time: new Date(), end_time: new Date(),
  correlation_id: 'corr-abc-123'
});
```

## Example 3: Configure a Forwarding Sink
```typescript
await collector.configureSink({
  sink_id: 'prometheus-sink', sink_type: 'PROMETHEUS',
  endpoint: 'http://prometheus:9090/api/v1/write',
  credentials: { bearer_token: 'tok-xxx' }
});
```

## Example 4: Query Aggregated Metrics
```typescript
const metrics = await collector.getAggregatedMetrics({
  metric_name: 'organelle.*.duration_ms',
  window: '60s', rollup_fn: 'p95',
  from: new Date('2026-02-26T00:00:00Z'), to: new Date()
});
```

## Example 5: Monitor Collector Health
```typescript
const health = await collector.getCollectorHealth();
console.log(`Buffer: ${health.buffer_utilization}%, Throughput: ${health.throughput_rps} rps`);
```
