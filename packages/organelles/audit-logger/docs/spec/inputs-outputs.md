# AuditLogger — Canonical Inputs & Outputs

## Input Ports

| Port | Type | Description |
|:-----|:-----|:------------|
| `command` | `AuditLoggerCommand` | Primary command input for state mutations |
| `query` | `AuditLoggerQuery` | Read-only query input for state inspection |
| `event` | `DomainEvent` | External event input for reactive processing |

## Output Ports

| Port | Type | Description |
|:-----|:-----|:------------|
| `result` | `AuditLoggerResult` | Command execution result |
| `event` | `AuditLoggerEvent` | Domain events emitted on state changes |
| `telemetry` | `TelemetryData` | Observability data for monitoring |
| `audit` | `AuditEntry` | Immutable audit trail entries |

## Data Contracts

All inputs and outputs are strongly typed using TypeScript interfaces.
Serialization format: JSON with schema validation.
