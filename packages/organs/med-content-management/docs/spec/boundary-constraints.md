# ContentManagement Organ — Domain Boundary Constraints
## Organ ID: ORGX-MED-CONTENT_MANAGEMENT

### Boundary Definition
The ContentManagement organ operates within a strictly defined domain boundary that encapsulates all media and content business logic.

### Invariants
1. No ContentManagement operation may depend on external organ state
2. All ContentManagement events are scoped to the MED domain
3. Cross-organ communication MUST use the organ interface contract
4. ContentManagement state MUST be self-contained and independently persistable
5. Offline operations MUST NOT require cross-organ coordination

### Interface Contract
- Input: ContentManagementCommand (typed, validated, idempotent)
- Output: ContentManagementEvent (immutable, timestamped, traceable)
- Query: ContentManagementQuery (read-only, cacheable, offline-capable)

_Boundary Hash: 2e23bd2b_
