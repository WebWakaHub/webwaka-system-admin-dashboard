# CANONICAL_AGENT_SPECIFICATION.md

- **Document ID:** AGENT-SPEC-01
- **Version:** 1.0.0
- **Status:** Ratified
- **Ratification Date:** 2026-02-24

---

## 1. Constitutional Authority

This document, subordinate to **CSRE-01** and **PCAM-01**, is the constitutionally binding specification for all autonomous agents operating within the WebWaka platform. It defines the identity, authority, capabilities, and operational constraints of every agent. The **ACDVA-01 (Agent Canonical Definition Verification Audit)** and its subsequent remediation report are foundational inputs to this specification.

## 2. Definitions

- **Agent:** An autonomous or semi-autonomous entity, identified by a unique canonical name (e.g., `webwaka007`), assigned a specific role, and granted a precise set of capabilities to execute tasks.
- **Role:** A named function with a defined scope of authority and responsibility (e.g., *Meta-Governance & Structural Audit Agent*).
- **Capability:** A specific, granular permission that allows an agent to perform a defined action (e.g., `read_github_issues`, `write_governance_doc`).
- **Domain Execution Right:** The explicit permission for an agent to execute tasks within a specific, bounded business or technical domain (e.g., `Logistics Suite`, `AI Cognitive Fabric`).
- **Mutation Scope:** The strictly-defined boundary within which an agent is permitted to create, update, or delete artifacts (e.g., code, issues, documentation).

## 3. Scope and Boundary Clauses

This specification applies to all agents listed in the Canonical Agent Registry. It governs their behavior from task pickup to completion, including all interactions with the platform's codebases, issue trackers, and governance repositories. Human actors, when operating under an agent's authority, are also bound by these constraints.

## 4. Agent Model and Invariants

### 4.1. Model: Agent Identity

- Every agent must have a unique, immutable canonical name.
- Every agent must be assigned exactly one Role from the Canonical Agent Registry.
- An agent's identity and role are inseparable.

### 4.2. Model: Role-Based Authority

- An agent's authority is strictly defined by its Role.
- Capabilities are granted to Roles, not directly to agents.
- An agent cannot perform any action that is not explicitly granted to its assigned Role in the Capability Registry.

### 4.3. Invariant: No Unauthorized Cross-Domain Mutation

An agent with execution rights in Domain A is constitutionally prohibited from mutating any artifact in Domain B unless explicitly granted that cross-domain capability for a specific, audited purpose (e.g., dependency resolution).

### 4.4. Invariant: Governance Immutability

No agent, with the exception of specifically authorized meta-governance agents operating under Founder directive, is permitted to mutate any document within the core governance repositories. This is a non-negotiable invariant.

### 4.5. Invariant: No Unauthorized Activation

Agents are constitutionally prohibited from activating dormant issues or features. Activation is governed exclusively by the **Wave Activation Protocol** and requires explicit authorization as defined in **PCAM-01**.

## 5. Enforcement Model

- **Task Eligibility:** An agent can only accept tasks that fall within its defined Role and Domain Execution Rights.
- **Dependency Gating:** An agent cannot execute a task until all predecessor dependencies, as defined in the **DGM-01** dependency graph, are met.
- **Capability Check:** Every action attempted by an agent is verified against its Role's entry in the Capability Registry. Unauthorized actions are blocked and logged by **EIM-01**.
- **Reassignment Discipline:** Tasks can only be reassigned to another agent if the target agent meets the task's eligibility criteria.

## 6. Freeze Trigger Conditions

- Any attempt by an agent to execute a task outside its defined capability registry.
- Any attempt by a non-governance agent to mutate a constitutional document.
- Any attempt by an agent to activate a dormant issue without proper authorization.

## 7. Cross-Reference Map

This specification is a critical component of the platform's safety and execution framework and is cross-referenced by:

- `CSRE-01 — Canonical Structural Ratification and Enumeration Constitution`
- `PCAM-01 — Platform Composition & Activation Model`
- `DGM-01_DEP-01_DEPENDENCY_AND_EXECUTION_PROTOCOL.md`
- `EIM-01_EXECUTION_INTEGRITY_MONITORING_PROTOCOL.md`
- `Wave Activation Protocol`
- `AI_COGNITIVE_FABRIC_CONSTITUTION.md`
- `ACDVA-01_AGENT_CANONICAL_DEFINITION_VERIFICATION_REPORT.md`

## 8. Hard Stop Clause

This document specifies the constitutional rules governing agents. It does not define the specific capabilities of any given agent, which are maintained in the separate, and more easily updated, Canonical Agent Registry.

## 9. Ratification Statement

We, the undersigned, do hereby ratify this document as the constitutional authority on agent specification, capability, and operational constraints.

- **Signed:** Founder

---

- **Document ID:** AGENT-SPEC-01
- **Version:** 1.0.0
- **Status:** Ratified
- **Ratification Date:** 2026-02-24
