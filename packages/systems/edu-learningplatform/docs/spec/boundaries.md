# LearningPlatformSystem — Boundary Definition
## System ID: SYS-EDU-LEARNINGPLATFORM

### Domain Boundaries
This system operates within the **Education** domain.

### Inclusions
- Course creation and management
- Adaptive assessment engine
- Learner progress tracking
- Offline content access
- Certificate generation

### Exclusions
- Does not implement infrastructure topology
- Does not redefine organ-level semantics
- Does not bypass lower-layer invariants
- Does not implement UI primitives directly

### Inter-System Boundaries
- May interoperate with other systems via defined APIs
- Must not fuse with unrelated domain systems
- Cross-system coordination requires explicit integration contracts
