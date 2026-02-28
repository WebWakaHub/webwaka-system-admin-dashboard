# ORG-CM-COMPOSITION_MODELER-v0.1.0 — P3-T03: Build Observability Hooks

## Metrics
| Metric | Type | Labels |
|--------|------|--------|
| composition.created.count | counter | name |
| composition.validated.count | counter | name, is_valid |
| composition.deployed.count | counter | name, environment |
| composition.validation.duration_ms | histogram | name |
| composition.dependency_resolution.duration_ms | histogram | organelle_count |

## Trace Spans
| Operation | Attributes |
|-----------|-----------|
| createComposition | name, organelle_count |
| validateComposition | composition_id, organelle_count |
| resolveDependencies | composition_id, node_count, edge_count |
| deployComposition | composition_id, environment |

## Structured Logs
| Level | Event | Context |
|-------|-------|---------|
| info | composition.created | composition_id, name |
| info | composition.validated | composition_id, is_valid, error_count |
| warn | composition.cycle_detected | composition_id, cycle_path |
| error | composition.validation_timeout | composition_id, elapsed_ms |
