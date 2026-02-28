# AssessmentEngine Organ — Tissue Composition Documentation
## Organ ID: ORGX-EDU-ASSESSMENT_ENGINE

### Constituent Tissues
1. **Command Coordination Tissue** — Routes and validates AssessmentEngine commands
2. **State Store Tissue** — Persists AssessmentEngine state with offline support
3. **Event Mesh Tissue** — Internal domain event bus for AssessmentEngine
4. **Validation Tissue** — Enforces AssessmentEngine business rules

### Composition Invariants
- All tissues operate within the AssessmentEngine domain boundary
- No tissue may directly invoke another tissue's methods
- Cross-tissue communication uses the internal event mesh
- State mutations are coordinated through the command tissue

_Composition Doc Hash: aec306b0_
