# AssetPlatformSystem — Boundary Definition
## System ID: SYS-RES-ASSETPLATFORM

### Domain Boundaries
This system operates within the **Resources** domain.

### Inclusions
- Asset registration and tracking
- Asset lifecycle management
- Preventive maintenance scheduling
- Depreciation calculation engine
- Asset audit and compliance

### Exclusions
- Does not implement infrastructure topology
- Does not redefine organ-level semantics
- Does not bypass lower-layer invariants
- Does not implement UI primitives directly

### Inter-System Boundaries
- May interoperate with other systems via defined APIs
- Must not fuse with unrelated domain systems
- Cross-system coordination requires explicit integration contracts
