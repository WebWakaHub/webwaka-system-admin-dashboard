# Unactivated Task Enforcement Rule (CRITICAL)

**Version:** 1.0  
**Date:** 2026-02-05  
**Status:** Canonical & Binding  
**Authority:** Founder-Mandated Institutional Law  
**Severity:** CRITICAL - Violations result in immediate halt

---

## Document Purpose

This document defines the **"Unactivated for Execution"** rule, which is the **most critical** execution control mechanism in the WebWaka platform.

**Core Principle:**
> Tasks MAY be created early for planning purposes, but MUST NOT be executed unless all dependencies are met and all required context is provided.

---

## The Unactivated State

### Definition

A task is **unactivated** when:
- It has been created as a GitHub Issue
- It has been assigned to an agent (`agent:{AGENT_ID}` label)
- It has been labeled `status:unactivated`
- One or more of its dependencies are not yet met
- One or more of its required context documents are not yet available

### Purpose

The unactivated state serves three critical purposes:

1. **Visibility:** Tasks can be created and tracked even when they cannot yet be executed
2. **Planning:** Agents and coordinators can see the full scope of work ahead
3. **Safety:** Prevents agents from executing work before prerequisites are satisfied

---

## Unactivated Task Requirements

### Mandatory Label

**Every unactivated task MUST have:**
```
status:unactivated
```

### Mandatory Documentation

**Every unactivated task MUST document:**

1. **Unmet Conditions** - Explicit list of what is preventing activation
2. **Activation Criteria** - Explicit conditions that must be met for activation
3. **Estimated Activation Date** - When conditions are expected to be met (if known)

**Format:**
```markdown
## Unmet Conditions
- [ ] Dependency: Issue #123 must be completed
- [ ] Dependency: Issue #456 must be completed
- [ ] Context: Document XYZ must be created
- [ ] Approval: Founder approval required

## Activation Criteria
This task will be activated when:
1. All dependencies listed above are resolved
2. All required context documents are available
3. Approval has been granted (if required)

## Estimated Activation Date
2026-02-10 (or "Unknown" if cannot be estimated)
```

---

## Agent Execution Rules

### MUST NOT Execute

**Agents MUST NOT execute tasks with `status:unactivated`.**

**This rule has NO exceptions.**

Even if:
- The agent believes the dependencies are actually met
- The agent believes the task is urgent
- The agent believes they can complete the task without the dependencies
- The agent is instructed by another agent to proceed

**If a task is labeled `status:unactivated`, it MUST NOT be executed.**

### What Agents SHOULD Do Instead

When an agent encounters an unactivated task:

1. **Acknowledge:** Recognize that the task exists but is not ready
2. **Review:** Read the "Unmet Conditions" to understand what is blocking activation
3. **Report:** If the agent believes conditions are actually met, report to Chief of Staff
4. **Wait:** Do not execute; wait for Chief of Staff or Founder Agent to activate

---

## Activation Authority

### Who Can Activate Tasks?

| Actor | Can Activate? | Restrictions |
|:------|:--------------|:-------------|
| **Founder** | Yes | None |
| **Founder Agent (webwaka007)** | Yes | Only within delegated authority |
| **Chief of Staff (webwakaagent1)** | Yes | Only after verifying all conditions met |
| **Execution Agents** | **NO** | Must request activation from Chief of Staff |

### Activation Process

**To activate a task, the authorized actor MUST:**

1. **Verify all conditions met:**
   - All dependency issues are `status:done`
   - All required context documents exist
   - All required approvals have been granted

2. **Update the GitHub Issue:**
   - Change label from `status:unactivated` to `status:ready`
   - Add comment documenting activation decision
   - Add comment listing evidence that conditions are met

3. **Notify assigned agent:**
   - Add comment mentioning agent: `@{AGENT_ID} this task is now ready for execution`

4. **Update Master Control Board:**
   - Reflect task status change on board

**Example Activation Comment:**
```markdown
## Task Activated

**Activated by:** webwakaagent1 (Chief of Staff)
**Date:** 2026-02-05
**Reason:** All dependencies met

**Evidence:**
- ✅ Dependency #123 completed (2026-02-04)
- ✅ Dependency #456 completed (2026-02-05)
- ✅ Context document PRODUCT_VISION.md created (2026-02-05)

@webwakaagent2 this task is now ready for execution.
```

---

## Deactivation Authority

### Who Can Deactivate Tasks?

| Actor | Can Deactivate? | When? |
|:------|:----------------|:------|
| **Founder** | Yes | Any time |
| **Founder Agent (webwaka007)** | Yes | When conditions change or new dependencies discovered |
| **Chief of Staff (webwakaagent1)** | Yes | When conditions change or errors in activation discovered |
| **Assigned Agent** | Yes | When discovering unmet dependencies during execution |

