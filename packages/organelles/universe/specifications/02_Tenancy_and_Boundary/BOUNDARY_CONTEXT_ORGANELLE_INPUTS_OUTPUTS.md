# BOUNDARY CONTEXT ORGANELLE — Canonical Inputs and Outputs Reference

**Organelle Code:** `ORG-TB-BOUNDARY_CONTEXT-v0.1.0`  
**Document Type:** Inputs & Outputs Reference  
**Phase:** 0 — Specification (P0-T02)  
**Responsible Agent:** webwakaagent4  
**Date:** 2026-02-26  
**Specification Reference:** `BOUNDARY_CONTEXT_ORGANELLE.md` v0.1.0

---

## Overview

This document provides the complete, canonical reference for all inputs accepted and outputs produced by the Boundary Context Organelle. It serves as the binding contract for all Cell-layer consumers and higher-layer structures that interact with this organelle.

---

## Part 1 — Canonical Inputs

The Boundary Context Organelle accepts exactly three input types. No other input types are accepted.

---

### Input 1: ContextRegistrationRequest

**Purpose:** Register a new bounded context with the platform.  
**Trigger:** A new domain context is being introduced into the platform.  
**Idempotency:** Non-idempotent. Duplicate `context_name` will be rejected with `DUPLICATE_CONTEXT_NAME`.

#### Schema

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `context_id` | UUID v4 string | Yes | Caller-generated, globally unique | Permanent identifier for this context |
| `context_name` | string | Yes | 1–128 chars, unique across platform, alphanumeric + hyphens | Human-readable canonical name |
| `domain_scope` | string | Yes | 1–256 chars | Plain-language description of what this context owns |
| `owned_aggregates` | string[] | Yes | Min 1 item; each item 1–64 chars | Aggregate root names exclusively owned by this context |
| `owned_events` | string[] | Yes | Min 1 item; each item 1–128 chars | Domain event names exclusively published by this context |
| `version` | string | Yes | Semantic version format (e.g. "1.0.0") | Version of the context's domain model |
| `registered_by` | string | Yes | Valid subject_id (UUID v4) | Subject ID of the registering agent |

#### Example

```json
{
  "context_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "context_name": "payment-processing",
  "domain_scope": "Manages payment initiation, authorization, capture, settlement, and refund lifecycle for all payment instruments",
  "owned_aggregates": ["Payment", "PaymentMethod", "Refund", "Settlement"],
  "owned_events": [
    "PaymentInitiated",
    "PaymentAuthorized",
    "PaymentCaptured",
    "PaymentFailed",
    "RefundInitiated",
    "RefundCompleted",
    "SettlementProcessed"
  ],
  "version": "1.0.0",
  "registered_by": "f0e9d8c7-b6a5-4321-fedc-ba9876543210"
}
```

#### Validation Rules

1. `context_id` must be a valid UUID v4 format
2. `context_name` must be unique across all ACTIVE and DEPRECATED contexts
3. `owned_aggregates` must not overlap with aggregates owned by any ACTIVE context
4. `owned_events` must not overlap with events owned by any ACTIVE context
5. `registered_by` must be a valid subject_id (existence check delegated to Cell layer)

#### Success Response

Returns a `ContextRecord` (see Output 1) with `status: ACTIVE` and `record_version: 1`.

#### Failure Responses

| Condition | Error Code |
|-----------|-----------|
| `context_name` already exists in ACTIVE or DEPRECATED state | `DUPLICATE_CONTEXT_NAME` |
| Any item in `owned_aggregates` is already owned by another ACTIVE context | `AGGREGATE_OWNERSHIP_CONFLICT` |
| Any item in `owned_events` is already owned by another ACTIVE context | `EVENT_OWNERSHIP_CONFLICT` |
| `context_id` is not a valid UUID v4 | `INVALID_CONTEXT_ID_FORMAT` |
| Required field missing or null | `MISSING_REQUIRED_FIELD` |

---

### Input 2: ContextMapDeclarationRequest

**Purpose:** Declare an explicit integration relationship between two bounded contexts.  
**Trigger:** A context needs to consume events, queries, or commands from another context.  
**Idempotency:** Idempotent if the same (source, target, relationship_type, integration_points) tuple is submitted twice — returns the existing `ContextMapRecord`.

