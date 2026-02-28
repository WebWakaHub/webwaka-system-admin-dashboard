# Geocoding Organ — Domain Boundary Constraints
## Organ ID: ORGX-GEO-GEOCODING

### Boundary Definition
The Geocoding organ operates within a strictly defined domain boundary that encapsulates all geospatial and location services business logic.

### Invariants
1. No Geocoding operation may depend on external organ state
2. All Geocoding events are scoped to the GEO domain
3. Cross-organ communication MUST use the organ interface contract
4. Geocoding state MUST be self-contained and independently persistable
5. Offline operations MUST NOT require cross-organ coordination

### Interface Contract
- Input: GeocodingCommand (typed, validated, idempotent)
- Output: GeocodingEvent (immutable, timestamped, traceable)
- Query: GeocodingQuery (read-only, cacheable, offline-capable)

_Boundary Hash: af2fffae_
