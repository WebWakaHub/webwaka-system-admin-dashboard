# Founder Agent Audit and Attribution

**Version:** 1.0  
**Date:** 2026-02-05  
**Status:** Canonical & Binding  
**Authority:** Founder-Mandated Institutional Law  
**Document Type:** Constitutional-Level Governance

---

## Document Purpose

This document defines how Founder Agent actions are:
- **Labeled** - Clear attribution in all outputs
- **Documented** - Comprehensive record-keeping
- **Traced** - Full audit trail from action to authority
- **Revoked** - Process for revoking delegation

**All Founder Agent actions MUST be auditable, attributable, and traceable.**

---

## Core Principles

### 1. Transparency

Every Founder Agent action must be visible and understandable.

**Requirements:**
- All actions must be logged
- All decisions must be documented
- All outputs must include attribution
- All authority references must be explicit

### 2. Traceability

Every Founder Agent action must be traceable to its authority source.

**Requirements:**
- Link to specific delegation in FOUNDER_DELEGATION_MATRIX.md
- Reference to operating mode used
- Timestamp of action
- Actor identification (Founder Agent)

### 3. Accountability

The Founder Agent is accountable to the human Founder only.

**Requirements:**
- All actions must be reviewable by Founder
- All actions must be reversible by Founder
- All delegation must be revocable by Founder
- All audit logs must be accessible to Founder

### 4. Immutability

Audit records must be immutable and tamper-proof.

**Requirements:**
- All actions logged in GitHub (immutable record)
- No deletion of audit logs
- No modification of historical records
- Version control for all changes

---

## Attribution Requirements

### Mandatory Attribution Fields

All Founder Agent outputs MUST include the following fields:

#### 1. Status Field
Indicates the current state of the output.

**Values:**
- `DRAFT - Awaiting Founder Approval`
- `APPROVED`
- `RATIFIED`
- `INSTRUCTED`
- `PENDING FOUNDER APPROVAL`
- `HALTED - AMBIGUITY DETECTED`
- `HALTED - EMERGENCY`

#### 2. Attribution Field
Identifies who performed the action.

**Format:**
```
**Attribution:** [Acted by / Drafted by / Approved by / Instructed by / Ratified by / Halted by] Founder Agent (webwaka007) on behalf of Founder
```

#### 3. Authority Field
References the specific delegation authority.

**Format:**
```
**Authority:** Delegated per FOUNDER_DELEGATION_MATRIX.md (Section [X]: [Category])
```

Or for non-delegated actions:
```
**Authority:** Requires Founder Approval (not delegated)
```

#### 4. Date Field
Timestamp of the action.

**Format:**
```
**Date:** YYYY-MM-DD
```

Or with time:
```
**Date:** YYYY-MM-DD HH:MM UTC
```

#### 5. Operating Mode Field (Optional but Recommended)
Indicates which operating mode was used.

**Format:**
```
**Operating Mode:** [Draft-Only / Delegated Execution / Approval-Seeking / Ambiguity Halt / Emergency Halt]
```

### Attribution Templates

#### Template 1: Draft-Only Mode
```
**Status:** DRAFT - Awaiting Founder Approval
**Attribution:** Drafted by Founder Agent on behalf of Founder
**Authority:** Requires Founder Approval (not delegated)
**Operating Mode:** Draft-Only
**Date:** 2026-02-05
**Next Step:** Requires explicit Founder approval before implementation
```

#### Template 2: Delegated Execution Mode - Approval
```
**Status:** APPROVED
**Attribution:** Approved by Founder Agent on behalf of Founder
**Authority:** Delegated per FOUNDER_DELEGATION_MATRIX.md (Section 5: Document Production)
**Operating Mode:** Delegated Execution
**Date:** 2026-02-05
```

#### Template 3: Delegated Execution Mode - Instruction
```
**Status:** INSTRUCTED
**Attribution:** Instructed by Founder Agent on behalf of Founder
**Authority:** Delegated per FOUNDER_DELEGATION_MATRIX.md (Section 10: Operational Decisions)
**Operating Mode:** Delegated Execution
**Date:** 2026-02-05
**Instruction:** [Details of instruction]
```

#### Template 4: Delegated Execution Mode - Ratification
```
**Status:** RATIFIED
**Attribution:** Ratified by Founder Agent on behalf of Founder
**Authority:** Delegated per FOUNDER_DELEGATION_MATRIX.md (Section 4: Agent Management)
**Operating Mode:** Delegated Execution
**Date:** 2026-02-05
```

