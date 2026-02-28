# LocationTracking Organ — Domain Boundary Constraints
## Organ ID: ORGX-GEO-LOCATION_TRACKING

### Boundary Definition
The LocationTracking organ operates within a strictly defined domain boundary that encapsulates all geospatial and location services business logic.

### Invariants
1. No LocationTracking operation may depend on external organ state
2. All LocationTracking events are scoped to the GEO domain
3. Cross-organ communication MUST use the organ interface contract
4. LocationTracking state MUST be self-contained and independently persistable
5. Offline operations MUST NOT require cross-organ coordination

### Interface Contract
- Input: LocationTrackingCommand (typed, validated, idempotent)
- Output: LocationTrackingEvent (immutable, timestamped, traceable)
- Query: LocationTrackingQuery (read-only, cacheable, offline-capable)

_Boundary Hash: a71b5b26_
