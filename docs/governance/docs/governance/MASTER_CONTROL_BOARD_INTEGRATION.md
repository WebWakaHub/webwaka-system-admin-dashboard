# Master Control Board Integration (Canonical)

**Version:** 1.0  
**Date:** 2026-02-05  
**Status:** Canonical & Binding  
**Authority:** Founder-Mandated Institutional Law

---

## Document Purpose

This document defines how agents MUST integrate with the Master Control Board to maintain system integrity.

**Core Principle:**
> The Master Control Board is the authoritative source of truth. All agent actions must reconcile back to it.

---

## The Binding Rule

**NON-NEGOTIABLE:**
> **If it is not visible on the Master Control Board, it does not exist.**

**Corollary:**
> **Any work not reflected in GitHub Issues and the Master Control Board is invalid.**

### What This Means

1. **Every phase item** on the board MUST link to:
   - Assigned agent(s)
   - Related GitHub Issues
   - Current status
   - Completion criteria

2. **Every agent action** MUST:
   - Be represented as a GitHub Issue
   - Be linked from the Master Control Board
   - Update the board when status changes

3. **Every completed task** MUST:
   - Update the GitHub Issue to `status:done`
   - Update the Master Control Board to reflect completion
   - Link artifacts produced

4. **Every blocker** MUST:
   - Be documented on the Master Control Board
   - Have a GitHub Issue tracking resolution
   - Have an escalation path defined

---

## Board Structure Requirements

### Phase Items

Every phase item on the Master Control Board MUST have:

```markdown
### [Phase Item Title]

**Status:** [unactivated | ready | in-progress | blocked | done]  
**Assigned Agent(s):** [agent ID(s)]  
**GitHub Issues:** [links to related issues]  
**Dependencies:** [links to prerequisite items]  
**Completion Criteria:** [explicit criteria]  
**Last Updated:** [date]  
**Updated By:** [agent ID]
```

### Example Phase Item

```markdown
### Product Vision & Strategy Document

**Status:** done  
**Assigned Agent(s):** webwakaagent2  
**GitHub Issues:** #123  
**Dependencies:** None  
**Completion Criteria:**
- Document created in `/docs/product/PRODUCT_VISION_STRATEGY.md`
- Document follows canonical template
- Document reviewed by Chief of Staff
- Document committed to GitHub

**Last Updated:** 2026-02-05  
**Updated By:** webwakaagent2  
**Artifacts:** [link to document]
```

---

## Agent Update Obligations

### When Agents MUST Update the Board

**Agents MUST update the Master Control Board:**

1. **When starting a task:**
   - Update phase item status to `in-progress`
   - Add "Last Updated" timestamp
   - Add "Updated By" field

2. **When completing a task:**
   - Update phase item status to `done`
   - Link artifacts produced
   - Add "Last Updated" timestamp
   - Add "Updated By" field

3. **When discovering a blocker:**
   - Update phase item status to `blocked`
   - Document blocker details
   - Link blocker GitHub Issue
   - Add "Last Updated" timestamp
   - Escalate per escalation path

4. **When resolving a blocker:**
   - Update phase item status to `ready` or `in-progress`
   - Document resolution
   - Add "Last Updated" timestamp

5. **When discovering new dependencies:**
   - Add dependencies to phase item
   - Update status if needed
   - Add "Last Updated" timestamp

### How to Update the Board

**Step-by-step process:**

1. **Navigate to Master Control Board:**
   - Open `/MASTER_CONTROL_BOARD.md` in repository

2. **Find your phase item:**
   - Search for the phase item related to your current task

3. **Update status:**
   - Change `**Status:**` field to new status

4. **Update metadata:**
   - Update `**Last Updated:**` to current date
   - Update `**Updated By:**` to your agent ID

5. **Add details:**
   - If completing: Add `**Artifacts:**` links
   - If blocking: Add `**Blocker:**` details
   - If discovering dependencies: Update `**Dependencies:**`

6. **Commit changes:**
   - Commit with message: `Update Master Control Board: [Phase Item] → [New Status]`
   - Reference GitHub Issue in commit message

7. **Verify:**
   - Ensure board reflects current reality
   - Ensure GitHub Issue and board are synchronized

---

## Chief of Staff Reconciliation Duties

### Weekly Reconciliation

**Chief of Staff MUST perform weekly reconciliation:**

1. **Verify Board-GitHub Sync:**
   - Every phase item on board has corresponding GitHub Issue(s)
   - Every GitHub Issue referenced on board exists and has correct status
   - Board status matches GitHub Issue status

2. **Verify Agent Updates:**
   - All agents have updated board after completing tasks
   - All "Last Updated" timestamps are within expected ranges
   - All "Updated By" fields are correctly attributed

3. **Verify Blocker Tracking:**
   - All blockers on board have GitHub Issues
   - All blockers >72 hours have been escalated
   - All resolved blockers have been removed from board

4. **Verify Completion Criteria:**
   - All `done` items have met completion criteria
   - All `done` items have linked artifacts
   - All `done` items have been verified

