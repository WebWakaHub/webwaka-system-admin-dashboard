# PatientManagement Organ — Tissue Composition Requirements
## Organ ID: ORGX-HLT-PATIENT_MANAGEMENT

### Constituent Tissues
The PatientManagement organ is composed of the following tissue types:
1. **Command Coordination Tissue** — Orchestrates patient management commands
2. **State Store Tissue** — Manages PatientManagement domain state with offline persistence
3. **Event Mesh Tissue** — Handles domain events within patient management boundary
4. **Validation Tissue** — Enforces PatientManagement business rules

### Composition Rules
- All tissues MUST operate within the PatientManagement domain boundary
- Cross-tissue communication MUST use the organ's internal event mesh
- State mutations MUST be coordinated through the command tissue
- Offline state MUST be synchronized through the state store tissue

### Nigeria-First Tissue Configuration
- All tissue timeouts: 30,000ms (30s) for Nigerian network conditions
- Locale: en-NG with NGN currency formatting
- Offline queue capacity: 1000 operations per tissue
- Sync strategy: Exponential backoff starting at 5s, max 300s

_Composition Hash: d94d097d_
