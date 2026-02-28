# AssessmentEngine Organ — Domain Boundary Constraints
## Organ ID: ORGX-EDU-ASSESSMENT_ENGINE

### Boundary Definition
The AssessmentEngine organ operates within a strictly defined domain boundary that encapsulates all education and learning business logic.

### Invariants
1. No AssessmentEngine operation may depend on external organ state
2. All AssessmentEngine events are scoped to the EDU domain
3. Cross-organ communication MUST use the organ interface contract
4. AssessmentEngine state MUST be self-contained and independently persistable
5. Offline operations MUST NOT require cross-organ coordination

### Interface Contract
- Input: AssessmentEngineCommand (typed, validated, idempotent)
- Output: AssessmentEngineEvent (immutable, timestamped, traceable)
- Query: AssessmentEngineQuery (read-only, cacheable, offline-capable)

_Boundary Hash: aec306b0_
