# LearningProgress Organ — Domain Boundary Constraints
## Organ ID: ORGX-EDU-LEARNING_PROGRESS

### Boundary Definition
The LearningProgress organ operates within a strictly defined domain boundary that encapsulates all education and learning business logic.

### Invariants
1. No LearningProgress operation may depend on external organ state
2. All LearningProgress events are scoped to the EDU domain
3. Cross-organ communication MUST use the organ interface contract
4. LearningProgress state MUST be self-contained and independently persistable
5. Offline operations MUST NOT require cross-organ coordination

### Interface Contract
- Input: LearningProgressCommand (typed, validated, idempotent)
- Output: LearningProgressEvent (immutable, timestamped, traceable)
- Query: LearningProgressQuery (read-only, cacheable, offline-capable)

_Boundary Hash: d5daacc9_
