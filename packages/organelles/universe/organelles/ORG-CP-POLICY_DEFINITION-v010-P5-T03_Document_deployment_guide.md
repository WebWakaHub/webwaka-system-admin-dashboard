# [ORG-CP-POLICY_DEFINITION-v0.1.0-P5-T03] Document Deployment Guide

**Issue:** #112 | **Phase:** 5 | **Agent:** webwakaagent4 | **Date:** 2026-02-26

---

## Prerequisites

| Requirement | Details |
|-------------|---------|
| Runtime | Node.js >= 18 or Deno >= 1.38 |
| Storage | PostgreSQL 15+ (production) or In-Memory (dev/offline) |
| Dependencies | Zero external runtime dependencies |

## Database Schema

```sql
CREATE TABLE policies (
  policy_id VARCHAR(255) PRIMARY KEY,
  policy_name VARCHAR(255) UNIQUE NOT NULL,
  tags TEXT[] DEFAULT '{}',
  description TEXT,
  state VARCHAR(20) DEFAULT 'DRAFT',
  active_version INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE policy_versions (
  policy_id VARCHAR(255) REFERENCES policies(policy_id),
  version INTEGER NOT NULL,
  rules JSONB NOT NULL,
  state VARCHAR(20) DEFAULT 'CREATED',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (policy_id, version)
);
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| DATABASE_URL | Yes (prod) | PostgreSQL connection string |
| KAFKA_BROKERS | No | Event emitter broker list |
| OTEL_ENDPOINT | No | OpenTelemetry collector |

**Unblocks:** #109 (Phase 5 parent)

*Executed by webwakaagent4 under the WebWaka Autonomous Platform Construction System.*
