# ClinicalWorkflow Organ — Domain Boundary Constraints
## Organ ID: ORGX-HLT-CLINICAL_WORKFLOW

### Boundary Definition
The ClinicalWorkflow organ operates within a strictly defined domain boundary that encapsulates all healthcare and clinical business logic.

### Invariants
1. No ClinicalWorkflow operation may depend on external organ state
2. All ClinicalWorkflow events are scoped to the HLT domain
3. Cross-organ communication MUST use the organ interface contract
4. ClinicalWorkflow state MUST be self-contained and independently persistable
5. Offline operations MUST NOT require cross-organ coordination

### Interface Contract
- Input: ClinicalWorkflowCommand (typed, validated, idempotent)
- Output: ClinicalWorkflowEvent (immutable, timestamped, traceable)
- Query: ClinicalWorkflowQuery (read-only, cacheable, offline-capable)

_Boundary Hash: 79667bcf_
