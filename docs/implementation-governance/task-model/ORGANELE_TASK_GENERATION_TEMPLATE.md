# ORGANELLE TASK GENERATION TEMPLATE

**Metadata:**
- **Layer:** Implementation Governance
- **Type:** Task Model
- **Stage:** 1
- **Number:** IMP-ST1-01
- **State:** proposed
- **Date:** 2026-02-18

---

## Purpose

This document defines the constitutional master template for generating Organelle implementation task trees within the WebWaka Biological Architecture framework. It establishes the standardized structure, numbering conventions, labels, templates, and protocols for managing Organelle implementation through GitHub Issues.

This template ensures:
- Deterministic and repeatable task decomposition
- Constitutional compliance at every phase
- Clear agent role assignment
- Explicit invariant tracking
- Structured handoff protocols
- Traceable audit trails

---

## I. Issue Hierarchy Model

The Organelle implementation task tree follows a strict three-level hierarchy. No fourth level is permitted.

### Level 1: Organelle Master Issue

The top-level issue representing the entire Organelle implementation lifecycle. This issue tracks progress across all phases (Phase 0 through Phase 6) and serves as the canonical reference for the Organelle's implementation status.

**Characteristics:**
- One master issue per Organelle
- Remains open until Phase 6 ratification is complete
- Contains links to all Phase Issues (Level 2)
- Tracks overall progress and blockers
- Assigned to the Architecture Authority (webwakaagent3) for initial creation

### Level 2: Phase Issues

Seven phase-specific issues corresponding to the seven mandatory implementation phases (Phase 0 through Phase 6). Each phase issue represents a distinct stage in the Organelle lifecycle.

**Phases:**
- **Phase 0:** Specification
- **Phase 1:** Design
- **Phase 2:** Internal Validation
- **Phase 3:** Implementation
- **Phase 4:** Verification
- **Phase 5:** Documentation
- **Phase 6:** Ratification

**Characteristics:**
- Seven phase issues per Organelle (one per phase)
- Each phase issue is a child of the Organelle Master Issue
- Contains links to all Atomic Work Units (Level 3) for that phase
- Assigned to the responsible agent for that phase
- Closed only when all atomic tasks are complete and phase gate requirements are met

### Level 3: Atomic Work Units

Individual, atomic tasks that can be completed within a single work session (maximum 8 hours). These are the smallest unit of work in the task tree.

**Characteristics:**
- Multiple atomic tasks per phase issue
- Each atomic task is a child of a Phase Issue
- Must be completable within 8 hours
- Must have explicit deliverables
- Must declare impacted invariants
- Assigned to the agent responsible for the parent phase

### Hierarchy Enforcement

**Prohibited:**
- No fourth level of nesting
- No tasks that span multiple phases
- No cross-category dependencies without explicit declaration
- No tasks without parent phase linkage

---

## II. Global Numbering Convention

All issues, tasks, and artifacts follow a standardized naming and numbering convention to ensure global uniqueness and traceability.

### Organelle Code Format

```
ORG-[CATEGORYCODE]-[ORGNAME]-v[VERSION]
```

**Components:**
- **ORG:** Fixed prefix indicating Organelle layer
- **CATEGORYCODE:** Two-letter code for the canonical category
- **ORGNAME:** Short name for the Organelle (kebab-case, max 20 characters)
- **VERSION:** Semantic version (e.g., v0.1.0, v1.0.0)

**Category Codes:**
- `IA` = Identity & Access
- `TB` = Tenancy & Boundary
- `DP` = Data & Persistence
- `ES` = Eventing & State
- `WO` = Workflow & Orchestration
- `CI` = Communication & Interaction
- `FV` = Financial & Value Movement
- `RA` = Resource & Asset Control
- `CP` = Configuration & Policy
- `ST` = Security & Trust
- `EM` = Extensibility & Modularity
- `OD` = Observability & Diagnostics
- `CM` = Content & Media
- `RG` = Relationship & Graph
- `TS` = Time & Scheduling
- `LG` = Location & Geography
- `IN` = Intelligence & Automation
- `EI` = Experience & Interface

**Example:**
```
ORG-IA-SUBJECT-REGISTRY-v0.1.0
```

