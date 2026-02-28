# AppStore Organ — Tissue Composition Requirements
## Organ ID: ORGX-EXT-APP_STORE

### Constituent Tissues
The AppStore organ is composed of the following tissue types:
1. **Command Coordination Tissue** — Orchestrates app store commands
2. **State Store Tissue** — Manages AppStore domain state with offline persistence
3. **Event Mesh Tissue** — Handles domain events within app store boundary
4. **Validation Tissue** — Enforces AppStore business rules

### Composition Rules
- All tissues MUST operate within the AppStore domain boundary
- Cross-tissue communication MUST use the organ's internal event mesh
- State mutations MUST be coordinated through the command tissue
- Offline state MUST be synchronized through the state store tissue

### Nigeria-First Tissue Configuration
- All tissue timeouts: 30,000ms (30s) for Nigerian network conditions
- Locale: en-NG with NGN currency formatting
- Offline queue capacity: 1000 operations per tissue
- Sync strategy: Exponential backoff starting at 5s, max 300s

_Composition Hash: 7c7e5e6e_