5. **Report Discrepancies:**
   - Document any board-GitHub mismatches
   - Escalate to Founder if critical discrepancies found
   - Update board to correct any errors

### Daily Monitoring

**Chief of Staff MUST monitor daily:**

1. **Agent Activity:**
   - Are agents updating board after actions?
   - Are agents following update obligations?

2. **Status Accuracy:**
   - Do board statuses reflect reality?
   - Are there stale statuses (not updated in >48 hours)?

3. **Blocker Escalation:**
   - Are blockers being reported promptly?
   - Are blockers being escalated per policy?

---

## Founder Agent Board Authority

### What Founder Agent May Do

**Within delegated authority, Founder Agent may:**

1. **Approve Phase Transitions:**
   - Update board to reflect phase completion
   - Mark phase milestones as complete
   - Authorize next phase start

2. **Verify Agent Compliance:**
   - Review board for agent compliance
   - Mark agents as compliant/non-compliant
   - Issue compliance warnings

3. **Unblock Tasks:**
   - Change phase item status from `blocked` to `ready`
   - Document unblocking decision
   - Authorize execution

4. **Activate Tasks:**
   - Change phase item status from `unactivated` to `ready`
   - Document activation decision
   - Notify assigned agent

5. **Update Priorities:**
   - Reorder phase items
   - Update priority labels
   - Communicate priority changes to agents

### What Founder Agent Must NOT Do

**Without explicit Founder approval:**

1. **Modify Board Structure:**
   - Cannot add/remove sections
   - Cannot change board format
   - Cannot delete board history

2. **Override Founder Updates:**
   - Cannot change board updates made by Founder
   - Cannot reverse Founder decisions

3. **Approve Phase Transitions Without Delegation:**
   - Cannot mark phases complete without explicit delegation
   - Cannot authorize phase starts without delegation

---

## Board-GitHub Synchronization Rules

### Single Source of Truth

**GitHub Issues are the operational source of truth.**  
**Master Control Board is the strategic source of truth.**

**Both must be synchronized at all times.**

### Synchronization Requirements

| Event | GitHub Issue Update | Master Control Board Update |
|:------|:-------------------|:---------------------------|
| **Task Created** | Create issue with labels | Add phase item to board |
| **Task Activated** | Change to `status:ready` | Change phase item to `ready` |
| **Task Started** | Change to `status:in-progress` | Change phase item to `in-progress` |
| **Task Blocked** | Change to `status:blocked` | Change phase item to `blocked`, document blocker |
| **Task Completed** | Change to `status:done` | Change phase item to `done`, link artifacts |
| **Task Deactivated** | Change to `status:unactivated` | Change phase item to `unactivated`, document reason |

### Conflict Resolution

**If GitHub Issue and Master Control Board conflict:**

1. **Identify Conflict:**
   - GitHub Issue says `status:done`
   - Board says `in-progress`

2. **Investigate:**
   - Check GitHub commit history
   - Check board update history
   - Identify which is correct

3. **Resolve:**
   - Update incorrect source to match reality
   - Document resolution in both places
   - Add comment explaining conflict and resolution

4. **Escalate if Needed:**
   - If conflict cannot be resolved, escalate to Chief of Staff
   - If Chief of Staff cannot resolve, escalate to Founder Agent
   - If Founder Agent cannot resolve, escalate to Founder

---

## Compliance Verification

### Agent Compliance Checklist

**Chief of Staff verifies each agent:**

- [ ] Agent updates board after completing tasks
- [ ] Agent updates board when discovering blockers
- [ ] Agent links artifacts when marking tasks done
- [ ] Agent timestamps are accurate and timely
- [ ] Agent attributions are correct

### Board Integrity Checklist

**Chief of Staff verifies board integrity:**

- [ ] All phase items have assigned agents
- [ ] All phase items have GitHub Issue links
- [ ] All phase items have current status
- [ ] All phase items have completion criteria
- [ ] All `done` items have linked artifacts
- [ ] All `blocked` items have documented blockers
- [ ] All `unactivated` items have documented unmet conditions

### Violation Response

**If violations detected:**

1. **Issue Warning:**
   - Chief of Staff issues compliance warning to agent
   - Document violation in governance log

2. **Require Correction:**
   - Agent must update board to correct state
   - Agent must provide evidence of correction

3. **Escalate if Persistent:**
   - If agent does not correct within 24 hours, escalate to Founder Agent
   - If agent repeatedly violates, escalate to Founder

---

## Summary

**The Master Control Board is the authoritative strategic view of WebWaka development.**

**All agents MUST:**
- Update the board after every action
- Ensure board reflects GitHub reality
- Link every phase item to agents and issues
- Respect the binding rule: "If it's not on the board, it doesn't exist"

**Chief of Staff MUST:**
- Reconcile board weekly
- Monitor board daily
- Verify agent compliance
- Escalate discrepancies

**Founder Agent MAY:**
- Approve phase transitions (when delegated)
- Verify agent compliance
- Unblock and activate tasks
- Update priorities

**This integration is critical to system integrity and governance enforcement.**

---

This document is binding and non-negotiable.
