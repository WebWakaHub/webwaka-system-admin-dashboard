# CourseManagement Organ — Tissue Composition Documentation
## Organ ID: ORGX-EDU-COURSE_MANAGEMENT

### Constituent Tissues
1. **Command Coordination Tissue** — Routes and validates CourseManagement commands
2. **State Store Tissue** — Persists CourseManagement state with offline support
3. **Event Mesh Tissue** — Internal domain event bus for CourseManagement
4. **Validation Tissue** — Enforces CourseManagement business rules

### Composition Invariants
- All tissues operate within the CourseManagement domain boundary
- No tissue may directly invoke another tissue's methods
- Cross-tissue communication uses the internal event mesh
- State mutations are coordinated through the command tissue

_Composition Doc Hash: 137510d8_
