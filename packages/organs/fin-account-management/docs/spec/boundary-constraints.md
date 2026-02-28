# AccountManagement Organ — Domain Boundary Constraints
## Organ ID: ORGX-FIN-ACCOUNT_MANAGEMENT

### Boundary Definition
The AccountManagement organ operates within a strictly defined domain boundary that encapsulates all financial services and ledger business logic.

### Invariants
1. No AccountManagement operation may depend on external organ state
2. All AccountManagement events are scoped to the FIN domain
3. Cross-organ communication MUST use the organ interface contract
4. AccountManagement state MUST be self-contained and independently persistable
5. Offline operations MUST NOT require cross-organ coordination

### Interface Contract
- Input: AccountManagementCommand (typed, validated, idempotent)
- Output: AccountManagementEvent (immutable, timestamped, traceable)
- Query: AccountManagementQuery (read-only, cacheable, offline-capable)

_Boundary Hash: 8d5f6cbe_
