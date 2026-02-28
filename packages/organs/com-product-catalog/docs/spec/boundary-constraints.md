# ProductCatalog Organ — Domain Boundary Constraints
## Organ ID: ORGX-COM-PRODUCT_CATALOG

### Boundary Definition
The ProductCatalog organ operates within a strictly defined domain boundary that encapsulates all commerce and e-commerce business logic.

### Invariants
1. No ProductCatalog operation may depend on external organ state
2. All ProductCatalog events are scoped to the COM domain
3. Cross-organ communication MUST use the organ interface contract
4. ProductCatalog state MUST be self-contained and independently persistable
5. Offline operations MUST NOT require cross-organ coordination

### Interface Contract
- Input: ProductCatalogCommand (typed, validated, idempotent)
- Output: ProductCatalogEvent (immutable, timestamped, traceable)
- Query: ProductCatalogQuery (read-only, cacheable, offline-capable)

_Boundary Hash: 336d8838_
