# CivicService Organ — Tissue Composition Requirements
## Organ ID: ORGX-GOV-CIVIC_SERVICE

### Constituent Tissues
The CivicService organ is composed of the following tissue types:
1. **Command Coordination Tissue** — Orchestrates civic service commands
2. **State Store Tissue** — Manages CivicService domain state with offline persistence
3. **Event Mesh Tissue** — Handles domain events within civic service boundary
4. **Validation Tissue** — Enforces CivicService business rules

### Composition Rules
- All tissues MUST operate within the CivicService domain boundary
- Cross-tissue communication MUST use the organ's internal event mesh
- State mutations MUST be coordinated through the command tissue
- Offline state MUST be synchronized through the state store tissue

### Nigeria-First Tissue Configuration
- All tissue timeouts: 30,000ms (30s) for Nigerian network conditions
- Locale: en-NG with NGN currency formatting
- Offline queue capacity: 1000 operations per tissue
- Sync strategy: Exponential backoff starting at 5s, max 300s

_Composition Hash: b85d3fd7_