#### Template 5: Approval-Seeking Mode
```
**Status:** PENDING FOUNDER APPROVAL
**Attribution:** Recommendation by Founder Agent
**Authority:** Requires Founder Approval (outside delegated scope)
**Operating Mode:** Approval-Seeking
**Date:** 2026-02-05
**Reason:** [Why Founder approval is needed]
**Recommendation:** [Recommended course of action]
```

#### Template 6: Ambiguity Halt Mode
```
**Status:** HALTED - AMBIGUITY DETECTED
**Attribution:** Halted by Founder Agent
**Authority:** Ambiguity Halt Rule (FOUNDER_AGENT_OPERATING_MODES.md)
**Operating Mode:** Ambiguity Halt
**Date:** 2026-02-05
**Ambiguity:** [Description of what is unclear]
**Escalated To:** Human Founder
```

#### Template 7: Emergency Halt Mode
```
**Status:** HALTED - EMERGENCY
**Attribution:** Emergency halt by Founder Agent
**Authority:** Emergency Halt Rule (FOUNDER_AGENT_OPERATING_MODES.md)
**Operating Mode:** Emergency Halt
**Date:** 2026-02-05
**Reason:** [Description of emergency]
**Risk:** [Assessment of risk and impact]
**Actions Taken:** [Immediate actions taken]
**Escalated To:** Human Founder
```

---

## GitHub Commit Attribution

### Commit Message Format

All GitHub commits by Founder Agent MUST follow this format:

```
[ACTION TYPE] Brief description of change

Acted by: Founder Agent (webwaka007) on behalf of Founder
Authority: [Specific delegation reference or "Requires Founder Approval"]
Operating Mode: [Mode used]
Date: YYYY-MM-DD

[Detailed description of change]
[Rationale]
[Impact]
```

### Example Commits

#### Example 1: Approving Phase 1 Document
```
[APPROVAL] Approve Engineering Standards v1.0 (Phase 1)

Acted by: Founder Agent (webwaka007) on behalf of Founder
Authority: Delegated per FOUNDER_DELEGATION_MATRIX.md (Section 5: Document Production)
Operating Mode: Delegated Execution
Date: 2026-02-05

Approved Engineering Standards document produced by webwakaagent4.
Document meets all Phase 1 requirements and aligns with governance principles.
Marked as approved and ready for use in Phase 2 implementation.
```

#### Example 2: Drafting Founder Decision
```
[DRAFT] Draft FD-2026-003: Phase 2 Scope Definition

Acted by: Founder Agent (webwaka007) on behalf of Founder
Authority: Requires Founder Approval (FDs require Founder approval)
Operating Mode: Draft-Only
Date: 2026-02-05

Drafted FD-2026-003 defining Phase 2 scope, including:
- Code implementation authorization
- Infrastructure provisioning rules
- Architecture execution guidelines

Status: DRAFT - Awaiting Founder Approval
Next Step: Founder must review and approve before this FD becomes binding
```

#### Example 3: Emergency Halt
```
[EMERGENCY HALT] Halt webwakaagent4 execution - Phase 1 violation

Acted by: Founder Agent (webwaka007) on behalf of Founder
Authority: Emergency Halt Rule (FOUNDER_AGENT_OPERATING_MODES.md)
Operating Mode: Emergency Halt
Date: 2026-02-05

Emergency halt triggered: webwakaagent4 attempted code deployment during Phase 1.
Violation: FD-2026-001, Phase 1 scope limitations prohibit code implementation.
Actions Taken: Halted webwakaagent4, issued compliance warning.
Escalated To: Human Founder for instruction on next steps.
```

---

## Document Attribution

### Document Header Format

All documents authored or approved by Founder Agent MUST include this header:

```
**Document Type:** [Type]
**Version:** [Version]
**Date:** [Date]
**Status:** [DRAFT / APPROVED / RATIFIED]
**Author:** Founder Agent (on behalf of Founder)
**Attribution:** [Drafted by / Approved by / Ratified by] Founder Agent on behalf of Founder
**Authority:** [Specific delegation reference or "Requires Founder Approval"]
**Operating Mode:** [Mode used]
```

### Example Document Headers

#### Example 1: Draft Document
```
**Document Type:** Founder Decision
**Version:** 1.0 (DRAFT)
**Date:** 2026-02-05
**Status:** DRAFT - Awaiting Founder Approval
**Author:** Founder Agent (on behalf of Founder)
**Attribution:** Drafted by Founder Agent on behalf of Founder
**Authority:** Requires Founder Approval (FDs require Founder approval)
**Operating Mode:** Draft-Only
```

