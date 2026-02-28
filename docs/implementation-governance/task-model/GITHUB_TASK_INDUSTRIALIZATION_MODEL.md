# GITHUB TASK INDUSTRIALIZATION MODEL

---

## I. Purpose of Task Industrialization

Task industrialization transforms architectural intent into disciplined, traceable, and constitutionally compliant execution. Without industrialization, tasks become ad hoc, unauditable, and prone to structural drift.

This model establishes the GitHub-based task execution framework for WebWaka, ensuring that every task is properly scoped, labeled, tracked, verified, and ratified according to constitutional principles.

Task industrialization ensures:

- **Traceability:** Every decision and action is recorded and auditable
- **Constitutional compliance:** Every task respects layer boundaries and invariants
- **Parallel efficiency:** Tasks can be executed in parallel where dependencies permit
- **Verification discipline:** Every task passes through mandatory verification gates
- **Scope control:** Task explosion and scope creep are prevented through mandatory controls

---

## II. Issue Hierarchy Model

All work in WebWaka follows a three-level issue hierarchy:

### Level 1 — Organelle Implementation (Parent Issue)

The parent issue represents the complete implementation of a single Organelle. It serves as the coordination point for all phases and subtasks.

**Characteristics:**
- One parent issue per Organelle
- Contains high-level description, category, and rationale
- Links to all child issues (phases)
- Tracks overall progress

### Level 2 — Phase Issues (Child Issues)

Each phase of the Organelle implementation is represented as a child issue. There are exactly 7 phases (0-6) as defined in ORGANELLE_IMPLEMENTATION_STANDARD.md.

**Characteristics:**
- One child issue per phase
- Contains phase-specific objectives, artifacts, and verification gates
- Links to parent issue
- Links to subtasks (atomic work units)

### Level 3 — Atomic Work Units (Subtasks)

Each phase is decomposed into atomic work units represented as subtasks within the phase issue.

**Characteristics:**
- Multiple subtasks per phase
- Each subtask is independently completable
- Each subtask has clear deliverables and exit criteria
- Subtasks may have dependencies on other subtasks

**No fourth level is permitted.** All work must fit within this three-level hierarchy.

---

## III. Labeling Taxonomy

All issues must be labeled according to the following taxonomy:

### Layer Labels

- `layer:organelle` — Organelle Layer
- `layer:cell` — Cell Layer
- `layer:tissue` — Tissue Layer
- `layer:organ` — Organ Layer
- `layer:system` — System Layer
- `layer:organism` — Organism Layer

### Type Labels

- `type:implementation` — Implementation work
- `type:constitution` — Constitutional document creation or amendment
- `type:audit` — Structural audit or compliance verification
- `type:amendment` — Formal amendment proposal
- `type:verification` — Verification work
- `type:admission` — System admission proposal
- `type:deprecation` — System deprecation proposal

### Phase Labels

- `phase:0` — Specification
- `phase:1` — Design
- `phase:2` — Internal Validation
- `phase:3` — Implementation
- `phase:4` — Verification
- `phase:5` — Documentation
- `phase:6` — Ratification

### State Labels

- `state:proposed` — Task proposed, awaiting approval
- `state:approved` — Task approved, ready to begin
- `state:in-progress` — Task actively being worked on
- `state:awaiting-verification` — Task complete, awaiting verification
- `state:verified` — Task verified, awaiting ratification
- `state:ratified` — Task ratified and complete
- `state:blocked` — Task blocked by dependency or issue
- `state:frozen` — Task frozen due to constitutional violation

---

## IV. Task Lifecycle States

Tasks progress through the following lifecycle states:

### State Transition Model

```
proposed → approved → in-progress → awaiting-verification → verified → ratified
```

### Allowed Transitions

- **proposed → approved:** Task approved by governance
- **approved → in-progress:** Agent begins work
- **in-progress → awaiting-verification:** Agent completes work, submits for verification
- **awaiting-verification → verified:** Verification agent validates work
- **verified → ratified:** Founder ratifies work

### Exceptional Transitions

- **Any state → blocked:** Task blocked by dependency or issue
- **blocked → previous state:** Block resolved, task resumes
- **Any state → frozen:** Constitutional violation detected
- **frozen → proposed:** Violation resolved, task resubmitted

### Prohibited Transitions

**No skipping states is permitted.** Tasks must progress through all states in order.

---

## V. Mandatory Issue Template

All issues must use the following template:

