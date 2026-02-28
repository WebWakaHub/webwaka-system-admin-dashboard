# ORG-LG-AUDIT_LOGGER-v0.1.0 — Usage Examples

## Example 1: Record an Audit Event
```typescript
const receipt = await logger.recordEvent({
  actor: 'webwakaagent4',
  action: 'SUBJECT_REGISTERED',
  resource: 'subject:sub-001',
  outcome: 'SUCCESS',
  metadata: { subject_type: 'INDIVIDUAL' },
  correlation_id: 'corr-abc-123'
});
// receipt.sequence_number = 42, receipt.hash = 'a1b2c3...'
```

## Example 2: Verify Integrity
```typescript
const report = await logger.verifyIntegrity(1, 1000);
console.log(`Verified: ${report.verified}, Entries: ${report.entries_checked}`);
```

## Example 3: Query by Actor
```typescript
const entries = await logger.queryLog({
  filters: { actor: 'webwakaagent4' },
  time_range: { from: new Date('2026-01-01'), to: new Date() },
  pagination: { offset: 0, limit: 100 }
});
```

## Example 4: Export for Compliance
```typescript
const result = await logger.exportTrail({
  format: 'JSON_LINES',
  time_range: { from: new Date('2026-01-01'), to: new Date() },
  filters: { action: 'POLICY_ACTIVATED' }
});
```

## Example 5: Record Batch
```typescript
const receipts = await logger.recordBatch({
  events: [
    { actor: 'webwakaagent3', action: 'DESIGN_APPROVED', resource: 'organelle:ORG-IA-SR', outcome: 'SUCCESS', correlation_id: 'corr-1' },
    { actor: 'webwakaagent5', action: 'VERIFICATION_PASSED', resource: 'organelle:ORG-IA-SR', outcome: 'SUCCESS', correlation_id: 'corr-2' }
  ]
});
```
