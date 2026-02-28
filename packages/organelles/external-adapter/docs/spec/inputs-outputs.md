# ExternalAdapter — Canonical Inputs & Outputs

## Input Ports

| Port | Type | Description |
|:-----|:-----|:------------|
| `command` | `ExternalAdapterCommand` | Primary command input |
| `query` | `ExternalAdapterQuery` | Read-only query input |
| `event` | `DomainEvent` | External event input |

## Output Ports

| Port | Type | Description |
|:-----|:-----|:------------|
| `result` | `ExternalAdapterResult` | Command execution result |
| `event` | `ExternalAdapterEvent` | Domain events emitted |
| `telemetry` | `TelemetryData` | Observability data |
| `audit` | `AuditEntry` | Audit trail entries |
