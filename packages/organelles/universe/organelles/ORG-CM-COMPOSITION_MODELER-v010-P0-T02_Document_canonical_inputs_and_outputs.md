# ORG-CM-COMPOSITION_MODELER-v0.1.0 — P0-T02: Document Canonical Inputs and Outputs

## Input Commands
| Command | Description | Required Fields |
|---------|-------------|-----------------|
| CreateCompositionCommand | Create a new composition manifest | name, version, organelle_refs[], connection_map[] |
| ValidateCompositionCommand | Validate a composition for structural correctness | composition_id |
| DeployCompositionCommand | Mark a validated composition as deployed | composition_id, target_environment |
| ArchiveCompositionCommand | Archive a deployed composition | composition_id |
| DiffCompositionsCommand | Compare two composition versions | composition_id_a, composition_id_b |
| AddOrganelleCommand | Add an organelle reference to a draft composition | composition_id, organelle_ref |
| RemoveOrganelleCommand | Remove an organelle from a draft composition | composition_id, organelle_id |
| ConnectPortsCommand | Connect two organelle ports within a composition | composition_id, source_port, target_port |

## Output Types
| Output | Description | Key Fields |
|--------|-------------|------------|
| CompositionSnapshot | Immutable snapshot of a validated composition | composition_id, version, organelle_graph, validation_result |
| ValidationResult | Result of composition validation | is_valid, errors[], warnings[], dependency_graph |
| CompositionDiff | Structured diff between two compositions | added[], removed[], modified[], connection_changes[] |
| DependencyGraph | Resolved dependency graph | nodes[], edges[], topological_order[] |

## Error Codes
| Code | Name | Description |
|------|------|-------------|
| CM-001 | COMPOSITION_NOT_FOUND | Composition ID does not exist |
| CM-002 | INVALID_MANIFEST | Composition manifest fails schema validation |
| CM-003 | CYCLE_DETECTED | Circular dependency detected in composition graph |
| CM-004 | PORT_INCOMPATIBLE | Connected ports have incompatible types |
| CM-005 | MISSING_PROVIDER | Required capability has no provider in composition |
| CM-006 | VERSION_CONFLICT | Incompatible version constraints between organelles |
| CM-007 | DUPLICATE_BINDING | Same port bound to multiple sources |
| CM-008 | COMPOSITION_LOCKED | Composition is not in DRAFT state for modification |
