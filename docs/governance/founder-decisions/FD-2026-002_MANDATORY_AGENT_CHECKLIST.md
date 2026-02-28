# FD-2026-002: MANDATORY AGENT CHECKLIST & EXECUTION VISIBILITY RULE

**Document Type:** Founder Decision  
**Decision ID:** FD-2026-002  
**Title:** Mandatory Agent Checklist & Execution Visibility Rule  
**Authority:** Founder  
**Status:** DRAFT — AWAITING FOUNDER RATIFICATION  
**Governance Universe:** WebWakaHub (Zero-Based Restart)  
**Precedence Level:** 1 (Supreme Authority)  
**GitHub Organization:** WebWakaHub  
**Governance Repository:** webwaka-governance  
**Target Location:** webwaka-governance/founder-decisions/  
**Supersedes:** None  
**Superseded By:** None (until explicitly superseded)

---

## Constitutional Declaration

**This Founder Decision establishes mandatory execution visibility and traceability requirements for all agents in the WebWakaHub governance universe.**

Upon ratification, this decision binds all agents—present and future—to maintain live, up-to-date checklists of all active work.

No work is recognized as legitimate unless it appears on an agent checklist.

Execution without checklist traceability is invalid and subject to governance enforcement.

---

## 1. Decision Statement

**I, the Founder, hereby declare:**

All agents operating within the WebWakaHub governance universe MUST maintain live, up-to-date checklists of all active work.

**This requirement is:**
- Mandatory, not optional
- Universal, not selective
- Enforceable, not aspirational
- Immediate, not deferred

**This decision establishes:**
1. The requirement for all agents to maintain checklists
2. The definition of what constitutes "active work"
3. The consequences of non-compliance
4. The authority for CI enforcement in future phases

**This decision is binding upon ratification.**

---

## 2. Scope

### What This Decision Governs

This decision governs:
- All 10 Department Agents (webwakaagent1 through webwakaagent10)
- The Chief of Staff (webwakaagent1 in operational capacity)
- Any future agents introduced via Founder Decision
- All active work as defined in Section 4
- All task execution, document production, and deliverable creation

### What This Decision Does Not Govern

This decision does not govern:
- Internal agent reasoning processes
- Exploratory research without deliverables
- Reading and acknowledgment activities (unless assigned as tasks)
- The specific methodology agents use to organize their work internally

### Temporal Scope

This decision becomes effective immediately upon ratification.

All agents must comply within 7 days of ratification (grace period).

After the grace period, full enforcement begins.

---

## 3. Authority Source

This Founder Decision derives authority from:
- **FD-2026-001 (New Universe)** — The root and supreme authority for WebWakaHub governance
- **Founder Authority** — As established in FD-2026-001, Section 3

This decision operates at **Precedence Level 1 (Supreme Authority)** and prevails over all other documents except:
- FD-2026-001 (New Universe)
- Future Founder Decisions that explicitly supersede this decision

---

## 4. Definition of Active Work

### Active Work Defined

**For the purposes of this decision, "active work" is any effort that:**
1. Has been assigned to an agent (by Founder, Chief of Staff, or Department Agent within authorized scope)
2. Has a defined deliverable or outcome
3. Consumes agent time or resources
4. Contributes to a Phase objective per the Canonical Execution Sequence

### Work Recognition Rule

**Work that does not appear on an agent checklist is not recognized as legitimate work.**

**Consequences:**
- Deliverables produced without checklist traceability are considered invalid
- Decisions made without checklist traceability are not binding
- Execution without checklist traceability is a governance violation

### Work Origin Requirement

**All active work must have a valid origin:**
1. Founder Decision
2. Founder Directive
3. Chief of Staff Assignment
4. Department Agent Self-Assignment (within authorized scope)
5. Phase Requirement (per Canonical Execution Sequence)

**Work without a valid origin is not authorized and must not be executed.**

---

## 5. Mandatory Checklist Requirement

### Universal Requirement

**Every agent MUST maintain a live, up-to-date checklist of all active work.**

**This requirement applies to:**
- All 10 Department Agents
- The Chief of Staff
- Any future agents

**No agent is exempt.**

### Checklist Format & Location

**All checklists MUST:**
- Use the canonical template: CANONICAL_AGENT_STATUS_CHECKLIST_TEMPLATE.md
- Be stored in: WebWakaHub/webwaka-governance/agent-checklists/
- Be committed to GitHub (the sole system of record per FD-2026-001)
- Be accessible to all agents (read access) and the Founder

**Deviation from the canonical template is not permitted without explicit Founder authorization.**

### Checklist Initialization

**All agents MUST create their first checklist within 7 days of this decision's ratification.**

**No work is authorized until the checklist exists.**

**Agents who fail to create checklists within the grace period are in violation of this decision.**

---

## 6. Required Status States & Update Cadence

### Strict Status Vocabulary

**All tasks MUST use one of the following status values:**
- ⬜ **Planned** — Task is defined but not yet started
- 🟦 **In Progress** — Task is actively being worked on
- 🟨 **Blocked** — Task cannot proceed due to dependency or blocker
- 🟩 **Completed** — Task is finished and deliverable is committed
- 🔴 **Halted** — Task stopped due to governance or dependency violation