### Phase Issue Format

```
ORG-[CATEGORYCODE]-[ORGNAME]-P[PHASENUMBER]
```

**Components:**
- **ORG-[CATEGORYCODE]-[ORGNAME]:** Same as Organelle Code
- **P[PHASENUMBER]:** Phase number (0-6)

**Example:**
```
ORG-IA-SUBJECT-REGISTRY-P0
ORG-IA-SUBJECT-REGISTRY-P1
ORG-IA-SUBJECT-REGISTRY-P2
```

### Atomic Task Format

```
ORG-[CATEGORYCODE]-[ORGNAME]-P[PHASENUMBER]-T[XX]
```

**Components:**
- **ORG-[CATEGORYCODE]-[ORGNAME]-P[PHASENUMBER]:** Same as Phase Issue Format
- **T[XX]:** Task number (zero-padded, e.g., T01, T02, T15)

**Example:**
```
ORG-IA-SUBJECT-REGISTRY-P0-T01
ORG-IA-SUBJECT-REGISTRY-P0-T02
ORG-IA-SUBJECT-REGISTRY-P3-T05
```

---

## III. Required GitHub Labels

All issues must be tagged with appropriate labels from the following taxonomy. Labels are used for filtering, tracking, and enforcing constitutional compliance.

### Layer Labels

- `layer:organelle` — Indicates the issue is related to the Organelle layer

### Type Labels

- `type:specification` — Specification-related work (Phase 0)
- `type:design` — Design-related work (Phase 1)
- `type:validation` — Validation-related work (Phase 2)
- `type:implementation` — Implementation-related work (Phase 3)
- `type:verification` — Verification-related work (Phase 4)
- `type:documentation` — Documentation-related work (Phase 5)
- `type:ratification` — Ratification-related work (Phase 6)

### Phase Labels

- `phase:0` — Specification phase
- `phase:1` — Design phase
- `phase:2` — Internal Validation phase
- `phase:3` — Implementation phase
- `phase:4` — Verification phase
- `phase:5` — Documentation phase
- `phase:6` — Ratification phase

### State Labels

- `state:proposed` — Issue has been created and is awaiting approval
- `state:approved` — Issue has been approved and is ready to begin
- `state:in-progress` — Work is actively underway
- `state:awaiting-verification` — Work is complete and awaiting verification
- `state:verified` — Work has been verified and approved
- `state:ratified` — Work has been ratified by Founder (Phase 6 only)
- `state:blocked` — Work is blocked by external dependency or issue
- `state:frozen` — Work has been frozen due to constitutional violation or drift

### Label Usage Rules

**Mandatory Labels:**
- Every issue must have exactly one `layer` label
- Every issue must have exactly one `type` label
- Every issue must have exactly one `phase` label
- Every issue must have exactly one `state` label

**State Transitions:**
- `proposed` → `approved` (requires approval by responsible agent or Founder)
- `approved` → `in-progress` (agent begins work)
- `in-progress` → `awaiting-verification` (agent completes work)
- `awaiting-verification` → `verified` (verification agent approves)
- `verified` → `ratified` (Founder ratifies, Phase 6 only)
- Any state → `blocked` (external blocker identified)
- Any state → `frozen` (constitutional violation detected)

---

## IV. Mandatory Organelle Master Issue Template

The Organelle Master Issue serves as the top-level tracking issue for the entire Organelle implementation lifecycle.

### Template Structure

