# ORG-CM-COMPOSITION_MODELER-v0.1.0 — P5-T03: Deployment Guide

## Prerequisites
- Node.js >= 18.0.0
- PostgreSQL >= 14.0 (for composition storage)
- Discovery Registry organelle (for capability lookup)

## Database Setup
```sql
CREATE TABLE compositions (
  composition_id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  version VARCHAR(50) NOT NULL,
  state VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
  organelle_graph JSONB NOT NULL,
  connection_map JSONB NOT NULL,
  snapshot_hash VARCHAR(64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_compositions_state ON compositions(state);
CREATE INDEX idx_compositions_name ON compositions(name);
```

## Installation
```bash
npm install @webwaka/organelle-composition-modeler
```

## Configuration
```typescript
import { CompositionOrchestrator } from '@webwaka/organelle-composition-modeler';

const orchestrator = new CompositionOrchestrator(
  new PostgresCompositionStorage(connectionPool),
  new KafkaCompositionEventAdapter(kafkaProducer),
  new PrometheusCompositionObservability(registry),
);
```

## Health Check
The organelle exposes health status via the observability port. Monitor `composition.validation.duration_ms` histogram for performance degradation.
