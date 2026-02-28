# ThreatDetection Organ — Tissue Composition Requirements
## Organ ID: ORGX-SEC-THREAT_DETECTION

### Constituent Tissues
The ThreatDetection organ is composed of the following tissue types:
1. **Command Coordination Tissue** — Orchestrates threat detection commands
2. **State Store Tissue** — Manages ThreatDetection domain state with offline persistence
3. **Event Mesh Tissue** — Handles domain events within threat detection boundary
4. **Validation Tissue** — Enforces ThreatDetection business rules

### Composition Rules
- All tissues MUST operate within the ThreatDetection domain boundary
- Cross-tissue communication MUST use the organ's internal event mesh
- State mutations MUST be coordinated through the command tissue
- Offline state MUST be synchronized through the state store tissue

### Nigeria-First Tissue Configuration
- All tissue timeouts: 30,000ms (30s) for Nigerian network conditions
- Locale: en-NG with NGN currency formatting
- Offline queue capacity: 1000 operations per tissue
- Sync strategy: Exponential backoff starting at 5s, max 300s

_Composition Hash: e006e378_
