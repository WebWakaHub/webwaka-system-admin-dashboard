# ShoppingCart Organ — Tissue Composition Requirements
## Organ ID: ORGX-COM-SHOPPING_CART

### Constituent Tissues
The ShoppingCart organ is composed of the following tissue types:
1. **Command Coordination Tissue** — Orchestrates shopping cart commands
2. **State Store Tissue** — Manages ShoppingCart domain state with offline persistence
3. **Event Mesh Tissue** — Handles domain events within shopping cart boundary
4. **Validation Tissue** — Enforces ShoppingCart business rules

### Composition Rules
- All tissues MUST operate within the ShoppingCart domain boundary
- Cross-tissue communication MUST use the organ's internal event mesh
- State mutations MUST be coordinated through the command tissue
- Offline state MUST be synchronized through the state store tissue

### Nigeria-First Tissue Configuration
- All tissue timeouts: 30,000ms (30s) for Nigerian network conditions
- Locale: en-NG with NGN currency formatting
- Offline queue capacity: 1000 operations per tissue
- Sync strategy: Exponential backoff starting at 5s, max 300s

_Composition Hash: dfe8b03d_