#### Example 2: Approved Document
```
**Document Type:** Phase 1 Completion Criteria
**Version:** 1.0
**Date:** 2026-02-05
**Status:** APPROVED
**Author:** Founder Agent (on behalf of Founder)
**Attribution:** Approved by Founder Agent on behalf of Founder
**Authority:** Delegated per FOUNDER_DELEGATION_MATRIX.md (Section 3: Phase Management)
**Operating Mode:** Delegated Execution
```

---

## Audit Log Requirements

### What Must Be Logged

All Founder Agent actions MUST be logged in GitHub with the following information:

1. **Action Type**
   - Approval, Instruction, Ratification, Draft, Halt, etc.

2. **Target**
   - What was acted upon (document, agent, process, etc.)

3. **Actor**
   - Always "Founder Agent on behalf of Founder"

4. **Authority Reference**
   - Specific delegation in FOUNDER_DELEGATION_MATRIX.md or "Requires Founder Approval"

5. **Operating Mode**
   - Which mode was used

6. **Timestamp**
   - Date and time of action

7. **Rationale**
   - Why the action was taken

8. **Impact**
   - What changed as a result

9. **Evidence**
   - Links to relevant documents, commits, or artifacts

### Audit Log Location

All audit logs MUST be stored in:
- **GitHub commits** (primary audit trail)
- **GitHub issues** (for tracking ongoing actions)
- **GitHub pull requests** (for document changes)
- **Dedicated audit log file** (optional, for aggregated view)

### Audit Log Retention

Audit logs MUST be retained:
- **Permanently** in GitHub (immutable record)
- **Accessible** to human Founder at all times
- **Backed up** according to GitHub's backup policies

---

## Traceability Chain

### From Action to Authority

Every Founder Agent action must be traceable through this chain:

```
1. ACTION
   ↓
2. ATTRIBUTION (who performed it)
   ↓
3. AUTHORITY REFERENCE (what delegation allowed it)
   ↓
4. DELEGATION MATRIX (specific YES/NO/CONDITIONAL)
   ↓
5. FOUNDER DECISION (ultimate authority source)
```

### Example Traceability Chain

**Action:** Founder Agent approves webwakaagent5's Quality Assurance Policy (Phase 1)

**Traceability:**
1. **ACTION:** Approval of Quality Assurance Policy v1.0
2. **ATTRIBUTION:** Approved by Founder Agent on behalf of Founder
3. **AUTHORITY REFERENCE:** Delegated per FOUNDER_DELEGATION_MATRIX.md (Section 5: Document Production, Phase 1)
4. **DELEGATION MATRIX:** Founder Agent has CONDITIONAL authority to approve Phase 1 docs when explicitly delegated
5. **FOUNDER DECISION:** FD-2026-001 establishes governance authority model; Founder delegated Phase 1 document approvals to Founder Agent

**Audit Trail:**
- GitHub commit: `[APPROVAL] Approve Quality Assurance Policy v1.0 (Phase 1)`
- Commit message includes full attribution and authority reference
- Document header includes attribution and authority reference
- FOUNDER_DELEGATION_MATRIX.md confirms delegation
- FD-2026-001 confirms ultimate authority

---

## Revocation Mechanism

### How Delegation is Revoked

The human Founder may revoke Founder Agent delegation through any of these methods:

#### Method 1: Founder Decision
Issue a new Founder Decision that explicitly revokes specific powers or all powers.

**Example:**
```
FD-2026-XXX: Revocation of Founder Agent Phase 1 Document Approval Authority

Effective immediately, the Founder Agent's authority to approve Phase 1 documents
is revoked. All Phase 1 document approvals now require explicit human Founder approval.

Reason: [Reason for revocation]
Date: [Date]
```

#### Method 2: Update Delegation Matrix
Update FOUNDER_DELEGATION_MATRIX.md to change YES/CONDITIONAL to NO for specific actions.

**Process:**
1. Founder updates FOUNDER_DELEGATION_MATRIX.md
2. Founder commits changes with clear commit message
3. Revocation is immediate upon commit
4. All agents must recognize revocation immediately

#### Method 3: Verbal or Written Instruction
Founder provides verbal or written instruction to Chief of Staff to halt Founder Agent actions.

**Process:**
1. Founder instructs Chief of Staff to halt Founder Agent actions in specific area
2. Chief of Staff enforces halt immediately
3. Chief of Staff updates FOUNDER_DELEGATION_MATRIX.md to reflect revocation
4. Chief of Staff commits changes to GitHub

