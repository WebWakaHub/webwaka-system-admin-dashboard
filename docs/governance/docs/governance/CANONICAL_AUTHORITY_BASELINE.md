
# CANONICAL AUTHORITY BASELINE

**Version:** 1.0  
**Date:** 2026-02-16  
**Status:** RATIFIABLE - AWAITING FOUNDER APPROVAL  
**Authority:** Founder-Mandated Constitutional Synthesis  
**Executor:** webwaka007 (Chief Constitutional Synthesizer)

---

## 0. Purpose & Effect

This document establishes the **single, correct, future-proof, and enforceable source of truth** for the WebWaka platform. It is the legal and architectural root of the platform.

**EFFECTIVE IMMEDIATELY:**
- All other governance documents are subordinate to this baseline.
- All future work must align with this baseline.
- All historical conflicts are resolved by this baseline.

This is the moment WebWaka stops inheriting its past and starts governing its future.

---

## A. Surviving Foundations

*These elements are permanently valid and must never change. They are the constitutional bedrock of the platform.*

### Master Control Board

- **Status:** CONSTITUTIONAL AUTHORITY
- **Source:** `MASTER_CONTROL_BOARD.md V4.0`
- **Permanence:** ABSOLUTE
- **Rationale:** Supreme source of truth for platform state. Binding rule: 'If it is not visible on the Master Control Board, it does not exist.'

### 10 Core Architectural Invariants

- **Status:** NON-NEGOTIABLE, CI/CD ENFORCED
- **Source:** `canonical/WEBWAKA_MODULAR_DESIGN_ARCHITECTURE_INVARIANTS.md`
- **Permanence:** ABSOLUTE
- **Rationale:** Foundational engineering constraints derived from WEBWAKA_CANONICAL_MASTER_CONTEXT.md V4.3 RATIFIED AND LOCKED

### 5-Level Actor Hierarchy

- **Status:** RATIFIED
- **Source:** `canonical/WEBWAKA_CANONICAL_MASTER_CONTEXT.md (Lines 317-542)`
- **Permanence:** ABSOLUTE
- **Rationale:** Defines the economic and permission model for the entire platform

### Institutional Principles

- **Status:** IMMUTABLE, FOUNDER AUTHORITY
- **Source:** `canonical/WEBWAKA_INSTITUTIONAL_PRINCIPLES.md`
- **Permanence:** ABSOLUTE
- **Rationale:** Philosophical foundation of platform identity

### Phase 2.5 (Core Modules Build)

- **Status:** APPROVED AND AUTHORIZED
- **Source:** `MASTER_CONTROL_BOARD.md V4.0`
- **Permanence:** BINDING UNTIL COMPLETION
- **Rationale:** Active, ratified, Founder-approved plan. All execution must align with this timeline.

### ARB (Architecture Review Board)

- **Status:** ACTIVE
- **Source:** `docs/governance/ARB_OPERATIONAL_ANNOUNCEMENT.md (2026-02-14)`
- **Permanence:** ACTIVE UNTIL SUPERSEDED
- **Rationale:** Binding governance body for architectural decisions

### Reuse Doctrine

- **Status:** ACTIVE - SUPERSEDES V0
- **Source:** `docs/governance/REUSE_REGISTRY_V1.md (2026-02-14)`
- **Permanence:** ACTIVE UNTIL SUPERSEDED
- **Rationale:** Prevents duplication and enforces capability reuse


---

## B. Invalidated Authorities

*These documents and concepts are officially retired and cannot be referenced as a source of authority. They are archived for historical context only.*

### Blueprints V1-V7 (as standalone authority)

- **Status:** RETIRED AS AUTHORITY, ARCHIVED AS REFERENCE
- **Reason for Invalidation:** Evolved in parallel to canonical governance. Contains valuable architectural thinking but conflicts with Master Control Board on timeline (24-week vs 71-week), terminology (Client/Merchant vs Tenant/Vendor), and authority structure.
- **Superseded By:** Canonical Authority Baseline (this document)
- **Salvageable Elements (for reference):** Capability classification methodology, Anti-silo architectural principles, Enforcement automation concepts, Governance maturity ladder

