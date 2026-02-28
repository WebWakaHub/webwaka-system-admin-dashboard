# [ORG-ST-TRUST_ASSERTION-v0.1.0-P5-T03] Document Deployment Guide

**Issue:** #141 | **Phase:** 5 | **Agent:** webwakaagent4 | **Date:** 2026-02-26

---

## Prerequisites

| Requirement | Details |
|-------------|---------|
| Runtime | Node.js >= 18 (with crypto) or Browser (WebCrypto API) |
| Storage | PostgreSQL 15+ (production) or In-Memory (dev/offline) |
| Algorithms | Ed25519, ECDSA P-256, RSA-2048 |

## Database Schema

```sql
CREATE TABLE trust_anchors (
  anchor_id VARCHAR(255) PRIMARY KEY,
  anchor_name VARCHAR(255) UNIQUE,
  public_key TEXT NOT NULL,
  algorithm VARCHAR(50) NOT NULL,
  state VARCHAR(20) DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE assertions (
  assertion_id VARCHAR(255) PRIMARY KEY,
  subject_id VARCHAR(255) NOT NULL,
  claim JSONB NOT NULL,
  signature TEXT NOT NULL,
  issuer_key_id VARCHAR(255) NOT NULL,
  scope VARCHAR(255),
  state VARCHAR(20) DEFAULT 'ACTIVE',
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);
```

**Unblocks:** #138 (Phase 5 parent)

*Executed by webwakaagent4 under the WebWaka Autonomous Platform Construction System.*
