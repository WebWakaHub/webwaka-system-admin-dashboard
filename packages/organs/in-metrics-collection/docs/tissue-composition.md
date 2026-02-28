# MetricsCollection Organ — Tissue Composition Documentation
## Organ ID: ORGX-IN-METRICS_COLLECTION

### Constituent Tissues
1. **Command Coordination Tissue** — Routes and validates MetricsCollection commands
2. **State Store Tissue** — Persists MetricsCollection state with offline support
3. **Event Mesh Tissue** — Internal domain event bus for MetricsCollection
4. **Validation Tissue** — Enforces MetricsCollection business rules

### Composition Invariants
- All tissues operate within the MetricsCollection domain boundary
- No tissue may directly invoke another tissue's methods
- Cross-tissue communication uses the internal event mesh
- State mutations are coordinated through the command tissue

_Composition Doc Hash: 4eed02be_
