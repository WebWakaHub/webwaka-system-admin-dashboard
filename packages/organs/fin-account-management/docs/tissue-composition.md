# AccountManagement Organ — Tissue Composition Documentation
## Organ ID: ORGX-FIN-ACCOUNT_MANAGEMENT

### Constituent Tissues
1. **Command Coordination Tissue** — Routes and validates AccountManagement commands
2. **State Store Tissue** — Persists AccountManagement state with offline support
3. **Event Mesh Tissue** — Internal domain event bus for AccountManagement
4. **Validation Tissue** — Enforces AccountManagement business rules

### Composition Invariants
- All tissues operate within the AccountManagement domain boundary
- No tissue may directly invoke another tissue's methods
- Cross-tissue communication uses the internal event mesh
- State mutations are coordinated through the command tissue

_Composition Doc Hash: 8d5f6cbe_
