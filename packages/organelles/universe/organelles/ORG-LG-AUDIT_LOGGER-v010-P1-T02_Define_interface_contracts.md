# ORG-LG-AUDIT_LOGGER-v0.1.0 — Interface Contracts

## Primary Ports (Driving)
### IAuditWritePort
```typescript
interface IAuditWritePort {
  recordEvent(cmd: RecordAuditEventCommand): Promise<AuditReceipt>;
  recordBatch(cmd: RecordBatchCommand): Promise<AuditReceipt[]>;
}
```

### IAuditQueryPort
```typescript
interface IAuditQueryPort {
  queryLog(query: AuditQuery): Promise<AuditEntry[]>;
  getEntry(sequence: number): Promise<AuditEntry | null>;
  getLatestSequence(): Promise<number>;
}
```

### IAuditManagementPort
```typescript
interface IAuditManagementPort {
  verifyIntegrity(from: number, to: number): Promise<IntegrityReport>;
  exportTrail(cmd: ExportCommand): Promise<ExportResult>;
  setRetentionPolicy(cmd: RetentionPolicyCommand): Promise<void>;
  rotateLog(reason: string): Promise<void>;
}
```

## Secondary Ports (Driven)
### IAuditStoragePort — Persist audit entries (append-only)
### IAuditEventPort — Emit lifecycle events
### IAuditObservabilityPort — Self-monitoring metrics
### ICryptoPort — Cryptographic hash computation
