# ResultValidator — State Machine Design

## States

| State | Description |
|:------|:------------|
| IDLE | Ready to accept commands |
| PROCESSING | Actively executing |
| COMPLETED | Execution successful |
| ERROR | Unrecoverable error |
| TERMINATED | Shut down |

## Transitions

```
IDLE → PROCESSING → COMPLETED → IDLE
PROCESSING → ERROR → IDLE
IDLE → TERMINATED
```
