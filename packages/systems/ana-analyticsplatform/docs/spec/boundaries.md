# AnalyticsPlatformSystem — Boundary Definition
## System ID: SYS-ANA-ANALYTICSPLATFORM

### Domain Boundaries
This system operates within the **Analytics** domain.

### Inclusions
- Real-time analytics pipeline
- Custom dashboard builder
- Scheduled report generation
- Data aggregation across domains
- Predictive analytics engine

### Exclusions
- Does not implement infrastructure topology
- Does not redefine organ-level semantics
- Does not bypass lower-layer invariants
- Does not implement UI primitives directly

### Inter-System Boundaries
- May interoperate with other systems via defined APIs
- Must not fuse with unrelated domain systems
- Cross-system coordination requires explicit integration contracts