```markdown
# [Organelle Name]

**Organelle Code:** ORG-[CATEGORYCODE]-[ORGNAME]-v[VERSION]

**Canonical Category:** [Category Name]

**Version:** [Semantic Version]

**State:** [proposed | approved | in-progress | awaiting-verification | verified | ratified]

---

## Specification Reference

- **Document:** [Link to ORGANELLE_SPECIFICATION.md in webwaka-organelle-universe]
- **Version:** [Version number]
- **Status:** [proposed | approved]

## Design Reference

- **Document:** [Link to ORGANELLE_DESIGN.md in webwaka-organelle-universe]
- **Version:** [Version number]
- **Status:** [proposed | approved]

## Validation Reference

- **Document:** [Link to ORGANELLE_VALIDATION.md in webwaka-organelle-universe]
- **Version:** [Version number]
- **Status:** [proposed | approved]

---

## Dependency Declaration

**Cross-Category Dependencies:**
- [List any dependencies on other categories, or state "None"]

**Intra-Category Dependencies:**
- [List any dependencies on other Organelles within the same category, or state "None"]

**External Dependencies:**
- [List any external dependencies (libraries, tools), or state "None"]

---

## Invariant Declaration

**Organelle-Specific Invariants:**
1. [Invariant 1]
2. [Invariant 2]
3. [Invariant N]

**Category Invariants:**
- [Reference to category-level invariants from ORGANELLE_CATEGORY_UNIVERSE.md]

**Layer Invariants:**
- [Reference to layer-level invariants from ORGANELLE_LAYER_CONSTITUTION.md]

---

## Phase Breakdown Table

| Phase | Phase Name | Responsible Agent | State | Phase Issue | Start Date | End Date |
|-------|------------|-------------------|-------|-------------|------------|----------|
| 0 | Specification | webwakaagent3 | [state] | [Link to P0 issue] | [Date] | [Date] |
| 1 | Design | webwakaagent3 | [state] | [Link to P1 issue] | [Date] | [Date] |
| 2 | Internal Validation | webwakaagent5 | [state] | [Link to P2 issue] | [Date] | [Date] |
| 3 | Implementation | webwakaagent4 | [state] | [Link to P3 issue] | [Date] | [Date] |
| 4 | Verification | webwakaagent5 | [state] | [Link to P4 issue] | [Date] | [Date] |
| 5 | Documentation | webwakaagent4 | [state] | [Link to P5 issue] | [Date] | [Date] |
| 6 | Ratification | webwaka007 | [state] | [Link to P6 issue] | [Date] | [Date] |

---

## Parallelization Eligibility

**Can this Organelle be parallelized with others?**
- [Yes | No]

**Reason:**
- [Explanation of why parallelization is or is not permitted]

**Blocked By:**
- [List any Organelles that must complete before this one can begin, or state "None"]

**Blocks:**
- [List any Organelles that depend on this one, or state "None"]

---

## Ratification Requirement

**Ratification Authority:** webwaka007 (Founder)

**Ratification Criteria:**
- All phases (0-6) completed
- All invariants preserved
- All constitutional gates passed
- All verification reports approved
- Documentation complete

**Ratification Status:** [Pending | Ratified]

---

## Progress Tracking

**Overall Progress:** [X/7 phases complete]

**Current Phase:** [Phase number and name]

**Blockers:** [List any blockers, or state "None"]

**Notes:** [Any additional notes or context]
```

---

## V. Mandatory Phase Issue Template

Each phase issue represents a distinct stage in the Organelle implementation lifecycle. Phase issues are children of the Organelle Master Issue.

### Template Structure

```markdown
# [Organelle Name] — Phase [N]: [Phase Name]

**Phase Code:** ORG-[CATEGORYCODE]-[ORGNAME]-P[N]

**Parent Issue:** [Link to Organelle Master Issue]

**Phase Number:** [0-6]

**Phase Name:** [Specification | Design | Internal Validation | Implementation | Verification | Documentation | Ratification]

**Responsible Agent:** [webwakaagent3 | webwakaagent4 | webwakaagent5 | webwaka007]

**State:** [proposed | approved | in-progress | awaiting-verification | verified | ratified]

---

## Entry Criteria

**Prerequisites:**
- [List prerequisites that must be met before this phase can begin]

**Required Approvals:**
- [List required approvals from previous phase]

**Required Artifacts:**
- [List artifacts that must exist before this phase can begin]

---

## Deliverables

**Primary Deliverables:**
1. [Deliverable 1]
2. [Deliverable 2]
3. [Deliverable N]

**Artifact Locations:**
- [List where artifacts will be stored (repository, file paths)]

---

## Constitutional Checks

**Invariants to Validate:**
- [List invariants that must be validated during this phase]

**Boundary Checks:**
- [ ] No cross-category contamination
- [ ] No business logic (if Organelle layer)
- [ ] No UI logic
- [ ] No deployment logic
- [ ] No framework lock-in (if Implementation phase)

**Prohibited Actions:**
- [List actions that are explicitly prohibited in this phase]

---

## Exit Criteria

**Completion Requirements:**
- [ ] All deliverables completed
- [ ] All invariants validated
- [ ] All constitutional checks passed
- [ ] All atomic tasks closed
- [ ] Handoff comment added

**Required Approvals:**
- [List required approvals to exit this phase]

**Next Phase:**
- [Link to next phase issue, or "None" if Phase 6]

---

## Atomic Tasks

| Task ID | Task Name | State | Assignee | Estimated Effort | Link |
|---------|-----------|-------|----------|------------------|------|
| T01 | [Task name] | [state] | [agent] | [hours] | [Link] |
| T02 | [Task name] | [state] | [agent] | [hours] | [Link] |
| TXX | [Task name] | [state] | [agent] | [hours] | [Link] |

---

## Required Handoff Comment Format

When this phase is complete, the responsible agent must add a structured handoff comment:

```
## Phase [N] Handoff

