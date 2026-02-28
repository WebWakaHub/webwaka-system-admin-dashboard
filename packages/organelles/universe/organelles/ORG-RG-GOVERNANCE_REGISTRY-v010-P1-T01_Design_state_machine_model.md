# ORG-RG-GOVERNANCE_REGISTRY-v0.1.0 — P1-T01: Design State Machine Model

## Rule Lifecycle States
| State | Description | Allowed Operations |
|-------|-------------|--------------------|
| DRAFT | Rule is being authored | edit, activate, delete |
| ACTIVE | Rule is enforced | deprecate, query |
| DEPRECATED | Rule is sunset-scheduled | archive, query (with warning) |
| ARCHIVED | Rule is retired; terminal | read-only |

## State Transitions
| From | To | Trigger | Guards |
|------|----|---------|--------|
| DRAFT | ACTIVE | activate | Rule passes schema validation |
| DRAFT | DRAFT | edit | Rule is in DRAFT state |
| ACTIVE | DEPRECATED | deprecate | Reason and sunset_date provided |
| DEPRECATED | ARCHIVED | archive | Sunset date has passed or explicit archive |
| ACTIVE | ARCHIVED | archive | Emergency archival with governance override |
