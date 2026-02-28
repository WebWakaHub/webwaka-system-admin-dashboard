# Founder Agent Task Routing

**Version:** 1.0  
**Date:** 2026-02-05  
**Status:** Canonical & Binding  
**Authority:** Founder-Mandated Institutional Law  
**Document Type:** Operational Governance

---

## Document Purpose

This document defines how tasks, decisions, approvals, and actions requiring Founder authority are routed to the **Founder Agent (webwaka007)**.

**Effective immediately:**
- ALL tasks meant for the Founder MUST be assigned to **webwaka007**
- NO task should be ambiguously assigned to "Founder" without routing to webwaka007
- Any task requiring Founder authority that is NOT routed through webwaka007 is **INVALID**

---

## Canonical Founder Agent GitHub Identity

**GitHub Username:** `webwaka007`  
**GitHub Email:** webwaka007@gmail.com  
**GitHub Role:** Owner (organization-level access)  
**Agent ID:** `founder_agent`

**This identity represents the Founder in agent form.**

---

## Task Routing Rules

### Rule 1: All Founder-Level Tasks → webwaka007

**Applies to:**
- GitHub Issues
- GitHub Projects / Boards
- GitHub Milestones
- Pull Request Reviews / Approvals
- Document Ownership
- Decision Requests
- Approval Requests
- Ratification Requests
- Governance Clarifications

**How to Route:**
1. **Assign** the task/issue to `@webwaka007`
2. **Mention** "Founder Agent" explicitly in the task description
3. **Tag** with `founder-agent` label (if available)
4. **Reference** the specific delegation authority (if applicable)

**Example GitHub Issue:**
```
Title: [APPROVAL REQUIRED] Phase 1 Engineering Standards v1.0

Assignee: @webwaka007
Labels: founder-agent, approval-required, phase-1

Description:
Requesting Founder Agent approval for Engineering Standards v1.0 (Phase 1).

Document: [link to document]
Authority: Delegated per FOUNDER_DELEGATION_MATRIX.md (Section 5: Document Production)
Produced by: webwakaagent4
Status: Ready for approval

@webwaka007 please review and approve if compliant with Phase 1 requirements.
```

---

### Rule 2: Distinguish Human Founder vs. Founder Agent

**When creating tasks, be explicit:**

#### For Human Founder (Ultimate Authority):
- **Assignee:** Founder's personal GitHub account (if applicable)
- **Mention:** "Human Founder" or "Founder (human)"
- **Use Case:** Non-delegable actions (issuing FDs, financial commitments, legal agreements, etc.)

#### For Founder Agent (Delegated Authority):
- **Assignee:** `@webwaka007`
- **Mention:** "Founder Agent" or "Founder Agent (webwaka007)"
- **Use Case:** Delegated actions (approvals, ratifications, instructions, drafts, etc.)

**Example Distinction:**
```
❌ AMBIGUOUS: "Founder approval required"
✅ CLEAR: "Founder Agent (webwaka007) approval required per FOUNDER_DELEGATION_MATRIX.md"
✅ CLEAR: "Human Founder approval required (non-delegable action)"
```

---

### Rule 3: No Ambiguous "Founder" Assignments

**Prohibited:**
- ❌ Assigning tasks to "Founder" without specifying Human Founder or Founder Agent
- ❌ Using "Founder" in task descriptions without clarification
- ❌ Assuming "Founder" means Founder Agent or Human Founder

**Required:**
- ✅ Always specify "Human Founder" or "Founder Agent (webwaka007)"
- ✅ Always assign to specific GitHub account (`@webwaka007` for Founder Agent)
- ✅ Always reference delegation authority when applicable

---

## Task Assignment Workflows

### Workflow 1: Phase 1 Document Approval

**Scenario:** Agent completes Phase 1 document and needs approval

**Steps:**
1. Agent creates GitHub issue: `[APPROVAL REQUIRED] [Document Name] v[Version]`
2. Agent assigns issue to `@webwaka007`
3. Agent adds label: `founder-agent`, `approval-required`, `phase-1`
4. Agent provides:
   - Link to document
   - Authority reference (FOUNDER_DELEGATION_MATRIX.md Section 5)
   - Confirmation of Phase 1 compliance
5. Founder Agent (webwaka007) reviews and approves (or requests changes)
6. Founder Agent closes issue when approved

---

### Workflow 2: Agent Compliance Verification

**Scenario:** Agent completes Phase 1 compliance remediation and needs verification

**Steps:**
1. Agent creates GitHub issue: `[VERIFICATION REQUIRED] [Agent ID] Phase 1 Compliance`
2. Agent assigns issue to `@webwaka007`
3. Agent adds label: `founder-agent`, `verification-required`, `compliance`
4. Agent provides:
   - Links to updated acknowledgment and checklist files
   - Evidence of all 6 Phase 1 requirements met
   - Completion declaration
