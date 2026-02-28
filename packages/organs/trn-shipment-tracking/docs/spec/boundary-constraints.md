# ShipmentTracking Organ — Domain Boundary Constraints
## Organ ID: ORGX-TRN-SHIPMENT_TRACKING

### Boundary Definition
The ShipmentTracking organ operates within a strictly defined domain boundary that encapsulates all transportation and shipping business logic.

### Invariants
1. No ShipmentTracking operation may depend on external organ state
2. All ShipmentTracking events are scoped to the TRN domain
3. Cross-organ communication MUST use the organ interface contract
4. ShipmentTracking state MUST be self-contained and independently persistable
5. Offline operations MUST NOT require cross-organ coordination

### Interface Contract
- Input: ShipmentTrackingCommand (typed, validated, idempotent)
- Output: ShipmentTrackingEvent (immutable, timestamped, traceable)
- Query: ShipmentTrackingQuery (read-only, cacheable, offline-capable)

_Boundary Hash: b75ce27f_