**Phase:** [Phase number and name]
**Responsible Agent:** [Agent name]
**Completion Date:** [YYYY-MM-DD]

**Deliverables:**
- [Link to deliverable 1]
- [Link to deliverable 2]
- [Link to deliverable N]

**Invariant Compliance:**
- [Confirmation that all invariants were preserved]

**Constitutional Checks:**
- [Confirmation that all constitutional checks passed]

**Blockers Encountered:**
- [List any blockers encountered, or "None"]

**Next Phase:**
- [Link to next phase issue]

**Next Responsible Agent:** @[next agent username]

**State Transition:** [old state] → [new state]
```

---

## Progress Tracking

**Atomic Tasks Completed:** [X/Y]

**Blockers:** [List any blockers, or "None"]

**Notes:** [Any additional notes or context]
```

---

## VI. Mandatory Atomic Task Template

Atomic tasks are the smallest unit of work in the task tree. Each atomic task must be completable within a single work session (maximum 8 hours).

### Template Structure

```markdown
# [Task Name]

**Task ID:** ORG-[CATEGORYCODE]-[ORGNAME]-P[PHASENUMBER]-T[XX]

**Parent Phase:** [Link to Phase Issue]

**Estimated Effort:** [X hours (≤ 8 hours)]

**Assigned To:** [Agent username]

**State:** [proposed | approved | in-progress | awaiting-verification | verified]

---

## Description

[Clear, concise description of the task. What needs to be done?]

---

## Constraints

**Constitutional Constraints:**
- [List any constitutional constraints that apply to this task]

**Technical Constraints:**
- [List any technical constraints]

**Dependency Constraints:**
- [List any dependencies on other tasks or artifacts]

---

## Required Artifacts

**Inputs:**
- [List required input artifacts]

**Outputs:**
- [List expected output artifacts]

**Artifact Locations:**
- [Specify where artifacts will be stored]

---

## Verification Checklist

- [ ] [Verification item 1]
- [ ] [Verification item 2]
- [ ] [Verification item N]
- [ ] All invariants preserved
- [ ] All constitutional constraints respected
- [ ] All deliverables completed

---

## Invariant Confirmation Statement

**Impacted Invariants:**
- [List invariants that may be impacted by this task]

**Confirmation:**
- [ ] I confirm that this task does not violate any Organelle-level invariants
- [ ] I confirm that this task does not violate any Category-level invariants
- [ ] I confirm that this task does not violate any Layer-level invariants
- [ ] I confirm that this task does not introduce cross-category dependencies

**Agent Signature:** [Agent name]
**Date:** [YYYY-MM-DD]

---

## Progress Tracking

**Status:** [Not started | In progress | Complete | Blocked]

**Blockers:** [List any blockers, or "None"]

**Notes:** [Any additional notes or context]
```

---

## VII. Constitutional Pre-Execution Declaration Block

Before beginning work on any phase or atomic task, the responsible agent must add a structured pre-execution declaration comment to the issue. This declaration ensures constitutional compliance and explicit awareness of impacted invariants.

### Declaration Template

