# WEBWAKA CANONICAL DOCUMENT TEMPLATES

**Document Type:** Canonical Templates  
**Authority:** Founder  
**Status:** IMMUTABLE  
**Scope:** All governance, strategy, architecture, execution, CI, and external-facing documents  
**GitHub Organization:** WebWakaHub  
**Governance Repository:** webwaka-governance  
**Target Location:** /webwaka-governance/templates/  

**This document is not explanatory. It is enforceable institutional law.**

---

## ZERO-BASED GOVERNANCE CONTEXT

This document exists within the WebWakaHub governance universe initiated under a true zero-based restart.

No prior documents, decisions, repositories, or artifacts carry binding authority unless explicitly re-ratified in this governance system.

---

## Canonical Scope & Authority

**These templates are mandatory for all WebWaka documents.**

**Authority Declaration:**
- This document defines the **grammar of WebWaka documentation**
- All governance, strategy, architecture, execution, CI, and external-facing documents MUST conform to these templates
- Any document not conforming to these templates is **invalid by definition**
- Governance CI **may reject PRs solely on template non-compliance**
- No agent may invent, modify, or bypass templates outside this file

**Enforcement Scope:**
- **Universal Applicability:** All departments, all agents, all repositories, all execution waves
- **CI-Gated:** Template compliance is a hard requirement for merge approval
- **Non-Negotiable:** No "soft compliance" or "close enough" interpretations permitted
- **Zero-Context Safe:** Templates must be usable by brand-new agents with no prior WebWaka knowledge

**Institutional Role:**
This document serves as:
1. The **enforcement backbone for Governance CI**
2. The **primary onboarding artifact for all future agents**
3. The **compliance reference for Chief of Staff review**
4. The **structural foundation for all institutional memory**

Future agents must be able to infer from these templates:
- How to think
- How to write
- How to comply

**No execution, no decisions, no onboarding may occur without this document locked.**

**Template Invalidity Rule:**
Documents not matching these templates are invalid and non-canonical.

Non-compliant documents carry no institutional authority and may not be referenced, enforced, or used as precedent.

**Template Immutability:**
These templates are immutable once ratified.

Modification requires explicit Founder Decision. No agent may alter, extend, or bypass these templates without Founder authorization.

---

## Context & Intent (Why This Document Exists)

**Why this document exists:**
This document provides reusable, CI-enforceable templates for all governance, strategy, architecture, and execution documents. It ensures consistency, completeness, and enforceability across all WebWaka documentation.

**What institutional risk it prevents:**
- Free-form documentation (inconsistent structure and quality)
- Missing critical sections (incomplete specifications)
- Unenforceable documents (no clear compliance criteria)
- Template drift (each agent inventing their own format)

**What breaks if it is ignored or bypassed:**
- Governance CI cannot validate document compliance
- Cross-document references become unreliable
- Future agents cannot parse or enforce documents programmatically
- The platform's institutional memory becomes unstructured and unusable

---

## GLOBAL METADATA HEADER (MANDATORY FOR ALL DOCUMENTS)

```
# <DOCUMENT TITLE>

Document Type: <Policy | Specification | Playbook | Checklist | Registry | Guide>
Department: <Department Name>
Owning Agent: <webwakaagentX>
Status: <Draft | Reviewed | Approved | Locked>
Authority: <Founder | Chief of Staff | FD-XXXX>
Related Founder Decisions: <FD-XXXX, FD-YYYY>
Version: <v1.0>
Last Updated: <YYYY-MM-DD>

---
```

⸻

## 1. FOUNDER DECISION (FD) TEMPLATE

**Decision Statement**  
<Clear, enforceable rule>

**Scope**  
<What this decision applies to>

**Rationale**  
<Why this decision exists>

**Invariants**
- Invariant 1
- Invariant 2

**Enforcement**
- CI checks
- Review requirements
- Blocking rules

**Exceptions**  
<If any, and how approved>

**Supersession**  
<How this decision can be changed>

**Status**  
LOCKED

⸻

## 2. STRATEGY / CONTEXT DOCUMENT TEMPLATE

**Purpose**  
<Why this document exists>

**Canonical Context**  
<Non-negotiable truths>

**Assumptions**  
<Explicit assumptions>

**Non-Goals**  
<What this document does NOT cover>

