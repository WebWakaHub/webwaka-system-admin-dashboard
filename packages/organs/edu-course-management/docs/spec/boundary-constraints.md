# CourseManagement Organ — Domain Boundary Constraints
## Organ ID: ORGX-EDU-COURSE_MANAGEMENT

### Boundary Definition
The CourseManagement organ operates within a strictly defined domain boundary that encapsulates all education and learning business logic.

### Invariants
1. No CourseManagement operation may depend on external organ state
2. All CourseManagement events are scoped to the EDU domain
3. Cross-organ communication MUST use the organ interface contract
4. CourseManagement state MUST be self-contained and independently persistable
5. Offline operations MUST NOT require cross-organ coordination

### Interface Contract
- Input: CourseManagementCommand (typed, validated, idempotent)
- Output: CourseManagementEvent (immutable, timestamped, traceable)
- Query: CourseManagementQuery (read-only, cacheable, offline-capable)

_Boundary Hash: 137510d8_
