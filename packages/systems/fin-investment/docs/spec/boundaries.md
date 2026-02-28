# InvestmentSystem — Boundary Definition
## System ID: SYS-FIN-INVESTMENT

### Domain Boundaries
This system operates within the **Finance** domain.

### Inclusions
- Portfolio composition management
- Order execution engine
- Risk assessment and monitoring
- Real-time market data integration
- Investment performance reporting

### Exclusions
- Does not implement infrastructure topology
- Does not redefine organ-level semantics
- Does not bypass lower-layer invariants
- Does not implement UI primitives directly

### Inter-System Boundaries
- May interoperate with other systems via defined APIs
- Must not fuse with unrelated domain systems
- Cross-system coordination requires explicit integration contracts
