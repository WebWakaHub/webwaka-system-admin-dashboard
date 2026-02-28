# CANONICAL GITHUB REPOSITORY STRUCTURE

**Document Type:** Canonical Repository Topology  
**Authority:** Founder  
**Status:** CANONICAL — IMMUTABLE — CI-ENFORCEABLE  
**Scope:** All WebWakaHub repositories, all departments, all execution waves  
**GitHub Organization:** WebWakaHub  
**Governance Repository:** webwaka-governance  
**Target Location:** webwaka-governance/canonical/  

**This document is the authoritative, immutable source of truth for WebWakaHub's GitHub repository topology under the zero-based restart model.**

---

## ZERO-BASED GOVERNANCE CONTEXT

This document exists within the WebWakaHub governance universe initiated under a true zero-based restart.

No prior documents, decisions, repositories, or artifacts carry binding authority unless explicitly re-ratified in this governance system.

---

## Canonical Status & Enforcement

**This document is CANONICAL.**

**Authority Declaration:**
- This document defines the **complete and authoritative GitHub repository structure** for WebWakaHub
- All repositories listed here are **canonical and approved**
- Any repository not listed here is **non-canonical and prohibited** unless introduced via a new Founder Decision
- This document is **IMMUTABLE** once ratified and may only be modified via explicit Founder Decision
- This document is **CI-ENFORCEABLE** — repository creation, dependency rules, and cross-repository imports are subject to automated validation

**Enforcement Scope:**
- **Universal Applicability:** All departments, all agents, all execution waves
- **CI-Gated:** Repository structure and dependency compliance is a hard requirement
- **Non-Bypassable:** No "temporary" or "experimental" repositories permitted outside this structure
- **Zero-Context Safe:** This structure must be usable by brand-new agents with no prior WebWaka knowledge

**Institutional Role:**
This document serves as:
1. The **structural backbone for all WebWaka source control**
2. The **enforcement foundation for architectural boundaries**
3. The **dependency governance reference for CI validation**
4. The **repository ownership map for all department agents**

**Explicit Rule:**
Any repository not listed in this document is **non-canonical and prohibited** unless introduced via a new Founder Decision (FD-XXXX).

---

## Governance Anchor

**This document is governed by the Founder Decision system.**

**Governance Rules:**
- Any change to this document requires a **new Founder Decision**
- No agent, including Chief of Staff, may modify repository structure unilaterally
- Repository additions, removals, or restructuring require:
  1. Explicit Founder authorization
  2. Ratification via Founder Decision (FD-XXXX)
  3. Version increment and changelog entry
  4. Notification to all department agents

**Mandatory Cross-References:**
This document MUST be referenced by:
- **Architecture documents** — to ensure architectural boundaries align with repository structure
- **Infrastructure blueprints** — to ensure deployment topology aligns with repository structure
- **CI governance rules** — to enforce dependency rules and repository compliance
- **Department onboarding documents** — to clarify repository ownership and access

**Rationale:**
Repository structure is **constitutional infrastructure**. Uncontrolled repository proliferation would:
- Break architectural boundaries
- Create circular dependencies
- Undermine platform-for-platforms model
- Make zero-based reconstruction impossible

---

## Zero-Based Restart Alignment

**This repository structure is defined for the new WebWakaHub governance universe.**

**Alignment Declaration:**
- This structure is part of the **zero-based restart initiative**
- Any prior repository structures are **historical reference only**
- No legacy repositories are canonical unless explicitly listed in this document
- This structure is designed to support a **10–20 year platform-for-platforms lifecycle**

**Design Principles:**
- **Clean separation:** Governance, platform, suites, and infrastructure are distinct
- **No circular dependencies:** Dependency direction is strictly enforced
- **Platform-for-platforms model:** Suites depend on platform, platform does not depend on suites
- **Offline-first:** Repository structure supports offline-first development and deployment
- **Multi-tenant:** Repository structure supports white-label and multi-tenant architecture
- **AI-native:** Repository structure supports AI extension paths for all features
- **Suite-as-platform expansion:** New suites can be added without restructuring existing repositories