```markdown
# [Task Title]

**Layer:** [Organelle | Cell | Tissue | Organ | System | Organism]  
**Type:** [Implementation | Constitution | Audit | Amendment | Verification | Admission | Deprecation]  
**Phase:** [0 | 1 | 2 | 3 | 4 | 5 | 6 | N/A]  
**State:** [Proposed | Approved | In Progress | Awaiting Verification | Verified | Ratified | Blocked | Frozen]

---

## Impacted Invariants

- [Invariant 1]
- [Invariant 2]
- [...]

---

## Description

[Clear description of the task]

---

## Deliverables

- [ ] [Deliverable 1]
- [ ] [Deliverable 2]
- [ ] [...]

---

## Dependencies

- [Dependency 1]
- [Dependency 2]
- [...]

---

## Responsible Agent

**Agent:** [webwakaagent3 | webwakaagent4 | webwakaagent5 | webwakaagent1 | webwaka007]

---

## Verification Agent

**Agent:** [webwakaagent5 | webwakaagent1 | webwaka007]

---

## Exit Criteria

- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [...]
```

---

## VI. Agent Pickup & Handoff Protocol

### Agent Pickup Protocol

When an agent picks up a task, the agent must:

1. **Declare reading of relevant constitutional documents**  
   The agent must explicitly state which constitutional documents have been read and understood.

2. **Restate impacted invariants**  
   The agent must restate the invariants that may be impacted by the task.

3. **Confirm no boundary violation**  
   The agent must confirm that the task does not violate any layer boundaries, category boundaries, or exclusion rules.

4. **Update status before beginning work**  
   The agent must update the task state to `in-progress` before beginning work.

### Agent Handoff Protocol

When an agent completes a task and hands it off for verification:

1. **Update status to awaiting-verification**  
   The agent must update the task state to `awaiting-verification`.

2. **Document deliverables**  
   The agent must document all deliverables and link to relevant artifacts.

3. **Confirm exit criteria met**  
   The agent must confirm that all exit criteria have been met.

4. **Tag verification agent**  
   The agent must tag the designated verification agent to request review.

---

## VII. Verification Checkpoints per State

### Verification by webwakaagent5 (Verification Agent)

**Validates:**
- Technical correctness
- Invariant preservation
- Test coverage
- Implementation completeness
- Exclusion boundary respect

### Verification by webwakaagent1 (Governance Agent)

**Validates:**
- Constitutional compliance
- Layer boundary respect
- Category alignment
- Governance protocol adherence

### Ratification by webwaka007 (Founder)

**Required for:**
- Constitutional amendments
- New System admissions
- Domain modifications
- Layer invariant changes
- Final Organelle ratification (Phase 6)

---

## VIII. Parallel Execution Governance

### Parallel Execution Rules

**Parallel allowed:**
- Multiple Organelles may be implemented in parallel
- Multiple tasks at the same phase across different Organelles may be executed in parallel
- Tasks with no dependencies may be executed in parallel

**Parallel prohibited:**
- Phases of the same Organelle may not be executed in parallel
- Tasks with dependencies may not be executed in parallel
- Tasks that risk invariant violation may not be executed in parallel

### Freeze Protocol

If invariant risk is detected during parallel execution:

1. **Immediate freeze** of all affected tasks
2. **Audit** to assess risk
3. **Resolution** of risk before resuming
4. **Governance approval** to resume

---

## IX. Immutable Audit & Traceability Requirements

### Decision Recording

All decisions must be recorded in issue comments. No decision may be made outside the GitHub issue tracking system.

### No Deletion of Task History

Task history is immutable. Issue comments, state transitions, and decisions may not be deleted.

### No Force Push Rewriting

Git history is immutable. Force pushes that rewrite history are prohibited.

### Amendment References Required

Any change to a ratified artifact must reference the formal amendment that authorized the change.

---

## X. Task Explosion & Scope Control

### Maximum Subtask Size

A subtask may not exceed 8 hours of estimated work. If a subtask exceeds this threshold, it must be split into smaller subtasks.

### Scope Creep Detection

Scope creep is detected when:
- A task's deliverables expand beyond the original definition
- A task introduces dependencies not declared at approval
- A task violates layer or category boundaries

When scope creep is detected, the task must be frozen and resubmitted for approval.

### Mandatory Splitting Threshold

If a phase issue contains more than 10 subtasks, it must be reviewed for potential splitting into multiple phases or Organelles.

### Cross-Domain Duplication Detection

Before approving a task, governance must verify that the task does not duplicate functionality already implemented in another Organelle, Cell, Tissue, Organ, or System.

---

## XI. Ratification Statement

This GitHub Task Industrialization Model is hereby ratified as the mandatory task execution framework for all work within the WebWaka Biological Architecture.

All tasks must comply with this model. Non-compliance constitutes a constitutional violation.

**Status:** RATIFIED  
**Authority:** Founder  
**Date:** 2026-02-18 (UTC)

---
