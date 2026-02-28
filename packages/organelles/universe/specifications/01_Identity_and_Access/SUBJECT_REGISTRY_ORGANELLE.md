# SUBJECT REGISTRY ORGANELLE

**Specification Version:** 0.1.0  
**Layer:** Organelle  
**Category:** Identity & Access  
**Phase:** 0 — Specification  
**State:** Proposed

---

## 1. Canonical Category

**Identity & Access**

This organelle belongs to the Identity & Access category within the Organelle Layer of the WebWaka Biological Architecture.

---

## 2. Formal Definition

The **Subject Registry Organelle** is a primitive structural unit responsible for the atomic modeling, registration, and lifecycle management of **subjects** within the WebWaka platform.

A **subject** is defined as any entity that may perform actions, hold identity attributes, or be referenced within the system. Subjects include but are not limited to: users, service accounts, API clients, system processes, and external agents.

This organelle provides the foundational primitive for subject identity modeling. It does not authenticate, authorize, or assign permissions. It exists solely to establish and maintain the structural representation of a subject.

---

## 3. Responsibilities

The Subject Registry Organelle is responsible for:

1. **Subject Registration:** Creating a new subject record with a unique, immutable identifier
2. **Subject Identification:** Providing a canonical subject identifier (Subject ID) that remains stable across the subject's lifecycle
3. **Subject Type Classification:** Classifying subjects by type (e.g., human user, service account, API client, system process)
4. **Subject Attribute Storage:** Storing structural identity attributes (e.g., subject type, creation timestamp, status)
5. **Subject Status Management:** Tracking subject lifecycle states (e.g., active, suspended, archived, deleted)
6. **Subject Lookup:** Enabling retrieval of subject records by Subject ID
7. **Subject Lifecycle Events:** Emitting events for subject creation, status changes, and archival

---

## 4. Explicit Exclusions

The Subject Registry Organelle explicitly **does NOT**:

- **Authenticate subjects** (authentication belongs to Authentication Organelle)
- **Authorize actions** (authorization belongs to Authorization Organelle)
- **Assign roles or permissions** (role assignment belongs to Role Assignment Organelle)
- **Evaluate policies** (policy evaluation belongs to Policy Engine Organelle)
- **Store credentials** (credential storage belongs to Credential Vault Organelle)
- **Issue tokens** (token issuance belongs to Token Issuance Organelle)
- **Define relationships between subjects** (relationships belong to Relationship & Graph category organelles)
- **Implement tenancy hierarchy** (tenancy belongs to Tenancy & Boundary category organelles)
- **Score risk or trust** (risk scoring belongs to Security & Trust category organelles)
- **Implement business-domain semantics** (business logic belongs to Organ and System layers)
- **Implement UI components** (UI belongs to Experience & Interface category organelles)
- **Define deployment topology** (deployment belongs to infrastructure layers outside biological architecture)

---

## 5. Inputs

The Subject Registry Organelle accepts the following structural inputs:

### 5.1. Subject Registration Request

- **Subject Type:** Enumerated type (e.g., `USER`, `SERVICE_ACCOUNT`, `API_CLIENT`, `SYSTEM_PROCESS`)
- **Subject Attributes:** Key-value pairs representing structural identity attributes (e.g., `display_name`, `email`, `external_id`)
- **Requesting Context:** Metadata about the registration request (e.g., requesting system, timestamp)

### 5.2. Subject Status Update Request

- **Subject ID:** Immutable unique identifier
- **New Status:** Enumerated status (e.g., `ACTIVE`, `SUSPENDED`, `ARCHIVED`, `DELETED`)
- **Reason:** Optional reason for status change

### 5.3. Subject Lookup Request

- **Subject ID:** Immutable unique identifier

---

## 6. Outputs

The Subject Registry Organelle produces the following structural outputs:

### 6.1. Subject Record