---

## Context & Intent (Why This Document Exists)

**Why this document exists:**
This document defines the canonical GitHub repository structure for WebWaka, ensuring clean separation between governance, platform, suites, and infrastructure. It prevents repository sprawl and enforces architectural boundaries at the source control level.

**What institutional risk it prevents:**
- Repository chaos (unclear ownership and purpose)
- Circular dependencies (suites depending on each other)
- Governance contamination (application code in governance repos)
- Architectural boundary violations (platform depending on suites)

**What breaks if it is ignored or bypassed:**
- CI cannot enforce dependency rules
- Deployment becomes unpredictable
- The platform-for-platforms model collapses into a monolith
- Zero-based reconstruction becomes impossible

---

## Canonical GitHub Repositories

These repositories are **non-overlapping, long-term stable, and map cleanly to the platform-for-platforms vision**.

---

### A. GOVERNANCE & CANONICAL CONTEXT

**1. webwaka-governance**

**Purpose:**
- Founder Decisions (FDs)
- Canonical Master Context
- Agent roles & department model
- Governance CI rules
- Decision logs, audits, enforcement
- Canonical document templates
- Institutional principles

**Owner:** Governance Department (webwakaagent2) — Chief of Staff

**Rule:**
- **No application code allowed**
- This repo is the **constitutional layer**
- All governance documents live here
- All Founder Decisions are tracked here

**Dependencies:**
- Depends on: **Nothing** (constitutional layer)
- Depended on by: All other repositories (for governance reference)

---

### B. PLATFORM FOUNDATION (CORE PRIMITIVES)

**2. webwaka-platform-core**

**Purpose:**
- Identity & actor hierarchy (Super Admin → Partner → Tenant → Vendor → Agent → Staff → End User)
- Role–Capability–Permission–Pricing (WEEG) system
- Event system (platform-wide event bus)
- Transaction & offline queue primitives
- Core APIs (non-suite specific)
- Delegation algebra & authority inheritance
- Multi-tenant isolation primitives

**Owner:** Engineering Department (webwakaagent3) — Architecture & System Design

**Dependencies:**
- Depends on: webwaka-governance (for governance reference only)
- Depended on by: All suites, frontend, infrastructure

**Rule:**
- **May NOT depend on any suite repositories**
- Must remain suite-agnostic
- All platform primitives live here

---

**3. webwaka-platform-storage**

**Purpose:**
- Data models (canonical entity schemas)
- Offline-first storage (IndexedDB, SQLite, local-first sync)
- Sync engines (conflict-free replicated data types, operational transforms)
- Conflict resolution logic (multi-device, multi-user)
- Data migration & versioning

**Owner:** Engineering Department (webwakaagent3) — Architecture & System Design

**Dependencies:**
- Depends on: webwaka-platform-core (for identity, events, transactions)
- Depended on by: All suites, frontend

**Rule:**
- **May NOT depend on any suite repositories**
- Must remain suite-agnostic
- All storage primitives live here

---

**4. webwaka-platform-integrations**

**Purpose:**
- External APIs (payment gateways, SMS, email, logistics)
- Webhooks (inbound and outbound)
- Third-party services (authentication, analytics, monitoring)
- AI/LLM abstraction layer (OpenRouter, LiteLLM, Bedrock)
- API rate limiting, retry logic, circuit breakers

**Owner:** Engineering Department (webwakaagent3) — Architecture & System Design

**Dependencies:**
- Depends on: webwaka-platform-core (for identity, events, transactions)
- Depended on by: All suites, frontend

**Rule:**
- **May NOT depend on any suite repositories**
- Must remain suite-agnostic
- All integration primitives live here

---

### C. SUITES (PLATFORM-ON-PLATFORM)

**5. webwaka-suite-commerce**

