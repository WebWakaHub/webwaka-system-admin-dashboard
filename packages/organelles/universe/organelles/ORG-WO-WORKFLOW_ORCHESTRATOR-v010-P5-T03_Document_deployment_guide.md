# [ORG-WO-WORKFLOW_ORCHESTRATOR-v0.1.0-P5-T03] Document Deployment Guide

**Issue:** #199 | **Phase:** 5 | **Agent:** webwakaagent4 | **Date:** 2026-02-26

---

## Prerequisites

| Requirement | Details |
|-------------|---------|
| Runtime | Node.js >= 18 |
| Storage | PostgreSQL 15+ (production) or In-Memory (dev/offline) |
| Tick interval | Configurable (default: 1 second for step advancement) |

## Database Schema

```sql
CREATE TABLE workflow_definitions (
  workflow_id VARCHAR(255) NOT NULL,
  version VARCHAR(50) NOT NULL,
  steps JSONB NOT NULL,
  on_failure VARCHAR(20) DEFAULT 'ABORT',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (workflow_id, version)
);

CREATE TABLE workflow_instances (
  instance_id VARCHAR(255) PRIMARY KEY,
  workflow_id VARCHAR(255) NOT NULL,
  version VARCHAR(50) NOT NULL,
  state VARCHAR(20) DEFAULT 'PENDING',
  current_step VARCHAR(255),
  input JSONB NOT NULL,
  output JSONB,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE step_executions (
  execution_id VARCHAR(255) PRIMARY KEY,
  instance_id VARCHAR(255) REFERENCES workflow_instances(instance_id),
  step_id VARCHAR(255) NOT NULL,
  state VARCHAR(20) NOT NULL,
  input JSONB,
  output JSONB,
  error TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  attempt INTEGER DEFAULT 1
);

CREATE INDEX idx_instances_state ON workflow_instances(state, workflow_id);
CREATE INDEX idx_steps_instance ON step_executions(instance_id, step_id);
```

**Unblocks:** #196 (Phase 5 parent)

*Executed by webwakaagent4 under the WebWaka Autonomous Platform Construction System.*