- **Subject ID:** Immutable unique identifier (UUID or equivalent)
- **Subject Type:** Enumerated type
- **Subject Attributes:** Key-value pairs of identity attributes
- **Status:** Current lifecycle status
- **Created At:** Timestamp of subject creation
- **Updated At:** Timestamp of last update
- **Version:** Record version for optimistic concurrency control

### 6.2. Subject Lifecycle Events

- **Subject Created Event:** Emitted when a new subject is registered
- **Subject Status Changed Event:** Emitted when subject status changes
- **Subject Archived Event:** Emitted when subject is archived
- **Subject Deleted Event:** Emitted when subject is deleted

### 6.3. Subject Lookup Response

- **Subject Record:** Complete subject record if found
- **Not Found Indicator:** If subject does not exist

---

## 7. Invariants

The Subject Registry Organelle enforces the following structural invariants:

### 7.1. Subject ID Immutability

Once a Subject ID is assigned, it **MUST NOT** be changed. The Subject ID is the stable, canonical identifier for the subject across its entire lifecycle.

### 7.2. Subject Type Constraints

A subject **MUST** have exactly one subject type. Subject type **MUST NOT** be null or empty. Subject type **MUST** be one of the enumerated types defined in the organelle specification.

### 7.3. No Embedded Permission Logic

The Subject Registry Organelle **MUST NOT** contain any authorization, permission, role, or policy logic. It is purely a structural identity primitive.

### 7.4. No Cross-Category Dependencies

The Subject Registry Organelle **MUST NOT** depend on organelles outside the Identity & Access category. It **MUST NOT** depend on Security & Trust, Tenancy & Boundary, or any other category.

### 7.5. Subject ID Uniqueness

Every Subject ID **MUST** be globally unique within the WebWaka platform. No two subjects may share the same Subject ID.

### 7.6. Status Transition Validity

Subject status transitions **MUST** follow valid state machine rules. Invalid transitions (e.g., `DELETED` → `ACTIVE`) **MUST** be rejected.

### 7.7. No Business-Domain Semantics

The Subject Registry Organelle **MUST NOT** implement business-domain-specific logic. It remains domain-agnostic and reusable across all business contexts.

---

## 8. Failure Modes

The Subject Registry Organelle may encounter the following structural failure modes:

### 8.1. Subject ID Collision

**Condition:** Attempt to register a subject with a Subject ID that already exists.  
**Handling:** Reject registration request with error code `SUBJECT_ID_COLLISION`.

### 8.2. Invalid Subject Type

**Condition:** Attempt to register a subject with an invalid or unsupported subject type.  
**Handling:** Reject registration request with error code `INVALID_SUBJECT_TYPE`.

### 8.3. Subject Not Found

**Condition:** Attempt to lookup or update a subject that does not exist.  
**Handling:** Return error code `SUBJECT_NOT_FOUND`.

### 8.4. Invalid Status Transition

**Condition:** Attempt to transition subject status in a way that violates state machine rules.  
**Handling:** Reject status update request with error code `INVALID_STATUS_TRANSITION`.

### 8.5. Concurrent Modification Conflict

**Condition:** Attempt to update a subject record that has been modified by another process (optimistic concurrency control failure).  
**Handling:** Reject update request with error code `CONCURRENT_MODIFICATION_CONFLICT`.

---

## 9. Security Considerations

The Subject Registry Organelle operates at the **identity boundary** and must enforce the following security considerations:

### 9.1. Subject ID as Public Identifier

Subject IDs are considered **public identifiers** and may be exposed in logs, APIs, and events. They **MUST NOT** contain sensitive information (e.g., email addresses, social security numbers).

### 9.2. No Credential Storage

The Subject Registry Organelle **MUST NOT** store credentials, passwords, API keys, or any authentication secrets. Credential storage belongs to the Credential Vault Organelle.

### 9.3. No Cryptography Logic

The Subject Registry Organelle **MUST NOT** implement cryptographic operations (e.g., hashing, encryption, signing). Cryptographic operations belong to Security & Trust category organelles.

### 9.4. Audit Trail