**Purpose:**
- POS (Point of Sale)
- Single Vendor Marketplace (SVM)
- Multi Vendor Marketplace (MVM)
- Inventory sync (real-time, offline-first)
- Pricing & taxation logic (multi-currency, multi-jurisdiction)
- Order management & fulfillment

**Owner:** Product Department (webwakaagent4) — Product & Platform Strategy

**Dependencies:**
- Depends on: webwaka-platform-core, webwaka-platform-storage, webwaka-platform-integrations
- Depended on by: webwaka-frontend

**Rule:**
- **May NOT depend on other suite repositories**
- Must use platform primitives for all core functionality
- Suite-specific logic only

---

**6. webwaka-suite-transportation**

**Purpose:**
- Transport companies (bus, taxi, logistics)
- Motor parks (Nigerian motor park model)
- Ticketing (seat reservation, route management)
- Seat & route inventory (real-time availability)
- Staff & independent agents (driver, conductor, agent roles)
- Trip scheduling & dispatch

**Owner:** Product Department (webwakaagent4) — Product & Platform Strategy

**Dependencies:**
- Depends on: webwaka-platform-core, webwaka-platform-storage, webwaka-platform-integrations
- Depended on by: webwaka-frontend

**Rule:**
- **May NOT depend on other suite repositories**
- Must use platform primitives for all core functionality
- Suite-specific logic only

---

**7. webwaka-suite-sites-funnels**

**Purpose:**
- Websites (white-label, multi-tenant)
- Funnels (lead capture, conversion optimization)
- White-label landing pages (partner branding)
- Domain & branding logic (custom domains, SSL, DNS)
- Content management (pages, posts, media)

**Owner:** Product Department (webwakaagent4) — Product & Platform Strategy

**Dependencies:**
- Depends on: webwaka-platform-core, webwaka-platform-storage, webwaka-platform-integrations
- Depended on by: webwaka-frontend

**Rule:**
- **May NOT depend on other suite repositories**
- Must use platform primitives for all core functionality
- Suite-specific logic only

---

**Future Suites (Placeholder):**
- webwaka-suite-health (clinics, pharmacies, telemedicine)
- webwaka-suite-education (schools, courses, certifications)
- webwaka-suite-hospitality (hotels, restaurants, events)
- webwaka-suite-civic (government services, permits, registrations)
- webwaka-suite-crm (customer relationship management, sales pipeline)

**Rule for Future Suites:**
- Must follow same dependency pattern (depend on platform, not on other suites)
- Must be introduced via Founder Decision
- Must be added to this document before development begins

---

### D. EXPERIENCE & DELIVERY

**8. webwaka-frontend**

**Purpose:**
- PWA (Progressive Web App)
- Mobile-first UI (responsive, touch-optimized)
- Offline UI states (graceful degradation, sync indicators)
- White-label theming (partner branding, custom CSS)
- Multi-suite navigation (unified experience across suites)
- Accessibility (WCAG compliance, screen reader support)

**Owner:** Engineering Department (webwakaagent3) — Architecture & System Design

**Dependencies:**
- Depends on: webwaka-platform-core, webwaka-platform-storage, all suite repositories
- Depended on by: webwaka-infrastructure (for deployment)

**Rule:**
- **May depend on all platform and suite repositories**
- Must remain suite-agnostic in architecture (dynamic suite loading)
- UI components must be reusable across suites

---

**9. webwaka-infrastructure**

**Purpose:**
- AWS IaC (Infrastructure as Code: Terraform, CloudFormation)
- Cloudflare config (CDN, DDoS protection, edge workers)
- CI/CD pipelines (GitHub Actions, deployment automation)
- Observability (logging, monitoring, alerting, tracing)
- Disaster recovery & backup
- Environment management (dev, staging, production)

**Owner:** Operations Department (webwakaagent7) — Release, Operations & Support

**Dependencies:**
- Depends on: All repositories (for deployment orchestration)
- Depended on by: Nothing (infrastructure layer)

