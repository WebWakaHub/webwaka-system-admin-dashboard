# ORG-LG-AUDIT_LOGGER-v0.1.0 — Deployment Guide

## Prerequisites
- Node.js >= 18.0.0
- PostgreSQL 15+ (for append-only audit storage)

## Database Schema
```sql
CREATE TABLE audit_log (
  sequence BIGSERIAL PRIMARY KEY,
  actor VARCHAR(255) NOT NULL,
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(500) NOT NULL,
  outcome VARCHAR(20) NOT NULL CHECK (outcome IN ('SUCCESS', 'FAILURE', 'DENIED', 'ERROR')),
  metadata JSONB DEFAULT '{}',
  correlation_id VARCHAR(255) NOT NULL,
  hash VARCHAR(64) NOT NULL,
  prev_hash VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prevent updates and deletes (append-only enforcement)
CREATE RULE audit_no_update AS ON UPDATE TO audit_log DO INSTEAD NOTHING;
CREATE RULE audit_no_delete AS ON DELETE TO audit_log DO INSTEAD NOTHING;

CREATE INDEX idx_audit_actor ON audit_log(actor);
CREATE INDEX idx_audit_action ON audit_log(action);
CREATE INDEX idx_audit_resource ON audit_log(resource);
CREATE INDEX idx_audit_correlation ON audit_log(correlation_id);
CREATE INDEX idx_audit_created ON audit_log(created_at);
```

## Environment Variables
| Variable | Default | Description |
|----------|---------|-------------|
| AL_HASH_ALGORITHM | sha256 | Hash algorithm for chain |
| AL_BATCH_MAX | 500 | Maximum batch size |
| AL_RETENTION_DAYS | 365 | Default retention period |
| AL_QUERY_MAX_RESULTS | 10000 | Maximum query results |
| AL_GENESIS_HASH | 0000...0000 | Genesis block prev_hash |
