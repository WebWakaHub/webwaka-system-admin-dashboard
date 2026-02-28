# ORG-CM-COMPOSITION_MODELER-v0.1.0 — P5-T01: API Documentation

## CompositionManagement Port API

### createComposition(cmd: CreateCompositionCommand): Promise<CompositionSnapshot>
Creates a new composition in DRAFT state.
- **Parameters:** name (string), version (string), organelle_refs (OrganelleRef[]), connection_map (Connection[])
- **Returns:** CompositionSnapshot with composition_id
- **Errors:** CM-002 (invalid manifest), CM-003 (cycle), CM-004 (port incompatible)

### validateComposition(cmd: ValidateCompositionCommand): Promise<ValidationResult>
Validates a DRAFT composition and transitions to VALIDATED if all checks pass.
- **Parameters:** composition_id (string)
- **Returns:** ValidationResult with is_valid, errors[], warnings[]
- **Errors:** CM-001 (not found), CM-008 (not in DRAFT)

### deployComposition(cmd: DeployCompositionCommand): Promise<CompositionSnapshot>
Deploys a VALIDATED composition to a target environment.
- **Parameters:** composition_id (string), target_environment (string)
- **Returns:** Updated CompositionSnapshot
- **Errors:** CM-001 (not found), CM-008 (not in VALIDATED state)

### archiveComposition(cmd: ArchiveCompositionCommand): Promise<void>
Archives a VALIDATED or DEPLOYED composition (terminal state).
- **Parameters:** composition_id (string)
- **Errors:** CM-001 (not found), CM-008 (already archived)

### diffCompositions(cmd: DiffCompositionsCommand): Promise<CompositionDiff>
Compares two composition versions and returns structured diff.
- **Parameters:** composition_id_a (string), composition_id_b (string)
- **Returns:** CompositionDiff with added[], removed[], modified[]