**Rule:**
- **May depend on all repositories for deployment purposes**
- Must not contain application logic
- Infrastructure as code only

---

**10. webwaka-docs**

**Purpose:**
- Public documentation (user guides, tutorials, FAQs)
- Developer guides (API references, SDK documentation)
- Partner onboarding (partner program, white-label setup)
- API references (REST, GraphQL, webhooks)
- Changelog & release notes

**Owner:** Marketing Department (webwakaagent6) — Marketing, Sales & Community

**Dependencies:**
- Depends on: webwaka-governance (for canonical context), all other repositories (for documentation reference)
- Depended on by: Nothing (documentation layer)

**Rule:**
- **May reference all repositories for documentation purposes**
- Must not contain application logic
- Documentation only

---

## Cross-Repository Dependency Rule

**The following dependency constraints are enforced:**

### Dependency Direction (Strict Hierarchy)

1. **Governance repositories depend on nothing**
   - webwaka-governance is the constitutional layer
   - No dependencies permitted

2. **Platform repositories may not depend on suite repositories**
   - webwaka-platform-core, webwaka-platform-storage, webwaka-platform-integrations
   - May only depend on webwaka-governance (for governance reference)
   - Must remain suite-agnostic

3. **Suite repositories may depend on platform repositories**
   - All suite repositories (commerce, transportation, sites-funnels, future suites)
   - May depend on: webwaka-platform-core, webwaka-platform-storage, webwaka-platform-integrations
   - **May NOT depend on other suite repositories** (no cross-suite dependencies)

4. **Frontend may depend on suites and platform**
   - webwaka-frontend may depend on all platform and suite repositories
   - Must use dynamic suite loading to avoid tight coupling

5. **Infrastructure may depend on all repositories**
   - webwaka-infrastructure may depend on all repositories for deployment orchestration
   - Must not contain application logic

6. **Documentation may reference all repositories**
   - webwaka-docs may reference all repositories for documentation purposes
   - Must not contain application logic

### Forbidden Patterns

- ❌ **No circular dependencies permitted**
- ❌ **No platform depending on suites**
- ❌ **No suite depending on other suites**
- ❌ **No governance depending on anything**
- ❌ **No application logic in infrastructure or documentation**

**Violations must be blocked at CI level.**

---

## CI Enforcement — Expanded & Mandatory

**Governance CI MUST validate the following:**

### 1. Forbidden Import Detection

**Rule:**
- CI MUST detect and block imports that violate dependency direction
- Platform repositories importing from suite repositories = **hard block**
- Suite repositories importing from other suite repositories = **hard block**
- Governance repositories importing from any repository = **hard block**

**Implementation:**
- Automated static analysis of import statements
- Dependency graph validation
- Package.json / requirements.txt / go.mod analysis

**Failure Action:**
- **Block PR merge** until violation is resolved
- **Alert owning agent** with specific violation details
- **Escalate to Chief of Staff** if non-compliance persists after 2 attempts

---

### 2. Circular Dependency Detection

**Rule:**
- CI MUST detect and block circular dependencies between repositories
- Any cycle in the dependency graph = **hard block**

**Implementation:**
- Dependency graph cycle detection algorithm
- Automated validation on every PR
- Fail-fast on cycle detection

**Failure Action:**
- **Block PR merge** until cycle is broken
- **Alert all agents involved in cycle** with dependency path
- **Escalate to Chief of Staff** immediately (circular dependencies are governance incidents)

---

### 3. Dependency Direction Validation

**Rule:**
- CI MUST validate that all dependencies follow the strict hierarchy defined in this document
- Any dependency not explicitly permitted = **hard block**

**Implementation:**
- Whitelist-based dependency validation
- Automated comparison against canonical dependency rules
- Fail-fast on unauthorized dependency

