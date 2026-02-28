# ORG-RG-GOVERNANCE_REGISTRY-v0.1.0 — P5-T02: Usage Examples

## Example 1: Register and Activate a Rule
```typescript
const orchestrator = new GovernanceOrchestrator(storage, events, observability);
const rule = await orchestrator.registerRule({
  rule_id: crypto.randomUUID(), title: 'Data Retention Policy',
  body: 'All PII must be purged after 90 days', category: 'data-governance', version: '1.0.0',
});
await orchestrator.activateRule({ rule_id: rule.rule_id });
```

## Example 2: Process a Constitutional Amendment
```typescript
const result = await orchestrator.amendConstitution({
  article_id: 'AGVE-001', amendment_body: 'Updated quorum threshold to 60%',
  proposer: 'webwaka007', signatures: ['webwaka007', 'webwakaagent3', 'webwakaagent5'],
});
console.log(result.quorum_met); // true
```

## Example 3: Query Compliance
```typescript
const report = await orchestrator.queryCompliance({
  target_type: 'organelle', target_id: 'subject-registry',
});
console.log(report.applicable_rules.length); // N rules
```