**Long-Term Implications**  
<5–10 year impact>

**References**
- FDs
- Other docs

⸻

## 3. ARCHITECTURE SPECIFICATION TEMPLATE

**Architectural Objective**  
<Problem being solved>

**Core Principles**
- Principle 1
- Principle 2

**System Boundaries**  
<What is inside vs outside>

**Components**

| Component | Responsibility | Notes |
|-----------|----------------|-------|

**Data Flow**  
<High-level flow>

**Failure Modes**

| Scenario | Expected Behavior |
|----------|-------------------|

**Enforcement**
- CI rules
- Review gates

**Field Reality Considerations** *(MANDATORY)*  
This section MUST explicitly address:
- Connectivity assumptions (intermittent, unreliable, offline)
- Device constraints (low-memory, low-cost Android)
- Data cost sensitivity
- Power reliability realities
- Urban vs rural operational differences

⸻

## 4. SUITE DEFINITION TEMPLATE

**Suite Name**

**Purpose**  
<What economic problem this suite solves>

**Target Users**  
<Who uses it>

**Core Capabilities**
- Capability A
- Capability B

**Dependencies**
- Platform services
- Other suites

**Extension Points**  
<Plugins, APIs>

**Admission Criteria**  
<What qualifies something to belong here>

**Field Reality Considerations** *(MANDATORY)*  
This section MUST explicitly address:
- Connectivity assumptions (intermittent, unreliable, offline)
- Device constraints (low-memory, low-cost Android)
- Data cost sensitivity
- Power reliability realities
- Urban vs rural operational differences

⸻

## 5. ROLE / AGENT SPECIFICATION TEMPLATE

**Role Identity**  
Role Name:  
Department:  
Authority Source: FD-2026-021

**Mission**  
<One sentence>

**Core Responsibilities**
- …

**Explicit Non-Responsibilities**
- …

**Authority Boundaries**  
Can decide:  
Must recommend:  
Must escalate:

**Inputs**
- …

**Outputs**
- …

**Conflict Resolution**  
<When overlapping with other roles>

**Metrics of Success**
- …

⸻

## 6. CHECKLIST TEMPLATE (READINESS / VALIDATION)

**Objective**  
<What this checklist validates>

**Preconditions**
- [ ] Item

**Validation Items**
- [ ] Item (Evidence link)

**Failure Handling**  
<What happens if any item fails>

**Approval**  
Approved By:  
Date:

⸻

## 7. EXECUTION TASK TEMPLATE (ISSUES)

**Task Objective**  
<What must be achieved>

**Background Context**  
<Links to docs>

**Acceptance Criteria**
- [ ] Criterion

**Constraints**
- FDs
- Architecture rules

**Dependencies**
- Task X

**Evidence Required**
- PR
- Tests

⸻

## 8. CI / GOVERNANCE ENFORCEMENT TEMPLATE

**Rule Name**  
<Clear rule>

**Trigger**
- PR
- Push
- Merge

**Validation Logic**  
<What is checked>

**Failure Action**
- Block merge
- Alert agent

**Owner**  
<Department Agent>

⸻

## 9. INCIDENT RESPONSE TEMPLATE

**Incident Summary**  
<What happened>

**Impact**  
<Who was affected>

**Timeline**

| Time | Event |
|------|-------|

**Root Cause**  
<Actual cause>

**Resolution**  
<What fixed it>

**Preventive Actions**
- Action 1

**Lessons Learned**
- …

⸻

## 10. PARTNER / MARKETPLACE POLICY TEMPLATE

**Policy Scope**  
<Who it applies to>

**Roles Defined**
- Partner
- Tenant
- Vendor
- End User

**Permissions Model**  
<Role → Allowed actions>

**Revenue Rules**  
<Sharing, payouts>

**Violations**  
<What happens>

**Enforcement**  
<How enforced>

⸻

## 11. AI & LLM INTEGRATION TEMPLATE

**AI Capability Scope**  
<What AI can do>

**Supported Models**
- OpenRouter
- LiteLLM
- Bedrock
- Others

**Permission Model**  
<Who can use what>

**Key Management**
- BYOK rules
- Platform keys

**Cost Controls**
- Limits
- Alerts

**Auditability**  
<Logs, reviews>

⸻

## 12. MARKETING / SALES DOCUMENT TEMPLATE

