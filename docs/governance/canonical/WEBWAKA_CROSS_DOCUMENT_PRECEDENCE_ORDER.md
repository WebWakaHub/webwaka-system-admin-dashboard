# WEBWAKA CROSS-DOCUMENT PRECEDENCE ORDER

**Document Type:** Canonical Precedence Rule  
**Authority:** Founder  
**Status:** IMMUTABLE  
**Scope:** All WebWakaHub canonical documents  
**Maintained By:** Chief of Staff (Strategic & Governance)  
**Enforcement:** Governance CI + Manual Conflict Resolution  
**Supersession:** Founder Decision only  
**GitHub Organization:** WebWakaHub  
**Governance Repository:** webwaka-governance  
**Target Location:** webwaka-governance/canonical/

---

## ZERO-BASED GOVERNANCE CONTEXT

This document exists within the WebWakaHub governance universe initiated under a true zero-based restart.

No prior documents, decisions, repositories, or artifacts carry binding authority unless explicitly re-ratified in this governance system.

---

## Context & Intent (Why This Document Exists)

**Why this document exists:**
This document establishes the canonical precedence order for resolving conflicts between WebWaka governance documents. It prevents cherry-picking, ensures CI enforcement clarity, and makes governance disputes objective rather than subjective.

**What institutional risk it prevents:**
- Agents cherry-picking documents to justify convenience
- CI enforcement becoming ambiguous in conflict scenarios
- Governance disputes devolving into subjective interpretation battles
- Authority leakage through selective document application

**What breaks if it is ignored or bypassed:**
- Conflict resolution becomes political rather than systematic
- Agents can weaponize documents against each other
- Chief of Staff cannot adjudicate disputes objectively
- The governance system loses coherence under pressure

---

## Canonical Precedence Order

**In the event of a conflict between WebWaka governance documents, the following precedence order applies:**

### 1. Founder Decisions (FDs)
**Highest Authority**

Founder Decisions are the supreme source of institutional authority.

All other documents must align with Founder Decisions.

If any document conflicts with a Founder Decision, the Founder Decision wins unconditionally.

**Conflict Resolution:**
- Conflicting document must be updated or superseded
- Execution must halt until alignment is restored
- Chief of Staff must escalate to Founder if resolution is unclear

---

### 2. WebWaka Canonical Master Context
**Constitutional Authority**

The Canonical Master Context defines the foundational identity, vision, and invariants of WebWaka.

All strategic, architectural, and governance documents must align with the Master Context.

If a conflict arises between the Master Context and any other document (except Founder Decisions), the Master Context wins.

**Conflict Resolution:**
- Conflicting document must be revised
- Chief of Staff must validate alignment
- Founder ratification required if Master Context must change

---

### 3. WebWaka Institutional Principles
**Philosophical Authority**

Institutional Principles provide interpretive guidance for all strategic, architectural, and governance decisions.

Principles do not override explicit policies or specifications, but they guide interpretation when ambiguity exists.

If a conflict arises between Institutional Principles and a department-owned document, the Principles provide the interpretive framework for resolution.

**Conflict Resolution:**
- Chief of Staff adjudicates using Principles as interpretive lens
- Conflicting document may require clarification or revision
- Principles never override explicit Founder Decisions or Master Context

---

### 4. Department-Owned Canonical Documents
**Operational Authority**

Department-owned canonical documents (e.g., Architecture Specifications, Execution Roadmaps, Ownership Maps) have operational authority within their defined scope.

These documents govern day-to-day execution and must align with higher-precedence documents.

If a conflict arises between two department-owned documents, the Chief of Staff adjudicates based on:
- Scope boundaries
- Dependency direction
- Alignment with higher-precedence documents

**Conflict Resolution:**
- Chief of Staff determines which document has authority in the conflict domain
- Owning Department Agents must collaborate to resolve ambiguity
- Escalation to Founder if structural conflict cannot be resolved

---

### 5. Templates & Checklists
**Structural Authority**

Templates and checklists define the structure and completeness requirements for all documents.

They do not create policy or strategy, but they enforce compliance and consistency.

If a conflict arises between a template requirement and a department-owned document, the template wins on structural compliance, but the department document wins on content authority.

**Conflict Resolution:**
- Chief of Staff validates that document structure complies with templates
- Content authority remains with owning Department Agent
- Templates may be updated via Founder Decision if structural requirements conflict with operational needs

---

## Precedence Application Rules

### Rule 1: Explicit Always Beats Implicit

If one document makes an explicit statement and another implies a conflicting position, the explicit statement wins.

### Rule 2: Specific Always Beats General

If one document addresses a specific scenario and another provides general guidance, the specific document wins within its defined scope.

### Rule 3: Newer Always Beats Older (Same Precedence Level)

If two documents at the same precedence level conflict, the more recently ratified document wins, unless explicitly superseded.

### Rule 4: Escalation Is Mandatory for Ambiguous Conflicts

If precedence order does not clearly resolve a conflict, escalation to Chief of Staff is mandatory.

Chief of Staff may escalate to Founder if resolution requires policy clarification.

---

## CI Enforcement Integration

**Governance CI MUST validate precedence order when detecting conflicts:**

1. **Founder Decision Conflicts:**
   - Block PR if document conflicts with any Founder Decision
   - Require Chief of Staff override to proceed

2. **Master Context Conflicts:**
   - Block PR if document conflicts with Master Context
   - Require alignment before merge

3. **Cross-Department Conflicts:**
   - Flag PR for Chief of Staff review
   - Require conflict resolution before merge

4. **Template Compliance:**
   - Block PR if document does not comply with canonical templates
   - Require structural fixes before merge

---

## Reference Requirement

**All canonical documents MUST reference this precedence order.**

Documents must include a statement:

> In the event of a conflict with other governance documents, refer to the **WebWaka Cross-Document Precedence Order** for resolution.

This ensures agents know where to escalate conflicts.

---



---

## Supreme Authority Reference

This document derives its authority from **FD-2026-001: Governance Foundation & Authority Model for WebWakaHub**, ratified by the Founder on 2026-02-04.

FD-2026-001 sits at Precedence Level 1 (Supreme Authority) and establishes the foundational governance model that this document implements.

In the event of any conflict between this document and FD-2026-001, FD-2026-001 prevails.

---
## Governance Status

**Status:** IMMUTABLE  
**Authority:** Founder  
**Maintained By:** Chief of Staff  
**Immutability:** Upon ratification, this document becomes immutable  
**Supersession:** May only be modified or superseded by explicit Founder Decision  
**Enforcement:** Governance CI + Manual Conflict Resolution

---

## Ratification Block

**[RATIFIED]**

**Version:** 1.0  
**Date:** 2026-02-04  
**Ratified By:** Founder  
**Supersedes:** None (First version)  

**Modification Clause:**
This document may only be modified by the Founder or the Chief of Staff acting under explicit Founder authorization. No Department Agent may propose or approve changes to this document unilaterally.

**Enforcement Clause:**
All conflict resolution must follow this precedence order. Violations are governance incidents and must be escalated to the Chief of Staff.

---

**READY FOR FOUNDER RATIFICATION**
