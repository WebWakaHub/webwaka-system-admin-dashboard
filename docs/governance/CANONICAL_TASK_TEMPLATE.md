# Canonical Task Template

**Document Type:** Governance Template  
**Created By:** webwakaagent1 (Chief of Staff)  
**Date:** 2026-02-08  
**Version:** 1.0  
**Status:** APPROVED (Pending Founder Agent review)  
**Authority:** EXECUTION_LESSONS_AND_STANDARD_PRACTICES.md (All 10 Mandatory Standards)

---

## Purpose

This template defines the **canonical format** for all task assignments to WebWaka agents.

**All task assignments MUST use this template to ensure:**
- Compliance with ALL 10 MANDATORY STANDARDS
- Zero ambiguity (mechanical execution possible)
- Consistent execution across all agents
- Proper identity loading and GitHub authentication
- Explicit completion criteria
- Step-by-step GitHub commits

**This template is BINDING for all future task assignments.**

---

## Canonical Task Assignment Format

```
You are now operating as {AGENT_ID} because you will perform all tasks assigned to {AGENT_ID}

Use this PAT for CLI to access the repos and for all GitHub-related tasks because they are private repos:
{GITHUB_PAT}

Commit to GitHub step by step as you progress.

You are at Step {STEP_NUMBER} of the {PHASE_NAME}.

Your task: {TASK_DESCRIPTION}

Visit the Agent Identity Registry at https://github.com/WebWakaHub/webwaka-governance/blob/master/AGENT_IDENTITY_REGISTRY.md, load your identity completely, then access {EXECUTION_LIST_FILE}.md and locate Step {STEP_NUMBER}. Execute ONLY Step {STEP_NUMBER} as specified. Do not execute other steps or milestones.
```

---

## Template Variables

### Required Variables

**{AGENT_ID}**
- **Description:** The unique identifier of the agent being assigned the task
- **Format:** `webwakaagent1`, `webwakaagent2`, ..., `webwakaagent10`, or `webwaka007`
- **Example:** `webwakaagent4`

**{GITHUB_PAT}**
- **Description:** The Personal Access Token for the agent to access GitHub repositories
- **Format:** `[REDACTED-PAT]` (40 characters after `ghp_`)
- **Example:** `[REDACTED-PAT]`
- **Security:** MUST be agent-specific, MUST NOT be committed to GitHub in execution lists

**{STEP_NUMBER}**
- **Description:** The step number in the execution list
- **Format:** Integer (1, 2, 3, ...)
- **Example:** `23`

**{PHASE_NAME}**
- **Description:** The name of the phase execution list
- **Format:** `Phase {N} Simplified Execution List` where N is the phase number
- **Example:** `Phase 3 Simplified Execution List`

**{TASK_DESCRIPTION}**
- **Description:** A concise, action-oriented description of what the agent must accomplish
- **Format:** Action verb + object + context (optional)
- **Example:** `Conduct Pre-Production Security Audit (Week 1)`
- **Requirements:**
  - MUST be specific and actionable
  - MUST NOT be ambiguous
  - SHOULD include timing context if relevant (e.g., "Week 1")

**{EXECUTION_LIST_FILE}**
- **Description:** The filename of the execution list document (without .md extension)
- **Format:** `PHASE_{N}_SIMPLIFIED_EXECUTION_LIST`
- **Example:** `PHASE_3_SIMPLIFIED_EXECUTION_LIST`

---

## Mandatory Standards Compliance

This template ensures compliance with ALL 10 MANDATORY STANDARDS:

### Standard 1: Step Decomposition with Copy-Paste Prompts ✅
- **Compliance:** Template provides exact copy-paste format
- **Evidence:** Entire prompt is copy-pasteable without modification (except variable substitution)

### Standard 2: Agent Identity Loading ✅
- **Compliance:** Template includes identity loading instruction
- **Evidence:** "Visit the Agent Identity Registry... load your identity completely"

### Standard 3: Master Control Board Updates ✅
- **Compliance:** Execution lists include Master Control Board update steps
- **Evidence:** Phase 3 Step 58 updates Master Control Board

### Standard 4: GitHub Commit Discipline ✅
- **Compliance:** Template includes commit instruction
- **Evidence:** "Commit to GitHub step by step as you progress"

### Standard 5: Completion Criteria ✅
- **Compliance:** Execution lists include explicit completion criteria for every step
- **Evidence:** Every step in Phase 3 execution list has "Completion Criteria" section

### Standard 6: Documentation-as-Part-of-Done ✅
- **Compliance:** Completion criteria require documentation committed to GitHub
- **Evidence:** Every step requires "STEP_{N}_{DESCRIPTION}.md committed to GitHub"

### Standard 7: Blocker Escalation ✅
- **Compliance:** Execution lists include escalation procedures
- **Evidence:** Phase 3 Step 8 finalizes production support procedures with escalation paths

### Standard 8: Founder Agent Verification ✅
- **Compliance:** Execution lists include Founder Agent verification at key milestones
- **Evidence:** Phase 3 Steps 10, 20, 30, 40, 50, 56, 57 include Founder Agent verification

### Standard 9: Production Readiness Checklist ✅
- **Compliance:** Execution lists include production readiness verification
- **Evidence:** Phase 3 Steps 1-10 verify production readiness before deployment

