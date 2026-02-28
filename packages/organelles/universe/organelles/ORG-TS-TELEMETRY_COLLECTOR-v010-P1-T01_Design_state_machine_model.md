# ORG-TS-TELEMETRY_COLLECTOR-v0.1.0 — State Machine Model

## Collector States
| State | Description | Terminal |
|-------|-------------|----------|
| INITIALIZING | Collector starting, loading configuration | No |
| COLLECTING | Actively accepting and buffering signals | No |
| FLUSHING | Actively forwarding buffered signals to sinks | No |
| BACKPRESSURE | Buffer threshold exceeded, rejecting new signals | No |
| DRAINING | Graceful shutdown, flushing remaining signals | No |
| STOPPED | Collector stopped, no signals accepted | Yes |

## State Transitions
| From | To | Trigger | Guards |
|------|----|---------|--------|
| INITIALIZING | COLLECTING | Configuration loaded | All sinks validated |
| COLLECTING | FLUSHING | Flush interval elapsed OR manual flush | Buffer non-empty |
| FLUSHING | COLLECTING | Flush complete | All signals forwarded |
| COLLECTING | BACKPRESSURE | Buffer > 80% capacity | Capacity threshold exceeded |
| BACKPRESSURE | COLLECTING | Buffer < 60% capacity | Drain below threshold |
| COLLECTING | DRAINING | Shutdown signal received | — |
| BACKPRESSURE | DRAINING | Shutdown signal received | — |
| DRAINING | STOPPED | All buffered signals flushed | Buffer empty |

## Sink States
| State | Description |
|-------|-------------|
| CONNECTED | Sink is reachable and accepting signals |
| DEGRADED | Sink is slow, retry backoff active |
| DISCONNECTED | Sink is unreachable |
