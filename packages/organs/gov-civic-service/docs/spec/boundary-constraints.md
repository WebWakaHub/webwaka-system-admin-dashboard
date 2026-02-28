# CivicService Organ — Domain Boundary Constraints
## Organ ID: ORGX-GOV-CIVIC_SERVICE

### Boundary Definition
The CivicService organ operates within a strictly defined domain boundary that encapsulates all government and civic services business logic.

### Invariants
1. No CivicService operation may depend on external organ state
2. All CivicService events are scoped to the GOV domain
3. Cross-organ communication MUST use the organ interface contract
4. CivicService state MUST be self-contained and independently persistable
5. Offline operations MUST NOT require cross-organ coordination

### Interface Contract
- Input: CivicServiceCommand (typed, validated, idempotent)
- Output: CivicServiceEvent (immutable, timestamped, traceable)
- Query: CivicServiceQuery (read-only, cacheable, offline-capable)

_Boundary Hash: b85d3fd7_
