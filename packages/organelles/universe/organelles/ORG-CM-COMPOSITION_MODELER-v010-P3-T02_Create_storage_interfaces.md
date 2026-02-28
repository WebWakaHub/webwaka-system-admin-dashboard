# ORG-CM-COMPOSITION_MODELER-v0.1.0 — P3-T02: Create Storage Interfaces

## ICompositionStoragePort
Implements the secondary storage port with methods for CRUD operations on composition entities.

## Storage Schema
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
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deployed_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ
);

CREATE INDEX idx_compositions_state ON compositions(state);
CREATE INDEX idx_compositions_name ON compositions(name);
CREATE UNIQUE INDEX idx_compositions_snapshot ON compositions(snapshot_hash) WHERE snapshot_hash IS NOT NULL;
```
