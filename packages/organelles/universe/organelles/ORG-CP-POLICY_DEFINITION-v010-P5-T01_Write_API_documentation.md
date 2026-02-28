# [ORG-CP-POLICY_DEFINITION-v0.1.0-P5-T01] Write API Documentation

**Issue:** #110 | **Phase:** 5 | **Agent:** webwakaagent4 | **Date:** 2026-02-26

---

## IPolicyDefinition API Reference

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| createPolicy | CreatePolicyRequest | Result<PolicyDefinition, PolicyError> | Create new policy |
| updatePolicy | UpdatePolicyRequest | Result<PolicyDefinition, PolicyError> | Create new version |
| getPolicy | GetPolicyRequest | Result<PolicyDefinition, PolicyError> | Get policy by ID |
| evaluatePolicy | EvaluatePolicyRequest | Result<PolicyEvaluationResult, PolicyError> | Evaluate policy |
| activateVersion | ActivatePolicyVersionRequest | Result<PolicyDefinition, PolicyError> | Activate version |
| deactivatePolicy | DeactivatePolicyRequest | Result<PolicyDefinition, PolicyError> | Deactivate policy |
| listPolicies | ListPoliciesRequest | Result<PolicyPage, PolicyError> | List with filters |
| archivePolicy | ArchivePolicyRequest | Result<PolicyDefinition, PolicyError> | Archive policy |

## Rule AST Format

```typescript
type PolicyRule = {
  operator: 'AND' | 'OR' | 'NOT' | 'EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'CONTAINS' | 'MATCHES';
  field?: string;
  value?: any;
  children?: PolicyRule[];
};
```

**Unblocks:** #111

*Executed by webwakaagent4 under the WebWaka Autonomous Platform Construction System.*
