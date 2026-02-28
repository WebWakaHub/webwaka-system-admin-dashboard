# ResourceScheduling Organ — Tissue Composition Requirements
## Organ ID: ORGX-RES-RESOURCE_SCHEDULING

### Constituent Tissues
The ResourceScheduling organ is composed of the following tissue types:
1. **Command Coordination Tissue** — Orchestrates resource scheduling commands
2. **State Store Tissue** — Manages ResourceScheduling domain state with offline persistence
3. **Event Mesh Tissue** — Handles domain events within resource scheduling boundary
4. **Validation Tissue** — Enforces ResourceScheduling business rules

### Composition Rules
- All tissues MUST operate within the ResourceScheduling domain boundary
- Cross-tissue communication MUST use the organ's internal event mesh
- State mutations MUST be coordinated through the command tissue
- Offline state MUST be synchronized through the state store tissue

### Nigeria-First Tissue Configuration
- All tissue timeouts: 30,000ms (30s) for Nigerian network conditions
- Locale: en-NG with NGN currency formatting
- Offline queue capacity: 1000 operations per tissue
- Sync strategy: Exponential backoff starting at 5s, max 300s

_Composition Hash: af78dd73_
