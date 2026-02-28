# [ORG-IA-SUBJECT_REGISTRY-v0.1.0-P5-T03] Document Deployment Guide

**Issue:** #25
**Phase:** 5 — Documentation
**Agent:** webwakaagent4 (Engineering & Delivery)
**Execution Date:** 2026-02-26

---

## 1. Overview

This guide describes how to integrate and deploy the Subject Registry Organelle within a WebWaka Cell. The organelle is a pure TypeScript library with no runtime dependencies — all infrastructure concerns are handled by the Cell layer through dependency injection.

## 2. Prerequisites

| Requirement | Description |
|------------|-------------|
| Node.js | >= 18.x LTS |
| TypeScript | >= 5.0 |
| Package Manager | pnpm (recommended) or npm |
| Cell Layer | Must implement ISubjectStorage, ISubjectEventEmitter, ISubjectObservability |

## 3. Installation

```bash
# From the WebWaka internal registry
pnpm add @webwaka/organelle-subject-registry

# Or from source
cd webwaka-organelle-subject-registry
pnpm install
pnpm build
```

## 4. Build

```bash
pnpm build   # Compiles TypeScript to dist/
```

Output: `dist/index.js` (CommonJS) and `dist/index.d.ts` (type declarations).

## 5. Cell Layer Integration

The Cell layer must provide concrete implementations of three interfaces:

### 5.1. Storage Adapter

```typescript
// Example: PostgreSQL adapter
class PostgresSubjectStorage implements ISubjectStorage {
  async storeSubject(record: SubjectRecord): Promise<StorageResult<void>> {
    // INSERT INTO subjects ... ON CONFLICT (subject_id) DO NOTHING
  }
  async retrieveSubject(subject_id: string): Promise<StorageResult<SubjectRecord | undefined>> {
    // SELECT * FROM subjects WHERE subject_id = $1
  }
  async updateSubject(subject_id: string, expected_version: number, updated: SubjectRecord): Promise<StorageResult<{ version_mismatch?: boolean }>> {
    // UPDATE subjects SET ... WHERE subject_id = $1 AND version = $2
  }
  async querySubjectsByStatus(status: SubjectStatus): Promise<StorageResult<string[]>> {
    // SELECT subject_id FROM subjects WHERE status = $1
  }
}
```

### 5.2. Event Emitter Adapter

```typescript
// Example: Kafka adapter
class KafkaSubjectEventEmitter implements ISubjectEventEmitter {
  async emit(event: SubjectEvent): Promise<void> {
    // Publish to 'subject-events' topic with subject_id as partition key
  }
}
```

### 5.3. Observability Adapter

```typescript
// Example: OpenTelemetry adapter
class OtelSubjectObservability implements ISubjectObservability {
  startTrace(operation_name: string, fields?: Record<string, unknown>): string { /* ... */ }
  endTrace(span_id: string, success: boolean, error_code?: SubjectRegistryErrorCode): void { /* ... */ }
  recordMetric(name: string, type: MetricType, value: number, labels?: Record<string, string>): void { /* ... */ }
  log(level: LogLevel, message: string, fields?: Record<string, unknown>): void { /* ... */ }
}
```

## 6. Wiring

```typescript
import { SubjectRegistry } from '@webwaka/organelle-subject-registry';

const registry = new SubjectRegistry(
  new PostgresSubjectStorage(dbPool),
  new KafkaSubjectEventEmitter(kafkaProducer),
  new OtelSubjectObservability(tracer, meter, logger)
);

// Expose via Cell's service container or API gateway
```

## 7. Database Schema (Reference)

```sql
CREATE TABLE subjects (
  subject_id    UUID PRIMARY KEY,
  subject_type  VARCHAR(32) NOT NULL,
  status        VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
  attributes    JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version       INTEGER NOT NULL DEFAULT 1,
  
  CONSTRAINT chk_subject_type CHECK (subject_type IN ('USER', 'SERVICE_ACCOUNT', 'API_CLIENT', 'SYSTEM_PROCESS')),
  CONSTRAINT chk_status CHECK (status IN ('ACTIVE', 'SUSPENDED', 'ARCHIVED', 'DELETED')),
  CONSTRAINT chk_version_positive CHECK (version > 0)
);

CREATE INDEX idx_subjects_status ON subjects(status);
CREATE INDEX idx_subjects_type ON subjects(subject_type);
```

## 8. Health Check

The organelle itself has no health endpoint — health is determined by the Cell layer's storage and event bus availability.

## 9. Monitoring

| Metric | Type | Description |
|--------|------|-------------|
| `subject.registered` | Counter | Total subjects registered |
| `subject.status_changed` | Counter | Total status transitions |
| `subject.attributes_updated` | Counter | Total attribute updates |
| `subject.lookup` | Counter | Total lookups |

**Unblocks:** #22 (Phase 5 parent)

---

*Executed by webwakaagent4 under the WebWaka Autonomous Platform Construction System.*
