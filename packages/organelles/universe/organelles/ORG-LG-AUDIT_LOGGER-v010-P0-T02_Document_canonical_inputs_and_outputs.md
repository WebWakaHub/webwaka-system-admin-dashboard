# ORG-LG-AUDIT_LOGGER-v0.1.0 — Canonical Inputs & Outputs

## Input Commands
| Command | Fields | Description |
|---------|--------|-------------|
| RecordAuditEvent | actor, action, resource, outcome, metadata, correlation_id | Record a single audit event |
| RecordBatch | events[] | Record a batch of audit events |
| QueryAuditLog | filters, time_range, pagination | Query audit entries with filters |
| VerifyIntegrity | from_sequence, to_sequence | Verify hash chain integrity |
| ExportAuditTrail | format, time_range, filters | Export audit trail to file |
| SetRetentionPolicy | retention_days, archive_after_days | Configure retention policy |
| RotateLog | reason | Trigger log rotation |

## Output Types
| Output | Fields | Description |
|--------|--------|-------------|
| AuditReceipt | receipt_id, sequence_number, hash, timestamp | Acknowledgment with integrity proof |
| AuditEntry | sequence, actor, action, resource, outcome, hash, prev_hash, timestamp | Full audit record |
| IntegrityReport | verified, entries_checked, first_invalid, status | Hash chain verification result |
| ExportResult | format, entry_count, file_path, checksum | Export completion result |

## Error Codes
| Code | Name | Description |
|------|------|-------------|
| AL-001 | INVALID_EVENT | Audit event fails validation |
| AL-002 | INTEGRITY_VIOLATION | Hash chain integrity check failed |
| AL-003 | RETENTION_EXPIRED | Requested entries have been archived |
| AL-004 | EXPORT_FAILED | Export operation failed |
| AL-005 | ACCESS_DENIED | Insufficient permissions for audit access |
| AL-006 | SEQUENCE_GAP | Gap detected in sequence numbers |
| AL-007 | STORAGE_FULL | Audit log storage capacity exceeded |
| AL-008 | DUPLICATE_EVENT | Duplicate event detected (idempotency) |

## Lifecycle Events
| Event | Trigger | Payload |
|-------|---------|---------|
| AuditEventRecorded | Event persisted | sequence, hash |
| BatchRecorded | Batch persisted | batch_id, count |
| IntegrityVerified | Verification complete | status, entries_checked |
| LogRotated | Rotation complete | old_sequence, new_sequence |
| RetentionApplied | Entries archived/deleted | entries_affected |
| ExportCompleted | Export finished | format, count |
