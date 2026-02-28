# ResultValidator — Canonical Inputs & Outputs

## Input Ports

| Port | Type | Description |
|:-----|:-----|:------------|
| `command` | `ResultValidatorCommand` | Primary command input |
| `query` | `ResultValidatorQuery` | Read-only query input |
| `event` | `DomainEvent` | External event input |

## Output Ports

| Port | Type | Description |
|:-----|:-----|:------------|
| `result` | `ResultValidatorResult` | Command execution result |
| `event` | `ResultValidatorEvent` | Domain events emitted |
| `telemetry` | `TelemetryData` | Observability data |
| `audit` | `AuditEntry` | Audit trail entries |
