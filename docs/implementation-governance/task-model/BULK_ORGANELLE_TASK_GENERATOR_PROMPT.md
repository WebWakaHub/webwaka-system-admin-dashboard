# BULK ORGANELLE TASK GENERATOR PROMPT

**Metadata:**
- **Layer:** Implementation Governance
- **Type:** Task Automation
- **Stage:** 1
- **Number:** IMP-ST1-03
- **State:** proposed
- **Date:** 2026-02-18
- **Last Updated:** 2026-02-18

---

## I. Purpose

This document serves as the **official bulk issue tree generator** for all Organelle implementations within the WebWaka Biological Architecture framework.

### Declaration

**No Organelle may be implemented without using this generator.**

All Organelle implementations must follow the standardized 7-phase issue tree structure defined in this document. Any Organelle implementation that does not use this generator is considered unauthorized and subject to immediate freeze.

### Authority

This generator is maintained under the authority of **webwakaagent3 (Architecture Authority)** and is subject to oversight by **webwaka007 (Founder)**.

### Usage

This document is designed to be used as a **structured prompt** by webwaka007 (Founder) or authorized agents to generate a complete 7-phase issue tree for any Organelle in one execution.

The generator will create:
- 1 Master Organelle Issue (Level 1)
- 7 Phase Issues (Level 2, Phase 0–6)
- Minimum 21 Atomic Task Issues (Level 3, at least 3 per phase)

---

## II. Organelle Input Schema

To generate a complete issue tree for an Organelle, the following inputs are required:

### Required Inputs

| Input Field | Description | Format | Example |
|-------------|-------------|--------|---------|
| **Organelle Code** | Unique identifier for the Organelle | `ORG-[CATEGORYCODE]-[ORGNAME]-v[VERSION]` | `ORG-IA-SUBJECT_REGISTRY-v0.1.0` |
| **Organelle Name** | Human-readable name of the Organelle | String | `Subject Registry Organelle` |
| **Category Code** | Two-letter category code (1 of 18) | `IA`, `TB`, `DP`, `ES`, `WO`, `CI`, `FV`, `RA`, `CP`, `ST`, `EM`, `OD`, `CM`, `RG`, `TS`, `LG`, `IN`, `EI` | `IA` |
| **Category Name** | Full category name | String | `Identity & Access` |
| **Version** | Semantic version | `vX.Y.Z` | `v0.1.0` |
| **Initial Phase** | Starting phase number (default 0) | Integer (0-6) | `0` |
| **Dependency Declaration** | Cross-category or intra-category dependencies | "None" or list of dependencies | `None` |
| **Parallelization Eligibility** | Can this Organelle be parallelized with others? | `Yes` or `No` | `Yes` |

### Input Example

```yaml
organelle_code: ORG-IA-SUBJECT_REGISTRY-v0.1.0
organelle_name: Subject Registry Organelle
category_code: IA
category_name: Identity & Access
version: v0.1.0
initial_phase: 0
dependency_declaration: None
parallelization_eligibility: Yes
```

---

## III. Generated Structure Model

The generator will create a 3-level issue hierarchy for the Organelle:

### Level 1: Master Organelle Issue

**Issue Title:**
```
[ORG-[CATEGORYCODE]-[ORGNAME]-v[VERSION]] [Organelle Name] — Master Implementation Issue
```

**Example:**
```
[ORG-IA-SUBJECT_REGISTRY-v0.1.0] Subject Registry Organelle — Master Implementation Issue
```