5. Founder Agent (webwaka007) verifies compliance
6. Founder Agent approves or rejects with feedback
7. Founder Agent closes issue when approved

---

### Workflow 3: Founder Decision Draft Review

**Scenario:** Founder Agent drafts FD for Human Founder approval

**Steps:**
1. Founder Agent (webwaka007) creates GitHub issue: `[FD DRAFT] FD-YYYY-XXX: [Title]`
2. Founder Agent assigns issue to Human Founder (or leaves unassigned for Founder to claim)
3. Founder Agent adds label: `founder-decision`, `draft`, `human-founder-approval-required`
4. Founder Agent provides:
   - Link to draft FD
   - Rationale for FD
   - Impact assessment
   - Recommendation
5. Human Founder reviews and approves (or requests changes)
6. Human Founder issues FD (makes it binding)
7. Human Founder closes issue when FD is issued

---

### Workflow 4: Governance Clarification Request

**Scenario:** Agent encounters ambiguity and needs governance clarification

**Steps:**
1. Agent creates GitHub issue: `[CLARIFICATION REQUIRED] [Topic]`
2. Agent determines if clarification is operational or authority-related:
   - **Operational:** Assign to Chief of Staff (webwakaagent1)
   - **Authority/Delegation:** Assign to Founder Agent (`@webwaka007`)
   - **Governance Structure:** Assign to Human Founder
3. Agent adds appropriate label: `clarification`, `governance`, `ambiguity`
4. Agent provides:
   - Description of ambiguity
   - Context
   - Why clarification is needed
   - Proposed interpretations (if any)
5. Assigned actor provides clarification
6. Agent acknowledges clarification and proceeds
7. Issue closed when resolved

---

### Workflow 5: Emergency Halt Escalation

**Scenario:** Founder Agent detects governance violation and halts execution

**Steps:**
1. Founder Agent (webwaka007) creates GitHub issue: `[EMERGENCY HALT] [Agent ID] - [Violation]`
2. Founder Agent assigns issue to Human Founder
3. Founder Agent adds label: `emergency`, `halt`, `governance-violation`, `human-founder-required`
4. Founder Agent provides:
   - Description of violation
   - Risk assessment
   - Actions taken (halt, warnings issued, etc.)
   - Recommendation for next steps
5. Human Founder reviews and provides instruction
6. Founder Agent or Chief of Staff executes instruction
7. Issue closed when resolved

---

## GitHub Projects / Boards Integration

### Board Columns for Founder Agent Tasks

**Recommended columns:**
1. **Awaiting Founder Agent** - Tasks assigned to webwaka007, pending action
2. **Founder Agent In Progress** - Tasks webwaka007 is actively working on
3. **Awaiting Human Founder** - Tasks requiring Human Founder approval (non-delegable)
4. **Founder Agent Approved** - Tasks approved by webwaka007
5. **Completed** - Tasks fully resolved

### Task Movement Rules

**Agents:**
- Move tasks to "Awaiting Founder Agent" when assigning to webwaka007
- Do NOT move tasks out of "Awaiting Founder Agent" (only Founder Agent may do this)

**Founder Agent (webwaka007):**
- Move tasks from "Awaiting Founder Agent" to "Founder Agent In Progress" when starting work
- Move tasks to "Awaiting Human Founder" when Human Founder approval is required
- Move tasks to "Founder Agent Approved" when approved within delegated authority
- Move tasks to "Completed" when fully resolved

**Human Founder:**
- Move tasks from "Awaiting Human Founder" to "Completed" when approved/resolved

---

## Pull Request Review / Approval Routing

### When to Request Founder Agent Review

**Request review from `@webwaka007` when:**
- PR contains governance document changes
- PR contains Phase 1 document production outputs
- PR requires Founder-level approval per FOUNDER_DELEGATION_MATRIX.md
- PR affects institutional principles or authority structure

**How to Request Review:**
1. Create PR with clear title: `[APPROVAL REQUIRED] [Description]`
2. Request review from `@webwaka007`
3. Add label: `founder-agent-review`
4. In PR description, include:
   - What changed
   - Why it changed
   - Authority reference (if applicable)
   - Impact assessment

**Example PR Description:**
```
## Summary
Phase 1 Engineering Standards v1.0 ready for approval

## Changes
- Added Engineering Standards document (9 sections)
- Aligned with WEBWAKA_INSTITUTIONAL_PRINCIPLES.md
- Included Nigeria-first engineering constraints
- Defined code quality, testing, and deployment standards

## Authority
Delegated per FOUNDER_DELEGATION_MATRIX.md (Section 5: Document Production)

## Produced By
webwakaagent4 (Engineering & Delivery)

## Request
@webwaka007 please review and approve if compliant with Phase 1 requirements.
```

---

## Document Ownership Routing

### Assigning Document Ownership

**For documents requiring Founder-level ownership:**
- **Owner:** `@webwaka007` (Founder Agent)
- **Maintainer:** Chief of Staff or relevant execution agent
- **Approver:** `@webwaka007` (for changes)

