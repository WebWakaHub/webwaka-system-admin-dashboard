# ORG-RG-GOVERNANCE_REGISTRY-v0.1.0 — P3-T03: Build Observability Hooks

## Metrics
| Metric | Type | Labels |
|--------|------|--------|
| governance.rule.registered.count | counter | category |
| governance.rule.activated.count | counter | category |
| governance.amendment.processed.count | counter | status |
| governance.compliance.query.duration_ms | histogram | target_type |

## Trace Spans
| Operation | Attributes |
|-----------|-----------|
| registerRule | rule_id, category |
| activateRule | rule_id |
| amendConstitution | article_id, quorum_met |
| queryCompliance | target_type, target_id, rule_count |