**Failure Action:**
- **Block PR merge** until dependency is removed or authorized via Founder Decision
- **Alert owning agent** with specific dependency violation
- **Escalate to Chief of Staff** for Founder Decision if dependency is legitimate but not yet authorized

---

### 4. Non-Canonical Repository Detection

**Rule:**
- CI MUST detect and alert on any repository not listed in this document
- Non-canonical repositories = **governance incident**

**Implementation:**
- Automated repository inventory scan
- Comparison against canonical repository list
- Alert on discrepancy

**Failure Action:**
- **Alert Chief of Staff** immediately
- **Escalate to Founder** for authorization or removal
- **Block all CI/CD operations** for non-canonical repositories until resolved

---

### Enforcement Declaration

**CI enforcement of these rules is mandatory and non-bypassable.**

**Bootstrap Exception:**
- CI enforcement is **not active** until FD-2026-001 (New Universe) is ratified
- Until then, Chief of Staff performs manual validation
- Once FD-2026-001 is ratified, CI enforcement becomes **mandatory and automated**

**Owner:**
- **Governance Department Agent (webwakaagent2)** — Chief of Staff
- Responsible for CI rule implementation and enforcement oversight

**Escalation Path:**
- Violation detected → Alert owning agent
- Non-compliance after 2 attempts → Escalate to Chief of Staff
- Governance incident → Escalate to Founder

---

## Repository Ownership Summary

| Repository | Owning Department | Owning Agent | Purpose Summary |
|------------|-------------------|--------------|-----------------|
| webwaka-governance | Governance | webwakaagent2 | Constitutional layer, Founder Decisions, governance rules |
| webwaka-platform-core | Engineering | webwakaagent3 | Identity, WEEG, events, transactions, delegation algebra |
| webwaka-platform-storage | Engineering | webwakaagent3 | Data models, offline-first storage, sync engines |
| webwaka-platform-integrations | Engineering | webwakaagent3 | External APIs, webhooks, AI/LLM abstraction |
| webwaka-suite-commerce | Product | webwakaagent4 | POS, marketplaces, inventory, pricing |
| webwaka-suite-transportation | Product | webwakaagent4 | Transport companies, motor parks, ticketing |
| webwaka-suite-sites-funnels | Product | webwakaagent4 | Websites, funnels, white-label landing pages |
| webwaka-frontend | Engineering | webwakaagent3 | PWA, mobile-first UI, offline UI states, white-label theming |
| webwaka-infrastructure | Operations | webwakaagent7 | AWS IaC, CI/CD, observability, disaster recovery |
| webwaka-docs | Marketing | webwakaagent6 | Public docs, developer guides, partner onboarding |

**Key Principles:**
- **Single Owner:** Each repository has one owning agent responsible for repository integrity
- **Cross-Department Collaboration:** Repositories may be used across departments but maintained by a single owner
- **Enforcement Authority:** Owning agent has authority to approve or reject PRs for their repository

**Conflict Resolution:**
- If two departments claim ownership of a repository, **Chief of Staff (webwakaagent2) arbitrates**
- If a repository is missing from this structure, **Chief of Staff assigns ownership via Founder escalation**

---

## Final Validation Checklist

**Before marking this document as READY FOR FOUNDER RATIFICATION, the following validations have been performed:**

### ✅ No Repository Overlap
- Each repository has a distinct, non-overlapping purpose
- No two repositories serve the same function
- Ownership is clear and unambiguous

### ✅ Dependency Direction Integrity
- All dependencies follow the strict hierarchy
- No circular dependencies exist
- Platform does not depend on suites
- Suites do not depend on other suites
- Governance depends on nothing

### ✅ Platform-for-Platforms Principles
- Suites are independent and composable
- Platform primitives are suite-agnostic
- New suites can be added without restructuring
- Architectural boundaries are enforced at repository level

### ✅ Offline-First Support
- Repository structure supports offline-first development
- Storage layer is separate from application logic
- Sync engines are platform-level primitives

