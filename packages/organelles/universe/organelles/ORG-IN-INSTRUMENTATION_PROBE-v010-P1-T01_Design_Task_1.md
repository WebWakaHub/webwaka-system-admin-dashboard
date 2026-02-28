# [ORG-IN-INSTRUMENTATION_PROBE-v0.1.0-P1-T01] Design Task 1 — State Machine Model

**Structure:** ORG-IN-INSTRUMENTATION_PROBE-v0.1.0
**Layer:** Organelle
**Issue:** webwaka-organelle-universe#471
**Repository:** WebWakaHub/webwaka-organelle-universe
**Type:** Design
**Phase:** P1 — Design | Task: T01
**Executing Agent:** webwakaagent3 (Architecture & System Design)
**Depends On:** #466 (P0 Phase — Specification Complete)
**Unblocks:** #472 (P1-T02 — Interface Contracts)

---

## 1. State Machine Architecture

The Instrumentation Probe state machine governs the lifecycle of every probe instance from creation through shutdown. The design follows a deterministic finite automaton (DFA) pattern with explicit guard conditions on every transition.

### 1.1 State Definitions

| State | Entry Condition | Behavior | Exit Condition |
|:---|:---|:---|:---|
| `UNINITIALIZED` | Probe constructor called | No telemetry operations permitted. Configuration object is empty. | `initialize()` called with valid `ProbeConfig` |
| `INITIALIZING` | `initialize()` invoked | Validates config, resolves telemetry backend port, registers metrics. Timeout: 100ms (INV-IN-P01). | Backend resolved → ACTIVE; Backend unreachable → DEGRADED |
| `ACTIVE` | Backend connection established | Full telemetry emission: metrics flushed at `emissionInterval`, traces emitted per-operation, health checks at `healthCheckInterval`. | Backend fails → DEGRADED; `shutdown()` called → DRAINING |
| `DEGRADED` | Backend unreachable or emission failure | Telemetry buffered to `IOfflineBufferPort`. Health status reports DEGRADED. Circuit breaker OPEN on emission path. | Backend recovers → ACTIVE; `shutdown()` called → DRAINING |
| `DRAINING` | `shutdown()` called | Flushes remaining buffer (best-effort, 5s timeout). No new telemetry accepted. | Buffer flushed or timeout → SHUTDOWN |
| `SHUTDOWN` | Drain complete or timeout | All resources released. Probe instance is terminal and cannot be restarted. | (terminal state) |

### 1.2 Transition Table

| From | To | Trigger | Guard | Side Effect |
|:---|:---|:---|:---|:---|
| UNINITIALIZED | INITIALIZING | `initialize(config)` | config is valid `ProbeConfig` | Emit `probe.lifecycle.initializing` log |
| INITIALIZING | ACTIVE | Backend resolved | Resolution < 100ms | Register all metrics, start health timer |
| INITIALIZING | DEGRADED | Backend timeout | Resolution >= 100ms | Activate offline buffer, open circuit breaker |
| ACTIVE | DEGRADED | Emission failure | 3 consecutive failures | Open circuit breaker, switch to buffer |
| ACTIVE | DRAINING | `shutdown()` | None | Stop accepting new operations |
| DEGRADED | ACTIVE | Backend recovery | Health check succeeds | Close circuit breaker, flush buffer |
| DEGRADED | DRAINING | `shutdown()` | None | Stop accepting new operations |
| DRAINING | SHUTDOWN | Buffer flushed or 5s timeout | None | Release all resources |

### 1.3 Invalid Transitions

The following transitions are explicitly prohibited and MUST throw `InvalidStateTransitionError`:

| From | To | Reason |
|:---|:---|:---|
| UNINITIALIZED | ACTIVE | Must go through INITIALIZING |
| SHUTDOWN | Any | Terminal state, no recovery |
| DRAINING | ACTIVE | Cannot cancel shutdown |
| DRAINING | DEGRADED | Cannot change mode during drain |

---

## 2. Concurrency Model

The Instrumentation Probe is designed for single-threaded execution within the JavaScript event loop. Concurrency is managed through the following patterns:

### 2.1 Emission Queue

Telemetry events are placed into a bounded async queue (`maxDepth: 1000` events). The queue is drained on a timer (`emissionInterval`). If the queue reaches capacity, the oldest events are evicted (FIFO) and a `BUFFER_OVERFLOW` metric is incremented.

### 2.2 Health Check Timer

Health checks run on a separate `setInterval` timer that does not block the emission queue. Health check results are cached for `healthCheckInterval` duration to avoid redundant probing.

### 2.3 Circuit Breaker Pattern

The emission path uses a circuit breaker with the following parameters:

| Parameter | Value | Description |
|:---|:---|:---|
| Failure threshold | 3 | Consecutive failures before OPEN |
| Recovery timeout | 30s | Time before attempting HALF-OPEN |
| Success threshold | 2 | Consecutive successes to close circuit |
| Half-open max attempts | 1 | Concurrent requests allowed in HALF-OPEN |

---

## 3. Memory Model

The probe's memory footprint is bounded by the following allocations:

| Component | Max Size | Eviction Policy |
|:---|:---|:---|
| Metric registry | 500 metrics | LRU eviction of least-accessed metrics |
| Emission queue | 1000 events | FIFO eviction when full |
| Offline buffer | 10MB (configurable) | Oldest-first eviction |
| Span context cache | 100 active spans | Auto-expire after 5 minutes |
| Health check cache | 1 entry | Overwrite on each check |

Total steady-state memory: < 5MB (INV-IN-P04).

---

## 4. Error Recovery Flows

### 4.1 Backend Failure Recovery

```
ACTIVE → emission fails → increment failure count
  → failure count >= 3 → DEGRADED (circuit OPEN)
  → start recovery timer (30s)
  → timer fires → circuit HALF-OPEN
  → attempt single emission
    → success → circuit CLOSED → ACTIVE (flush buffer)
    → failure → circuit OPEN → restart timer
```

### 4.2 Initialization Failure Recovery

```
INITIALIZING → backend resolution timeout
  → DEGRADED (offline mode)
  → retry resolution every 60s
  → resolution succeeds → ACTIVE
  → 3 consecutive resolution failures → remain DEGRADED, log warning
```

---

## 5. Execution Metadata

**Executed by:** webwakaagent3 (Architecture & System Design Department)
**Agent PAT:** webwakaagent3-specific PAT used for all operations
**Date:** 2026-02-26
**Protocol:** WebWaka Autonomous Execution Protocol (Steps 1-8)
**Constitutional Compliance:** Verified against all 8 core doctrines
**Status:** COMPLETE
