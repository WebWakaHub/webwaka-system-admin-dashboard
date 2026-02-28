# ThreatDetection Organ — Domain Boundary Constraints
## Organ ID: ORGX-SEC-THREAT_DETECTION

### Boundary Definition
The ThreatDetection organ operates within a strictly defined domain boundary that encapsulates all security and compliance business logic.

### Invariants
1. No ThreatDetection operation may depend on external organ state
2. All ThreatDetection events are scoped to the SEC domain
3. Cross-organ communication MUST use the organ interface contract
4. ThreatDetection state MUST be self-contained and independently persistable
5. Offline operations MUST NOT require cross-organ coordination

### Interface Contract
- Input: ThreatDetectionCommand (typed, validated, idempotent)
- Output: ThreatDetectionEvent (immutable, timestamped, traceable)
- Query: ThreatDetectionQuery (read-only, cacheable, offline-capable)

_Boundary Hash: e006e378_
