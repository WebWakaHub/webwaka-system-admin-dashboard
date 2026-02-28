# IAAM CONSTITUTION v1.0.0

**Document ID:** IAAM-02
**Version:** 1.0.0
**Status:** RATIFIED
**Date:** 2026-02-24
**Authority:** IAAM-02 Protocol, Founder Mandate

---

## Section I — Constitutional Authority

This document provides the standalone constitutional formalization of the **Issue-Agent Assignment Model (IAAM)**. It establishes the supreme, binding authority for how all units of work (issues) are assigned to, owned by, and transferred between agents within the WebWaka ecosystem. Its purpose is to ensure that every task is executed by a qualified and authorized agent, preventing capability mismatches, unauthorized execution, and ownership ambiguity.

> **Declaration of Authority:** Adherence to this constitution is mandatory for all agents and for any process that assigns or reassigns work. All assignments must be explicit, logged, and compliant with the invariants defined herein.

---

## Section II — Assignment Invariant

The core of the IAAM is a set of non-negotiable invariants that govern the relationship between an issue and an agent.

*   **Singular Ownership Invariant:** Every issue must have exactly one primary responsible agent assigned at any given time. There is no dual or shared ownership of an issue's execution.
*   **Capability Match Invariant:** An issue can only be assigned to an agent whose ratified capabilities, as defined in the `CAPABILITY_REGISTRY_STANDARD`, explicitly match the requirements of the task.
*   **Layer-Domain Match Invariant:** An issue can only be assigned to an agent that possesses the explicit Domain Execution Right for the issue's specified biological layer (e.g., Organ, Cell) and business domain (e.g., Commerce, Logistics).

---

## Section III — Reassignment Protocol

Issues move between agents in a governed, auditable manner. Informal handoffs are constitutionally prohibited.

*   **Completion to Review Handoff:** Upon completion of an issue's implementation, it is automatically reassigned to the designated Quality Assurance agent (`webwakaagent5`) for review and closure validation, as per the `EIM-01` protocol.
*   **Handoff Requirements:** An agent can only hand off an issue to another agent by applying the `dep:handoff-pending` label and specifying the target agent. The system will then verify the target agent's eligibility before completing the reassignment.
*   **Cross-Domain Reassignment:** Reassignment of an issue across domain boundaries is a privileged operation. It requires the issue to be in a `dep:handoff-pending` state and must be approved by the Domain Stewards of both the source and target domains.
*   **Capability Escalation Model:** If an agent is unable to complete an assigned issue due to a capability gap, it must escalate the issue to its supervising System Agent. The System Agent is then responsible for reassigning the issue to a qualified agent or escalating further to the Architectural Review Board (ARB) if no qualified agent exists.

---

## Section IV — Capability Enforcement

Every assignment action is subject to automated verification against the platform's capability and role definitions.

*   **Role Alignment:** The assignment system must verify that the issue's required role (e.g., 'Backend Engineering') aligns with the assigned agent's canonical role as defined in the `CANONICAL_AGENT_SPECIFICATION`.
*   **Capability Registry Compliance:** The system must query the `CAPABILITY_REGISTRY_STANDARD` to ensure the agent possesses the specific, granular capabilities needed for the issue (e.g., `write_database_migration`, `mutate_commerce_api`).
*   **Domain Specialization Match:** The system must confirm that the agent's profile includes the specific domain specialization required by the issue (e.g., `specialization:transportation_suite`).

---

## Section V — Drift Prevention

The IAAM is designed to prevent the gradual decay of execution discipline.

*   **No Random Agent Naming:** All agent assignments must reference a canonical agent name registered in the `WEBWAKA_CANONICAL_AI_AGENT_ROLES_AUTHORITATIVE_SPECIFICATION.md`. Arbitrary or unregistered agent names are prohibited.
*   **No Unregistered Assignment:** An issue cannot be assigned to an agent that does not have a complete and ratified entry in the canonical agent registry.
*   **No Cross-Layer Contamination:** The system prevents the assignment of, for example, a `Runtime` layer issue to an agent that only has execution rights for the `Organ` layer.
*   **No Informal Task Execution:** Any work performed on the platform that is not tracked against a constitutionally assigned issue is considered a violation and is subject to an AGVE freeze.

---

## Section VI — Audit & Trace Model

All assignment activities are subject to a strict, immutable audit trail.

*   **Assignment Log:** Every assignment or reassignment action is recorded in a central, immutable log.
*   **Change Tracking:** The log entry must include the issue ID, the previous agent, the new agent, the timestamp, and the agent or system that initiated the change.
*   **Immutable Audit History:** This assignment log is considered a core constitutional artifact. It cannot be altered or deleted. The Meta-Governance agent (`webwaka007`) will periodically audit this log for anomalies.

---

## Section VII — Version Seal

This document, `IAAM_CONSTITUTION_v1.0.0`, is hereby ratified as the supreme constitutional authority on issue-to-agent assignment. It provides the formal, binding model for execution ownership, ensuring that every task is performed with accountability, authority, and precision.
