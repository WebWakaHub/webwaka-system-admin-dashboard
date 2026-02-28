# HealthPlatformSystem — Boundary Definition
## System ID: SYS-HLT-HEALTHPLATFORM

### Domain Boundaries
This system operates within the **Health** domain.

### Inclusions
- Patient registration and management
- Electronic health record management
- Appointment scheduling with SMS reminders
- Prescription tracking
- Health outcome analytics

### Exclusions
- Does not implement infrastructure topology
- Does not redefine organ-level semantics
- Does not bypass lower-layer invariants
- Does not implement UI primitives directly

### Inter-System Boundaries
- May interoperate with other systems via defined APIs
- Must not fuse with unrelated domain systems
- Cross-system coordination requires explicit integration contracts