### Deactivation Process

**To deactivate a task, the authorized actor MUST:**

1. **Document reason:**
   - What condition is no longer met?
   - What new dependency was discovered?
   - What error in activation was discovered?

2. **Update the GitHub Issue:**
   - Change label from `status:ready` or `status:in-progress` to `status:unactivated`
   - Add comment documenting deactivation decision
   - Update "Unmet Conditions" section with new information

3. **Notify relevant parties:**
   - Notify assigned agent
   - Notify Chief of Staff (if not the deactivator)
   - Escalate to Founder if critical

4. **Update Master Control Board:**
   - Reflect task status change on board

---

## Common Scenarios

### Scenario 1: Agent Finds Unactivated Task in Queue

**Agent discovers task with `status:unactivated` when querying GitHub Issues.**

**Correct Action:**
1. Read "Unmet Conditions" to understand why task is unactivated
2. Do NOT execute the task
3. Continue to next `status:ready` task
4. If no `status:ready` tasks remain, report to Chief of Staff

**Incorrect Action:**
- ❌ Execute the task anyway
- ❌ Assume the label is wrong
- ❌ Ask Founder Agent to activate without reviewing conditions

---

### Scenario 2: Agent Believes Unactivated Task Should Be Ready

**Agent reviews unactivated task and believes all conditions are actually met.**

**Correct Action:**
1. Document evidence that conditions are met
2. Report to Chief of Staff with evidence
3. Request activation
4. Wait for Chief of Staff to verify and activate
5. Do NOT execute until task is activated

**Incorrect Action:**
- ❌ Execute the task anyway
- ❌ Change the label yourself
- ❌ Proceed based on your own judgment

---

### Scenario 3: Agent Discovers Unmet Dependency During Execution

**Agent starts executing `status:ready` task but discovers a dependency that was not documented.**

**Correct Action:**
1. Stop execution immediately
2. Transition task to `status:unactivated`
3. Document newly discovered dependency in "Unmet Conditions"
4. Report to Chief of Staff with details
5. Request guidance on how to resolve

**Incorrect Action:**
- ❌ Continue execution
- ❌ Try to work around the missing dependency
- ❌ Complete the task with known gaps

---

### Scenario 4: Chief of Staff Activates Task Prematurely

**Chief of Staff activates task but agent discovers conditions were not actually met.**

**Correct Action:**
1. Stop execution immediately
2. Deactivate task (`status:unactivated`)
3. Document what condition is not met
4. Report to Chief of Staff with evidence
5. Escalate to Founder if Chief of Staff disagrees

**Incorrect Action:**
- ❌ Continue execution to avoid conflict
- ❌ Assume Chief of Staff knows better
- ❌ Complete task with known gaps

---

## Enforcement

### Violation Detection

**Chief of Staff MUST monitor for:**
- Agents executing tasks with `status:unactivated`
- Agents changing task status without authorization
- Agents completing work that was not `status:ready`

### Violation Response

**If violation is detected:**

1. **Immediate Halt:**
   - Chief of Staff MUST halt the agent immediately
   - All work produced by the agent on unactivated task is invalid

2. **Rollback:**
   - All commits related to unactivated task MUST be reverted
   - All artifacts MUST be deleted
   - GitHub Issue MUST be returned to `status:unactivated`

3. **Investigation:**
   - Chief of Staff MUST investigate why agent violated rule
   - Document findings in governance violation log

4. **Escalation:**
   - Chief of Staff MUST escalate to Founder
   - Founder decides on corrective action

5. **Prevention:**
   - Update agent context page if needed
   - Update governance documentation if needed
   - Conduct compliance review of all agents

---

## Why This Rule is Critical

### Prevents Cascading Failures

If an agent executes a task before dependencies are met:
- The output may be incorrect or incomplete
- Downstream tasks that depend on this output will fail
- The entire phase may need to be re-executed

### Maintains System Integrity

If agents can self-activate tasks:
- Coordination breaks down
- Chief of Staff loses visibility
- Master Control Board becomes inaccurate
- Governance becomes unenforceable

### Enables Safe Parallel Execution

If all agents respect the unactivated rule:
- Multiple agents can work simultaneously without conflicts
- Dependencies are explicitly managed
- Coordination overhead is minimized

---

## Summary

**The unactivated rule is simple:**

> If a task is labeled `status:unactivated`, do NOT execute it. No exceptions.

**This rule is the foundation of safe, coordinated execution in the WebWaka platform.**

**Violations are treated as critical governance failures and escalated to Founder immediately.**

---

This document is binding and non-negotiable.
