# ResourceRegistry — State Machine Design

**Cell:** CEL-RESOURCEREG-v0.1.0
**Category:** Resource & Asset Control

## 1. Cell States

| State | Description | Transitions |
|:------|:------------|:------------|
| `IDLE` | Cell is initialized and waiting for input | → VALIDATING |
| `VALIDATING` | Input is being validated by ResourceDiscovery | → PROCESSING, → ERROR |
| `PROCESSING` | Core logic executing via ResourceAllocator and ResourceReleaser | → COMPLETING, → ERROR |
| `COMPLETING` | Finalizing output and emitting events | → IDLE |
| `ERROR` | Error state with recovery options | → IDLE (retry), → DEAD_LETTER |
| `OFFLINE` | Operating in offline mode with local queue | → SYNCING |
| `SYNCING` | Replaying offline queue on reconnection | → IDLE, → ERROR |
| `DEAD_LETTER` | Unrecoverable error, requires manual intervention | → IDLE (manual) |

## 2. Transition Rules

```
IDLE → VALIDATING: on(input.command)
VALIDATING → PROCESSING: on(validation.passed)
VALIDATING → ERROR: on(validation.failed)
PROCESSING → COMPLETING: on(execution.success)
PROCESSING → ERROR: on(execution.failed)
COMPLETING → IDLE: on(output.emitted)
ERROR → IDLE: on(retry.requested) [max 3 retries]
ERROR → DEAD_LETTER: on(retries.exhausted)
IDLE → OFFLINE: on(network.lost)
OFFLINE → SYNCING: on(network.restored)
SYNCING → IDLE: on(sync.complete)
SYNCING → ERROR: on(sync.conflict)
```

## 3. Offline State Machine Extension

The offline state machine is a parallel track:
- All operations in OFFLINE state are queued to IndexedDB
- Queue entries include: operation, timestamp, sequence number, idempotency key
- On SYNCING, entries are replayed in sequence order
- Conflicts are resolved using vector clock comparison
