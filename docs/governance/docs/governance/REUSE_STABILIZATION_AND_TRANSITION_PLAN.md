# Reuse Stabilization and Transition Plan

**Document Type:** Founder-Mandated Governance Program
**Date:** 2026-02-14
**Author:** webwaka007 (Founder Agent)
**Status:** PENDING RATIFICATION

---

## 1. Day-1 Triage Protocol (What Happens Tomorrow Morning)

To prevent paralysis while enforcing discipline, all in-flight and new tasks will be triaged according to the following protocol, effective tomorrow morning:

| Task Status | Triage Rule | Action Required |
|---|---|---|
| **Not Started** | All new tasks | MUST complete a `REUSE_DECLARATION.md` before activation. | 
| **In-Flight** | Task involves creating a new capability in a high-risk domain (payments, identity, messaging, etc.) | PAUSE execution. Submit a retroactive `REUSE_DECLARATION.md` to the ARB. | 
| **In-Flight** | Task involves extending an existing capability. | CONTINUE execution. Complete a `REUSE_DECLARATION.md` for the record. | 
| **In-Flight** | Task is purely documentation, bug fixing, or maintenance. | CONTINUE execution. No declaration required. | 
| **Blocked/Paused** | Any task currently blocked. | RE-EVALUATE against the Reuse Doctrine. May be cancelled if it promotes duplication. | 

**Default Action:** When in doubt, pause and declare.

---

## 2. Legacy Work Protocol

Existing code and completed tasks will be handled as follows:

-   **Grandfathered:** All code merged before the activation of this program is considered legacy. It will not be retroactively blocked or reverted.
-   **Scheduled for Migration:** All identified duplicate capabilities are now officially scheduled for migration under the Migration Wave Framework. They are considered "technical debt" and will be prioritized for consolidation.
-   **Allowed to Finish:** In-flight tasks that are not in high-risk domains are allowed to finish to maintain momentum. However, they will be reviewed upon completion to identify any new duplication.

---

## 3. Preserving Agent Productivity

This is not a bureaucracy; it is a guardrail. Agent productivity will be preserved by:

-   **Clarity:** The rules are clear, mechanical, and predictable.
-   **Speed:** The ARB is bound by a 48-hour SLA. The default is to unblock.
-   **Safety:** The system protects agents from building the wrong thing and facing rework.
-   **Focus:** By reusing existing capabilities, agents can focus on building new, innovative features, not re-implementing the basics.

---

## 4. The Imperfect, Essential Registry (v0)

The registry will begin tomorrow, even if it is not perfect. 

-   **Location:** `/docs/governance/REUSE_REGISTRY_V0.md`
-   **Format:** A simple Markdown table.
-   **Initial Content:** The Chief of Staff will populate the registry with all known capabilities, even if the details are incomplete. The initial focus is on visibility, not perfection.
-   **Evolution:** The registry will be improved and automated over time, but we will not wait for perfection to start.

---

## 5. ARB Triage and Load Management

The ARB will not become a bottleneck. It will use a lane-based system to manage load:

-   **Auto-Lane (No Review Required):** Direct reuse of an existing, well-defined capability.
-   **Fast-Lane (48-Hour SLA):** Extension of an existing capability with clear boundaries.
-   **Full-Review Lane (72-Hour SLA):** Proposal for a new capability in a non-high-risk domain.
-   **High-Risk Lane (Immediate Review):** Proposal for a new capability in a high-risk domain (payments, identity, etc.).

---

## 6. Duplication Discovery Protocol

When a potential duplication is discovered:

1.  **Who Decides:** The Chief of Staff makes the initial determination.
2.  **Action:** The Chief of Staff issues a `REUSE_VIOLATION_NOTICE` and pauses the offending task.
3.  **Escalation:** If the agent disagrees with the determination, they can appeal to the ARB.
4.  **Final Authority:** The ARB has the final authority on all duplication disputes.

---

## 7. Preserving Psychological Safety

This is a system improvement, not a punishment. Psychological safety will be preserved by:

-   **No Blame:** The focus is on fixing the system, not blaming individuals.
-   **Clarity and Predictability:** The rules are clear and apply to everyone equally.
-   **Support:** The ARB and Chief of Staff are there to help agents navigate the system, not to punish them.
-   **Positive Reinforcement:** Agents who demonstrate strong reuse practices will be publicly recognized.

---

## 8. Enforcement Escalation Curve

Enforcement will escalate over time:

-   **Phase 1 (Light - First 30 Days):** Manual enforcement by the Chief of Staff. Focus on education and guidance.
-   **Phase 2 (Structured - 30-90 Days):** Formal enforcement through the ARB and mandatory declaration gates. Violations are tracked.
-   **Phase 3 (Automated - 90+ Days):** Automated enforcement through CI/CD pipeline checks. Duplication is mechanically blocked.

---

## 9. Master Control Board Integration

The Master Control Board will be updated to include a new "Reuse Governance" section that tracks:

-   **Reuse Ratio:** Percentage of tasks reusing/extending capabilities.
-   **ARB Queue:** Number of tasks awaiting ARB review.
-   **Active Violations:** Number of open reuse violations.
-   **Migration Progress:** Status of the migration waves.

---

## 10. 30/60/90 Day Maturity Roadmap

-   **30 Days:**
    -   All new tasks are using the Reuse Declaration.
    -   The v0 Registry is live and being used.
    -   The ARB is operational and meeting its SLA.
    -   The first migration wave (Cosmetic Alignment) is complete.
-   **60 Days:**
    -   The Task Activation Decision Tree is a hard gate for all new tasks.
    -   The second migration wave (Contract Alignment) is underway.
    -   Reuse metrics are being reported weekly.
-   **90 Days:**
    -   The first automated CI/CD checks are in place.
    -   The third migration wave (Functional Consolidation) has begun.
    -   The reuse ratio is consistently above 80%.
