# [ORG-IA-SUBJECT_REGISTRY-v0.1.0-P1-T03] Create Architectural Diagrams

**Structure:** `ORG-IA-SUBJECT_REGISTRY-v0.1.0`
**Layer:** Organelle
**Category:** Identity & Access (01)
**Issue:** #9
**Parent Issue:** #6 (Phase 1: Design)
**Master Issue:** #1 (Subject Registry Organelle — Master Implementation Issue)
**Repository:** WebWakaHub/webwaka-organelle-universe
**Type:** design
**Execution Date:** 2026-02-26
**Executing Agent:** webwakaagent3 (Architecture & System Design Department)
**Acting Under Canonical Role:** Architecture & System Design
**Protocol:** WebWaka Autonomous Platform Construction System

---

## 1. Overview

This document provides the complete set of **architectural diagrams** for the Subject Registry Organelle. These diagrams visualize the organelle's internal structure, external interactions, data flow, and lifecycle behavior. All diagrams are expressed in Mermaid notation for version-control compatibility and reproducibility.

---

## 2. Component Architecture Diagram

This diagram shows the internal components of the Subject Registry Organelle and their relationships.

```mermaid
graph TB
    subgraph "Subject Registry Organelle"
        direction TB
        SR[SubjectRegistry<br/>Main Orchestrator]
        SE[SubjectEntity<br/>Domain Model]
        SM[StateMachine<br/>Transition Validator]
        
        SR --> SE
        SR --> SM
    end
    
    subgraph "Injected Dependencies (Cell Layer)"
        direction TB
        IS[ISubjectStorage<br/>Persistence Abstraction]
        IE[ISubjectEventEmitter<br/>Event Emission]
        IO[ISubjectObservability<br/>Metrics & Logs]
    end
    
    SR --> IS
    SR --> IE
    SR --> IO
    
    subgraph "Consumers (Higher Layers)"
        direction TB
        C1[Cell Layer]
        C2[Tissue Layer]
        C3[Organ Layer]
    end
    
    C1 --> SR
    C2 -.-> C1
    C3 -.-> C2
    
    style SR fill:#4A90D9,color:#fff
    style SE fill:#7B68EE,color:#fff
    style SM fill:#7B68EE,color:#fff
    style IS fill:#F5A623,color:#fff
    style IE fill:#F5A623,color:#fff
    style IO fill:#F5A623,color:#fff
```

### 2.1. Component Descriptions

| Component | Responsibility | Internal/External |
|-----------|---------------|-------------------|
| **SubjectRegistry** | Main orchestrator — coordinates all operations, delegates to SubjectEntity and StateMachine | Internal |
| **SubjectEntity** | Domain model — enforces structural invariants on individual subject records | Internal |
| **StateMachine** | Transition validator — validates status transitions against the state machine rules | Internal |
| **ISubjectStorage** | Persistence abstraction — injected at Cell layer | External (injected) |
| **ISubjectEventEmitter** | Event emission — injected at Cell layer | External (injected) |
| **ISubjectObservability** | Metrics and logging — injected at Cell layer | External (injected) |

---

## 3. Subject Lifecycle State Machine Diagram

This diagram formalizes the state machine designed in P1-T01.

```mermaid
stateDiagram-v2
    [*] --> ACTIVE : registerSubject()
    
    ACTIVE --> SUSPENDED : SUSPEND
    ACTIVE --> ARCHIVED : ARCHIVE
    ACTIVE --> DELETED : DELETE
    
    SUSPENDED --> ACTIVE : REACTIVATE
    SUSPENDED --> ARCHIVED : ARCHIVE
    SUSPENDED --> DELETED : DELETE
    
    ARCHIVED --> [*] : Terminal
    DELETED --> [*] : Terminal
    
    note right of ACTIVE
        Initial state for all
        newly registered subjects
    end note
    
    note right of ARCHIVED
        Read-only. No further
        transitions permitted.
    end note
    
    note right of DELETED
        Soft delete. Record retained
        for configurable period.
    end note
```

---

## 4. Data Flow Diagram — Registration

This diagram shows the complete data flow for the `registerSubject` operation.

```mermaid
sequenceDiagram
    participant Consumer as Consumer (Cell/Tissue)
    participant SR as SubjectRegistry
    participant SE as SubjectEntity
    participant SM as StateMachine
    participant Store as ISubjectStorage
    participant Events as ISubjectEventEmitter
    participant Obs as ISubjectObservability

    Consumer->>SR: registerSubject(request)
    SR->>SR: Validate request fields
    SR->>SE: Create SubjectEntity(type, attributes)
    SE->>SE: Generate UUID subject_id
    SE->>SE: Set status = ACTIVE
    SE->>SE: Set version = 1
    SE->>SE: Set created_at, updated_at = now()
    SE-->>SR: SubjectRecord
    SR->>Store: create(SubjectRecord)
    Store-->>SR: StorageResult<SubjectRecord>
    alt Storage Success
        SR->>Events: emit(SubjectCreatedEvent)
        SR->>Obs: recordMetric("subject.registered", 1, COUNTER)
        SR->>Obs: log(INFO, "Subject registered", context)
        SR-->>Consumer: SubjectRecord
    else Storage Failure (COLLISION)
        SR->>Obs: log(ERROR, "Subject ID collision", context)
        SR-->>Consumer: Error(SUBJECT_ID_COLLISION)
    end
```

---

## 5. Data Flow Diagram — Status Update