### 24-Week Migration Plan (from Blueprint V7)

- **Status:** INVALIDATED
- **Reason for Invalidation:** Conflicts with Master Control Board's 71-week Phase 2.5 plan
- **Superseded By:** Phase 2.5 (Core Modules Build) - 71 weeks

### Platform Execution Launch System (as immediate execution trigger)

- **Status:** RETIRED AS AUTHORITY, ARCHIVED AS REFERENCE
- **Reason for Invalidation:** Proposed parallel execution engines outside Master Control Board authority
- **Superseded By:** Phase 2.5 execution under Master Control Board
- **Salvageable Elements (for reference):** Tooling build matrix concepts, Migration wave structure ideas, Governance activation checklist


---

## C. Mutated Concepts

*These concepts survive but in a modified, canonical form. The evolved form is now binding.*

### Actor Terminology

- **Original Form:** Client, Merchant (used in Blueprints V1-V7)
- **Evolved (Canonical) Form:** Tenant (L3), Vendor (L4) (canonical 5-level hierarchy)
- **Source of Truth:** `canonical/WEBWAKA_CANONICAL_MASTER_CONTEXT.md`
- **Rationale:** Canonical terminology must be used to prevent confusion and align with permission models
- **Binding Rule:** All future documents must use Tenant/Vendor, not Client/Merchant

### Migration Timeline

- **Original Form:** 24 weeks (6 waves of 4 weeks each)
- **Evolved (Canonical) Form:** 71 weeks (15 core modules + 2 suites with 10 validation checkpoints)
- **Source of Truth:** `MASTER_CONTROL_BOARD.md V4.0`
- **Rationale:** Master Control Board timeline is authoritative and already approved
- **Binding Rule:** All planning must align with 71-week Phase 2.5

### ARB SLA Structure

- **Original Form:** 2-7 business days (oversimplified in Blueprint V7)
- **Evolved (Canonical) Form:** 4-lane structure (Auto, Fast 24h, Standard 48h, High-Risk 24h urgent)
- **Source of Truth:** `docs/governance/ARB_OPERATIONAL_ANNOUNCEMENT.md`
- **Rationale:** Actual ARB structure is more nuanced than Blueprint summary
- **Binding Rule:** Use 4-lane structure, not simplified range

### Capability Registry

- **Original Form:** Proposed in Blueprints V3-V7 as new system
- **Evolved (Canonical) Form:** REUSE_REGISTRY_V1.md already exists and is active
- **Source of Truth:** `docs/governance/REUSE_REGISTRY_V1.md (2026-02-14)`
- **Rationale:** Registry already operational, Blueprint proposals must integrate not replace
- **Binding Rule:** Enhance existing registry, do not create parallel system


---

## D. Authority Hierarchy

*This is the clear, non-negotiable precedence order of all governance artifacts. In any conflict, the lower number wins.*

| Level | Authority | Scope | Source |
|---|---|---|---|
| 1 | **Human Founder** | Ultimate - may override all | `MASTER_CONTROL_BOARD.md` |
| 2 | **Master Control Board** | Constitutional - defines platform state | `MASTER_CONTROL_BOARD.md V4.0` |
| 3 | **Canonical Documents (Tier 1: Founder Decisions)** | Precedence 1 | `canonical/WEBWAKA_CANONICAL_GOVERNANCE_INDEX.md` |
| 4 | **Canonical Documents (Tier 2: Constitutional)** | Precedence 2 | `canonical/WEBWAKA_CANONICAL_GOVERNANCE_INDEX.md` |
| 5 | **Canonical Documents (Tier 3: Philosophical)** | Precedence 3 | `canonical/WEBWAKA_CANONICAL_GOVERNANCE_INDEX.md` |
| 6 | **Active Governance Documents (ARB, Reuse Registry)** | Operational governance | `docs/governance/` |
| 7 | **Phase Execution Plans** | Tactical execution within approved phases | `Phase-specific documents` |
| 8 | **Agent Directives** | Department-specific guidance | `Agent-specific documents` |
| 9 | **Archived Reference Documents** | Historical context only, no binding authority | `Retired documents` |