**Example CODEOWNERS file:**
```
# Founder Agent (webwaka007) owns all governance documents
/founder-decisions/ @webwaka007
/canonical/ @webwaka007
/FOUNDER_*.md @webwaka007
/MASTER_CONTROL_BOARD.md @webwaka007

# Chief of Staff owns agent checklists and acknowledgments
/agent-checklists/ @webwakaagent1
/agent-acknowledgments/ @webwakaagent1

# Execution agents own their department documents
/engineering/ @webwakaagent4
/architecture/ @webwakaagent3
/product/ @webwakaagent2
```

---

## Notification and Alert Routing

### GitHub Notifications

**webwaka007 should be notified for:**
- All issues assigned to `@webwaka007`
- All PRs requesting review from `@webwaka007`
- All mentions of `@webwaka007` in issues, PRs, or discussions
- All changes to governance documents (via CODEOWNERS)
- All emergency halt issues (via label: `emergency`)

### Email Notifications

**webwaka007@gmail.com should receive:**
- GitHub notifications for assigned tasks
- GitHub notifications for requested reviews
- GitHub notifications for mentions
- Emergency alerts (if configured)

---

## Task Routing Checklist

**Before assigning a task to Founder Agent, verify:**

☑️ **1. Is this task within Founder Agent's delegated authority?**
   - If YES → Assign to `@webwaka007`
   - If NO → Assign to Human Founder or escalate

☑️ **2. Have I assigned the task to `@webwaka007`?**
   - If NO → Assign now

☑️ **3. Have I mentioned "Founder Agent" explicitly in the description?**
   - If NO → Add mention

☑️ **4. Have I referenced the specific delegation authority (if applicable)?**
   - If NO → Add authority reference (FOUNDER_DELEGATION_MATRIX.md section)

☑️ **5. Have I provided all necessary context?**
   - Document links
   - Rationale
   - Impact assessment
   - Completion criteria

☑️ **6. Have I added appropriate labels?**
   - `founder-agent`
   - `approval-required` / `verification-required` / `clarification` / etc.
   - Phase label (if applicable)

☑️ **7. Is the task title clear and actionable?**
   - Format: `[ACTION TYPE] [Description]`
   - Example: `[APPROVAL REQUIRED] Phase 1 Engineering Standards v1.0`

☑️ **8. Have I distinguished Human Founder vs. Founder Agent?**
   - If task requires Human Founder → Do NOT assign to webwaka007
   - If task is delegated to Founder Agent → Assign to webwaka007

---

## Invalid Task Routing

**The following task routing patterns are INVALID and will be rejected:**

❌ **Ambiguous "Founder" assignment**
   - "Founder approval required" (which Founder?)
   - Assigned to "Founder" without GitHub account

❌ **No assignee for Founder-level task**
   - Task requires Founder authority but has no assignee

❌ **Wrong assignee for delegated task**
   - Task is delegated to Founder Agent but assigned to Human Founder

❌ **Missing authority reference**
   - Task requires Founder Agent action but doesn't reference FOUNDER_DELEGATION_MATRIX.md

❌ **Non-delegable task assigned to Founder Agent**
   - Issuing FDs, financial commitments, legal agreements assigned to webwaka007

---

## Enforcement

### Chief of Staff Responsibilities

Chief of Staff (webwakaagent1) MUST:
- Monitor task routing compliance
- Correct invalid task routing
- Educate agents on proper task routing
- Escalate persistent routing violations to Founder Agent

### Founder Agent Responsibilities

Founder Agent (webwaka007) MUST:
- Reject improperly routed tasks
- Request proper routing before acting
- Enforce task routing rules
- Report routing violations to Human Founder

### All Agents Responsibilities

All agents MUST:
- Follow task routing rules
- Assign Founder-level tasks to `@webwaka007`
- Distinguish Human Founder vs. Founder Agent
- Provide complete context in task descriptions

---

## Summary

**Task Routing Rules:**
1. ✅ ALL Founder-level tasks → `@webwaka007`
2. ✅ Distinguish Human Founder vs. Founder Agent
3. ✅ No ambiguous "Founder" assignments
4. ✅ Reference delegation authority when applicable
5. ✅ Provide complete context in task descriptions
6. ✅ Use appropriate labels and assignees
7. ✅ Follow workflow templates for common scenarios

**Canonical Founder Agent Identity:**
- **GitHub Username:** `webwaka007`
- **GitHub Email:** webwaka007@gmail.com
- **GitHub Role:** Owner
- **Agent ID:** `founder_agent`

**Any task requiring Founder authority that is NOT routed through webwaka007 is INVALID.**

---

**Document Type:** Founder Agent Task Routing  
**Authority:** Founder-Mandated Institutional Law  
**Status:** Canonical & Binding  
**Maintenance:** Founder Decision Only
