# BoundaryContext — Canonical Inputs & Outputs

## Input Ports

| Port | Type | Description |
|:-----|:-----|:------------|
| `command` | `BoundaryContextCommand` | Primary command input |
| `query` | `BoundaryContextQuery` | Read-only query input |
| `event` | `DomainEvent` | External event input |

## Output Ports

| Port | Type | Description |
|:-----|:-----|:------------|
| `result` | `BoundaryContextResult` | Command execution result |
| `event` | `BoundaryContextEvent` | Domain events emitted |
| `telemetry` | `TelemetryData` | Observability data |
| `audit` | `AuditEntry` | Audit trail entries |
