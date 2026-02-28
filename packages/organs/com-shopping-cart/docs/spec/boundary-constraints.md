# ShoppingCart Organ — Domain Boundary Constraints
## Organ ID: ORGX-COM-SHOPPING_CART

### Boundary Definition
The ShoppingCart organ operates within a strictly defined domain boundary that encapsulates all commerce and e-commerce business logic.

### Invariants
1. No ShoppingCart operation may depend on external organ state
2. All ShoppingCart events are scoped to the COM domain
3. Cross-organ communication MUST use the organ interface contract
4. ShoppingCart state MUST be self-contained and independently persistable
5. Offline operations MUST NOT require cross-organ coordination

### Interface Contract
- Input: ShoppingCartCommand (typed, validated, idempotent)
- Output: ShoppingCartEvent (immutable, timestamped, traceable)
- Query: ShoppingCartQuery (read-only, cacheable, offline-capable)

_Boundary Hash: dfe8b03d_