```markdown
## Pre-Execution Declaration

**Agent:** [Agent name]
**Date:** [YYYY-MM-DD]
**Issue:** [Issue ID and title]

---

### Impacted Layer

**Layer:** [Organelle | Cell | Tissue | Organ | System | Organism]

**Confirmation:** I confirm that I am operating within the [Layer] layer and will not introduce logic from higher or lower layers.

---

### Impacted Invariants

**Organelle-Level Invariants:**
- [List Organelle-specific invariants that may be impacted]

**Category-Level Invariants:**
- [List Category-level invariants that may be impacted]

**Layer-Level Invariants:**
- [List Layer-level invariants that may be impacted]

**Confirmation:** I confirm that I have reviewed all impacted invariants and will preserve them throughout this work.

---

### Dependency Awareness

**Cross-Category Dependencies:**
- [List any cross-category dependencies, or "None"]

**Intra-Category Dependencies:**
- [List any intra-category dependencies, or "None"]

**External Dependencies:**
- [List any external dependencies, or "None"]

**Confirmation:** I confirm that I am aware of all dependencies and will not introduce undeclared dependencies.

---

### Boundary Confirmation

**Category Boundary:**
- [ ] I confirm that this work does not cross category boundaries without explicit declaration

**Layer Boundary:**
- [ ] I confirm that this work does not cross layer boundaries

**Business Logic Boundary:**
- [ ] I confirm that this work does not introduce business logic (if Organelle layer)

**UI Logic Boundary:**
- [ ] I confirm that this work does not introduce UI logic

---

### Phase Confirmation

**Current Phase:** [Phase number and name]

**Phase Requirements:**
- [ ] I confirm that all entry criteria for this phase have been met
- [ ] I confirm that all required artifacts from previous phases are available

---

### State Confirmation

**Current State:** [State label]

**State Transition:**
- [ ] I confirm that the current state allows me to begin this work
- [ ] I will update the state label to `in-progress` when I begin work

---

### Constitutional Documents Read

- [ ] ORGANELLE_LAYER_CONSTITUTION.md
- [ ] ORGANELLE_CATEGORY_UNIVERSE.md (relevant category section)
- [ ] ORGANELLE_IMPLEMENTATION_STANDARD.md
- [ ] AGENT_EXECUTION_PROTOCOL.md
- [ ] [Organelle-specific specification document]
- [ ] [Organelle-specific design document]

---

**Declaration Complete:** I have completed this pre-execution declaration and am ready to begin work.

**Agent Signature:** [Agent name]
**Date:** [YYYY-MM-DD]
```

---

## VIII. Handoff Protocol Block

At the completion of each phase, the responsible agent must add a structured handoff comment to the phase issue. This handoff comment serves as the formal transition point between phases and agents.

### Handoff Template

```markdown
## Phase [N] Handoff

**Phase:** [Phase number and name]
**Responsible Agent:** [Agent name]
**Completion Date:** [YYYY-MM-DD]
**Phase Duration:** [X days/hours]

---

### Deliverables

**Primary Deliverables:**
1. [Link to deliverable 1]
2. [Link to deliverable 2]
3. [Link to deliverable N]

**Artifact Locations:**
- [Repository and file paths for all artifacts]

**Commit Hashes:**
- [List relevant commit hashes for traceability]

---

### Invariant Compliance

**Organelle-Level Invariants:**
- [ ] All Organelle-level invariants preserved

**Category-Level Invariants:**
- [ ] All Category-level invariants preserved

**Layer-Level Invariants:**
- [ ] All Layer-level invariants preserved

**Confirmation:** I confirm that all invariants have been preserved throughout this phase.

---

### Constitutional Checks

**Boundary Checks:**
- [ ] No cross-category contamination
- [ ] No business logic (if Organelle layer)
- [ ] No UI logic
- [ ] No deployment logic
- [ ] No framework lock-in (if Implementation phase)

**Dependency Checks:**
- [ ] No undeclared dependencies introduced
- [ ] All dependencies explicitly documented

**Confirmation:** I confirm that all constitutional checks have passed.

---

### Blockers Encountered

**Blockers:**
- [List any blockers encountered during this phase, or "None"]

**Resolutions:**
- [Describe how blockers were resolved, or "N/A"]

---

### Next Phase

**Next Phase:** [Phase number and name]

**Next Phase Issue:** [Link to next phase issue]

**Next Responsible Agent:** @[next agent username]

**Entry Criteria for Next Phase:**
- [List entry criteria that have been met for the next phase]

---

### State Transition

**Old State:** [Previous state label]
**New State:** [New state label]

**Label Changes:**
- Remove: `state:[old-state]`
- Add: `state:[new-state]`

---

### Handoff Checklist

- [ ] All deliverables completed and linked
- [ ] All atomic tasks closed
- [ ] All invariants validated
- [ ] All constitutional checks passed
- [ ] All artifacts pushed to GitHub
- [ ] Next phase issue created (if applicable)
- [ ] Next agent tagged
- [ ] State label updated

---

**Handoff Complete:** I have completed this phase and handed off to the next responsible agent.

**Agent Signature:** [Agent name]
**Date:** [YYYY-MM-DD]
```

