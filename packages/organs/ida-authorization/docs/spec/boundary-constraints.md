# Authorization Organ — Domain Boundary Constraints
## Organ ID: ORGX-IDA-AUTHORIZATION

### Boundary Definition
The Authorization organ operates within a strictly defined domain boundary that encapsulates all identity and access management business logic.

### Invariants
1. No Authorization operation may depend on external organ state
2. All Authorization events are scoped to the IDA domain
3. Cross-organ communication MUST use the organ interface contract
4. Authorization state MUST be self-contained and independently persistable
5. Offline operations MUST NOT require cross-organ coordination

### Interface Contract
- Input: AuthorizationCommand (typed, validated, idempotent)
- Output: AuthorizationEvent (immutable, timestamped, traceable)
- Query: AuthorizationQuery (read-only, cacheable, offline-capable)

_Boundary Hash: 80dae5e1_
