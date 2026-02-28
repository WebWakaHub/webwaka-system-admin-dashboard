# Agent Execution Protocol (Canonical)

This protocol governs ALL agent behavior on the WebWaka platform.

Deviation is prohibited unless explicitly authorized by the Founder Agent.

---

## Step 1: Load Identity
- Load your context page from `/docs/agents/context/{AGENT_ID}.md`
- Confirm your authority and prohibitions

---

## Step 2: Load Governance
You MUST load:
- Master Control Board
- AGENT_IDENTITY_REGISTRY.md
- Relevant phase definitions
- Any documents referenced by your context page

---

## Step 3: Discover Tasks
Query GitHub Issues where:
- `agent:{YOUR_AGENT_ID}`

---

## Step 4: Filter Tasks
You MUST NOT execute tasks with status:
- `status:done`
- `status:blocked`
- `status:unactivated`

Only tasks labeled:
- `status:ready`
may be executed.

---

## Step 5: Execute
For each ready task:
- Follow the task's Definition of Done
- Respect all scope boundaries
- Do not introduce unapproved changes

---

## Step 6: Update State
After execution:
- Update the GitHub issue status
- Commit all artifacts
- Update the Master Control Board
- Record any blockers or discoveries

---

## Step 7: Founder Agent Review Gate (MANDATORY FOR CHIEF OF STAFF)

**GOVERNANCE RULE (Hard-Coded):**
> ALL tasks and ALL documents created by Chief of Staff MUST be assigned to webwaka007 for review, verification, and approval before they are considered final.

**This is a permanent governance rule. No exceptions unless explicitly approved by Founder Agent.**

### Review Clarity Requirement (Non-Optional)

When assigning ANY task or document to webwaka007 for review, you MUST include explicit review context:

1. **What was done**
   - Summary of actions taken
   - Scope covered
   - What was explicitly NOT done

2. **Why it was done**
   - Objective or problem being solved
   - Decision context (what alternatives existed)

3. **What webwaka007 is reviewing for**
   - Examples: Architectural correctness, governance compliance, security implications, long-term scalability, alignment with Control Board, best-practice validation
   - This must be explicit — not assumed

4. **What decision or outcome is expected**
   - Approval
   - Conditional approval
   - Recommendations
   - Rejection / rework

**Governance Rule (Critical):**
> Founder Agent must NEVER be forced to infer intent, scope, or review objectives. Ambiguous assignments are governance violations.

**If review context is missing or unclear:**
- The task will be returned unreviewed
- The task remains unapproved by definition

### How to Assign for Review

**For GitHub Issues:**
- Add label: `agent:webwaka007` OR `reviewer:webwaka007`
- Include review context in issue description or comment
- Update status to `status:pending-review`

**For Documents:**
- Create explicit review task assigned to webwaka007
- Include "Reviewer Brief" section at top of document
- Mark document as "Pending Founder Agent Review"

### Governance Principle

**No task is complete.**  
**No document is final.**  
**No decision is authoritative.**  
**Until Founder Agent (webwaka007) has reviewed it — with clear review intent.**

---

## Step 8: Termination Condition
If no `status:ready` tasks remain:
- STOP execution
- Report status
- Do not invent work

---

## Enforcement Rule
Any work not reflected in GitHub and the Master Control Board is invalid.

This protocol is binding.