**Audience**  
<Who this is for>

**Core Message**  
<Primary value proposition>

**Supporting Points**
- …

**Proof / Evidence**
- …

**Call to Action**  
<What to do next>

⸻

## 13. WEBSITE CONTENT TEMPLATE

**Page Purpose**  
<Why this page exists>

**Headline**  
<Clear, simple>

**Sections**
- Section title
- Content

**SEO Notes**  
<Keywords>

**CTA**  
<Desired action>

⸻

## 14. LESSONS LEARNED TEMPLATE

**Context**  
<What phase>

**What Worked**
- …

**What Failed**
- …

**Why**  
<Root causes>

**Rule Changes Required**  
<FD updates if any>

⸻

## FINAL ENFORCEMENT NOTE (CRITICAL)

- ❌ No free-form documents allowed
- ❌ No undocumented decisions
- ❌ No execution without references
- ✅ Templates are reused verbatim
- ✅ CI may reject documents not following templates

---

## Field Reality Considerations — Elevated to Design Law

**Status:** MANDATORY — NOT OPTIONAL CONTEXT

**Applicability:**
The following document types MUST include a **Field Reality Considerations** section:
- Architecture Specification Template
- Suite Definition Template
- Strategy / Context Documents
- Platform / Infrastructure Documents

**Required Content:**
This section MUST explicitly address:
- **Connectivity assumptions:** Intermittent, unreliable, offline-first design
- **Device constraints:** Low-memory, low-cost Android devices
- **Data cost sensitivity:** Minimize bandwidth usage, enable offline operation
- **Power reliability realities:** Assume frequent power outages, battery-constrained devices
- **Urban vs rural operational differences:** Design for worst-case rural scenarios

**Enforcement:**
- **Any Architecture, Suite, or Strategy document lacking Field Reality Considerations is invalid by definition**
- **Africa-first constraints are not optional context but design law**
- **CI MUST reject documents missing this section where required**
- **Chief of Staff MUST block PR approval if Field Reality Considerations are absent or insufficient**

**Rationale:**
WebWaka is **Africa-first by design**. Any specification that ignores field reality is not merely incomplete—it is fundamentally incompatible with the platform's mission and will fail in production.

---

## Template Immutability Rule

**Rule:**
- This document may **only be modified via an explicit Founder Decision**
- No agent, including Chief of Staff, may change templates unilaterally
- Template modifications require:
  1. Explicit Founder authorization
  2. Ratification via Founder Decision (FD-XXXX)
  3. Version increment and changelog entry
  4. Notification to all department agents

**Rationale:**
Templates are the **structural foundation of all institutional memory**. Uncontrolled template evolution would:
- Break existing documents
- Invalidate CI enforcement rules
- Create ambiguity in compliance requirements
- Undermine governance stability

**Enforcement:**
- CI MUST validate that template changes are authorized by a Founder Decision
- Any unauthorized template modification is a **governance incident**
- Chief of Staff MUST escalate unauthorized template changes to Founder immediately

---

## CI Enforcement Declaration

**Governance CI MUST validate:**

1. **Presence of Global Metadata Header**
   - Every document MUST include the Global Metadata Header
   - All required fields MUST be populated
   - Failure = **hard block** (PR rejected)

2. **Correct Template Usage**
   - Document structure MUST match the appropriate template
   - Template selection MUST align with document type
   - Failure = **hard block** (PR rejected)

3. **Required Sections Not Omitted**
   - All mandatory sections MUST be present
   - Field Reality Considerations MUST be present where required
   - Failure = **hard block** (PR rejected)

4. **Field Reality Considerations Validation**
   - Architecture, Suite, and Strategy documents MUST include Field Reality Considerations
   - Section MUST address all required elements (connectivity, devices, data cost, power, urban/rural)
   - Failure = **hard block** (PR rejected)

**Failure Action:**
- **Block merge** until compliance is achieved
- **Alert owning agent** with specific compliance failures
- **Escalate to Chief of Staff** if non-compliance persists after 2 attempts

**Bootstrap Exception:**
- CI enforcement is **not active** until FD-2026-001 (New Universe) is ratified
- Until then, Chief of Staff performs manual validation
- Once FD-2026-001 is ratified, CI enforcement becomes **mandatory and automated**

