# AGENT EXECUTION CONTEXT MASTER CONSTITUTION v1.0.0

**Document ID:** CINV-05-MASTER
**Version:** 1.0.0
**Status:** RATIFIED
**Date:** 2026-02-24
**Authority:** CINV-05 Protocol, Founder Mandate

---

## Section I — Constitutional Authority

This document is the **supreme, unified, and authoritative execution context** for all agents operating within the WebWaka ecosystem. It is constitutionally mandated that every agent read, understand, and align with this constitution before executing any issue. This document derives its authority from the foundational governance layer of the platform and serves to consolidate and clarify the most critical operational mandates.

This Master Constitution references and is supported by the following core constitutional documents:

*   **CSRE-01:** Canonical Structure Ratification Constitution v2.0.0 [1]
*   **CSRE-02:** Canonical Issue Invariant Constitution [2]
*   **DGM-01:** Dependency and Execution Protocol [3]
*   **AGVE:** The principles of the Agent Governance and Verification Engine, as defined in the AI Cognitive Fabric Constitution [4]
*   **IAAM-01:** The principles of the Issue-Agent Assignment Matrix, as referenced in platform audits [5]

> **Declaration of Mandate:** Adherence to this constitution is non-negotiable. It supersedes all prior informal context, verbal instructions, or individual agent assumptions. Violation of this constitution will trigger an immediate AGVE Level 4 Freeze.

---

## Section II — Structural Invariants Summary

The structural integrity of the platform is maintained by a set of non-negotiable invariants. Agents must operate in full compliance with these rules.

*   **Dual-Invariant Model:** The platform's structure is governed by two primary invariants as defined in `CSRE-02`. The **Base Core Invariant** mandates that every canonical structure contains exactly 29 base issues. The **Overlay Invariant** permits an additive-only layer of AI-native issues on top of the base core, with strict caps defined per layer.
*   **Overlay Caps:** The application and size of an AI-Native Structural Overlay are strictly controlled by layer. For example, 'Organ' structures are permitted a maximum of 10 overlay issues, while 'Cell' and 'Tissue' structures are permitted none.
*   **Dependency Enforcement:** The `DGM-01` protocol enforces a strict dependency graph. An issue or structure cannot be activated or executed until all its upstream dependencies are complete and verified.
*   **Execution Gating:** The `EIM-01` protocol acts as the gatekeeper for all execution, continuously monitoring for compliance with all structural and constitutional invariants. Any detected violation results in an immediate halt.

---

## Section III — Domain Sovereignty Summary

The platform is composed of 12 discrete, sovereign domains, each with a clearly defined boundary and purpose. Cross-domain interaction is strictly governed to prevent contamination and maintain architectural integrity.

| Domain ID | Name | Core Purpose |
| :--- | :--- | :--- |
| **IDA** | Identity & Access | Manages users, roles, permissions, and authentication. |
| **SEC** | Security | Governs cryptography, key management, and threat detection. |
| **COM** | Commerce | Provides primitives for all transactional capabilities (e.g., POS, SVM). |
| **FIN** | Finance | Manages payments, billing, and economic ledger functions. |
| **LOG** | Logistics | Orchestrates supply chain, inventory, and fulfillment. |
| **TRN** | Transportation | Manages routes, fleets, and transportation-specific operations. |
| **RES** | Reservations | Handles booking, scheduling, and resource management. |
| **GEO** | Geolocation | Provides mapping, location, and geospatial services. |
| **ANA** | Analytics | Governs data insights, reporting, and business intelligence. |
| **CFG** | Configuration | Manages tenant, platform, and feature configuration. |
| **EXP** | Expansion | Manages platform composition and multi-platform expansion. |
| **Runtime** | Runtime | Provides the underlying execution environment and infrastructure services. |

**Boundary Prohibitions:** An agent operating within one domain is constitutionally prohibited from directly mutating the state or accessing the internal logic of another domain. All cross-domain interactions must occur via formally defined and ratified APIs or event contracts.

---

## Section IV — AI Cognitive Fabric Mandate

The AI Cognitive Fabric is a pervasive, cross-cutting augmentation layer. Its integration is governed by the following mandates from the `AI Cognitive Fabric Constitution`.

*   **Pervasive Integration:** AI is not a silo. It is a fabric woven through all layers of the platform, designed to enhance, not replace, domain logic.
*   **Multi-LLM Compatibility:** The platform is vendor-neutral. It must support multiple AI providers through a runtime abstraction layer, preventing lock-in.
*   **Aggregator Plug-in Support:** The fabric must support aggregator services to optimize for cost and performance across different models.
*   **BYOK Support:** Tenants must have the ability to 
Bring Their Own Key (BYOK) for AI services, ensuring data privacy and security.
*   **AI-Native Encoding Requirements:** The `DAEF-01` formula mandates a specific structural encoding for AI-native capabilities, ensuring they are integrated in a standardized and traceable manner.
*   **Overlay Issue Classification Discipline:** All AI-native issues must be clearly labeled as `type:ai-native` and `cognitive:fabric` to distinguish them from the base structural core.

---

## Section V — Platform Doctrines (MANDATORY)

These six doctrines are the philosophical and operational pillars of the WebWaka platform. They are constitutionally sealed and must be respected in all execution activities.

1.  **Build Once, Use Infinitely**
    *   **Constitutional Language:** The platform evolves through the composition of reusable primitives, not the duplication of effort. A capability, once built, is canonical and must be reused across all layers and platforms.
    *   **Implications:** Prohibits forking or creating parallel implementations of existing domains or primitives. New platforms are assembled from the existing inventory of canonical organs.