#### Schema

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `source_context_id` | UUID v4 string | Yes | Must reference an ACTIVE context | The consuming context |
| `target_context_id` | UUID v4 string | Yes | Must reference an ACTIVE context; must differ from source | The providing context |
| `relationship_type` | enum | Yes | See relationship types below | The nature of the integration relationship |
| `integration_points` | IntegrationPoint[] | Yes | Min 1 item | Explicit list of what is consumed |
| `declared_by` | string | Yes | Valid subject_id (UUID v4) | Subject ID of the declaring agent |

#### Relationship Types

| Value | Description | Typical Use |
|-------|-------------|-------------|
| `CONFORMIST` | Source adopts target's model wholesale | Source has no bargaining power; accepts target's model as-is |
| `ACL` | Source uses an Anti-Corruption Layer to translate target's model | Source wants to protect its own model from target's semantics |
| `OPEN_HOST` | Target exposes a well-defined public API | Target is a shared service with multiple consumers |
| `PUBLISHED_LANGUAGE` | Both contexts agree on a shared canonical model | Peer-to-peer integration with a shared schema |
| `PARTNERSHIP` | Both contexts co-evolve together | Tightly coupled teams that must coordinate releases |
| `CUSTOMER_SUPPLIER` | Source (customer) drives target (supplier) requirements | Source has bargaining power to influence target's roadmap |

#### IntegrationPoint Schema

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `type` | enum | Yes | `EVENT` \| `QUERY` \| `COMMAND` | The kind of integration point |
| `name` | string | Yes | 1–128 chars | Canonical name of the event/query/command |
| `direction` | enum | Yes | `INBOUND` \| `OUTBOUND` | From source context's perspective |

#### Example

```json
{
  "source_context_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "target_context_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "relationship_type": "ACL",
  "integration_points": [
    {
      "type": "EVENT",
      "name": "PaymentCaptured",
      "direction": "INBOUND"
    },
    {
      "type": "EVENT",
      "name": "PaymentFailed",
      "direction": "INBOUND"
    },
    {
      "type": "QUERY",
      "name": "GetPaymentStatus",
      "direction": "INBOUND"
    }
  ],
  "declared_by": "f0e9d8c7-b6a5-4321-fedc-ba9876543210"
}
```

#### Validation Rules

1. `source_context_id` must reference an ACTIVE context
2. `target_context_id` must reference an ACTIVE context
3. `source_context_id` and `target_context_id` must be different
4. Each `integration_points[].name` that is of type `EVENT` must be in the `owned_events` list of the target context
5. Each `integration_points[].name` that is of type `COMMAND` must be in the declared command surface of the target context

#### Success Response

Returns a `ContextMapRecord` (see Output 2) with `status: ACTIVE`.

#### Failure Responses

| Condition | Error Code |
|-----------|-----------|
| Source context is RETIRED | `RETIRED_CONTEXT_REFERENCE` |
| Target context is RETIRED | `RETIRED_CONTEXT_REFERENCE` |
| Source and target are the same context | `SELF_REFERENTIAL_MAP` |
| Integration point references an event not owned by target | `UNDECLARED_EVENT_REFERENCE` |

---

### Input 3: BoundaryViolationReport

**Purpose:** Record a detected boundary violation for audit purposes.  
**Trigger:** A monitoring agent or enforcement layer detects an undeclared cross-context access.  
**Idempotency:** Idempotent on `violation_id` — duplicate reports with the same ID are ignored.

#### Schema

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `violation_id` | UUID v4 string | Yes | Caller-generated, globally unique | Permanent identifier for this violation record |
| `violating_context` | UUID v4 string | Yes | Must reference a known context | The context that attempted the boundary crossing |
| `target_context` | UUID v4 string | Yes | Must reference a known context | The context whose boundary was crossed |
| `violation_type` | enum | Yes | See violation types below | The nature of the violation |
| `violation_detail` | string | Yes | 1–1024 chars | Human-readable description of the violation |
| `detected_at` | integer | Yes | UTC milliseconds since epoch | When the violation was detected |
| `detected_by` | string | Yes | Valid subject_id or system identifier | Who or what detected the violation |

#### Violation Types

| Value | Description |
|-------|-------------|
| `DIRECT_MODEL_ACCESS` | A context accessed another context's internal domain model directly (e.g., queried its database table) |
| `UNDECLARED_EVENT_CONSUMPTION` | A context consumed an event from another context without a declared context map |
| `UNDECLARED_COMMAND_INVOCATION` | A context invoked a command in another context without a declared context map |

#### Example

