# ORG-RG-GOVERNANCE_REGISTRY-v0.1.0 — P0-T02: Document Canonical Inputs and Outputs

## Input Commands
| Command | Description | Required Fields |
|---------|-------------|-----------------|
| RegisterRuleCommand | Register a new governance rule | rule_id, title, body, category, version |
| ActivateRuleCommand | Activate a draft rule | rule_id |
| DeprecateRuleCommand | Deprecate an active rule | rule_id, reason, sunset_date |
| ArchiveRuleCommand | Archive a deprecated rule | rule_id |
| AmendConstitutionCommand | Propose a constitutional amendment | article_id, amendment_body, proposer, signatures[] |
| BindPolicyCommand | Bind a compliance policy to a target | policy_id, target_type, target_id |
| QueryComplianceCommand | Query applicable rules for a context | target_type, target_id, category? |

## Output Types
| Output | Description | Key Fields |
|--------|-------------|------------|
| GovernanceRule | A registered governance rule | rule_id, title, body, state, version, history[] |
| ComplianceBinding | A policy-to-target binding | binding_id, policy_id, target_type, target_id |
| AmendmentResult | Result of amendment processing | amendment_id, status, quorum_met, effective_date |
| ComplianceReport | Applicable rules for a context | target_id, applicable_rules[], compliance_status |

## Error Codes
| Code | Name | Description |
|------|------|-------------|
| GR-001 | RULE_NOT_FOUND | Governance rule ID does not exist |
| GR-002 | INVALID_RULE | Rule fails schema validation |
| GR-003 | RULE_LOCKED | Rule is not in modifiable state |
| GR-004 | QUORUM_NOT_MET | Amendment lacks required signatures |
| GR-005 | DUPLICATE_BINDING | Policy already bound to target |
| GR-006 | CIRCULAR_DEPENDENCY | Rule dependency cycle detected |
| GR-007 | VERSION_CONFLICT | Concurrent version modification |