All subject registration, status changes, and lifecycle events **MUST** be logged for audit purposes. Audit logs **MUST** include timestamp, requesting context, and subject ID.

### 9.5. Access Control at Higher Layers

Access control for subject registration and modification is enforced at higher layers (Cell, Tissue, Organ). The organelle itself does not enforce authorization.

---

## 10. Observability Hooks

The Subject Registry Organelle provides the following observability hooks:

### 10.1. Metrics

- **Subject Registration Rate:** Number of subjects registered per unit time
- **Subject Lookup Rate:** Number of subject lookups per unit time
- **Subject Status Change Rate:** Number of status changes per unit time
- **Active Subject Count:** Total number of subjects in `ACTIVE` status
- **Archived Subject Count:** Total number of subjects in `ARCHIVED` status
- **Deleted Subject Count:** Total number of subjects in `DELETED` status

### 10.2. Logs

- **Subject Registration Log:** Logged when a subject is registered (includes Subject ID, Subject Type, timestamp)
- **Subject Status Change Log:** Logged when subject status changes (includes Subject ID, old status, new status, reason, timestamp)
- **Subject Lookup Log:** Logged when a subject is looked up (includes Subject ID, timestamp, requesting context)
- **Error Log:** Logged when a failure mode occurs (includes error code, Subject ID if applicable, timestamp)

### 10.3. Events

- **Subject Created Event:** Published to event stream when subject is created
- **Subject Status Changed Event:** Published to event stream when subject status changes
- **Subject Archived Event:** Published to event stream when subject is archived
- **Subject Deleted Event:** Published to event stream when subject is deleted

---

## 11. Dependency Map

The Subject Registry Organelle has the following dependency constraints:

### 11.1. No Cross-Category Dependencies

The Subject Registry Organelle **MUST NOT** depend on organelles outside the Identity & Access category.

### 11.2. No Dependencies on Security & Trust

The Subject Registry Organelle **MUST NOT** depend on Security & Trust category organelles (e.g., Credential Vault, Token Issuance, Risk Scoring).

### 11.3. No Dependencies on Tenancy & Boundary

The Subject Registry Organelle **MUST NOT** depend on Tenancy & Boundary category organelles (e.g., Tenant Registry, Workspace Boundary).

### 11.4. No Dependencies on Higher Layers

The Subject Registry Organelle **MUST NOT** depend on Cells, Tissues, Organs, or Systems. Dependencies flow downward only.

### 11.5. Potential Dependencies Within Category

The Subject Registry Organelle may depend on other Identity & Access organelles if needed (e.g., Subject Type Registry Organelle if subject types are externalized). However, for this specification, no intra-category dependencies are declared.

---

## 12. Versioning Strategy

The Subject Registry Organelle follows **semantic versioning** (MAJOR.MINOR.PATCH):

### 12.1. Version Format

- **MAJOR:** Incremented for breaking changes (e.g., removal of fields, incompatible API changes)
- **MINOR:** Incremented for backward-compatible additions (e.g., new subject types, new attributes)
- **PATCH:** Incremented for backward-compatible bug fixes

### 12.2. Current Version

**0.1.0** — Initial specification (pre-release)

### 12.3. Backward Compatibility Rule

Once the organelle reaches version **1.0.0** (ratified and implemented), all changes **MUST** maintain backward compatibility unless a MAJOR version increment is approved through constitutional amendment.

### 12.4. Deprecation Policy

Deprecated fields, attributes, or behaviors **MUST** be marked as deprecated for at least one MINOR version before removal in a MAJOR version.

### 12.5. Version Tracking

The organelle version **MUST** be tracked in the `BIOLOGICAL_MANIFEST.json` file at the root of the organelle's implementation repository.

---

## Status

**Current State:** Proposed  
**Phase:** 0 — Specification  
**Next Phase:** Phase 1 — Design (pending approval)

---

## Ratification

**Status:** Pending  
**Authority:** Founder (webwaka007)  
**Date:** TBD

---
