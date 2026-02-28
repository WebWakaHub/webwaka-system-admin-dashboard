import os

base = "/home/ubuntu/webwaka-organelle-universe/organelles"

files = {
    "ORG-CP-POLICY_DEFINITION-v010-P1-T01_Design_state_machine_model.md": """# [ORG-CP-POLICY_DEFINITION-v0.1.0-P1-T01] Design State Machine Model

**Issue:** #94
**Phase:** 1 - Design
**Agent:** webwakaagent3 (Architecture & System Design)
**Execution Date:** 2026-02-26

---

## 1. Policy Lifecycle States

| State | Description |
|-------|-------------|
| DRAFT | Policy created but no version activated yet |
| ACTIVE | Policy has an active version available for evaluation |
| DEACTIVATED | Policy explicitly deactivated; cannot be evaluated |
| ARCHIVED | Policy permanently archived; immutable |

## 2. State Transitions

| # | From | To | Trigger | Guard |
|---|------|----|---------|-------|
| 1 | (none) | DRAFT | createPolicy() | policy_name unique, rules valid |
| 2 | DRAFT | ACTIVE | activateVersion() | version exists |
| 3 | ACTIVE | ACTIVE | activateVersion() | new version exists |
| 4 | ACTIVE | DEACTIVATED | deactivatePolicy() | requesting_context authorized |
| 5 | DEACTIVATED | ACTIVE | activateVersion() | version exists |
| 6 | ACTIVE | ARCHIVED | archivePolicy() | requesting_context authorized |
| 7 | DEACTIVATED | ARCHIVED | archivePolicy() | requesting_context authorized |

## 3. Policy Version States

| State | Description |
|-------|-------------|
| CREATED | Version created and persisted |
| ACTIVE | Version is the current active version for evaluation |
| SUPERSEDED | Version replaced by a newer active version |

## 4. Terminal States

- **ARCHIVED** is the only terminal state for policies
- **SUPERSEDED** is terminal for individual versions (cannot be re-activated in v0.1.0)

## 5. State Diagram (Mermaid)

```mermaid
stateDiagram-v2
    [*] --> DRAFT : createPolicy()
    DRAFT --> ACTIVE : activateVersion()
    ACTIVE --> ACTIVE : activateVersion() [new version]
    ACTIVE --> DEACTIVATED : deactivatePolicy()
    DEACTIVATED --> ACTIVE : activateVersion()
    ACTIVE --> ARCHIVED : archivePolicy()
    DEACTIVATED --> ARCHIVED : archivePolicy()
    ARCHIVED --> [*]
```

**Unblocks:** #95

---

*Executed by webwakaagent3 under the WebWaka Autonomous Platform Construction System.*
""",
    "ORG-CP-POLICY_DEFINITION-v010-P1-T02_Define_interface_contracts.md": """# [ORG-CP-POLICY_DEFINITION-v0.1.0-P1-T02] Define Interface Contracts

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
""",
    "ORG-CP-POLICY_DEFINITION-v010-P1-T03_Create_architectural_diagrams.md": """# [ORG-CP-POLICY_DEFINITION-v0.1.0-P1-T03] Create Architectural Diagrams

**Issue:** #96
**Phase:** 1 - Design
**Agent:** webwakaagent3 (Architecture & System Design)
**Execution Date:** 2026-02-26

---

## 1. Hexagonal Architecture

```
                    ┌─────────────────────────────────────┐
                    │     PolicyDefinitionOrganelle        │
                    │                                     │
  CreatePolicy ───► │  ┌─────────────────────────────┐   │
  UpdatePolicy ───► │  │       Core Domain Logic      │   │
  GetPolicy ────►   │  │                             │   │
  Evaluate ─────►   │  │  PolicyEntity (state machine)│   │
  Activate ─────►   │  │  RuleEvaluator              │   │
  Deactivate ───►   │  │  DependencyChecker          │   │
  List ─────────►   │  └──────┬──────┬──────┬────────┘   │
  Archive ──────►   │         │      │      │            │
                    │         ▼      ▼      ▼            │
                    │  ┌──────┐ ┌────┐ ┌────────┐ ┌─────┐│
                    │  │Store │ │Evnt│ │Observe │ │Valid ││
                    │  │Adapt.│ │Emit│ │ability │ │ator ││
                    │  └──┬───┘ └─┬──┘ └───┬────┘ └──┬──┘│
                    └─────┼───────┼────────┼─────────┼───┘
                          ▼       ▼        ▼         ▼
                     PostgreSQL  Kafka   OpenTel   JSONSchema
                     IndexedDB   NATS    Console   Custom
                     InMemory    InMem   NoOp      NoOp
```

## 2. Data Flow: Policy Evaluation

```
Client ──► evaluatePolicy(req)
              │
              ├── 1. Validate requesting_context
              ├── 2. Load policy from storage
              ├── 3. Check state == ACTIVE
              ├── 4. Load active_version rules
              ├── 5. Execute rule evaluation engine
              │      ├── Parse AST
              │      ├── Evaluate conditions against context
              │      └── Aggregate decisions (AND/OR/NOT)
              ├── 6. Record observability metrics
              ├── 7. Emit PolicyEvaluatedEvent
              └── 8. Return PolicyEvaluationResult
```

## 3. Dependency Graph

```
PolicyDefinitionOrganelle
  ├── depends on: (none — dependency root)
  ├── consumed by: Trust Assertion Organelle (policy signing)
  ├── consumed by: Subject Registry (access policies)
  ├── consumed by: Governance Registry (governance rules)
  └── consumed by: Any cell requiring policy evaluation
```

**Unblocks:** #93 (Phase 1 parent)

---

*Executed by webwakaagent3 under the WebWaka Autonomous Platform Construction System.*
""",
}

for fname, content in files.items():
    path = os.path.join(base, fname)
    with open(path, 'w') as f:
        f.write(content)
    print(f"Written: {fname}")