```json
{
  "violation_id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "violating_context": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "target_context": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "violation_type": "UNDECLARED_EVENT_CONSUMPTION",
  "violation_detail": "Order context consumed PaymentCaptured event without a declared context map to payment-processing context",
  "detected_at": 1740528000000,
  "detected_by": "boundary-enforcement-agent-01"
}
```

#### Success Response

Returns the recorded `BoundaryViolationRecord` with confirmation of audit trail entry.

---

## Part 2 — Canonical Outputs

The Boundary Context Organelle produces exactly three output types.

---

### Output 1: ContextRecord

**Produced by:** ContextRegistrationRequest (on success), ContextLookupRequest, ContextStatusUpdateRequest  
**Purpose:** The authoritative record of a registered bounded context.

#### Schema

| Field | Type | Description |
|-------|------|-------------|
| `context_id` | UUID v4 string | Permanent, immutable identifier |
| `context_name` | string | Human-readable canonical name |
| `domain_scope` | string | Plain-language description of owned domain |
| `owned_aggregates` | string[] | Aggregate root names exclusively owned |
| `owned_events` | string[] | Domain event names exclusively published |
| `version` | string | Semantic version of the context's domain model |
| `status` | enum | `ACTIVE` \| `DEPRECATED` \| `RETIRED` |
| `registered_at` | integer | UTC milliseconds since epoch |
| `registered_by` | string | subject_id of registering agent |
| `updated_at` | integer | UTC milliseconds since epoch (last modification) |
| `record_version` | integer | Optimistic concurrency counter (starts at 1, increments on each update) |

---

### Output 2: ContextMapRecord

**Produced by:** ContextMapDeclarationRequest (on success), ContextMapLookupRequest  
**Purpose:** The authoritative record of a declared integration relationship between two contexts.

#### Schema

| Field | Type | Description |
|-------|------|-------------|
| `map_id` | UUID v4 string | Permanent, immutable identifier for this context map |
| `source_context_id` | UUID v4 string | The consuming context |
| `target_context_id` | UUID v4 string | The providing context |
| `relationship_type` | enum | The nature of the integration relationship |
| `integration_points` | IntegrationPoint[] | Explicit list of what is consumed |
| `status` | enum | `ACTIVE` \| `REVOKED` |
| `declared_at` | integer | UTC milliseconds since epoch |
| `declared_by` | string | subject_id of declaring agent |

---

### Output 3: Boundary Lifecycle Events

**Produced by:** All state-changing operations  
**Purpose:** Published to the platform event stream for downstream consumers.

#### Event Catalogue

| Event Type | Trigger | Key Fields |
|-----------|---------|-----------|
| `CONTEXT_REGISTERED` | Successful ContextRegistrationRequest | context_id, context_name, registered_at |
| `CONTEXT_DEPRECATED` | Context status changed to DEPRECATED | context_id, deprecated_at, deprecated_by |
| `CONTEXT_RETIRED` | Context status changed to RETIRED | context_id, retired_at, retired_by |
| `CONTEXT_MAP_DECLARED` | Successful ContextMapDeclarationRequest | map_id, source_context_id, target_context_id, relationship_type, declared_at |
| `CONTEXT_MAP_REVOKED` | Context map status changed to REVOKED | map_id, revoked_at, revoked_by |
| `BOUNDARY_VIOLATION_DETECTED` | Successful BoundaryViolationReport | violation_id, violating_context, target_context, violation_type, detected_at |

---

## Part 3 — Input/Output Invariants

The following invariants govern the relationship between inputs and outputs:

| Invariant | Rule |
|-----------|------|
| IO-INV-01 | Every successful ContextRegistrationRequest produces exactly one ContextRecord and exactly one CONTEXT_REGISTERED event |
| IO-INV-02 | Every successful ContextMapDeclarationRequest produces exactly one ContextMapRecord and exactly one CONTEXT_MAP_DECLARED event |
| IO-INV-03 | Every successful BoundaryViolationReport produces exactly one BoundaryViolationRecord and exactly one BOUNDARY_VIOLATION_DETECTED event |
| IO-INV-04 | A failed input produces no output record and no event |
| IO-INV-05 | Events are published after the record is durably stored, never before |
| IO-INV-06 | All output records are immutable after creation except for `status`, `updated_at`, and `record_version` fields |

---

**Document Version:** 0.1.0  
**Agent:** webwakaagent4  
**Date:** 2026-02-26
