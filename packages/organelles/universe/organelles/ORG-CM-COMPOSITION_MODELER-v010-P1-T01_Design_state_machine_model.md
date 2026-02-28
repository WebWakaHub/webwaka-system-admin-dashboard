# ORG-CM-COMPOSITION_MODELER-v0.1.0 — P1-T01: Design State Machine Model

## Composition Lifecycle States
| State | Description | Allowed Operations |
|-------|-------------|--------------------|
| DRAFT | Composition is being authored; mutable | add/remove organelles, connect ports, validate |
| VALIDATED | Composition passed all validation checks; immutable | deploy, archive, diff |
| DEPLOYED | Composition is active in a target environment | archive |
| ARCHIVED | Composition is retired; terminal state | read-only |

## State Transitions
| From | To | Trigger | Guards |
|------|----|---------|--------|
| DRAFT | VALIDATED | validate_success | All validation checks pass, no cycles, all ports compatible |
| DRAFT | DRAFT | modify | Composition is in DRAFT state |
| VALIDATED | DEPLOYED | deploy | Target environment is valid, no conflicts |
| VALIDATED | DRAFT | invalidate | Explicit revert to draft for modifications |
| DEPLOYED | ARCHIVED | archive | No active workflows depend on this composition |
| VALIDATED | ARCHIVED | archive | Explicit archival without deployment |

## Dependency Resolution Algorithm
1. Build adjacency list from connection_map
2. Perform topological sort (Kahn's algorithm)
3. If cycle detected → reject with CM-003
4. Validate each edge for port type compatibility
5. Return topological order for deployment sequencing