**Issue Number:**
- GitHub will auto-assign issue number (e.g., #1)

**Labels:**
- `layer:organelle`
- `type:master`
- `state:proposed`

### Level 2: Phase Issues (7 Issues)

**Phase 0: Specification**
```
[ORG-[CATEGORYCODE]-[ORGNAME]-P0] Phase 0: Specification
```

**Phase 1: Design**
```
[ORG-[CATEGORYCODE]-[ORGNAME]-P1] Phase 1: Design
```

**Phase 2: Internal Validation**
```
[ORG-[CATEGORYCODE]-[ORGNAME]-P2] Phase 2: Internal Validation
```

**Phase 3: Implementation**
```
[ORG-[CATEGORYCODE]-[ORGNAME]-P3] Phase 3: Implementation
```

**Phase 4: Verification**
```
[ORG-[CATEGORYCODE]-[ORGNAME]-P4] Phase 4: Verification
```

**Phase 5: Documentation**
```
[ORG-[CATEGORYCODE]-[ORGNAME]-P5] Phase 5: Documentation
```

**Phase 6: Ratification**
```
[ORG-[CATEGORYCODE]-[ORGNAME]-P6] Phase 6: Ratification
```

**Labels (per phase):**
- `layer:organelle`
- `type:[specification|design|validation|implementation|verification|documentation|ratification]`
- `phase:[0|1|2|3|4|5|6]`
- `state:proposed`

### Level 3: Atomic Task Issues (Minimum 21 Issues)

**Naming Convention:**
```
[ORG-[CATEGORYCODE]-[ORGNAME]-P[PHASE]-T[XX]] [Task Description]
```

**Example:**
```
[ORG-IA-SUBJECT_REGISTRY-P0-T01] Define Subject Record Data Model
```

**Minimum Tasks per Phase:**
- Phase 0: 3 tasks
- Phase 1: 3 tasks
- Phase 2: 3 tasks
- Phase 3: 3 tasks
- Phase 4: 3 tasks
- Phase 5: 3 tasks
- Phase 6: 3 tasks

**Labels (per task):**
- `layer:organelle`
- `type:[specification|design|validation|implementation|verification|documentation|ratification]`
- `phase:[0|1|2|3|4|5|6]`
- `state:proposed`

---

## IV. Master Issue Template Block

The Master Organelle Issue must use the following template:

```markdown
# [Organelle Name] — Master Implementation Issue

**Organelle Code:** [ORG-CATEGORYCODE-ORGNAME-vVERSION]  
**Category:** [Category Name]  
**Version:** [vX.Y.Z]  
**Initial Phase:** [0]  
**Dependency Declaration:** [None | List of dependencies]  
**Parallelization Eligibility:** [Yes | No]  
**Responsible Agent (Initial):** @webwakaagent3  
**Date Created:** [YYYY-MM-DD]

---

## Organelle Overview

**Purpose:**
[Brief description of the Organelle's purpose and responsibilities]

**Canonical Category:**
[Category Name]

**Specification Reference:**
- [Link to ORGANELLE_SPECIFICATION.md in webwaka-organelle-universe]

**Design Reference:**
- [Link to ORGANELLE_DESIGN.md in webwaka-organelle-universe]

**Validation Reference:**
- [Link to ORGANELLE_VALIDATION.md in webwaka-organelle-universe]

---

## Phase Breakdown

| Phase | Phase Name | Responsible Agent | Entry Criteria | Deliverables | Exit Criteria | State |
|-------|------------|-------------------|----------------|--------------|---------------|-------|
| 0 | Specification | @webwakaagent3 | None | Specification document | Specification approved | proposed |
| 1 | Design | @webwakaagent3 | P0 approved | Design document | Design approved | proposed |
| 2 | Internal Validation | @webwakaagent5 | P1 approved | Validation document | Validation approved | proposed |
| 3 | Implementation | @webwakaagent4 | P2 approved | Implementation repository | Implementation complete | proposed |
| 4 | Verification | @webwakaagent5 | P3 approved | Verification report | Verification approved | proposed |
| 5 | Documentation | @webwakaagent4 | P4 approved | Documentation complete | Documentation approved | proposed |
| 6 | Ratification | @webwaka007 | P5 approved | Ratification approval | Organelle ratified | proposed |

---

## Invariant Declaration

This Organelle implementation must preserve the following invariants:

### Organelle-Level Invariants
- [List Organelle-specific invariants from specification]

### Category-Level Invariants
- [List category-level invariants from ORGANELLE_CATEGORY_UNIVERSE.md]

### Layer-Level Invariants
- [List layer-level invariants from ORGANELLE_LAYER_CONSTITUTION.md]

---

## Dependency Declaration

**Cross-Category Dependencies:**
[None | List of cross-category dependencies]

**Intra-Category Dependencies:**
[None | List of intra-category dependencies]

**Dependency Status:**
[All dependencies satisfied | Waiting on: [list]]

---

## Parallelization Eligibility

**Eligible for Parallel Execution:** [Yes | No]

**Rationale:**
[Explanation of why this Organelle can or cannot be parallelized]

**Parallel Execution Rules:**
- Same category, different Organelles: [Allowed | Not Allowed]
- Different categories, same phase: [Allowed | Not Allowed]
- Same Organelle, different phases: [Not Allowed]

---

## Ratification Requirement

This Organelle requires **Founder ratification** upon completion of Phase 6.

**Ratification Authority:** @webwaka007

**Ratification Criteria:**
- All phases (0–6) completed
- All invariants preserved
- All constitutional gates passed
- All documentation complete
- No structural drift detected

---

## Phase Issues

- [ ] Phase 0: Specification — [Link to P0 issue]
- [ ] Phase 1: Design — [Link to P1 issue]
- [ ] Phase 2: Internal Validation — [Link to P2 issue]
- [ ] Phase 3: Implementation — [Link to P3 issue]
- [ ] Phase 4: Verification — [Link to P4 issue]
- [ ] Phase 5: Documentation — [Link to P5 issue]
- [ ] Phase 6: Ratification — [Link to P6 issue]

---

## Progress Tracking

**Phase Completion Score:** 0% (0 of 7 phases complete)

**Current Phase:** Phase 0 (Specification)

**Current State:** proposed

**Last Updated:** [YYYY-MM-DD]

---

## Labels

- `layer:organelle`
- `type:master`
- `state:proposed`

---

## Related Documents

- [ORGANELLE_IMPLEMENTATION_STANDARD.md](../doctrine/ORGANELLE_IMPLEMENTATION_STANDARD.md)
- [GITHUB_TASK_INDUSTRIALIZATION_MODEL.md](../task-model/GITHUB_TASK_INDUSTRIALIZATION_MODEL.md)
- [MASTER_IMPLEMENTATION_TRACKER.md](../task-model/MASTER_IMPLEMENTATION_TRACKER.md)
```

---

## V. Phase Issue Auto-Generation Block

For each of the 7 phases, generate a Phase Issue using the following template:

### Phase 0: Specification

```markdown
# [ORG-[CATEGORYCODE]-[ORGNAME]-P0] Phase 0: Specification

**Parent Issue:** [Link to Master Organelle Issue]  
**Phase:** 0 — Specification  
**Responsible Agent:** @webwakaagent3  
**State:** proposed  
**Date Created:** [YYYY-MM-DD]

---

## Phase Overview

**Purpose:**
Define the Organelle's canonical specification, including definition, responsibilities, exclusions, inputs, outputs, invariants, failure modes, security considerations, observability hooks, dependency map, and versioning strategy.

**Deliverables:**
- ORGANELLE_SPECIFICATION.md in webwaka-organelle-universe repository

**Estimated Duration:** [X days]

---

## Entry Criteria

- [ ] Organelle Master Issue created
- [ ] Category confirmed (Identity & Access)
- [ ] No cross-category dependencies introduced
- [ ] Organelle name follows naming convention
- [ ] Organelle code assigned (ORG-[CATEGORYCODE]-[ORGNAME]-v[VERSION])

---

## Deliverables

- [ ] ORGANELLE_SPECIFICATION.md created in `webwaka-organelle-universe/specifications/[CATEGORY]/`
- [ ] Specification includes all 12 mandatory elements (per ORGANELLE_IMPLEMENTATION_STANDARD.md)
- [ ] Specification reviewed by webwakaagent3
- [ ] Specification pushed to GitHub

---

## Constitutional Checks

- [ ] No business logic introduced
- [ ] No UI logic introduced
- [ ] No deployment logic introduced
- [ ] No cross-category dependencies introduced
- [ ] No category boundary violations
- [ ] All invariants explicitly declared

---

## Exit Criteria

- [ ] All deliverables complete
- [ ] All constitutional checks passed
- [ ] Specification approved by webwakaagent3 or webwaka007
- [ ] State changed to `approved`
- [ ] Handoff comment posted
- [ ] Next phase agent tagged (@webwakaagent3 for P1)

---

## Atomic Tasks

- [ ] [ORG-[CATEGORYCODE]-[ORGNAME]-P0-T01] Define Organelle canonical definition
- [ ] [ORG-[CATEGORYCODE]-[ORGNAME]-P0-T02] Define Organelle responsibilities
- [ ] [ORG-[CATEGORYCODE]-[ORGNAME]-P0-T03] Define explicit exclusions

---

## Handoff Protocol

Upon completion of this phase, the responsible agent must:

1. Change state label from `proposed` to `approved`
2. Add the following structured completion comment:

```markdown
## Phase 0 Completion

**Completion Date:** [YYYY-MM-DD]  
**Responsible Agent:** @webwakaagent3  
**Deliverables:** [Link to ORGANELLE_SPECIFICATION.md]  
**Invariant Compliance:** ✅ All invariants preserved  
**Constitutional Checks:** ✅ All checks passed  
**Next Phase:** Phase 1 (Design)  
**Next Responsible Agent:** @webwakaagent3  
**Phase Completion Score:** 14.29% (1 of 7 phases complete)
```

3. Tag next responsible agent: @webwakaagent3
4. Close this issue
5. Open Phase 1 issue

---

## Labels

- `layer:organelle`
- `type:specification`
- `phase:0`
- `state:proposed`
```

### Phase 1: Design

```markdown
# [ORG-[CATEGORYCODE]-[ORGNAME]-P1] Phase 1: Design

**Parent Issue:** [Link to Master Organelle Issue]  
**Phase:** 1 — Design  
**Responsible Agent:** @webwakaagent3  
**State:** proposed  
**Date Created:** [YYYY-MM-DD]

---

## Phase Overview

**Purpose:**
Define the Organelle's structural design, including data model, state machine, API surface, internal consistency rules, failure handling model, observability hooks, dependency interface, versioning strategy, and technology constraints.

**Deliverables:**
- ORGANELLE_DESIGN.md in webwaka-organelle-universe repository

**Estimated Duration:** [X days]

---

## Entry Criteria

- [ ] Phase 0 (Specification) approved
- [ ] ORGANELLE_SPECIFICATION.md exists and is approved
- [ ] No blockers from Phase 0

---

## Deliverables

- [ ] ORGANELLE_DESIGN.md created in `webwaka-organelle-universe/specifications/[CATEGORY]/`
- [ ] Design includes all 10 mandatory elements (per ORGANELLE_IMPLEMENTATION_STANDARD.md)
- [ ] Design reviewed by webwakaagent3
- [ ] Design pushed to GitHub

---

## Constitutional Checks

- [ ] No implementation code included
- [ ] No framework mentioned
- [ ] No database engine specified
- [ ] No cryptography specified
- [ ] No authentication logic
- [ ] No authorization logic
- [ ] No tenancy logic
- [ ] No policy logic
- [ ] No workflow engine
- [ ] No UI semantics

---

## Exit Criteria

- [ ] All deliverables complete
- [ ] All constitutional checks passed
- [ ] Design approved by webwakaagent3 or webwaka007
- [ ] State changed to `approved`
- [ ] Handoff comment posted
- [ ] Next phase agent tagged (@webwakaagent5 for P2)

---

## Atomic Tasks

- [ ] [ORG-[CATEGORYCODE]-[ORGNAME]-P1-T01] Define data model structure
- [ ] [ORG-[CATEGORYCODE]-[ORGNAME]-P1-T02] Define state machine diagram
- [ ] [ORG-[CATEGORYCODE]-[ORGNAME]-P1-T03] Define API surface

---

## Handoff Protocol

Upon completion of this phase, the responsible agent must:

1. Change state label from `proposed` to `approved`
2. Add the following structured completion comment:

```markdown
## Phase 1 Completion

**Completion Date:** [YYYY-MM-DD]  
**Responsible Agent:** @webwakaagent3  
**Deliverables:** [Link to ORGANELLE_DESIGN.md]  
**Invariant Compliance:** ✅ All invariants preserved  
**Constitutional Checks:** ✅ All checks passed  
**Next Phase:** Phase 2 (Internal Validation)  
**Next Responsible Agent:** @webwakaagent5  
**Phase Completion Score:** 28.57% (2 of 7 phases complete)
```

3. Tag next responsible agent: @webwakaagent5
4. Close this issue
5. Open Phase 2 issue

---

## Labels

- `layer:organelle`
- `type:design`
- `phase:1`
- `state:proposed`
```

### Phase 2: Internal Validation

```markdown
# [ORG-[CATEGORYCODE]-[ORGNAME]-P2] Phase 2: Internal Validation

**Parent Issue:** [Link to Master Organelle Issue]  
**Phase:** 2 — Internal Validation  
**Responsible Agent:** @webwakaagent5  
**State:** proposed  
**Date Created:** [YYYY-MM-DD]

---

## Phase Overview

**Purpose:**
Validate the Organelle's design through invariant stress testing, boundary violation simulations, and concurrency conflict scenarios.

**Deliverables:**
- ORGANELLE_VALIDATION.md in webwaka-organelle-universe repository

**Estimated Duration:** [X days]

---

## Entry Criteria

- [ ] Phase 1 (Design) approved
- [ ] ORGANELLE_DESIGN.md exists and is approved
- [ ] No blockers from Phase 1

---

## Deliverables

- [ ] ORGANELLE_VALIDATION.md created in `webwaka-organelle-universe/specifications/[CATEGORY]/`
- [ ] Validation includes 10 invariant violation simulations
- [ ] Validation includes 3 concurrency conflict simulations
- [ ] Validation includes 3 invalid state transition simulations
- [ ] Validation includes 3 boundary violation simulations
- [ ] Validation reviewed by webwakaagent5
- [ ] Validation pushed to GitHub

---

## Constitutional Checks

- [ ] No implementation code included
- [ ] No database specifics
- [ ] No infrastructure logic
- [ ] No authentication logic
- [ ] No authorization logic
- [ ] No tenancy logic
- [ ] No policy engine

---

## Exit Criteria

- [ ] All deliverables complete
- [ ] All constitutional checks passed
- [ ] Validation approved by webwakaagent5 or webwaka007
- [ ] State changed to `approved`
- [ ] Handoff comment posted
- [ ] Next phase agent tagged (@webwakaagent4 for P3)

---

## Atomic Tasks

- [ ] [ORG-[CATEGORYCODE]-[ORGNAME]-P2-T01] Simulate 10 invariant violations
- [ ] [ORG-[CATEGORYCODE]-[ORGNAME]-P2-T02] Simulate 3 concurrency conflicts
- [ ] [ORG-[CATEGORYCODE]-[ORGNAME]-P2-T03] Simulate 3 boundary violations

---

## Handoff Protocol

Upon completion of this phase, the responsible agent must:

1. Change state label from `proposed` to `approved`
2. Add the following structured completion comment:

```markdown
## Phase 2 Completion

**Completion Date:** [YYYY-MM-DD]  
**Responsible Agent:** @webwakaagent5  
**Deliverables:** [Link to ORGANELLE_VALIDATION.md]  
**Invariant Compliance:** ✅ All invariants preserved  
**Constitutional Checks:** ✅ All checks passed  
**Next Phase:** Phase 3 (Implementation)  
**Next Responsible Agent:** @webwakaagent4  
**Phase Completion Score:** 42.86% (3 of 7 phases complete)
```

3. Tag next responsible agent: @webwakaagent4
4. Close this issue
5. Open Phase 3 issue

---

## Labels

- `layer:organelle`
- `type:validation`
- `phase:2`
- `state:proposed`
```

### Phase 3: Implementation

```markdown
# [ORG-[CATEGORYCODE]-[ORGNAME]-P3] Phase 3: Implementation

**Parent Issue:** [Link to Master Organelle Issue]  
**Phase:** 3 — Implementation  
**Responsible Agent:** @webwakaagent4  
**State:** proposed  
**Date Created:** [YYYY-MM-DD]

---

## Phase Overview

**Purpose:**
Implement the Organelle as executable code following the approved specification, design, and validation documents.

**Deliverables:**
- Implementation repository: `webwaka-organelle-[orgname]`
- Core implementation files (entity model, state machine, storage interface, event interface, observability interface, main orchestrator)

**Estimated Duration:** [X days]

---

## Entry Criteria

- [ ] Phase 2 (Internal Validation) approved
- [ ] ORGANELLE_VALIDATION.md exists and is approved
- [ ] No blockers from Phase 2
- [ ] Language decision made (TypeScript, Python, Go, Rust, etc.)

---

## Deliverables

- [ ] Public repository created: `webwaka-organelle-[orgname]`
- [ ] Directory structure initialized (src/, tests/, docs/)
- [ ] Core implementation files created
- [ ] All invariants enforced in code
- [ ] No prohibited dependencies introduced
- [ ] Implementation pushed to GitHub

---

## Constitutional Checks

- [ ] No framework lock-in
- [ ] No database engine specified
- [ ] No HTTP server, REST, GraphQL
- [ ] No UI
- [ ] No authentication/authorization
- [ ] No tenancy/policy engine
- [ ] No deployment scripts, Docker, CI/CD
- [ ] No external dependencies unless absolutely primitive

---

## Exit Criteria

- [ ] All deliverables complete
- [ ] All constitutional checks passed
- [ ] Implementation compiles/runs without errors
- [ ] State changed to `awaiting-verification`
- [ ] Handoff comment posted
- [ ] Next phase agent tagged (@webwakaagent5 for P4)

---

## Atomic Tasks

- [ ] [ORG-[CATEGORYCODE]-[ORGNAME]-P3-T01] Create repository and directory structure
- [ ] [ORG-[CATEGORYCODE]-[ORGNAME]-P3-T02] Implement entity model with invariant enforcement
- [ ] [ORG-[CATEGORYCODE]-[ORGNAME]-P3-T03] Implement state machine enforcement

---

## Handoff Protocol

Upon completion of this phase, the responsible agent must:

1. Change state label from `proposed` to `awaiting-verification`
2. Add the following structured completion comment:

```markdown
## Phase 3 Completion

**Completion Date:** [YYYY-MM-DD]  
**Responsible Agent:** @webwakaagent4  
**Deliverables:** [Link to webwaka-organelle-[orgname] repository]  
**Invariant Compliance:** ✅ All invariants preserved  
**Constitutional Checks:** ✅ All checks passed  
**Next Phase:** Phase 4 (Verification)  
**Next Responsible Agent:** @webwakaagent5  
**Phase Completion Score:** 57.14% (4 of 7 phases complete)
```

3. Tag next responsible agent: @webwakaagent5
4. Close this issue
5. Open Phase 4 issue

---

## Labels

- `layer:organelle`
- `type:implementation`
- `phase:3`
- `state:proposed`
```

### Phase 4: Verification

```markdown
# [ORG-[CATEGORYCODE]-[ORGNAME]-P4] Phase 4: Verification

**Parent Issue:** [Link to Master Organelle Issue]  
**Phase:** 4 — Verification  
**Responsible Agent:** @webwakaagent5  
**State:** proposed  
**Date Created:** [YYYY-MM-DD]

---

## Phase Overview

**Purpose:**
Verify that the implementation correctly enforces all invariants, respects all boundaries, and matches the approved specification and design.

**Deliverables:**
- ORGANELLE_VERIFICATION_REPORT.md in implementation repository
- Test suite (unit tests, integration tests, invariant tests)

**Estimated Duration:** [X days]

---

## Entry Criteria

- [ ] Phase 3 (Implementation) complete
- [ ] Implementation repository exists
- [ ] Implementation compiles/runs without errors
- [ ] No blockers from Phase 3

---

## Deliverables

- [ ] ORGANELLE_VERIFICATION_REPORT.md created in implementation repository
- [ ] Test suite created (unit tests, integration tests, invariant tests)
- [ ] All invariants verified
- [ ] All boundaries verified
- [ ] All constitutional checks verified
- [ ] Verification report pushed to GitHub

---

## Constitutional Checks

- [ ] No framework lock-in introduced
- [ ] No database engine introduced
- [ ] No infrastructure logic introduced
- [ ] No cross-category contamination introduced
- [ ] All invariants enforced in code
- [ ] All boundaries respected

---

## Exit Criteria

- [ ] All deliverables complete
- [ ] All constitutional checks passed
- [ ] Verification approved by webwakaagent5 or webwaka007
- [ ] State changed to `verified`
- [ ] Handoff comment posted
- [ ] Next phase agent tagged (@webwakaagent4 for P5)

---

## Atomic Tasks

- [ ] [ORG-[CATEGORYCODE]-[ORGNAME]-P4-T01] Create test suite for invariant enforcement
- [ ] [ORG-[CATEGORYCODE]-[ORGNAME]-P4-T02] Create test suite for boundary compliance
- [ ] [ORG-[CATEGORYCODE]-[ORGNAME]-P4-T03] Create verification report

---

## Handoff Protocol

Upon completion of this phase, the responsible agent must:

1. Change state label from `awaiting-verification` to `verified`
2. Add the following structured completion comment:

```markdown
## Phase 4 Completion

**Completion Date:** [YYYY-MM-DD]  
**Responsible Agent:** @webwakaagent5  
**Deliverables:** [Link to ORGANELLE_VERIFICATION_REPORT.md]  
**Invariant Compliance:** ✅ All invariants preserved  
**Constitutional Checks:** ✅ All checks passed  
**Next Phase:** Phase 5 (Documentation)  
**Next Responsible Agent:** @webwakaagent4  
**Phase Completion Score:** 71.43% (5 of 7 phases complete)
```

3. Tag next responsible agent: @webwakaagent4
4. Close this issue
5. Open Phase 5 issue

---

## Labels

- `layer:organelle`
- `type:verification`
- `phase:4`
- `state:proposed`
```

### Phase 5: Documentation

```markdown
# [ORG-[CATEGORYCODE]-[ORGNAME]-P5] Phase 5: Documentation

**Parent Issue:** [Link to Master Organelle Issue]  
**Phase:** 5 — Documentation  
**Responsible Agent:** @webwakaagent4  
**State:** proposed  
**Date Created:** [YYYY-MM-DD]

---

## Phase Overview

**Purpose:**
Create complete documentation for the Organelle, including README, API documentation, usage examples, and integration guide.

**Deliverables:**
- README.md in implementation repository
- API documentation
- Usage examples
- Integration guide

**Estimated Duration:** [X days]

---

## Entry Criteria

- [ ] Phase 4 (Verification) approved
- [ ] ORGANELLE_VERIFICATION_REPORT.md exists and is approved
- [ ] No blockers from Phase 4

---

## Deliverables

- [ ] README.md created in implementation repository
- [ ] API documentation created
- [ ] Usage examples created
- [ ] Integration guide created
- [ ] All documentation reviewed by webwakaagent4
- [ ] All documentation pushed to GitHub

---

## Constitutional Checks

- [ ] Documentation does not introduce new features
- [ ] Documentation does not violate boundaries
- [ ] Documentation accurately reflects implementation
- [ ] Documentation includes constitutional constraints

---

## Exit Criteria

- [ ] All deliverables complete
- [ ] All constitutional checks passed
- [ ] Documentation approved by webwakaagent4 or webwaka007
- [ ] State changed to `verified`
- [ ] Handoff comment posted
- [ ] Next phase agent tagged (@webwaka007 for P6)

---

## Atomic Tasks

- [ ] [ORG-[CATEGORYCODE]-[ORGNAME]-P5-T01] Create README.md with overview and usage
- [ ] [ORG-[CATEGORYCODE]-[ORGNAME]-P5-T02] Create API documentation
- [ ] [ORG-[CATEGORYCODE]-[ORGNAME]-P5-T03] Create usage examples and integration guide

---

## Handoff Protocol

Upon completion of this phase, the responsible agent must:

1. Change state label from `proposed` to `verified`
2. Add the following structured completion comment:

```markdown
## Phase 5 Completion

**Completion Date:** [YYYY-MM-DD]  
**Responsible Agent:** @webwakaagent4  
**Deliverables:** [Link to README.md, API docs, usage examples, integration guide]  
**Invariant Compliance:** ✅ All invariants preserved  
**Constitutional Checks:** ✅ All checks passed  
**Next Phase:** Phase 6 (Ratification)  
**Next Responsible Agent:** @webwaka007  
**Phase Completion Score:** 85.71% (6 of 7 phases complete)
```

3. Tag next responsible agent: @webwaka007
4. Close this issue
5. Open Phase 6 issue

---

## Labels

- `layer:organelle`
- `type:documentation`
- `phase:5`
- `state:proposed`
```

### Phase 6: Ratification

```markdown
# [ORG-[CATEGORYCODE]-[ORGNAME]-P6] Phase 6: Ratification

**Parent Issue:** [Link to Master Organelle Issue]  
**Phase:** 6 — Ratification  
**Responsible Agent:** @webwaka007  
**State:** proposed  
**Date Created:** [YYYY-MM-DD]

---

## Phase Overview

**Purpose:**
Founder review and ratification of the completed Organelle implementation.

**Deliverables:**
- Founder ratification approval
- Version tag (vX.Y.Z)
- Ratification record

**Estimated Duration:** [X days]

---

## Entry Criteria

- [ ] Phase 5 (Documentation) approved
- [ ] All documentation complete
- [ ] No blockers from Phase 5
- [ ] All phases (0–5) complete

---

## Deliverables

- [ ] Founder review complete
- [ ] Ratification approval granted
- [ ] Version tag created (vX.Y.Z)
- [ ] Ratification record created

---

## Constitutional Checks

- [ ] All phases (0–5) completed
- [ ] All invariants preserved
- [ ] All constitutional gates passed
- [ ] All documentation complete
- [ ] No structural drift detected

---

## Exit Criteria

- [ ] Founder ratification granted
- [ ] Version tag created
- [ ] State changed to `ratified`
- [ ] Master Organelle Issue closed
- [ ] MASTER_IMPLEMENTATION_TRACKER.md updated

---

## Atomic Tasks

- [ ] [ORG-[CATEGORYCODE]-[ORGNAME]-P6-T01] Founder review of all phases
- [ ] [ORG-[CATEGORYCODE]-[ORGNAME]-P6-T02] Create version tag
- [ ] [ORG-[CATEGORYCODE]-[ORGNAME]-P6-T03] Create ratification record

---

## Handoff Protocol

Upon completion of this phase, the responsible agent must:

1. Change state label from `proposed` to `ratified`
2. Add the following structured completion comment:

```markdown
## Phase 6 Completion

**Completion Date:** [YYYY-MM-DD]  
**Responsible Agent:** @webwaka007  
**Deliverables:** Ratification approval, version tag [vX.Y.Z]  
**Invariant Compliance:** ✅ All invariants preserved  
**Constitutional Checks:** ✅ All checks passed  
**Phase Completion Score:** 100% (7 of 7 phases complete)  
**Organelle Status:** RATIFIED
```

3. Close Phase 6 issue
4. Close Master Organelle Issue
5. Update MASTER_IMPLEMENTATION_TRACKER.md

---

## Labels

- `layer:organelle`
- `type:ratification`
- `phase:6`
- `state:proposed`
```

---

## VI. Atomic Task Seed Block

For each phase, generate at least 3 atomic tasks using the following template:

### Atomic Task Template

```markdown
# [ORG-[CATEGORYCODE]-[ORGNAME]-P[PHASE]-T[XX]] [Task Description]

**Parent Phase:** [Link to Phase Issue]  
**Task Number:** T[XX]  
**Estimated Effort:** [X hours] (≤ 8 hours)  
**Responsible Agent:** @[agent]  
**State:** proposed  
**Date Created:** [YYYY-MM-DD]

---

## Task Description

[Brief description of what this task accomplishes]

---

## Constraints

- [ ] [Constraint 1]
- [ ] [Constraint 2]
- [ ] [Constraint 3]

---

## Required Artifacts

- [ ] [Artifact 1]
- [ ] [Artifact 2]
- [ ] [Artifact 3]

---

## Verification Checklist

- [ ] [Verification item 1]
- [ ] [Verification item 2]
- [ ] [Verification item 3]

---

## Invariant Confirmation

This task preserves the following invariants:
- [Invariant 1]
- [Invariant 2]
- [Invariant 3]

---

## Labels

- `layer:organelle`
- `type:[specification|design|validation|implementation|verification|documentation|ratification]`
- `phase:[0|1|2|3|4|5|6]`
- `state:proposed`
```

### Minimum Atomic Tasks per Phase

**Phase 0 (Specification):**
- T01: Define Organelle canonical definition
- T02: Define Organelle responsibilities
- T03: Define explicit exclusions

**Phase 1 (Design):**
- T01: Define data model structure
- T02: Define state machine diagram
- T03: Define API surface

**Phase 2 (Internal Validation):**
- T01: Simulate 10 invariant violations
- T02: Simulate 3 concurrency conflicts
- T03: Simulate 3 boundary violations

**Phase 3 (Implementation):**
- T01: Create repository and directory structure
- T02: Implement entity model with invariant enforcement
- T03: Implement state machine enforcement

**Phase 4 (Verification):**
- T01: Create test suite for invariant enforcement
- T02: Create test suite for boundary compliance
- T03: Create verification report

**Phase 5 (Documentation):**
- T01: Create README.md with overview and usage
- T02: Create API documentation
- T03: Create usage examples and integration guide

**Phase 6 (Ratification):**
- T01: Founder review of all phases
- T02: Create version tag
- T03: Create ratification record

---

## VII. Label Attachment Instructions

For each created issue (Master, Phase, or Atomic Task), attach the following labels:

### Master Organelle Issue Labels

- `layer:organelle`
- `type:master`
- `state:proposed`

### Phase Issue Labels

| Phase | Type Label | Phase Label | State Label |
|-------|------------|-------------|-------------|
| Phase 0 | `type:specification` | `phase:0` | `state:proposed` |
| Phase 1 | `type:design` | `phase:1` | `state:proposed` |
| Phase 2 | `type:validation` | `phase:2` | `state:proposed` |
| Phase 3 | `type:implementation` | `phase:3` | `state:proposed` |
| Phase 4 | `type:verification` | `phase:4` | `state:proposed` |
| Phase 5 | `type:documentation` | `phase:5` | `state:proposed` |
| Phase 6 | `type:ratification` | `phase:6` | `state:proposed` |

### Atomic Task Issue Labels

Same as parent Phase Issue labels:
- `layer:organelle`
- `type:[specification|design|validation|implementation|verification|documentation|ratification]`
- `phase:[0|1|2|3|4|5|6]`
- `state:proposed`

### Label Application Rules

- All issues must have exactly 3 labels: `layer`, `type`, and `state`
- Phase issues and atomic tasks must have exactly 4 labels: `layer`, `type`, `phase`, and `state`
- Labels must be applied at issue creation time
- Labels must be updated as state changes

---

## VIII. Tracker Update Instruction

After generating all issues for the Organelle, update the **MASTER_IMPLEMENTATION_TRACKER.md** file in the `webwaka-implementation-governance` repository:

### Update Instructions

1. **Open MASTER_IMPLEMENTATION_TRACKER.md**
   - Repository: `webwaka-implementation-governance`
   - File: `task-model/MASTER_IMPLEMENTATION_TRACKER.md`

2. **Add New Row to Master Tracking Table**

   Add the following row to the table in Section V (Initial Organelle Entries):

   ```markdown
   | [ORG-CATEGORYCODE-ORGNAME-vVERSION] | [Organelle Name] | [Category Name] | [vX.Y.Z] | 0 | proposed | webwakaagent3 | None | Yes | No | [YYYY-MM-DD] | [Link to Master Issue] | [Link to P0 Issue] |
   ```

   **Example:**
   ```markdown
   | ORG-IA-SUBJECT_REGISTRY-v0.1.0 | Subject Registry Organelle | Identity & Access | v0.1.0 | 0 | proposed | webwakaagent3 | None | Yes | No | 2026-02-18 | [#1](link) | [#2](link) |
   ```

3. **Update Global Progress Model**

   Update Section III (Global Progress Model) with:
   - **Total Organelles Tracked:** Increment by 1
   - **In Progress:** Increment by 1
   - **Global Organelle Completion:** Recalculate

4. **Commit and Push**

   Commit message:
   ```
   Update MASTER_IMPLEMENTATION_TRACKER.md — Add [Organelle Name]
   ```

---

## IX. Handoff Instruction Block

After generating all issues and updating the tracker, perform the following handoff:

### Handoff Steps

1. **Tag webwakaagent3**
   - Add comment to Master Organelle Issue: `@webwakaagent3 Phase 0 is ready to begin.`

2. **Require Phase 0 Approval**
   - Phase 0 must be approved by webwakaagent3 or webwaka007 before Phase 1 begins
   - No automatic phase transition

3. **No Parallel Phase Execution**
   - Only one phase may be active at a time for the same Organelle
   - Phases must be completed sequentially (0 → 1 → 2 → 3 → 4 → 5 → 6)

4. **Phase Gate Enforcement**
   - Each phase has explicit entry criteria that must be met
   - Each phase has explicit exit criteria that must be met
   - Phase transitions require explicit handoff comments

5. **Constitutional Compliance**
   - All agents must consult constitutional documents before beginning work
   - All agents must declare invariant compliance
   - All agents must respect boundary constraints

---

## X. Hard Stop Rule

After generating all issues, updating the tracker, and performing the handoff, the generator must **HARD STOP**.

### Hard Stop Conditions

**No Implementation:**
- Do not begin Phase 0 work
- Do not create specification documents
- Do not create design documents
- Do not create implementation code

**No Phase Transition:**
- Do not automatically transition from Phase 0 to Phase 1
- Do not skip phases
- Do not merge phases

**No Auto-Approval:**
- Do not automatically approve Phase 0
- Do not automatically approve any phase
- All approvals require explicit agent action

### What Happens After Hard Stop

1. **webwakaagent3 reviews Master Organelle Issue**
2. **webwakaagent3 begins Phase 0 work** (if approved)
3. **webwakaagent3 creates ORGANELLE_SPECIFICATION.md**
4. **webwakaagent3 submits Phase 0 for approval**
5. **webwaka007 or webwakaagent3 approves Phase 0**
6. **webwakaagent3 transitions to Phase 1**
7. **Process repeats for Phases 1–6**

---

## Ratification

**Status:** Proposed  
**Authority:** webwakaagent3 (Architecture Authority)  
**Date:** 2026-02-18

This document serves as the official bulk issue tree generator for all Organelle implementations within the WebWaka Biological Architecture framework. All Organelle implementations must use this generator to ensure standardization, traceability, and constitutional compliance.

---

**END OF DOCUMENT**
