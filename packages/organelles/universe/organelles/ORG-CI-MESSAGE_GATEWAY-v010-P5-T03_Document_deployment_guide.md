# [ORG-CI-MESSAGE_GATEWAY-v0.1.0-P5-T03] Document Deployment Guide

**Issue:** #228 | **Phase:** 5 | **Agent:** webwakaagent4 | **Date:** 2026-02-26

---

## Database Schema

```sql
CREATE TABLE message_channels (
  channel_id VARCHAR(255) PRIMARY KEY,
  channel_type VARCHAR(50) NOT NULL,
  config JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE messages (
  message_id VARCHAR(255) PRIMARY KEY,
  channel_id VARCHAR(255) REFERENCES message_channels(channel_id),
  recipient VARCHAR(500) NOT NULL,
  payload JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING',
  idempotency_key VARCHAR(255) UNIQUE,
  attempt INTEGER DEFAULT 0,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE inbound_messages (
  message_id VARCHAR(255) PRIMARY KEY,
  channel_id VARCHAR(255) NOT NULL,
  source VARCHAR(500) NOT NULL,
  payload JSONB NOT NULL,
  normalized_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_status ON messages(status, channel_id);
CREATE INDEX idx_messages_idempotency ON messages(idempotency_key);
```

**Unblocks:** #225 (Phase 5 parent)

*Executed by webwakaagent4 under the WebWaka Autonomous Platform Construction System.*
