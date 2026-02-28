# MetricsCollection Organ — Domain Boundary Constraints
## Organ ID: ORGX-IN-METRICS_COLLECTION

### Boundary Definition
The MetricsCollection organ operates within a strictly defined domain boundary that encapsulates all instrumentation and observability business logic.

### Invariants
1. No MetricsCollection operation may depend on external organ state
2. All MetricsCollection events are scoped to the IN domain
3. Cross-organ communication MUST use the organ interface contract
4. MetricsCollection state MUST be self-contained and independently persistable
5. Offline operations MUST NOT require cross-organ coordination

### Interface Contract
- Input: MetricsCollectionCommand (typed, validated, idempotent)
- Output: MetricsCollectionEvent (immutable, timestamped, traceable)
- Query: MetricsCollectionQuery (read-only, cacheable, offline-capable)

_Boundary Hash: 4eed02be_
