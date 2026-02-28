# ResourceRegistry — Inputs & Outputs Specification

**Cell:** CEL-RESOURCEREG-v0.1.0
**Category:** Resource & Asset Control

## 1. Input Ports

| Port | Type | Source | Description |
|:-----|:-----|:-------|:------------|
| `input.command` | `ResourceRegistryCommand` | External caller | Primary command/request payload |
| `input.context` | `ExecutionContext` | Runtime | Execution context with identity, tenant, locale |
| `input.config` | `ResourceRegistryConfig` | Configuration store | Cell-specific configuration |
| `input.offlineQueue` | `OfflineQueueEntry[]` | IndexedDB | Queued operations from offline state |

## 2. Output Ports

| Port | Type | Destination | Description |
|:-----|:-----|:------------|:------------|
| `output.result` | `ResourceRegistryResult` | Caller | Processed result payload |
| `output.events` | `DomainEvent[]` | Event bus | Events emitted during processing |
| `output.metrics` | `CellMetric[]` | Telemetry | Performance and health metrics |
| `output.auditLog` | `AuditEntry[]` | Audit store | Compliance audit trail |

## 3. Error Ports

| Port | Type | Description |
|:-----|:-----|:------------|
| `error.validation` | `ValidationError` | Input validation failures |
| `error.execution` | `ExecutionError` | Processing failures |
| `error.timeout` | `TimeoutError` | Operation timeout (network-aware for Nigeria) |
| `error.offline` | `OfflineError` | Offline fallback triggered |

## 4. Offline-First Data Flow

When offline, all inputs are queued to IndexedDB. On reconnection:
1. Queue is replayed in FIFO order
2. Conflict resolution applies (last-write-wins with vector clocks)
3. Sync confirmation emitted via `output.events`
