# ORG-TS-TELEMETRY_COLLECTOR-v0.1.0 — Architectural Diagrams

## Hexagonal Architecture
```
                    ┌─────────────────────────────────┐
                    │     Telemetry Collector Core     │
  ┌──────────┐      │                                 │      ┌──────────────┐
  │ Organelle │─────▶│  ┌─────────────┐  ┌──────────┐│─────▶│Signal Storage│
  │ Signals   │      │  │  Enrichment │  │Aggregator││      └──────────────┘
  └──────────┘      │  │  Pipeline    │  │  Engine  ││      ┌──────────────┐
  ┌──────────┐      │  └─────────────┘  └──────────┘│─────▶│Signal Forward│
  │ Batch    │─────▶│  ┌─────────────┐  ┌──────────┐│      └──────────────┘
  │ Ingestion│      │  │   Buffer    │  │ Flush    ││      ┌──────────────┐
  └──────────┘      │  │   Manager   │  │ Scheduler││─────▶│ Event Bus    │
  ┌──────────┐      │  └─────────────┘  └──────────┘│      └──────────────┘
  │Management│─────▶│  ┌─────────────┐               │      ┌──────────────┐
  │ Commands │      │  │ Backpressure│               │─────▶│ Observability│
  └──────────┘      │  │ Controller  │               │      └──────────────┘
                    │  └─────────────┘               │
                    └─────────────────────────────────┘
```

## Data Flow
1. Signals arrive via ITelemetryIngestionPort
2. Schema validation applied
3. Enrichment pipeline adds metadata
4. Signals buffered in BufferManager
5. FlushScheduler triggers periodic forwarding
6. AggregatorEngine computes rollups
7. Signals forwarded to configured sinks via ISignalForwardingPort