---

## E. Global Invariants

*These 12 invariants cannot be violated by any future plan, feature, or agent. They are the absolute laws of the platform, enforced by CI/CD and the ARB.*

1. 1. Master Control Board is supreme source of truth for platform state
2. 2. All 10 architectural invariants must be satisfied by all features
3. 3. 5-level actor hierarchy (Super Admin → Partner → Tenant → Vendor → End User) is immutable
4. 4. Zero-Based Governance Context: no prior documents carry authority unless re-ratified
5. 5. Offline-first, Mobile-first, Africa-first, Nigerian-first are engineering constraints
6. 6. All state changes must emit events (event-driven architecture)
7. 7. All features must be implemented as plugins (plugin-first)
8. 8. All data must be tenant-scoped (multi-tenant)
9. 9. All actions must check permissions (permission-driven)
10. 10. All functionality must be accessible via API (API-first)
11. 11. Phase transitions require Master Control Board approval
12. 12. ARB has binding authority on architectural decisions (with Founder escalation path)


---

## F. Registry of Supersession

*This registry provides an explicit audit trail of what has been replaced. It is the final word on document precedence.*

| Old Authority | Replaced By | Status |
|---|---|---|
| `Blueprints V1-V7` | `Canonical Authority Baseline` | **RETIRED AS AUTHORITY** |
| `24-week migration plan` | `Phase 2.5 (71 weeks)` | **INVALIDATED** |
| `Client/Merchant terminology` | `Tenant/Vendor terminology` | **DEPRECATED** |
| `Platform Execution Launch System` | `Phase 2.5 execution under MCB` | **RETIRED AS AUTHORITY** |
| `REUSE_REGISTRY_V0` | `REUSE_REGISTRY_V1` | **SUPERSEDED** |
| `ARB SLA: 2-7 days` | `ARB SLA: 4-lane structure` | **CORRECTED** |


---

## G. Operational Consequences

*These are the immediate, binding changes for all platform actors and systems.*

### For: Arb

- ARB continues operating under 4-lane structure (Auto, Fast, Standard, High-Risk)
- ARB decisions remain binding with Founder escalation path
- ARB must validate all architectural changes against 10 invariants

### For: Capability Owners

- Capability ownership model from Blueprints V4-V7 is deferred pending Phase 2.5 completion
- Reuse Registry V1 defines high-risk domains requiring ARB review
- No capability owners assigned until Phase 2.5 establishes module structure

### For: Chief Of Staff

- Chief of Staff (webwakaagent1) coordinates Phase 2.5 execution
- Updates Master Control Board with agent status and document production
- Escalates blockers to Founder Agent or Founder

### For: Agents

- All agents operate within Phase 2.5 scope (71 weeks)
- All agents must use canonical terminology (Tenant/Vendor, not Client/Merchant)
- All agents reference Master Control Board for current state
- All agents acknowledge 10 architectural invariants

### For: Ci Enforcement

- CI must enforce 10 architectural invariants
- CI must validate canonical terminology usage
- CI enforcement proposals from Blueprints V3-V7 are deferred to Phase 2.5 implementation

### For: Migration

- Migration follows Phase 2.5 plan (71 weeks, 15 modules + 2 suites)
- No parallel 24-week migration
- 10 validation checkpoints at specified weeks


---

## H. Stability Guarantee

*This baseline prevents future drift and ensures generational stability through four core mechanisms:*

1.  **Single Constitutional Root:** The **Master Control Board** is established as the supreme, singular source of truth for platform state, eliminating authority conflicts.
2.  **Immutable Invariants:** The **12 Global Invariants** provide a permanent, non-negotiable architectural foundation that cannot be eroded over time.
3.  **Explicit Supersession:** The **Registry of Supersession** makes it impossible to unknowingly reference or resurrect invalidated documents, preventing historical regression.
4.  **Layered Authority:** The **9-Level Authority Hierarchy** provides a clear, deterministic path for decision-making and conflict resolution, ensuring that precedence disputes are impossible.

**Conclusion:** Future execution can now proceed without reinterpretation, protected by a system of governance that is clear, enforceable, and built to last.