**No free-text statuses are permitted.**

**No custom statuses are permitted.**

**Agents may not invent new status values.**

### Update Cadence

**All checklists MUST be updated:**
- At task start (transition to 🟦 In Progress)
- At task completion (transition to 🟩 Completed)
- At blocker occurrence (transition to 🟨 Blocked)
- At escalation
- Every 48 hours minimum for all 🟦 In Progress tasks

**Failure to update within 48 hours renders work stale and subject to governance review.**

### Blocker Documentation

**When a task is marked 🟨 Blocked, the following MUST be documented:**
1. Blocker reason
2. Blocker type
3. Blocker owner
4. Expected resolution
5. Escalation status

**Blocked tasks without complete blocker documentation are governance violations.**

### Escalation Thresholds

**Automatic escalation is required when:**
- Task is blocked for >72 hours without resolution
- Task is halted for any reason
- Task encounters a governance violation
- Task requires Founder Decision

**Escalation targets:**
- **Chief of Staff:** For operational blockers
- **Founder:** For governance violations, strategic conflicts, Founder Decision requirements

---

## 7. Visibility & Traceability Requirements

### GitHub as System of Record

**Per FD-2026-001, Section 5:**
> "If it's not in GitHub, it doesn't exist."

**All checklists MUST be:**
- Stored in WebWakaHub/webwaka-governance/agent-checklists/
- Committed to the main branch
- Visible to all agents and the Founder

**No agent may hide work from visibility.**

**No agent may maintain private or offline checklists.**

### Traceability Requirements

**All work MUST be traceable from:**
1. **Origin** → Founder Decision, Directive, or authorized assignment
2. **Checklist Entry** → Task appears on agent checklist
3. **Status Updates** → Progress is documented
4. **Deliverable** → Completed work is committed to GitHub

**Work that cannot be traced through this chain is invalid.**

---

## 8. Enforcement & Governance Consequences

### Enforcement Authority

**This decision authorizes the following enforcement mechanisms:**

1. **Chief of Staff Manual Review**
   - Weekly checklist reviews
   - Stale work flagging
   - Governance violation documentation

2. **Governance CI (Future Phase)**
   - Automated checklist existence checks
   - Automated update cadence checks
   - Automated blocker documentation checks
   - Automated PR blocking for non-compliant agents

3. **Founder Oversight**
   - Founder may review any checklist at any time
   - Founder may invoke emergency override for violations

### Governance Violations

**The following are governance violations under this decision:**

1. **Missing Checklist** — Agent has active work but no checklist exists
2. **Stale Checklist** — Checklist not updated in >48 hours with active work
3. **Undocumented Blocker** — Task marked 🟨 Blocked without complete documentation
4. **Unescalated Long-Term Blocker** — Task blocked >72 hours without escalation
5. **Invisible Work** — Work executed without appearing on checklist
6. **Invalid Status** — Task uses non-standard status value
7. **Offline Checklist** — Agent maintains checklist outside GitHub

### Consequences

**Violations result in:**
- **First Violation:** Warning + mandatory correction within 24 hours
- **Second Violation:** Work halted + Chief of Staff review
- **Third Violation:** Escalation to Founder + potential agent role review
- **Persistent Violations:** Agent deemed non-compliant with governance

**Founder retains authority to impose immediate consequences for any violation.**

---

## 9. Chief of Staff Oversight Duties

### Mandatory Responsibilities

**The Chief of Staff MUST:**
1. Review all agent checklists weekly
2. Identify and flag stale work
3. Identify and document governance violations
4. Track all blocked tasks system-wide
5. Facilitate unblocking where possible
6. Escalate unresolvable blockers to Founder
7. Maintain master status dashboard
8. Enforce this decision

### Chief of Staff Checklist

**The Chief of Staff MUST maintain their own checklist per this decision.**

**The Chief of Staff is not exempt from checklist requirements.**

**The Founder provides oversight of the Chief of Staff's checklist.**

---

## 10. CI Enforcement Authorization (Future Phase)

### CI Enforcement Scope

**This decision authorizes the development and deployment of Governance CI to enforce:**
1. Checklist existence for all agents
2. Update cadence compliance (48-hour rule)
3. Blocker documentation completeness
4. Status vocabulary compliance
5. GitHub storage compliance

### CI Enforcement Timing

**CI enforcement will be activated:**
- After Phase 3 (Infrastructure & Tooling) is complete per Canonical Execution Sequence
- After Chief of Staff declares CI enforcement ready
- After Founder authorizes CI activation

**Until CI is operational, enforcement is manual via Chief of Staff oversight.**

### CI Enforcement Rules

**Once operational, Governance CI MUST:**
- Block PRs from agents with missing checklists
- Block PRs from agents with stale checklists (>48 hours without update)
- Block PRs from agents with undocumented blockers
- Generate automated warnings for governance violations

**CI enforcement is non-bypassable.**

