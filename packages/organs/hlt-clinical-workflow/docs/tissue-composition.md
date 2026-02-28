# ClinicalWorkflow Organ — Tissue Composition Documentation
## Organ ID: ORGX-HLT-CLINICAL_WORKFLOW

### Constituent Tissues
1. **Command Coordination Tissue** — Routes and validates ClinicalWorkflow commands
2. **State Store Tissue** — Persists ClinicalWorkflow state with offline support
3. **Event Mesh Tissue** — Internal domain event bus for ClinicalWorkflow
4. **Validation Tissue** — Enforces ClinicalWorkflow business rules

### Composition Invariants
- All tissues operate within the ClinicalWorkflow domain boundary
- No tissue may directly invoke another tissue's methods
- Cross-tissue communication uses the internal event mesh
- State mutations are coordinated through the command tissue

_Composition Doc Hash: 79667bcf_
