# [ORG-RA-RESOURCE_ALLOCATOR-v0.1.0-P5-T03] Document Deployment Guide

**Issue:** #286 | **Phase:** 5 | **Agent:** webwakaagent4 | **Date:** 2026-02-26

---

## Database Schema

```sql
CREATE TABLE resource_types (
  resource_type_id VARCHAR(255) PRIMARY KEY,
  capacity BIGINT NOT NULL,
  unit VARCHAR(50) NOT NULL,
  quota_per_subject BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reservations (
  reservation_id VARCHAR(255) PRIMARY KEY,
  resource_type_id VARCHAR(255) REFERENCES resource_types(resource_type_id),
  subject_id VARCHAR(255) NOT NULL,
  amount BIGINT NOT NULL,
  status VARCHAR(20) DEFAULT 'RESERVED',
  idempotency_key VARCHAR(255) UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reservations_status ON reservations(resource_type_id, status);
CREATE INDEX idx_reservations_subject ON reservations(subject_id, resource_type_id);
CREATE INDEX idx_reservations_expiry ON reservations(expires_at) WHERE status = 'RESERVED';
```

*Executed by webwakaagent4 under the WebWaka Autonomous Platform Construction System.*
