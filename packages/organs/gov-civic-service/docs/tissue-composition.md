# CivicService Organ — Tissue Composition Documentation
## Organ ID: ORGX-GOV-CIVIC_SERVICE

### Constituent Tissues
1. **Command Coordination Tissue** — Routes and validates CivicService commands
2. **State Store Tissue** — Persists CivicService state with offline support
3. **Event Mesh Tissue** — Internal domain event bus for CivicService
4. **Validation Tissue** — Enforces CivicService business rules

### Composition Invariants
- All tissues operate within the CivicService domain boundary
- No tissue may directly invoke another tissue's methods
- Cross-tissue communication uses the internal event mesh
- State mutations are coordinated through the command tissue

_Composition Doc Hash: b85d3fd7_