### ✅ Multi-Tenant Support
- Repository structure supports white-label architecture
- Identity and actor hierarchy are platform-level primitives
- Suites inherit multi-tenancy from platform

### ✅ AI-Native Support
- AI/LLM abstraction layer is platform-level primitive
- All suites can leverage AI capabilities
- AI governance is separate from AI implementation

### ✅ Suite-as-Platform Expansion
- New suites follow same dependency pattern
- No restructuring required for new suites
- Suite addition process is clear and governed

**All validations passed. Document is ready for Founder ratification.**

---

## Placement Confirmation

**This document will live in:**

```
webwaka-governance/
  canonical/
    CANONICAL_GITHUB_REPOSITORY_STRUCTURE.md
```

**Rationale:**
- This is a **canonical governance document**
- It defines **constitutional infrastructure**
- It must be **immutable and version-controlled**
- It must be **accessible to all agents for reference**

---

## Repository Lifecycle Rules

**Repository Creation:**
- No repository may be created outside this list without a Founder Decision
- Repository creation requires explicit Founder authorization via FD-XXXX
- New repositories must be added to this document before development begins
- Repository naming must follow canonical patterns defined in this document

**Repository Deprecation:**
- Repositories may only be deprecated via explicit Founder Decision
- Deprecated repositories must be archived, not deleted
- Archive process requires Chief of Staff sign-off
- Deprecation must include migration plan for existing code and documentation

**Repository Archival:**
- Archived repositories remain in GitHub but are read-only
- Archived repositories must include README explaining deprecation reason
- Archived repositories may not be referenced by canonical code
- Archived repositories are excluded from CI enforcement

**Repository Lifecycle Enforcement:**
- CI blocks creation of non-canonical repositories
- Manual repository creation requires Chief of Staff override
- All repository lifecycle changes must be documented in governance repository

---



---

## Document Precedence

In the event of a conflict with other governance documents, refer to the **WebWaka Cross-Document Precedence Order** for resolution.

This document sits at **precedence level 4 (Department-Owned Canonical Documents)** in the canonical hierarchy.

---

## Non-Authority Clarification

**This document does NOT:**
- Create Founder Decisions
- Override governance rules established by higher-precedence documents
- Authorize execution by itself without proper approval and activation

**This document DOES:**
- Provide repository structure and lifecycle governance
- Require alignment with higher-precedence governance documents

All execution authority flows from Founder Decisions and the Canonical Master Context.

---

## Change Classification & Approval Requirements

**Editorial Changes** (grammar, formatting, typos):
- May be approved by owning Department Agent
- No Chief of Staff review required
- Must not alter meaning or intent

**Clarifying Changes** (no meaning change, improved readability):
- Require owning Department Agent + Chief of Staff approval
- Must preserve original intent
- Must not expand or reduce scope

**Material Changes** (scope, authority, sequencing, invariants):
- Require Founder approval via explicit Founder Decision
- Must include rationale and impact analysis
- Must be versioned and supersede previous version

**Enforcement:**
CI may validate change classification and block PRs that attempt to bypass approval requirements.

---

## Temporal Validity & Review Cadence

**Immutability:**
This document is immutable once ratified by the Founder.

**Relevance Reviews:**
Relevance reviews may be proposed without modification, triggering either:
- **Reaffirmation:** Document remains valid and current
- **Supersession:** New Founder Decision required to update or replace

**Review Triggers:**
- Significant platform evolution
- Architectural paradigm shifts
- Governance incident patterns
- Founder-initiated review

**Review Process:**
1. Chief of Staff proposes relevance review
2. Owning Department Agent provides impact assessment
3. Founder determines reaffirmation or supersession
4. If supersession: New FD issued, document versioned

This preserves immutability without freezing institutional learning.

---

## Founder Emergency Override

**Emergency Override Authority:**
The Founder may temporarily override any governance process, approval requirement, or enforcement rule in emergency situations.

