# ORG-LG-AUDIT_LOGGER-v0.1.0 — State Machine Model

## Logger States
| State | Description | Terminal |
|-------|-------------|----------|
| INITIALIZING | Loading configuration, verifying last hash | No |
| ACTIVE | Accepting and recording audit events | No |
| VERIFYING | Running integrity verification | No |
| ROTATING | Performing log rotation | No |
| EXPORTING | Generating audit trail export | No |
| STOPPED | Logger stopped, no events accepted | Yes |

## State Transitions
| From | To | Trigger | Guards |
|------|----|---------|--------|
| INITIALIZING | ACTIVE | Config loaded, last hash verified | Hash chain valid |
| ACTIVE | VERIFYING | Verification requested | — |
| VERIFYING | ACTIVE | Verification complete | — |
| ACTIVE | ROTATING | Rotation triggered | — |
| ROTATING | ACTIVE | Rotation complete | New log initialized |
| ACTIVE | EXPORTING | Export requested | — |
| EXPORTING | ACTIVE | Export complete | — |
| ACTIVE | STOPPED | Shutdown signal | Pending writes flushed |