2.  **Mobile First**
    *   **Constitutional Language:** The smallest device is the baseline. All design and development must prioritize the mobile experience, assuming it as the primary execution environment.
    *   **Implications:** This is not 
responsive design; it is a fundamental architectural stance that ensures usability and performance on the most constrained devices.

3.  **PWA First**
    *   **Constitutional Language:** All end-user applications must be delivered as Progressive Web Applications (PWAs) by default.
    *   **Implications:** Applications must be installable, service-worker enabled for offline caching, and provide a meaningful experience on low-end devices.

4.  **Offline First (Non-Negotiable)**
    *   **Constitutional Language:** No feature may assume persistent connectivity. The platform must be designed with a local-first architecture, where data is stored and processed locally before being synchronized with the server.
    *   **Implications:** Requires a robust local database, a conflict resolution mechanism, and an asynchronous sync model. This is a structural property, not a cosmetic enhancement.

5.  **Nigeria First**
    *   **Constitutional Language:** The platform must be designed for the specific realities of the Nigerian market.
    *   **Implications:** This includes integrating with local payment gateways, complying with Nigerian regulations, supporting local languages, and being realistic about the state of local infrastructure.

6.  **Africa First**
    *   **Constitutional Language:** The platform must be built for regional scalability across the African continent.
    *   **Implications:** Requires tolerance for low-bandwidth environments, intermittent infrastructure, and diverse regulatory landscapes.

---

## Section VI — Dependency & Execution Orchestration

Execution is not a free-for-all. It is a governed, sequential process orchestrated by the following protocols:

*   **DGM-01 (Dependency Governance Model):** Defines the canonical dependency graph for all structures. It ensures that components are built and activated in the correct order.
*   **DEP-01 (Dependency and Execution Protocol):** Provides the rules for how agents interact with the dependency graph, ensuring that no agent can bypass a required dependency.
*   **EIM-01 (Execution Integrity Monitoring):** The active enforcement mechanism that monitors all platform activity for compliance with DGM-01 and DEP-01. It has the authority to halt any execution that violates the dependency chain.

> **Continuous Execution Mandate:** Agents may execute continuously **ONLY IF** all of the following conditions are met:
> 1.  All upstream dependencies for the target issue are complete and verified.
> 2.  The proposed execution does not violate any structural invariant (e.g., issue counts, layer caps).
> 3.  The proposed execution does not violate any of the six platform doctrines.

---

## Section VII — Mandatory Pre-Execution Checklist

Before executing **ANY** issue, every agent must perform and internally verify the following checklist. Execution without this verification is a constitutional violation.

1.  **Role Identity Alignment:** Does my canonical role have the authority to execute this type of issue?
2.  **Capability Alignment:** Is this task within my registered capabilities as defined in the `CAPABILITY_REGISTRY_STANDARD`?
3.  **Domain Boundary Awareness:** Does this task respect domain sovereignty, or does it risk an unauthorized cross-domain mutation?
4.  **Reuse Before Rebuild Check:** Have I thoroughly checked for an existing canonical primitive that fulfills this requirement before proposing a new build?
5.  **Offline-First Compatibility:** Is my proposed solution fully compliant with the non-negotiable Offline-First doctrine?
6.  **Mobile-First Impact:** Have I considered the implications of my work on the mobile-first baseline?
7.  **PWA Compliance:** Does my work support or enhance the PWA-first mandate?
8.  **Nigeria/Africa Implications:** Have I accounted for the specific infrastructure, regulatory, and market realities of Nigeria and Africa?
9.  **AI Integration Implications:** Does this task require integration with the AI Cognitive Fabric, and if so, does it comply with all fabric mandates?
10. **Dependency Completion Confirmation:** Have I verified in the dependency graph that all prerequisite issues are complete?

---

## Section VIII — Drift Prevention & Freeze Conditions

Constitutional integrity is paramount. The **Agent Governance and Verification Engine (AGVE)** is the automated enforcer of this constitution.

*   **Violation Trigger:** Any detected violation of the rules, invariants, doctrines, or checklists defined in this Master Constitution will automatically trigger an **AGVE Level 4 Freeze**.
*   **Immediate Halt:** A Level 4 Freeze constitutes an immediate, platform-wide halt to all non-essential execution. All agents must cease their current tasks and await a directive from the Meta-Governance agent (`webwaka007`).

---

## Section IX — Version Seal

This document, `AGENT_EXECUTION_CONTEXT_MASTER_CONSTITUTION_v1.0.0`, is the definitive and supreme source of execution context. It supersedes all informal context, prior assumptions, and outdated documentation.

Any future amendment to this constitution requires a formal, ratified protocol and Founder-level approval.

---

### References

[1] `protocols/CSRE-01_CANONICAL_STRUCTURE_RATIFICATION_CONSTITUTION_v2.0.0.md`
[2] `protocols/CSRE-02_CANONICAL_ISSUE_INVARIANT_CONSTITUTION.md`
[3] `protocols/DGM-01_DEP-01_DEPENDENCY_AND_EXECUTION_PROTOCOL.md`
[4] `docs/ai-governance/AI_COGNITIVE_FABRIC_CONSTITUTION.md`
[5] `audits/ACDVA-01_AGENT_CANONICAL_DEFINITION_VERIFICATION_REPORT.md`