---

## IX. Phase Gate Requirements

Each phase has specific entry and exit criteria that must be met before transitioning to the next phase. These phase gates ensure constitutional compliance and prevent premature advancement.

### Phase 0 → Phase 1

**Exit Criteria for Phase 0:**
- Specification document created (ORGANELLE_SPECIFICATION.md)
- Specification document approved by webwaka007
- All 12 mandatory elements present
- No cross-category contamination detected

**Entry Criteria for Phase 1:**
- Phase 0 specification approved
- Organelle Master Issue created
- Phase 1 issue created

**Gate Keeper:** webwaka007 (Founder)

---

### Phase 1 → Phase 2

**Exit Criteria for Phase 1:**
- Design document created (ORGANELLE_DESIGN.md)
- All 10 required design elements present
- No implementation code included
- No framework dependencies declared

**Entry Criteria for Phase 2:**
- Phase 1 design document completed
- Design document reviewed by webwakaagent3

**Gate Keeper:** webwakaagent3 (Architecture Authority)

---

### Phase 2 → Phase 3

**Exit Criteria for Phase 2:**
- Validation document created (ORGANELLE_VALIDATION.md)
- All 10 invariant violation simulations completed
- All boundary violations tested
- All concurrency conflicts simulated

**Entry Criteria for Phase 3:**
- Phase 2 validation document completed
- Validation document approved by webwakaagent5

**Gate Keeper:** webwakaagent5 (Verification Authority)

---

### Phase 3 → Phase 4

**Exit Criteria for Phase 3:**
- Implementation repository created
- All core organelle files implemented
- No prohibited dependencies detected
- All invariants enforced in code

**Entry Criteria for Phase 4:**
- Phase 3 implementation complete
- Implementation pushed to GitHub
- No constitutional violations detected

**Gate Keeper:** webwakaagent4 (Implementation Authority)

---

### Phase 4 → Phase 5

**Exit Criteria for Phase 4:**
- Verification report created
- All invariant tests passed
- All boundary tests passed
- All concurrency tests passed
- No drift detected

**Entry Criteria for Phase 5:**
- Phase 4 verification report approved
- All tests passing

**Gate Keeper:** webwakaagent5 (Verification Authority)

---

### Phase 5 → Phase 6

**Exit Criteria for Phase 5:**
- Documentation complete (README, API docs, usage examples)
- All public APIs documented
- All interfaces documented
- Installation instructions provided

**Entry Criteria for Phase 6:**
- Phase 5 documentation complete
- Documentation reviewed by webwakaagent4

**Gate Keeper:** webwakaagent4 (Implementation Authority)

---

### Phase 6 → CLOSED

**Exit Criteria for Phase 6:**
- Founder ratification received
- Version tagged
- All phases complete
- All invariants preserved
- All constitutional gates passed

**Entry Criteria for CLOSED:**
- Phase 6 ratification complete
- Organelle Master Issue marked as ratified

**Gate Keeper:** webwaka007 (Founder)

---

## X. Parallelization Rules

Parallelization of Organelle implementation is permitted under specific conditions to maximize throughput while maintaining constitutional compliance.

