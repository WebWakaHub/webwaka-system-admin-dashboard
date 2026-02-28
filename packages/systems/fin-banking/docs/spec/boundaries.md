# BankingSystem — Boundary Definition
## System ID: SYS-FIN-BANKING

### Domain Boundaries
This system operates within the **Finance** domain.

### Inclusions
- Account lifecycle management
- Real-time transaction processing
- Regulatory compliance monitoring
- Statement generation with Naira formatting
- Interest calculation engine

### Exclusions
- Does not implement infrastructure topology
- Does not redefine organ-level semantics
- Does not bypass lower-layer invariants
- Does not implement UI primitives directly

### Inter-System Boundaries
- May interoperate with other systems via defined APIs
- Must not fuse with unrelated domain systems
- Cross-system coordination requires explicit integration contracts