**Override Requirements:**
- Override must be logged in governance repository
- Override rationale must be documented
- Override scope and duration must be explicit
- Post-incident ratification required within 30 days

**Emergency Scenarios:**
- Critical security incident
- Platform-wide outage
- Regulatory compliance deadline
- Agent/process deadlock blocking critical path

**Post-Override Process:**
1. Incident report created by Chief of Staff
2. Override actions documented
3. Governance gaps identified
4. Founder Decision issued to ratify or supersede override
5. Process improvements implemented

This safety valve prevents governance from blocking urgent action while maintaining accountability.

---

## Approval vs Activation

**Approval locks content.**
**Activation is a separate, explicit step declared by Strategic & Governance.**

**Approval:**
- Content is finalized and immutable
- Document is ratified by Founder
- No further modifications permitted without supersession

**Activation:**
- Document becomes enforceable
- CI enforcement rules become active
- Agents must comply with document requirements
- Declared explicitly by Chief of Staff with Founder authorization

**Timing:**
- Approval may occur before dependencies are ready
- Activation occurs only when enforcement is operationally feasible
- Gap between approval and activation is normal and expected

**Status Indicators:**
- **APPROVED:** Content locked, not yet enforceable
- **ACTIVATED:** Content locked AND enforceable
- **SUPERSEDED:** Replaced by newer version

This prevents premature enforcement while allowing governance to be locked early.

---

## Naming Invariant

**The GitHub organization name is WebWakaHub.**

All references to the organization, repositories, and canonical identifiers must use this exact name.

**Forbidden Variants:**
- webwaka (lowercase, incomplete)
- WebWaka (incomplete, missing Hub)
- Webwaka (incorrect capitalization)

**CI Enforcement:**
Governance CI MUST validate naming consistency across all documents and reject PRs with naming violations.

**Rationale:**
Naming consistency is critical for:
- CI enforcement scripts
- Repository references
- Domain configuration
- External integrations

---



---

## Supreme Authority Reference

This document derives its authority from **FD-2026-001: Governance Foundation & Authority Model for WebWakaHub**, ratified by the Founder on 2026-02-04.

FD-2026-001 sits at Precedence Level 1 (Supreme Authority) and establishes the foundational governance model that this document implements.

In the event of any conflict between this document and FD-2026-001, FD-2026-001 prevails.

---
## Final Lock Status

**Status:** IMMUTABLE

**Version:** 1.0

**Immutability:**
Upon Founder ratification, this document becomes **IMMUTABLE** and may only be modified via explicit Founder Decision.

**Modification Clause:**
- No agent may modify this document without Founder authorization
- Repository structure changes require Founder Decision issuance
- Chief of Staff may correct typos or formatting errors without Founder approval (substantive changes forbidden)

**Enforcement Clause:**
- This document is **CI-enforceable** upon relevant Founder Decisions (once issued in the current governance universe)
- Until then, Chief of Staff performs manual validation
- Non-compliance with repository structure is a **blocking condition** for PR approval

**CI Integration:**
- Governance CI MUST validate repository structure compliance
- Validation rules defined in "CI Enforcement — Expanded & Mandatory" section
- Failure = hard block (PR rejected)

**Onboarding Integration:**
- This document MUST be included in all agent onboarding prompts
- New agents MUST understand repository structure before contributing code
- Zero-context safe: Agents with no prior WebWaka knowledge can use this structure

---

## Ratification Block

**Awaiting Founder Ratification**

**Upon ratification:**
- Status changes to: **IMMUTABLE**
- Document is committed to: `WebWakaHub/webwaka-governance/canonical/`
- CI enforcement rules are activated (upon FD-2026-001 ratification)
- All agents are notified of canonical repository structure
- Document becomes the authoritative reference for all WebWaka source control

**Supersedes:** None (First version)

**Related Founder Decisions:**
- Relevant Founder Decisions (once issued in the current governance universe) will activate CI enforcement and define agent roles

---

**END OF DOCUMENT**
