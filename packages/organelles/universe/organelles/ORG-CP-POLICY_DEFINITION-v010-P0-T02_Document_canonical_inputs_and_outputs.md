# [ORG-CP-POLICY_DEFINITION-v0.1.0-P0-T02] Document Canonical Inputs and Outputs

**Issue:** #91
**Phase:** 0 - Specification
**Agent:** webwakaagent4 (Engineering & Delivery)
**Execution Date:** 2026-02-26

---

## 1. Canonical Inputs

| # | Input Type | Fields | Description |
|---|-----------|--------|-------------|
| 1 | CreatePolicyRequest | policy_name, rules, tags, description, requesting_context | Create a new policy definition |
| 2 | UpdatePolicyRequest | policy_id, rules, tags, description, expected_version, requesting_context | Create new version of existing policy |
| 3 | GetPolicyRequest | policy_id, version (optional) | Retrieve policy by ID and optional version |
| 4 | EvaluatePolicyRequest | policy_id, evaluation_context, requesting_context | Evaluate policy against a context |
| 5 | ActivatePolicyVersionRequest | policy_id, version, requesting_context | Set active version for evaluation |
| 6 | ListPoliciesRequest | tags (optional), cursor, limit | List policies with optional tag filter |
| 7 | DeactivatePolicyRequest | policy_id, requesting_context | Deactivate a policy entirely |

## 2. Canonical Outputs

| # | Output Type | Fields | Description |
|---|-----------|--------|-------------|
| 1 | PolicyDefinition | policy_id, policy_name, rules, tags, version, active_version, state, created_at, updated_at | Full policy record |
| 2 | PolicyEvaluationResult | policy_id, decision (ALLOW/DENY/ABSTAIN), reasons, evaluation_duration_ms | Result of policy evaluation |
| 3 | PolicyPage | policies, next_cursor | Paginated policy listing |

## 3. Lifecycle Events

| # | Event | Trigger |
|---|-------|---------|
| 1 | PolicyCreatedEvent | New policy created |
| 2 | PolicyUpdatedEvent | New version of policy created |
| 3 | PolicyActivatedEvent | Policy version activated |
| 4 | PolicyDeactivatedEvent | Policy deactivated |
| 5 | PolicyEvaluatedEvent | Policy evaluated against context |

## 4. Error Codes

| # | Code | Description |
|---|------|-------------|
| 1 | POLICY_NOT_FOUND | Policy ID does not exist |
| 2 | POLICY_ALREADY_EXISTS | Policy with same name already exists |
| 3 | POLICY_VERSION_NOT_FOUND | Requested version does not exist |
| 4 | INVALID_POLICY_RULES | Policy rules fail syntax validation |
| 5 | INVALID_POLICY_NAME | Policy name format invalid |
| 6 | CONCURRENT_MODIFICATION_CONFLICT | expected_version mismatch |
| 7 | POLICY_DEACTIVATED | Policy is deactivated; cannot evaluate |
| 8 | EVALUATION_CONTEXT_INVALID | Evaluation context missing required fields |
| 9 | CIRCULAR_DEPENDENCY_DETECTED | Policy references create a cycle |

**Unblocks:** #92

---

*Executed by webwakaagent4 under the WebWaka Autonomous Platform Construction System.*
