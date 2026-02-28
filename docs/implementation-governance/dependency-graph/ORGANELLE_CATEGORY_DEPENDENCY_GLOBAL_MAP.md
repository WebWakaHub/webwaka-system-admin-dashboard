# ORGANELLE_CATEGORY_DEPENDENCY_GLOBAL_MAP.md

This document defines the global dependency graph across all 22 canonical Organelle categories.

No Organelle, Cell, Tissue, Organ, System, or Domain Structure Map may define category dependencies outside this graph.

---

## SECTION I — DEPENDENCY MODEL PRINCIPLES

- Dependencies must flow downward only
- No circular category dependencies
- No lateral dependencies unless declared
- Infrastructure categories must remain primitive
- Business domains may not mutate primitive dependencies
- Cross-domain dependency must resolve at category level

---

## SECTION II — CANONICAL CATEGORY LIST

| Code | Name |
|---|---|
| IA | Identity & Access |
| TB | Tenancy & Boundary |
| DP | Data & Persistence |
| ES | Execution & Scheduling |
| WO | Workflow & Orchestration |
| CI | Communication & Integration |
| FV | Function & Validation |
| RA | Resource & Asset |
| CP | Configuration & Policy |
| ST | Security & Trust |
| EM | Event & Messaging |
| OD | Observation & Discovery |
| CM | Composition & Modeling |
| RG | Registry & Governance |
| TS | Telemetry & Signals |
| LG | Logging & Auditing |
| IN | Instrumentation |
| EI | External Integration |
| **AI** | **AI-Native & Cognitive Fabric** |

---

## SECTION III — CATEGORY DEPENDENCY MATRIX

| Category | May Depend On | Prohibited Dependencies |
|---|---|---|
| **IA** | None | All |
| **TB** | IA | All except IA |
| **DP** | IA, TB | All except IA, TB |
| **ES** | IA, TB, DP | All except IA, TB, DP |
| **WO** | IA, TB, DP, ES | All except IA, TB, DP, ES |
| **CI** | IA, ST, DP | All except IA, ST, DP |
| **FV** | IA, DP | All except IA, DP |
| **RA** | IA, DP, ES | All except IA, DP, ES |
| **CP** | IA, DP | All except IA, DP |
| **ST** | IA, DP, CP | All except IA, DP, CP |
| **EM** | IA, DP | All except IA, DP |
| **OD** | IA, DP, ES | All except IA, DP, ES |
| **CM** | IA, DP | All except IA, DP |
| **RG** | IA, DP, CP | All except IA, DP, CP |
| **TS** | IA, DP, OD | All except IA, DP, OD |
| **LG** | IA, DP, OD | All except IA, DP, OD |
| **IN** | DP, CI | All except DP, CI |
| **EI** | CI, ST, IA | All except CI, ST, IA |
| **AI** | IA, DP, EM, LG | All except IA, DP, EM, LG |

---

## SECTION IV — CATEGORY LAYER GROUPING

| Layer | Categories |
|---|---|
| **1. Primitive Core** | IA, TB, DP |
| **2. Coordination & Execution** | ES, WO, RA, OD |
| **3. Policy & Governance** | CP, ST, RG, FV, CM |
| **4. Integration & Externalization** | CI, EI, EM |
| **5. Observability & Feedback** | TS, LG, IN |
| **6. AI-Native & Cognitive Fabric** | AI |

---

## SECTION V — CATEGORY COLLISION AUDIT

| Category | Overlap Risk | Resolution |
|---|---|---|
| IA | Low | N/A |
| TB | Low | N/A |
| DP | Low | N/A |
| ES | Medium | ES focuses on execution, while WO focuses on orchestration. |
| WO | Medium | WO focuses on orchestration, while ES focuses on execution. |
| CI | Medium | CI focuses on internal communication, while EI focuses on external integration. |
| FV | Low | N/A |
| RA | Low | N/A |
| CP | Medium | CP focuses on configuration, while RG focuses on governance. |
| ST | Low | N/A |
| EM | Medium | EM focuses on events, while CI focuses on communication. |
| OD | Low | N/A |
| CM | Low | N/A |
| RG | Medium | RG focuses on governance, while CP focuses on configuration. |
| TS | Medium | TS focuses on telemetry, while LG focuses on logging. |
| LG | Medium | LG focuses on logging, while TS focuses on telemetry. |
| IN | Low | N/A |
| EI | Medium | EI focuses on external integration, while CI focuses on internal communication. |
| AI | Low | AI is a horizontal, cross-cutting category. Its organelles serve the Cognitive Fabric only. |