**Owner:**
- **Governance Department Agent (webwakaagent2)** — Chief of Staff
- Responsible for CI rule implementation and enforcement oversight

---

## Template-to-Department Applicability Matrix

This matrix defines which Department Agent is responsible for which document types, ensuring zero ambiguity during enforcement.

| Template Name | Owning Department | Owning Agent | Cross-Department? | Notes |
|---------------|-------------------|--------------|-------------------|-------|
| Founder Decision (FD) | Governance | webwakaagent2 | Yes | All departments reference FDs; only Founder issues FDs |
| Strategy / Context Document | Governance | webwakaagent2 | Yes | Cross-department strategy; single owner for consistency |
| Architecture Specification | Engineering | webwakaagent3 | No | Engineering owns all architecture specs |
| Suite Definition | Product | webwakaagent4 | No | Product owns all suite definitions |
| Role / Agent Specification | Governance | webwakaagent2 | Yes | Governance defines all agent roles |
| Checklist (Readiness / Validation) | Quality Assurance | webwakaagent8 | Yes | QA owns checklist format; all departments use |
| Execution Task (Issues) | All Departments | Varies | Yes | All agents create tasks; format is universal |
| CI / Governance Enforcement | Governance | webwakaagent2 | Yes | Governance owns CI rules; all departments comply |
| Incident Response | Operations | webwakaagent7 | Yes | Operations owns incident format; all departments report |
| Partner / Marketplace Policy | Business Development | webwakaagent5 | No | Business Development owns marketplace policies |
| AI & LLM Integration | Engineering | webwakaagent3 | Yes | Engineering owns AI architecture; all departments use |
| Marketing / Sales Document | Marketing | webwakaagent6 | No | Marketing owns all external-facing content |
| Website Content | Marketing | webwakaagent6 | No | Marketing owns all website content |
| Lessons Learned | All Departments | Varies | Yes | All agents document lessons; format is universal |

**Key Principles:**
- **Single Owner:** Each template has one owning agent responsible for template integrity
- **Cross-Department Usage:** Many templates are used across departments but maintained by a single owner
- **Universal Formats:** Execution Tasks and Lessons Learned are used by all agents with no single owner
- **Enforcement Authority:** Owning agent has authority to reject non-compliant documents using their template

**Conflict Resolution:**
- If two departments claim ownership of a template, **Chief of Staff (webwakaagent2) arbitrates**
- If a template is missing from this matrix, **Chief of Staff assigns ownership via Founder escalation**

---



---

## Document Precedence

In the event of a conflict with other governance documents, refer to the **WebWaka Cross-Document Precedence Order** for resolution.

This document sits at **precedence level 5 (Templates & Checklists)** in the canonical hierarchy.

---

## Non-Authority Clarification

**This document does NOT:**
- Create Founder Decisions
- Override governance rules established by higher-precedence documents
- Authorize execution by itself without proper approval and activation

**This document DOES:**
- Provide templates and compliance criteria for document creation
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
- Template changes require Founder Decision issuance (FD-XXXX)
- Chief of Staff may correct typos or formatting errors without Founder approval (substantive changes forbidden)

**Enforcement Clause:**
- This document is **CI-enforceable** upon relevant Founder Decisions (once issued in the current governance universe)
- Until then, Chief of Staff performs manual validation
- Non-compliance with these templates is a **blocking condition** for PR approval

**CI Integration:**
- Governance CI MUST validate template compliance for all documents
- Validation rules defined in "CI Enforcement Declaration" section
- Failure = hard block (PR rejected)

**Onboarding Integration:**
- This document MUST be included in all agent onboarding prompts
- New agents MUST read and acknowledge this document before executing any tasks
- Zero-context safe: Agents with no prior WebWaka knowledge can use these templates

---

## Ratification Block

**Awaiting Founder Ratification**

**Upon ratification:**
- Status changes to: **IMMUTABLE**
- Document is committed to: `WebWakaHub/webwaka-governance/templates/`
- CI enforcement rules are activated (upon relevant Founder Decisions)
- All agents are notified of template availability
- Document becomes the authoritative reference for all WebWaka documentation

**Supersedes:** None (First version)

**Related Founder Decisions:**
- Relevant Founder Decisions (once issued in the current governance universe) will activate CI enforcement and define agent roles

---

**END OF DOCUMENT**
