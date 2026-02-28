# ORG-LG-AUDIT_LOGGER-v0.1.0 — API Documentation

## AuditOrchestrator API

### Write Operations
| Method | Input | Output | Errors |
|--------|-------|--------|--------|
| `recordEvent(cmd)` | RecordAuditEventCommand | AuditReceipt | AL-001, AL-007 |
| `recordBatch(cmd)` | RecordBatchCommand | AuditReceipt[] | AL-001, AL-007 |

### Query Operations
| Method | Input | Output | Errors |
|--------|-------|--------|--------|
| `queryLog(query)` | AuditQuery | AuditEntry[] | AL-003 |
| `getEntry(seq)` | number | AuditEntry \| null | — |
| `getLatestSequence()` | — | number | — |

### Management Operations
| Method | Input | Output | Errors |
|--------|-------|--------|--------|
| `verifyIntegrity(from, to)` | number, number | IntegrityReport | AL-002, AL-006 |
| `exportTrail(cmd)` | ExportCommand | ExportResult | AL-004 |
| `setRetentionPolicy(cmd)` | RetentionPolicyCommand | void | — |
| `rotateLog(reason)` | string | void | — |