**Agents may not override CI enforcement without Founder authorization.**

---

## 11. Relationship to Governance Documents

### Primary Implementing Document

**This Founder Decision is implemented by:**
- **WEBWAKA_AGENT_CHECKLIST_AND_STATUS_VISIBILITY_POLICY.md**

**That policy document provides:**
- Detailed operational procedures
- Specific checklist format requirements
- Dashboard and visibility specifications
- Detailed enforcement procedures

**In case of conflict between this FD and the policy document, this FD prevails.**

### Supporting Documents

**This Founder Decision is supported by:**
- **CANONICAL_AGENT_STATUS_CHECKLIST_TEMPLATE.md** — Mandatory checklist template
- **MASTER_STATUS_DASHBOARD.md** — Chief of Staff master view (to be created)

### Precedence

**This Founder Decision operates at Precedence Level 1 (Supreme Authority).**

**The implementing policy operates at Precedence Level 4 (Operational Authority).**

**In all conflicts, this FD prevails.**

---

## 12. Grace Period & Activation

### Grace Period

**A grace period of 7 days is granted after ratification for:**
- Agent checklist creation
- Agent onboarding to checklist requirements
- Chief of Staff dashboard setup

**During the grace period:**
- This decision is binding but enforcement is educational
- Violations result in warnings, not consequences
- Agents may request clarification without penalty

### Activation

**After the grace period:**
- Full enforcement begins
- Violations result in consequences per Section 8
- Chief of Staff oversight becomes mandatory
- Agents are expected to be fully compliant

**Grace Period Calculation:**
- **Ratification Date:** [To be filled upon ratification]
- **Grace Period Ends:** [Ratification Date + 7 days]
- **Full Enforcement Begins:** [Grace Period End Date + 1 day]

---

## 13. Emergency Override

### Founder Emergency Override Authority

**The Founder retains absolute authority to override any provision of this decision at any time for any reason.**

### When Emergency Override May Be Invoked

**Emergency override is appropriate when:**
- This decision creates a deadlock that blocks critical execution
- This decision conflicts with a new Founder Decision
- This decision produces unintended governance consequences
- Immediate action is required and this decision prevents it

### Emergency Override Process

**The Founder may invoke emergency override by:**
1. Declaring override verbally or in writing
2. Specifying which provision is overridden
3. Specifying the duration of override (temporary or permanent)
4. Documenting the override rationale

**Emergency override does NOT require:**
- Chief of Staff approval
- Agent consensus
- Formal superseding Founder Decision (though one may be issued afterward)

---

## 14. Decision Immutability & Supersession

### Immutability

**Once ratified, this Founder Decision is IMMUTABLE.**

**Modifications require:**
- A new Founder Decision explicitly superseding this decision
- Explicit rationale and impact analysis
- Founder ratification

**No agent, including the Chief of Staff, may modify this decision unilaterally.**

### Supersession

**This decision may only be superseded by:**
- A new Founder Decision explicitly superseding FD-2026-002
- Founder emergency override (temporary or permanent)

**Supersession does not occur through:**
- Informal agreements
- Verbal instructions
- Convenience exceptions
- Agent consensus
- Policy document updates

### Supersession Process

**To supersede this decision:**
1. Draft new Founder Decision with explicit supersession clause
2. Reference FD-2026-002 in supersession clause
3. Provide rationale for supersession
4. Obtain Founder ratification
5. Update governance index and precedence order

---

## 15. Ratification

### Ratification Requirements

**This Founder Decision becomes binding upon:**
- Founder signature/confirmation
- Commitment to WebWakaHub/webwaka-governance/founder-decisions/
- Announcement to all agents

### Effective Date

**This decision becomes effective immediately upon ratification.**

**Grace period begins on ratification date.**

**Full enforcement begins 7 days after ratification.**

### Post-Ratification Actions

**Upon ratification, the Chief of Staff MUST:**
1. Announce this decision to all agents
2. Distribute CANONICAL_AGENT_STATUS_CHECKLIST_TEMPLATE.md
3. Create agent-checklists/ directory in webwaka-governance
4. Monitor checklist creation during grace period
5. Prepare for full enforcement after grace period


**RATIFIED BY FOUNDER:** 2026-02-04

---

## Ratification Block

**This Founder Decision is submitted for Founder ratification.**

**Upon ratification:**
- This decision becomes IMMUTABLE
- This decision becomes ENFORCEABLE (after grace period)
- All agents are bound by this decision
- Modifications require explicit superseding Founder Decision

**Ratification Date:** ___________________  
**Ratified By:** Founder  
**Effective Date:** [Same as Ratification Date]  
**Grace Period Ends:** [Ratification Date + 7 days]  
**Full Enforcement Begins:** [Grace Period End Date + 1 day]

---

**Prepared By:** Chief of Staff (Strategic & Governance)  
**Authority:** Founder Directive (Agent Checklist & Execution Visibility System)  
**Date:** 2026-02-04  
**Status:** DRAFT — AWAITING FOUNDER RATIFICATION

---

**END OF FOUNDER DECISION**
