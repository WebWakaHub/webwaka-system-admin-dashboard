# PatientManagement Organ — Tissue Composition Documentation
## Organ ID: ORGX-HLT-PATIENT_MANAGEMENT

### Constituent Tissues
1. **Command Coordination Tissue** — Routes and validates PatientManagement commands
2. **State Store Tissue** — Persists PatientManagement state with offline support
3. **Event Mesh Tissue** — Internal domain event bus for PatientManagement
4. **Validation Tissue** — Enforces PatientManagement business rules

### Composition Invariants
- All tissues operate within the PatientManagement domain boundary
- No tissue may directly invoke another tissue's methods
- Cross-tissue communication uses the internal event mesh
- State mutations are coordinated through the command tissue

_Composition Doc Hash: d94d097d_