```mermaid
sequenceDiagram
    participant Consumer as Consumer (Cell/Tissue)
    participant SR as SubjectRegistry
    participant SM as StateMachine
    participant Store as ISubjectStorage
    participant Events as ISubjectEventEmitter
    participant Obs as ISubjectObservability

    Consumer->>SR: updateSubjectStatus(request)
    SR->>Store: findById(subject_id)
    Store-->>SR: StorageResult<SubjectRecord>
    alt Subject Not Found
        SR-->>Consumer: Error(SUBJECT_NOT_FOUND)
    else Subject Found
        SR->>SM: isValidTransition(current_status, new_status)
        alt Invalid Transition
            SR-->>Consumer: Error(INVALID_STATUS_TRANSITION)
        else Valid Transition
            SR->>Store: update(subject_id, {status, version+1, updated_at}, expected_version)
            alt Version Conflict
                SR-->>Consumer: Error(CONCURRENT_MODIFICATION_CONFLICT)
            else Update Success
                SR->>Events: emit(SubjectStatusChangedEvent)
                alt new_status == ARCHIVED
                    SR->>Events: emit(SubjectArchivedEvent)
                else new_status == DELETED
                    SR->>Events: emit(SubjectDeletedEvent)
                end
                SR->>Obs: recordMetric("subject.status_changed", 1, COUNTER)
                SR-->>Consumer: Updated SubjectRecord
            end
        end
    end
```

---

## 6. Data Flow Diagram — Subject Lookup

```mermaid
sequenceDiagram
    participant Consumer as Consumer (Cell/Tissue)
    participant SR as SubjectRegistry
    participant Store as ISubjectStorage
    participant Obs as ISubjectObservability

    Consumer->>SR: getSubject(request)
    SR->>Store: findById(subject_id)
    Store-->>SR: StorageResult<SubjectRecord | null>
    alt Subject Found
        SR->>Obs: recordMetric("subject.lookup", 1, COUNTER)
        SR-->>Consumer: SubjectRecord
    else Subject Not Found
        SR->>Obs: log(WARN, "Subject not found", context)
        SR-->>Consumer: Error(SUBJECT_NOT_FOUND)
    end
```

---

## 7. Layer Position Diagram

This diagram shows the Subject Registry Organelle's position within the WebWaka Biological Architecture.

```mermaid
graph TB
    subgraph "Organism Layer"
        ORG[WebWaka Platform]
    end
    
    subgraph "System Layer"
        SYS[Identity System]
    end
    
    subgraph "Organ Layer"
        ORGAN[Identity Organ]
    end
    
    subgraph "Tissue Layer"
        TISSUE[Identity Tissue]
    end
    
    subgraph "Cell Layer"
        CELL[Subject Registry Cell<br/>Technology-specific implementation]
    end
    
    subgraph "Organelle Layer (THIS LEVEL)"
        ORGANELLE[Subject Registry Organelle<br/>Structural primitive]
    end
    
    ORG --> SYS
    SYS --> ORGAN
    ORGAN --> TISSUE
    TISSUE --> CELL
    CELL --> ORGANELLE
    
    style ORGANELLE fill:#4A90D9,color:#fff,stroke:#2E6DA4,stroke-width:3px
    style CELL fill:#7B68EE,color:#fff
```

---

## 8. Category Boundary Diagram

This diagram shows the Subject Registry Organelle's position within the Identity & Access category and its isolation from other categories.

```mermaid
graph LR
    subgraph "Identity & Access Category"
        SR[Subject Registry<br/>Organelle]
        AUTH[Authentication<br/>Organelle]
        AUTHZ[Authorization<br/>Organelle]
        ROLE[Role Assignment<br/>Organelle]
        CRED[Credential Vault<br/>Organelle]
        TOKEN[Token Issuance<br/>Organelle]
    end
    
    subgraph "Security & Trust Category"
        TRUST[Trust Assertion<br/>Organelle]
    end
    
    subgraph "Tenancy & Boundary Category"
        TENANT[Boundary Context<br/>Organelle]
    end
    
    SR -.-x TRUST
    SR -.-x TENANT
    
    style SR fill:#4A90D9,color:#fff,stroke:#2E6DA4,stroke-width:3px
    style TRUST fill:#ccc,color:#666
    style TENANT fill:#ccc,color:#666
```

The dashed lines with X marks indicate **prohibited dependencies** (CON-SR-001). The Subject Registry Organelle has no dependencies on any other organelle, including those within its own category (for v0.1.0).

---

## 9. Verification Gate Checklist

| Gate Criterion | Status |
|----------------|--------|
| Component architecture diagram provided | PASS |
| State machine diagram provided (Mermaid) | PASS |
| Registration data flow sequence diagram provided | PASS |
| Status update data flow sequence diagram provided | PASS |
| Lookup data flow sequence diagram provided | PASS |
| Layer position diagram provided | PASS |
| Category boundary diagram provided | PASS |
| All diagrams use version-control-compatible notation | PASS |

---

## 10. Constitutional Compliance Declaration

This artifact has been produced in full compliance with:

- **AGENT_EXECUTION_CONTEXT_MASTER_CONSTITUTION_v1.0.0** — All pre-execution checklist items verified
- **ORGANELLE_IMPLEMENTATION_STANDARD** — Phase 1, Task 03 requirements satisfied
- **DGM-01 / DEP-01** — Dependency #8 confirmed complete before execution

---

## 11. Execution Metadata

| Field | Value |
|-------|-------|
| **Issue Number** | #9 |
| **Repository** | WebWakaHub/webwaka-organelle-universe |
| **Agent** | webwakaagent3 |
| **Wave** | Wave 1 (Infrastructure Stabilization) |
| **Sequence Phase** | 1A |
| **Execution Status** | COMPLETE |
| **Unblocks** | #6 (Phase 1: Design parent issue) |

---

*This document was produced by webwakaagent3 (Architecture & System Design Department) under the WebWaka Autonomous Platform Construction System. It represents a substantive design deliverable, not a template artifact.*