### Allowed Parallelization

**Different Organelles in Same Phase:**
- Multiple Organelles can be in the same phase simultaneously
- Example: Organelle A in Phase 3, Organelle B in Phase 3, Organelle C in Phase 3

**Same Organelle in Different Phases (if dependencies met):**
- An Organelle can have multiple phases in progress if there are no dependencies between them
- Example: Organelle A in Phase 1 (Design) and Phase 5 (Documentation) simultaneously
- Requires explicit dependency declaration

**Different Categories:**
- Organelles from different categories can be worked on in parallel without restriction
- Example: Identity & Access Organelle and Data & Persistence Organelle in parallel

### Prohibited Parallelization

**Same Organelle in Multiple Phases Simultaneously (with dependencies):**
- An Organelle cannot be in Phase 1 and Phase 3 simultaneously if Phase 3 depends on Phase 1 completion
- Example: Cannot implement (Phase 3) while still designing (Phase 1)

**Tasks that Introduce Cross-Category Dependencies:**
- Tasks that would create undeclared cross-category dependencies cannot be parallelized
- Requires explicit dependency declaration and approval

**Tasks Without Explicit Invariant Declaration:**
- Tasks that have not declared impacted invariants cannot be parallelized
- Requires pre-execution declaration

**Same Agent on Multiple Organelles in Same Phase:**
- An agent should not work on multiple Organelles in the same phase simultaneously to avoid context switching
- Exception: If explicitly approved by Founder

### Dependency Management

**Explicit Dependency Declaration:**
- All dependencies must be explicitly declared in the Organelle Master Issue
- Dependencies must be validated before parallelization

**Blocking Relationships:**
- If Organelle A blocks Organelle B, Organelle B cannot begin until Organelle A reaches the required phase

**Parallel Execution Tracking:**
- All parallel execution must be tracked in the Organelle Master Issue
- Conflicts must be resolved immediately

---

## XI. Definition of Done

An Organelle is considered "Done" when all of the following criteria are met:

### Phase Completion

- [ ] Phase 0 (Specification) complete and approved
- [ ] Phase 1 (Design) complete and approved
- [ ] Phase 2 (Internal Validation) complete and approved
- [ ] Phase 3 (Implementation) complete and approved
- [ ] Phase 4 (Verification) complete and approved
- [ ] Phase 5 (Documentation) complete and approved
- [ ] Phase 6 (Ratification) complete and ratified by Founder

### Invariant Preservation

- [ ] All Organelle-level invariants preserved
- [ ] All Category-level invariants preserved
- [ ] All Layer-level invariants preserved
- [ ] No cross-category contamination detected
- [ ] No business logic introduced (if Organelle layer)
- [ ] No UI logic introduced

### Constitutional Gates

- [ ] All phase gate requirements met
- [ ] All entry criteria satisfied for each phase
- [ ] All exit criteria satisfied for each phase
- [ ] All constitutional checks passed
- [ ] No structural drift detected

### Artifacts

- [ ] Specification document created and approved
- [ ] Design document created and approved
- [ ] Validation document created and approved
- [ ] Implementation repository created and populated
- [ ] Verification report created and approved
- [ ] Documentation complete and reviewed

### Ratification

- [ ] Founder ratification received (webwaka007)
- [ ] Ratification comment added to Organelle Master Issue
- [ ] Version tagged in implementation repository
- [ ] Organelle Master Issue closed

### Traceability

- [ ] All commits linked to issues
- [ ] All handoff comments added
- [ ] All pre-execution declarations completed
- [ ] All atomic tasks closed
- [ ] All phase issues closed

### Quality

- [ ] All tests passing
- [ ] No prohibited dependencies
- [ ] No framework lock-in
- [ ] Code is technology-agnostic where applicable
- [ ] All public APIs documented

---

## Ratification

**Status:** Proposed  
**Authority:** webwaka007 (Founder)  
**Date:** 2026-02-18

This document serves as the constitutional master template for all Organelle implementation task trees within the WebWaka Biological Architecture framework. All agents must follow this template when creating, managing, and completing Organelle implementation tasks.

---

**END OF DOCUMENT**
