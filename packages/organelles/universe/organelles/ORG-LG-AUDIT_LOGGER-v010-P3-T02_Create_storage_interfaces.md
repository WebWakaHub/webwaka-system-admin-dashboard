# ORG-LG-AUDIT_LOGGER-v0.1.0 — Storage Interfaces

## IAuditStoragePort
```typescript
interface IAuditStoragePort {
  append(entry: AuditEntry): Promise<void>;
  appendBatch(entries: AuditEntry[]): Promise<void>;
  getBySequence(sequence: number): Promise<AuditEntry | null>;
  getRange(from: number, to: number): Promise<AuditEntry[]>;
  query(filters: AuditFilters, pagination: Pagination): Promise<AuditEntry[]>;
  getLatestEntry(): Promise<AuditEntry | null>;
  archiveRange(from: number, to: number): Promise<number>;
}
```

## Database Schema
```sql
CREATE TABLE audit_log (
  sequence BIGSERIAL PRIMARY KEY,
  actor VARCHAR(255) NOT NULL,
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(500) NOT NULL,
  outcome VARCHAR(20) NOT NULL,
  metadata JSONB DEFAULT '{}',
  correlation_id VARCHAR(255) NOT NULL,
  hash VARCHAR(64) NOT NULL,
  prev_hash VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_actor ON audit_log(actor);
CREATE INDEX idx_audit_action ON audit_log(action);
CREATE INDEX idx_audit_correlation ON audit_log(correlation_id);
CREATE INDEX idx_audit_created ON audit_log(created_at);
```
