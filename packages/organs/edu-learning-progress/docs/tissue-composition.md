# LearningProgress Organ — Tissue Composition Documentation
## Organ ID: ORGX-EDU-LEARNING_PROGRESS

### Constituent Tissues
1. **Command Coordination Tissue** — Routes and validates LearningProgress commands
2. **State Store Tissue** — Persists LearningProgress state with offline support
3. **Event Mesh Tissue** — Internal domain event bus for LearningProgress
4. **Validation Tissue** — Enforces LearningProgress business rules

### Composition Invariants
- All tissues operate within the LearningProgress domain boundary
- No tissue may directly invoke another tissue's methods
- Cross-tissue communication uses the internal event mesh
- State mutations are coordinated through the command tissue

_Composition Doc Hash: d5daacc9_
