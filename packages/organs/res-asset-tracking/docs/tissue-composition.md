# AssetTracking Organ — Tissue Composition Documentation
## Organ ID: ORGX-RES-ASSET_TRACKING

### Constituent Tissues
1. **Command Coordination Tissue** — Routes and validates AssetTracking commands
2. **State Store Tissue** — Persists AssetTracking state with offline support
3. **Event Mesh Tissue** — Internal domain event bus for AssetTracking
4. **Validation Tissue** — Enforces AssetTracking business rules

### Composition Invariants
- All tissues operate within the AssetTracking domain boundary
- No tissue may directly invoke another tissue's methods
- Cross-tissue communication uses the internal event mesh
- State mutations are coordinated through the command tissue

_Composition Doc Hash: 07f38e68_
