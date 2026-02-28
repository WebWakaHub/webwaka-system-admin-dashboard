# InstrumentationProbe — Canonical Inputs & Outputs

## Input Ports

| Port | Type | Description |
|:-----|:-----|:------------|
| `command` | `InstrumentationProbeCommand` | Primary command input |
| `query` | `InstrumentationProbeQuery` | Read-only query input |
| `event` | `DomainEvent` | External event input |

## Output Ports

| Port | Type | Description |
|:-----|:-----|:------------|
| `result` | `InstrumentationProbeResult` | Command execution result |
| `event` | `InstrumentationProbeEvent` | Domain events emitted |
| `telemetry` | `TelemetryData` | Observability data |
| `audit` | `AuditEntry` | Audit trail entries |
