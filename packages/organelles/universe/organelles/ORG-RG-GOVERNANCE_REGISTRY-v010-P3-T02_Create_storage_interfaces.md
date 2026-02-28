# ORG-RG-GOVERNANCE_REGISTRY-v0.1.0 — P3-T02: Create Storage Interfaces

## Storage Schema
```sql
CREATE TABLE governance_rules (
  rule_id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  state VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
  version VARCHAR(50) NOT NULL,
  sunset_date TIMESTAMPTZ,
  deprecation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE rule_versions (
  version_id UUID PRIMARY KEY,
  rule_id UUID NOT NULL REFERENCES governance_rules(rule_id),
  version VARCHAR(50) NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE compliance_bindings (
  binding_id UUID PRIMARY KEY,
  policy_id UUID NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  target_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(policy_id, target_type, target_id)
);

CREATE INDEX idx_rules_category ON governance_rules(category);
CREATE INDEX idx_rules_state ON governance_rules(state);
CREATE INDEX idx_bindings_target ON compliance_bindings(target_type, target_id);
```
