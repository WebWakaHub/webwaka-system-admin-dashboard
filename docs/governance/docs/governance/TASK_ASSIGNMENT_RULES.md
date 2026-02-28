# Task Assignment Rules (Canonical)

**Version:** 1.0  
**Date:** 2026-02-05  
**Status:** Canonical & Binding  
**Authority:** Founder-Mandated Institutional Law

---

## Document Purpose

This document defines the **ONLY** valid method for assigning work to agents in the WebWaka platform.

**Non-negotiable rule:**
> All agent tasks MUST be GitHub Issues. Work assigned through any other method is invalid and MUST NOT be executed.

---

## Mandatory GitHub Issue Structure

Every task assigned to an agent MUST be a GitHub Issue with the following mandatory elements:

### 1. Mandatory Labels

**Every task issue MUST have these labels:**

| Label Type | Format | Purpose | Example |
|:-----------|:-------|:--------|:--------|
| **Agent Assignment** | `agent:{AGENT_ID}` | Identifies which agent owns this task | `agent:webwakaagent1` |
| **Phase Assignment** | `phase:{PHASE_ID}` | Identifies which phase this task belongs to | `phase:phase1` |
| **Status** | `status:{STATUS}` | Indicates execution readiness | `status:ready` |

**Valid Status Values:**
- `status:unactivated` - Task exists but dependencies not met; DO NOT execute
- `status:ready` - Task is ready for execution; agent MAY execute
- `status:in-progress` - Task is currently being executed
- `status:blocked` - Task is blocked by external dependency; DO NOT execute
- `status:done` - Task is complete; DO NOT re-execute

---

### 2. Mandatory Issue Fields

**Every task issue MUST contain these sections in the issue body:**

#### A. Objective
Clear, concise statement of what needs to be accomplished.

**Format:**
```markdown
## Objective
[One sentence describing the goal]
```

#### B. Definition of Done
Explicit criteria that define when the task is complete.

**Format:**
```markdown
## Definition of Done
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3
```

#### C. Dependencies
Links to other GitHub Issues that must be completed before this task can be executed.

**Format:**
```markdown
## Dependencies
- Depends on #123
- Depends on #456
- None (if no dependencies)
```

#### D. Required Context Documents
List of documents the agent must load before executing this task.

**Format:**
```markdown
## Required Context Documents
1. Document Name 1
2. Document Name 2
3. Document Name 3
```

#### E. Control Board References
Links to relevant sections of the Master Control Board.

**Format:**
```markdown
## Control Board References
- Phase: [Phase Name]
- Section: [Section Name]
- Link: [URL to Master Control Board section]
```

---

## Example Task Issue

**Title:** `Create Product Vision Document`

**Labels:**
- `agent:webwakaagent2`
- `phase:phase1`
- `status:ready`

**Body:**
```markdown
## Objective
Create the Product Vision & Strategy document for WebWaka platform.

## Definition of Done
- [ ] Document created in `/docs/product/PRODUCT_VISION_STRATEGY.md`
- [ ] Document follows canonical template
- [ ] Document reviewed by webwakaagent1 (Chief of Staff)
- [ ] Document committed to GitHub
- [ ] Master Control Board updated

## Dependencies
- None

## Required Context Documents
1. WEBWAKA_CANONICAL_MASTER_CONTEXT.md
2. WEBWAKA_INSTITUTIONAL_PRINCIPLES.md
3. Product Requirements Specification Template
4. Master Control Board

## Control Board References
- Phase: Phase 1 - Document Production
- Section: Product & Platform Strategy
- Link: [URL to Master Control Board]
```

---

## Task Creation Rules

### Who Can Create Tasks?

| Actor | Can Create Tasks For | Restrictions |
|:------|:---------------------|:-------------|
| **Founder** | Any agent | None |
| **Founder Agent (webwaka007)** | Any agent | Only within delegated authority |
| **Chief of Staff (webwakaagent1)** | Any agent | Only for Phase 1 coordination activities |
| **Execution Agents** | Themselves only | Only for sub-tasks of assigned work |

### Task Creation Process

1. **Create GitHub Issue** in appropriate repository
2. **Add mandatory labels** (`agent:`, `phase:`, `status:`)
3. **Fill mandatory fields** (Objective, Definition of Done, Dependencies, Context, Control Board)
4. **Set initial status:**
   - `status:unactivated` if dependencies not met
   - `status:ready` if dependencies met and task can be executed immediately
5. **Link to Master Control Board** (update board to reference this issue)

---

## Task Status Transitions

```
unactivated → ready → in-progress → done
              ↓
            blocked → ready
```

**Transition Rules:**
- `unactivated` → `ready`: Only Chief of Staff or Founder Agent may activate
- `ready` → `in-progress`: Agent assigned to task may transition when starting work
- `in-progress` → `done`: Agent assigned to task may transition when Definition of Done is met
- `in-progress` → `blocked`: Agent assigned to task may transition when external blocker discovered
- `blocked` → `ready`: Only Chief of Staff or Founder Agent may unblock
- Any status → `unactivated`: Only Founder Agent may deactivate

---

## Enforcement Rules

### For Agents

**Agents MUST:**
- Query GitHub Issues with `agent:{YOUR_AGENT_ID}` label
- Filter to only tasks with `status:ready`
- Execute tasks in order of priority (defined by issue labels or explicit ordering)
- Update issue status when starting work (`status:in-progress`)
- Update issue status when completing work (`status:done`)
- Update Master Control Board after completing each task
- Report blockers immediately by transitioning to `status:blocked` and escalating

**Agents MUST NOT:**
- Execute tasks with `status:unactivated` (dependencies not met)
- Execute tasks with `status:blocked` (external blocker present)
- Execute tasks with `status:done` (already complete)
- Execute tasks without `agent:{YOUR_AGENT_ID}` label (not assigned to you)
- Execute work that is not represented as a GitHub Issue

### For Chief of Staff

**Chief of Staff MUST:**
- Monitor all agent task queues
- Activate tasks when dependencies are met (`unactivated` → `ready`)
- Unblock tasks when external blockers are resolved (`blocked` → `ready`)
- Verify task completion against Definition of Done
- Escalate to Founder when agents are blocked >72 hours

### For Founder Agent

**Founder Agent MAY:**
- Create tasks for any agent
- Activate/deactivate tasks at will
- Override task priorities
- Unblock any task
- Reassign tasks between agents (by changing `agent:` label)

---

## Invalid Task Assignment Methods

**The following methods are INVALID and MUST NOT be used:**
- ❌ Verbal instructions
- ❌ Email requests
- ❌ Slack/chat messages
- ❌ Long contextual prompts
- ❌ Embedded instructions in documents
- ❌ Implicit expectations

**If work is not a GitHub Issue with proper labels, it does not exist.**

---

## Integration with Master Control Board

**Binding Rule:**
> If a task is not visible on the Master Control Board, it does not exist.

**Requirements:**
- Every GitHub Issue MUST link to a Master Control Board section
- Every Master Control Board item MUST link to relevant GitHub Issues
- Agents MUST update the Master Control Board after completing each task
- Chief of Staff MUST verify Master Control Board accuracy weekly

---

## Compliance Verification

**Chief of Staff MUST verify weekly:**
1. All agent tasks are GitHub Issues with proper labels
2. All `status:ready` tasks have met dependencies
3. All `status:unactivated` tasks have documented unmet conditions
4. All `status:blocked` tasks have escalation records
5. All `status:done` tasks have updated Master Control Board
6. No agent is executing work outside GitHub Issues

**Violations MUST be escalated to Founder immediately.**

---

This document is binding and non-negotiable.
