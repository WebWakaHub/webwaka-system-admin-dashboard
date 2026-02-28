# ORG-RG-GOVERNANCE_REGISTRY-v0.1.0 — P0-T03: Declare Invariants and Constraints

## Structural Invariants
- **INV-S01:** Every rule MUST have a globally unique rule_id (UUID v4)
- **INV-S02:** Every rule MUST have a semantic version string
- **INV-S03:** Constitutional articles MUST be immutable once ratified; changes require amendments
- **INV-S04:** All rule versions MUST be retained in immutable history

## Behavioral Invariants
- **INV-B01:** Rule state transitions MUST follow the defined FSM (DRAFT→ACTIVE→DEPRECATED→ARCHIVED)
- **INV-B02:** Constitutional amendments MUST achieve quorum (>50% of authorized signers)
- **INV-B03:** All state mutations MUST emit governance events
- **INV-B04:** Compliance queries MUST return deterministic results for the same input
- **INV-B05:** Rule deprecation MUST include a sunset date and reason

## Operational Constraints
| Constraint | Value |
|-----------|-------|
| Max rules per category | 500 |
| Max bindings per target | 100 |
| Amendment quorum threshold | 51% |
| Version history retention | Unlimited (immutable) |
| Query timeout | 3,000 ms |
