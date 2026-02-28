# PolicyDefinition — Canonical Inputs & Outputs

## Input Ports

| Port | Type | Description |
|:-----|:-----|:------------|
| `command` | `PolicyDefinitionCommand` | Primary command input for state mutations |
| `query` | `PolicyDefinitionQuery` | Read-only query input for state inspection |
| `event` | `DomainEvent` | External event input for reactive processing |

## Output Ports

| Port | Type | Description |
|:-----|:-----|:------------|
| `result` | `PolicyDefinitionResult` | Command execution result |
| `event` | `PolicyDefinitionEvent` | Domain events emitted on state changes |
| `telemetry` | `TelemetryData` | Observability data for monitoring |
| `audit` | `AuditEntry` | Immutable audit trail entries |

## Data Contracts

All inputs and outputs are strongly typed using TypeScript interfaces.
Serialization format: JSON with schema validation.