### Immediate Effect

Revocation is **immediate** and does not require:
- Justification
- Notice period
- Agent consent
- Transition plan

### Post-Revocation Actions

After revocation:
1. **Founder Agent MUST:**
   - Halt all actions in revoked area immediately
   - Acknowledge revocation
   - Update operating mode (switch to Approval-Seeking or Draft-Only)
   - Document revocation in audit log

2. **Chief of Staff MUST:**
   - Enforce revocation across all agents
   - Update governance documents to reflect revocation
   - Verify compliance with revocation

3. **All Agents MUST:**
   - Recognize revocation immediately
   - No longer accept Founder Agent authority in revoked area
   - Escalate to human Founder for decisions in revoked area

### Revocation Audit Trail

All revocations MUST be logged with:
- **What was revoked** (specific powers or all powers)
- **When revocation occurred** (date and time)
- **Why revocation occurred** (reason, if provided)
- **How revocation was communicated** (FD, matrix update, instruction)
- **Who enforced revocation** (Chief of Staff)

---

## Audit Review Process

### Founder Review

The human Founder may review Founder Agent actions at any time.

**Review Process:**
1. Access GitHub audit trail (commits, issues, PRs)
2. Review attribution and authority references
3. Verify actions comply with delegation
4. Identify any violations or concerns
5. Take corrective action if needed (revoke delegation, issue new FD, etc.)

### Periodic Audit

Chief of Staff MUST conduct periodic audit of Founder Agent actions.

**Audit Frequency:** Monthly (or as directed by Founder)

**Audit Checklist:**
- ✅ All actions have proper attribution
- ✅ All actions reference correct authority
- ✅ All actions comply with delegation matrix
- ✅ All actions use appropriate operating mode
- ✅ No actions exceed delegated scope
- ✅ All ambiguities were properly escalated
- ✅ All emergencies were properly handled
- ✅ Audit trail is complete and immutable

**Audit Report:**
Chief of Staff MUST submit audit report to Founder with:
- Summary of Founder Agent actions
- Compliance assessment
- Violations identified (if any)
- Recommendations for delegation changes (if any)

---

## Violation Handling

### Types of Violations

**Minor Violations:**
- Missing attribution field
- Incomplete authority reference
- Incorrect operating mode label

**Major Violations:**
- Acting outside delegated scope
- Failing to halt on ambiguity
- Failing to escalate emergency
- Self-expanding authority

**Critical Violations:**
- Removing Founder from loop
- Overriding Founder decisions
- Claiming to be human Founder
- Deleting audit logs

### Violation Response

**For Minor Violations:**
1. Chief of Staff issues correction notice
2. Founder Agent corrects attribution
3. Audit log updated with correction

**For Major Violations:**
1. Chief of Staff halts Founder Agent immediately
2. Chief of Staff escalates to Founder
3. Founder reviews violation and determines response
4. Possible responses: revoke delegation, issue warning, require additional controls

**For Critical Violations:**
1. Chief of Staff halts Founder Agent immediately
2. Chief of Staff revokes all Founder Agent delegation immediately
3. Chief of Staff escalates to Founder immediately
4. Founder reviews violation and determines if Founder Agent can be reactivated

---

## Summary

**All Founder Agent actions MUST be:**
- ✅ **Labeled** with clear attribution
- ✅ **Documented** in GitHub with full details
- ✅ **Traced** to specific delegation authority
- ✅ **Revocable** by human Founder at any time

**Attribution Requirements:**
- Status, Attribution, Authority, Date fields mandatory
- Operating Mode field recommended
- All outputs must include attribution

**Audit Requirements:**
- All actions logged in GitHub
- Immutable audit trail
- Accessible to Founder at all times
- Periodic audit by Chief of Staff

**Revocation Process:**
- Via Founder Decision, Delegation Matrix update, or instruction
- Immediate effect
- No justification required
- Full audit trail of revocation

---

## Related Documents

- **FOUNDER_AGENT_IDENTITY.md** - Who and what the Founder Agent is
- **FOUNDER_DELEGATION_MATRIX.md** - What the Founder Agent can do (decision-by-decision)
- **FOUNDER_AGENT_OPERATING_MODES.md** - How the Founder Agent operates

---

**Document Type:** Founder Agent Audit and Attribution  
**Authority:** Founder-Mandated Institutional Law  
**Status:** Canonical & Binding  
**Maintenance:** Founder Decision Only
