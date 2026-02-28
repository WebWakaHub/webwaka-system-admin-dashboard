# AssetTracking Organ — Domain Boundary Constraints
## Organ ID: ORGX-RES-ASSET_TRACKING

### Boundary Definition
The AssetTracking organ operates within a strictly defined domain boundary that encapsulates all resource and asset management business logic.

### Invariants
1. No AssetTracking operation may depend on external organ state
2. All AssetTracking events are scoped to the RES domain
3. Cross-organ communication MUST use the organ interface contract
4. AssetTracking state MUST be self-contained and independently persistable
5. Offline operations MUST NOT require cross-organ coordination

### Interface Contract
- Input: AssetTrackingCommand (typed, validated, idempotent)
- Output: AssetTrackingEvent (immutable, timestamped, traceable)
- Query: AssetTrackingQuery (read-only, cacheable, offline-capable)

_Boundary Hash: 07f38e68_