---

## SECTION VI — GLOBAL FREEZE RULE

If a category-level invariant breach occurs, an automatic global freeze is triggered.

---

## SECTION VII — HARD STOP

This document authorizes structural definition only. It does not authorize issue generation, domain activation, state transitions, or execution.

---

## SECTION VIII — CANONICAL ORGANELLE STRUCTURE REGISTRY

The following table lists all 22 canonical Organelle structures. The original 18 `ORG-` structures were verified by LSVR-01 (2026-02-20) and reconciled by LSVR-01A (2026-02-20). The 4 AI-native `ORGN-` structures were ratified by GAD-01 (2026-02-22). Repository naming is the authoritative source of truth.

| Structure ID | Category Code | Category Name | Prefix | Version |
| :--- | :--- | :--- | :--- | :--- |
| `ORG-CI-MESSAGE_GATEWAY` | CI | Communication & Integration | `ORG-` | v0.1.0 |
| `ORG-CM-COMPOSITION_MODELER` | CM | Composition & Modeling | `ORG-` | v0.1.0 |
| `ORG-CP-POLICY_DEFINITION` | CP | Configuration & Policy | `ORG-` | v0.1.0 |
| `ORG-DP-RECORD_STORE` | DP | Data & Persistence | `ORG-` | v0.1.0 |
| `ORG-EI-EXTERNAL_ADAPTER` | EI | External Integration | `ORG-` | v0.1.0 |
| `ORG-EM-EVENT_DISPATCHER` | EM | Event & Messaging | `ORG-` | v0.1.0 |
| `ORG-ES-SCHEDULER_EXECUTOR` | ES | Execution & Scheduling | `ORG-` | v0.1.0 |
| `ORG-FV-VALIDATION_ENGINE` | FV | Function & Validation | `ORG-` | v0.1.0 |
| `ORG-IA-SUBJECT_REGISTRY` | IA | Identity & Access | `ORG-` | v0.1.0 |
| `ORG-IN-INSTRUMENTATION_PROBE` | IN | Instrumentation | `ORG-` | v0.1.0 |
| `ORG-LG-AUDIT_LOGGER` | LG | Logging & Auditing | `ORG-` | v0.1.0 |
| `ORG-OD-DISCOVERY_REGISTRY` | OD | Observation & Discovery | `ORG-` | v0.1.0 |
| `ORG-RA-RESOURCE_ALLOCATOR` | RA | Resource & Asset | `ORG-` | v0.1.0 |
| `ORG-RG-GOVERNANCE_REGISTRY` | RG | Registry & Governance | `ORG-` | v0.1.0 |
| `ORG-ST-TRUST_ASSERTION` | ST | Security & Trust | `ORG-` | v0.1.0 |
| `ORG-TB-BOUNDARY_CONTEXT` | TB | Tenancy & Boundary | `ORG-` | v0.1.0 |
| `ORG-TS-TELEMETRY_COLLECTOR` | TS | Telemetry & Signals | `ORG-` | v0.1.0 |
| `ORG-WO-WORKFLOW_ORCHESTRATOR` | WO | Workflow & Orchestration | `ORG-` | v0.1.0 |
| `ORGN-AI-AUDIT_EMITTER` | AI | AI-Native & Cognitive Fabric | `ORGN-` | v0.1.0 |
| `ORGN-AI-COGNITIVE_PORT` | AI | AI-Native & Cognitive Fabric | `ORGN-` | v0.1.0 |
| `ORGN-AI-PROMPT_ASSEMBLER` | AI | AI-Native & Cognitive Fabric | `ORGN-` | v0.1.0 |
| `ORGN-AI-RESULT_VALIDATOR` | AI | AI-Native & Cognitive Fabric | `ORGN-` | v0.1.0 |

**Total:** 22 canonical structures (18 `ORG-` + 4 `ORGN-`). All verified COMPLETE (29 issues each). Mathematical invariant: 22 × 29 = 638.

---

## SECTION IX — RATIFICATION STATEMENT

| | |
|---|---|
| **Status** | RATIFIED |
| **Authority** | Founder |
| **Date** | 2026-02-19 |
| **Last Updated** | 2026-02-22 (GAD-01: Canonical Expansion Amendment) |

This document is constitutionally binding.