### Standard 10: Compliance Verification ✅
- **Compliance:** Execution lists include compliance verification steps
- **Evidence:** Phase 3 Steps 41-50 verify SOC 2 compliance and security

---

## Usage Instructions

### For Human Founder

**When assigning a task to an agent:**

1. Copy the Canonical Task Assignment Format above
2. Replace all variables with actual values:
   - `{AGENT_ID}` → Agent identifier (e.g., `webwakaagent5`)
   - `{GITHUB_PAT}` → Agent's GitHub PAT (from credentials list)
   - `{STEP_NUMBER}` → Step number (e.g., `23`)
   - `{PHASE_NAME}` → Phase name (e.g., `Phase 3 Simplified Execution List`)
   - `{TASK_DESCRIPTION}` → Task description (e.g., `Onboard Tenant 1 (Week 4)`)
   - `{EXECUTION_LIST_FILE}` → Execution list filename (e.g., `PHASE_3_SIMPLIFIED_EXECUTION_LIST`)
3. Paste the complete prompt to the agent
4. Agent will execute the task according to the execution list

**Example:**

```
You are now operating as webwakaagent5 because you will perform all tasks assigned to webwakaagent5

Use this PAT for CLI to access the repos and for all GitHub-related tasks because they are private repos:
[REDACTED-PAT]

Commit to GitHub step by step as you progress.

You are at Step 1 of the Phase 3 Simplified Execution List.

Your task: Conduct Pre-Production Security Audit (Week 1)

Visit the Agent Identity Registry at https://github.com/WebWakaHub/webwaka-governance/blob/master/AGENT_IDENTITY_REGISTRY.md, load your identity completely, then access PHASE_3_SIMPLIFIED_EXECUTION_LIST.md and locate Step 1. Execute ONLY Step 1 as specified. Do not execute other steps or milestones.
```

### For Chief of Staff (webwakaagent1)

**When creating new execution lists:**

1. Use this template for EVERY step in the execution list
2. Ensure ALL 10 MANDATORY STANDARDS are applied
3. Include explicit completion criteria for every step
4. Include Founder Agent verification at key milestones
5. Do NOT commit execution lists with embedded credentials to GitHub
6. Store execution lists with credentials locally for Human Founder use only

### For Founder Agent (webwaka007)

**When reviewing execution lists:**

1. Verify every step uses this template format
2. Verify ALL 10 MANDATORY STANDARDS are applied
3. Verify completion criteria are explicit and measurable
4. Verify Founder Agent verification steps are included at appropriate milestones
5. Approve or reject execution list based on template compliance

---

## Template Evolution

**This template may evolve based on:**
- Lessons learned from Phase 3 execution
- New governance standards added to EXECUTION_LESSONS_AND_STANDARD_PRACTICES.md
- Founder Agent or Human Founder directives

**Template updates MUST:**
- Be approved by Founder Agent (webwaka007)
- Be documented in EXECUTION_LESSONS_AND_STANDARD_PRACTICES.md
- Maintain backward compatibility (old prompts still work)
- Be versioned (increment version number)

**Current Version:** 1.0 (2026-02-08)

---

## Prohibited Variations

**The following variations are PROHIBITED:**

❌ **Omitting identity loading instruction**
- Violates Standard 2 (Agent Identity Loading)

❌ **Omitting GitHub commit instruction**
- Violates Standard 4 (GitHub Commit Discipline)

❌ **Omitting execution list reference**
- Violates Standard 1 (Step Decomposition with Copy-Paste Prompts)

❌ **Omitting step number**
- Creates ambiguity, violates Standard 1

❌ **Omitting GitHub PAT**
- Prevents GitHub access, violates Standard 4

❌ **Using vague task descriptions**
- Creates ambiguity, violates Standard 1

❌ **Allowing agents to execute multiple steps**
- Violates step decomposition principle, violates Standard 1

---

## Quality Checklist

**Before using this template, verify:**

- [ ] Agent ID is correct
- [ ] GitHub PAT is correct for the agent
- [ ] Step number is correct
- [ ] Phase name is correct
- [ ] Task description is specific and actionable
- [ ] Execution list filename is correct
- [ ] All variables have been replaced (no {VARIABLE} placeholders remain)
- [ ] Prompt is copy-pasteable without modification
- [ ] Prompt complies with ALL 10 MANDATORY STANDARDS

---

## Enforcement

**This template is BINDING.**

**Violations will result in:**
- Task rejection by agent (agent may refuse non-compliant prompts)
- Escalation to Chief of Staff (webwakaagent1)
- Escalation to Founder Agent (webwaka007) if Chief of Staff cannot resolve
- Escalation to Human Founder if Founder Agent cannot resolve

**Compliance is MANDATORY.**

**Zero tolerance for non-compliant task assignments.**

---

## Document Status

**Created By:** webwakaagent1 (Chief of Staff)  
**Date:** 2026-02-08  
**Version:** 1.0  
**Status:** APPROVED (Pending Founder Agent review)  
**Authority:** EXECUTION_LESSONS_AND_STANDARD_PRACTICES.md  
**Binding:** YES (after Founder Agent approval)

---

**END OF CANONICAL TASK TEMPLATE**

**This template is the foundation of mechanical, zero-ambiguity task execution.**

**Use it. Enforce it. Improve it.**
