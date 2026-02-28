# [ORG-CP-POLICY_DEFINITION-v0.1.0-P1-T02] Define Interface Contracts

**Issue:** #95
**Phase:** 1 - Design
**Agent:** webwakaagent3 (Architecture & System Design)
**Execution Date:** 2026-02-26

---

## 1. Primary Interface: IPolicyDefinition

```typescript
interface IPolicyDefinition {
  createPolicy(req: CreatePolicyRequest): Promise<Result<PolicyDefinition, PolicyError>>;
  updatePolicy(req: UpdatePolicyRequest): Promise<Result<PolicyDefinition, PolicyError>>;
  getPolicy(req: GetPolicyRequest): Promise<Result<PolicyDefinition, PolicyError>>;
  evaluatePolicy(req: EvaluatePolicyRequest): Promise<Result<PolicyEvaluationResult, PolicyError>>;
  activateVersion(req: ActivatePolicyVersionRequest): Promise<Result<PolicyDefinition, PolicyError>>;
  deactivatePolicy(req: DeactivatePolicyRequest): Promise<Result<PolicyDefinition, PolicyError>>;
  listPolicies(req: ListPoliciesRequest): Promise<Result<PolicyPage, PolicyError>>;
  archivePolicy(req: ArchivePolicyRequest): Promise<Result<PolicyDefinition, PolicyError>>;
}
```

## 2. Port Interfaces (Injected Dependencies)

### IPolicyStorageAdapter
```typescript
interface IPolicyStorageAdapter {
  save(policy: PolicyDefinition): Promise<Result<void, StorageError>>;
  findById(policy_id: string): Promise<Result<PolicyDefinition | null, StorageError>>;
  findByName(policy_name: string): Promise<Result<PolicyDefinition | null, StorageError>>;
  list(filter: PolicyFilter, cursor: string | null, limit: number): Promise<Result<PolicyPage, StorageError>>;
  checkIdempotency(key: string): Promise<Result<PolicyDefinition | null, StorageError>>;
}
```

### IPolicyEventEmitter
```typescript
interface IPolicyEventEmitter {
  emit(event: PolicyEvent): Promise<void>;
}
```

### IPolicyObservability
```typescript
interface IPolicyObservability {
  recordOperation(op: string, duration_ms: number, success: boolean): void;
  recordEvaluation(policy_id: string, decision: string, duration_ms: number): void;
}
```

### IPolicyRuleValidator
```typescript
interface IPolicyRuleValidator {
  validate(rules: PolicyRuleAST): Result<void, ValidationError>;
  checkDependencies(rules: PolicyRuleAST, existing: PolicyDefinition[]): Result<void, DependencyError>;
}
```

## 3. Constructor Signature

```typescript
class PolicyDefinitionOrganelle implements IPolicyDefinition {
  constructor(
    storage: IPolicyStorageAdapter,
    events: IPolicyEventEmitter,
    observability: IPolicyObservability,
    ruleValidator: IPolicyRuleValidator
  ) {}
}
```

**Unblocks:** #96

---

*Executed by webwakaagent3 under the WebWaka Autonomous Platform Construction System.*
