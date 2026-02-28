# ResourceScheduling Organ — Tissue Composition Documentation
## Organ ID: ORGX-RES-RESOURCE_SCHEDULING

### Constituent Tissues
1. **Command Coordination Tissue** — Routes and validates ResourceScheduling commands
2. **State Store Tissue** — Persists ResourceScheduling state with offline support
3. **Event Mesh Tissue** — Internal domain event bus for ResourceScheduling
4. **Validation Tissue** — Enforces ResourceScheduling business rules

### Composition Invariants
- All tissues operate within the ResourceScheduling domain boundary
- No tissue may directly invoke another tissue's methods
- Cross-tissue communication uses the internal event mesh
- State mutations are coordinated through the command tissue

_Composition Doc Hash: af78dd73_
