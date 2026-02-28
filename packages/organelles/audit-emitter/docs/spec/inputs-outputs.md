# AuditEmitter — Canonical Inputs & Outputs

## Input Ports

| Port | Type | Description |
|:-----|:-----|:------------|
| `command` | `AuditEmitterCommand` | Primary command input |
| `query` | `AuditEmitterQuery` | Read-only query input |
| `event` | `DomainEvent` | External event input |

## Output Ports

| Port | Type | Description |
|:-----|:-----|:------------|
| `result` | `AuditEmitterResult` | Command execution result |
| `event` | `AuditEmitterEvent` | Domain events emitted |
| `telemetry` | `TelemetryData` | Observability data |
| `audit` | `AuditEntry` | Audit trail entries |
