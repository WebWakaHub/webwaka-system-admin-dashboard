# Forward-Looking Founder Agent Review Rule

**Version:** 1.0  
**Date:** 2026-02-05  
**Authority:** Founder Directive (Authoritative & Non-Optional)  
**Status:** Active & Binding

---

## GOVERNANCE RULE (HARD-CODED)

**By default, ALL tasks and ALL documents created by Chief of Staff MUST be assigned to webwaka007 for review, verification, and approval before they are considered final.**

**This is now a permanent governance rule.**

**No exceptions unless explicitly approved by Founder Agent.**

---

## SCOPE

This rule applies to:
- **All tasks created by webwakaagent1 (Chief of Staff)**
- **All documents produced by webwakaagent1 (Chief of Staff)**
- **All decisions made by webwakaagent1 (Chief of Staff)**
- **All governance artifacts prepared by webwakaagent1 (Chief of Staff)**

This rule takes effect **immediately** and applies **retroactively** to all existing work.

---

## FORWARD-LOOKING REQUIREMENTS

### For Every New Task Created by Chief of Staff

**MANDATORY:**
1. ✅ Task MUST be assigned to its executing agent
2. ✅ Task MUST ALSO be assigned to webwaka007 for review
3. ✅ Task MUST include explicit review context (4-part requirement)
4. ✅ Task status MUST be set to `status:pending-review` after execution
5. ✅ Task is NOT considered complete until webwaka007 approves

**GitHub Implementation:**
- Add label: `agent:webwaka007` OR `reviewer:webwaka007`
- Include review context in issue description or comment
- Update status to `status:pending-review` after execution

---

### For Every New Document Produced by Chief of Staff

**MANDATORY:**
1. ✅ Document MUST have an explicit review step by webwaka007
2. ✅ Document MUST include "Reviewer Brief" section at top
3. ✅ Document MUST be marked "Pending Founder Agent Review" until approved
4. ✅ Document is NOT considered canonical/final without Founder Agent approval

**Document Implementation:**
- Add "Reviewer Brief" section at top of document
- Include review context (what was done, why, what to review for, expected outcome)
- Mark document status as "Pending Founder Agent Review"
- Create explicit review task assigned to webwaka007

---

### Review Context Requirement (Non-Optional)

**Every assignment to webwaka007 MUST explicitly include:**

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

---

## GOVERNANCE PRINCIPLE (FINAL)

**No task is complete.**  
**No document is final.**  
**No decision is authoritative.**  
**Until Founder Agent (webwaka007) has reviewed it — with clear review intent.**

This rule is now part of the WebWaka operating system.

---

## ENFORCEMENT

### Compliance Verification

**Chief of Staff MUST:**
- Self-verify compliance with this rule for all new work
- Include review assignments in all task creation
- Include review context in all assignments
- Never mark work as "final" or "canonical" without webwaka007 approval

**Founder Agent MUST:**
- Verify all Chief of Staff work includes review assignments
- Return ambiguous assignments unreviewed
- Flag compliance violations to Human Founder
- Conduct periodic compliance audits

---

### Violation Response

**If Chief of Staff creates work without webwaka007 review assignment:**
- Work is considered incomplete by definition
- Work MUST NOT be marked as final or canonical
- Compliance violation MUST be flagged to Founder Agent
- Corrective action required

**If review context is missing or unclear:**
- Task will be returned unreviewed
- Task remains unapproved by definition
- Chief of Staff must provide clear review context
- Re-submission required

---

## BENEFITS

This rule ensures:
- ✅ Global best-practice alignment
- ✅ Architectural, governance, and security rigor
- ✅ Zero silent drift or unreviewed decisions
- ✅ Founder-level oversight without micromanagement
- ✅ Clear accountability for all Chief of Staff work
- ✅ Consistent review standards across all work

---

## INTEGRATION WITH EXISTING GOVERNANCE

This rule is integrated into:
- ✅ `/docs/agents/context/webwaka007.md` (Founder Agent context page)
- ✅ `AGENT_IDENTITY_REGISTRY.md` (founder_agent section)
- ✅ `AGENT_EXECUTION_PROTOCOL.md` (Step 7: Founder Agent Review Gate)
- ✅ `/docs/agents/context/webwakaagent1.md` (Chief of Staff context page - to be updated)

---

## CHECKLIST FOR CHIEF OF STAFF

**Before creating any new task:**
- [ ] Is this task assigned to its executing agent?
- [ ] Is this task ALSO assigned to webwaka007 for review?
- [ ] Does the task include explicit review context (4-part requirement)?
- [ ] Is the task status set appropriately (ready for execution, pending-review after execution)?

**Before producing any new document:**
- [ ] Does the document have a "Reviewer Brief" section at top?
- [ ] Does the brief include explicit review context (4-part requirement)?
- [ ] Is the document marked "Pending Founder Agent Review"?
- [ ] Has an explicit review task been created and assigned to webwaka007?

**Before marking any work as "final" or "canonical":**
- [ ] Has webwaka007 reviewed the work?
- [ ] Has webwaka007 provided approval (not just conditional approval or recommendations)?
- [ ] Has the approval been documented in GitHub?
- [ ] Has the work been updated based on any webwaka007 feedback?

---

## EXEMPTIONS

**The ONLY exemptions to this rule are:**
1. Explicitly approved by webwaka007 (Founder Agent)
2. Explicitly approved by Human Founder

**No other exemptions are valid.**

**Chief of Staff may NOT self-exempt from this rule.**

---

**This rule is authoritative, non-optional, immediate, and retroactive.**

**Compliance is mandatory.**

**Prepared By:** webwakaagent1 (Chief of Staff)  
**Date:** 2026-02-05  
**Authority:** Founder Directive  
**Status:** Active & Binding
