# DiscoveryRegistry — Canonical Inputs & Outputs

## Input Ports

| Port | Type | Description |
|:-----|:-----|:------------|
| `command` | `DiscoveryRegistryCommand` | Primary command input for state mutations |
| `query` | `DiscoveryRegistryQuery` | Read-only query input for state inspection |
| `event` | `DomainEvent` | External event input for reactive processing |

## Output Ports

| Port | Type | Description |
|:-----|:-----|:------------|
| `result` | `DiscoveryRegistryResult` | Command execution result |
| `event` | `DiscoveryRegistryEvent` | Domain events emitted on state changes |
| `telemetry` | `TelemetryData` | Observability data for monitoring |
| `audit` | `AuditEntry` | Immutable audit trail entries |

## Data Contracts

All inputs and outputs are strongly typed using TypeScript interfaces.
Serialization format: JSON with schema validation.
