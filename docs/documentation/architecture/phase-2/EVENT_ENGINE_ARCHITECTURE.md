# Event Engine Architecture — Phase 2 Detailed Design

**Document Type:** Phase 2 Architecture Specification  
**Task ID:** WA3-P2-002  
**Department:** Architecture & System Design  
**Owning Agent:** webwakaagent3  
**Status:** DRAFT  
**Authority:** FD-2026-001, WEBWAKA_CANONICAL_EXECUTION_SEQUENCE.md  
**Phase 1 Reference:** WEBWAKA_EVENT_DRIVEN_ARCHITECTURE_SPECIFICATION.md  
**Version:** 1.0  
**Date:** 2026-02-06  
**Scope:** Detailed architecture for the Event Engine including event sourcing, message queuing, real-time communication, and event-driven integration patterns  
**GitHub Issue:** [WA3-P2-002](https://github.com/WebWakaHub/webwaka-governance/issues/2)  
**Input Dependencies:** WA3-P2-001 (Identity System Architecture)

---

## 1. Executive Summary

This document provides the detailed architecture and design for the WebWaka Event Engine, the central nervous system of the platform. The Event Engine enables all cross-component communication through asynchronous, event-driven patterns, supporting loose coupling, offline operation, real-time synchronization, and comprehensive audit trails.

Building on the Phase 1 conceptual architecture (WEBWAKA_EVENT_DRIVEN_ARCHITECTURE_SPECIFICATION.md), this specification defines the concrete event bus topology, event schemas, delivery guarantees, routing mechanisms, and integration patterns required for implementation.

The design adheres to the principles of loose coupling and high cohesion, ensuring that platform components can evolve independently while maintaining system coherence.

---

## 2. Architecture Overview

### 2.1 System Context

The Event Engine sits at the core of the WebWaka platform, mediating all cross-service communication. No service communicates directly with another service; all communication flows through the Event Engine.

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Identity   │  │  Commerce   │  │  Inventory  │  │  Analytics  │
│  Service    │  │  Service    │  │  Service    │  │  Service    │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       │                │                │                │
       ▼                ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        EVENT ENGINE                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │  Event   │  │  Event   │  │  Event   │  │   Event      │   │
│  │  Bus     │  │  Store   │  │  Router  │  │   Processor  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────────────┐ │
│  │  Dead    │  │  Replay  │  │  Real-Time WebSocket Gateway │ │
│  │  Letter  │  │  Engine  │  │                              │ │
│  │  Queue   │  │          │  │                              │ │
│  └──────────┘  └──────────┘  └──────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
       │                │                │                │
       ▼                ▼                ▼                ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Offline    │  │  Notification│  │  Webhook    │  │  Audit      │
│  Sync Queue │  │  Service    │  │  Dispatcher │  │  Log        │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

### 2.2 Design Principles

1. **All Communication is Event-Based:** No direct service-to-service calls. All cross-boundary communication uses events.
2. **Loose Coupling:** Publishers do not know about subscribers. Subscribers do not know about publishers.
3. **High Cohesion:** Events are organized by domain (identity, commerce, inventory, etc.) with clear ownership.
4. **At-Least-Once Delivery:** Events are guaranteed to be delivered at least once. Consumers must be idempotent.
5. **Ordered Within Partition:** Events for the same aggregate (e.g., same order, same user) are delivered in order.
6. **Immutable Event Log:** Events are never modified or deleted. The event log is the source of truth.
7. **Offline-Compatible:** Events can be queued locally and synced when connectivity returns.

---

## 3. Event Bus Architecture

### 3.1 Technology Selection

The Event Engine uses a tiered message infrastructure:

| Tier | Technology | Purpose | Use Case |
|------|-----------|---------|----------|
| **Core Bus** | Apache Kafka | High-throughput, ordered event streaming | All domain events |
| **Task Queue** | Redis Streams | Lightweight task distribution | Background jobs, notifications |
| **Real-Time** | WebSocket (Socket.IO) | Bidirectional real-time communication | Live updates, chat |
| **Local Queue** | IndexedDB / SQLite | Offline event queuing on client | Offline-first support |

### 3.2 Kafka Topic Design

Events are organized into Kafka topics by domain, with partitioning by aggregate ID to ensure ordering:

```
webwaka.identity.actors          -- Actor lifecycle events
webwaka.identity.auth            -- Authentication events
webwaka.identity.delegations     -- Delegation events
webwaka.commerce.orders          -- Order lifecycle events
webwaka.commerce.payments        -- Payment events
webwaka.inventory.stock          -- Stock change events
webwaka.inventory.transfers      -- Stock transfer events
webwaka.notifications.outbound   -- Notification dispatch events
webwaka.audit.trail              -- Audit log events (high-retention)
webwaka.sync.upstream            -- Client-to-server sync events
webwaka.sync.downstream          -- Server-to-client sync events
webwaka.dlq.<original_topic>     -- Dead letter queues per topic
```

**Partitioning Strategy:**
- Identity events: Partitioned by `actor_id`
- Commerce events: Partitioned by `order_id`
- Inventory events: Partitioned by `location_id`
- Sync events: Partitioned by `device_id`

**Retention Policy:**
- Domain events: 30 days (configurable)
- Audit events: 7 years (compliance requirement)
- Sync events: 7 days
- Dead letter events: 90 days

### 3.3 Consumer Group Design

Each service maintains its own consumer group, ensuring independent processing:

```
Consumer Group: identity-service
  ├── Subscribes to: webwaka.commerce.orders (for user context)
  └── Subscribes to: webwaka.sync.upstream (for offline identity sync)

Consumer Group: commerce-service
  ├── Subscribes to: webwaka.identity.actors (for user lifecycle)
  ├── Subscribes to: webwaka.inventory.stock (for stock checks)
  └── Subscribes to: webwaka.sync.upstream (for offline order sync)

Consumer Group: analytics-service
  ├── Subscribes to: webwaka.identity.* (all identity events)
  ├── Subscribes to: webwaka.commerce.* (all commerce events)
  └── Subscribes to: webwaka.inventory.* (all inventory events)

Consumer Group: notification-service
  ├── Subscribes to: webwaka.identity.auth (login alerts)
  ├── Subscribes to: webwaka.commerce.orders (order notifications)
  └── Subscribes to: webwaka.notifications.outbound (dispatch)
```

---

## 4. Event Schema Design

### 4.1 Universal Event Envelope

Every event in the system follows a universal envelope schema:

```json
{
  "event_id": "evt_01HQXYZ...",
  "event_type": "domain.aggregate.action",
  "version": 1,
  "timestamp": "2026-02-06T08:00:00.000Z",
  "source": "service-name",
  "correlation_id": "cor_01HQXYZ...",
  "causation_id": "evt_01HQABC... | null",
  "actor_id": "uid_01HR...",
  "tenant_id": "uid_01HR...",
  "partition_key": "string",
  "payload": { },
  "metadata": {
    "schema_version": "1.0",
    "content_type": "application/json",
    "encoding": "utf-8",
    "offline_origin": false,
    "device_id": "dev_01HQ... | null",
    "sync_checkpoint": "2026-02-06T08:00:00Z | null"
  }
}
```

### 4.2 Event Type Taxonomy

Events follow a three-level naming convention: `<domain>.<aggregate>.<action>`

| Domain | Aggregate | Actions | Example |
|--------|-----------|---------|---------|
| identity | actors | created, updated, status_changed, deleted | `identity.actors.created` |
| identity | auth | login, logout, failed, token_refreshed | `identity.auth.login` |
| identity | delegations | created, revoked, expired | `identity.delegations.created` |
| commerce | orders | created, confirmed, fulfilled, cancelled | `commerce.orders.created` |
| commerce | payments | initiated, completed, failed, refunded | `commerce.payments.completed` |
| inventory | stock | adjusted, transferred, counted | `inventory.stock.adjusted` |
| sync | upstream | batch_received, conflict_detected, resolved | `sync.upstream.batch_received` |
| sync | downstream | batch_prepared, delivered, acknowledged | `sync.downstream.delivered` |

### 4.3 Schema Registry

All event schemas are registered in a central Schema Registry to ensure compatibility:

- **Schema Format:** JSON Schema (Draft 2020-12)
- **Compatibility Mode:** BACKWARD (new schemas can read old events)
- **Schema Evolution Rules:**
  - New optional fields may be added
  - Required fields may not be removed
  - Field types may not be changed
  - Enum values may be added but not removed
- **Schema Versioning:** Semantic versioning (major.minor)

---

## 5. Event Processing Patterns

### 5.1 Event Sourcing

For critical aggregates (orders, payments, inventory), the Event Engine supports event sourcing — the aggregate state is derived entirely from the event log.

**Event Sourcing Flow:**
```
Command ──▶ Validate ──▶ Emit Event ──▶ Update Projection ──▶ Acknowledge
                                              │
                                              ▼
                                     Materialized View
                                     (Read Model)
```

**Benefits for WebWaka:**
- Complete audit trail (every state change is an event)
- Offline conflict resolution (replay events to resolve)
- Time-travel debugging (reconstruct state at any point)
- Event replay for analytics and reporting

### 5.2 CQRS (Command Query Responsibility Segregation)

The Event Engine supports CQRS for high-read, low-write scenarios:

- **Command Side:** Validates commands, emits events, writes to event log
- **Query Side:** Maintains materialized views, optimized for reads
- **Sync:** Event processors update materialized views asynchronously

### 5.3 Saga Pattern

For multi-step business processes that span multiple services, the Event Engine supports the Saga pattern:

**Example: Order Fulfillment Saga**
```
1. commerce.orders.created
   └──▶ inventory-service: Reserve stock
        └──▶ inventory.stock.reserved
             └──▶ commerce-service: Confirm order
                  └──▶ commerce.orders.confirmed
                       └──▶ notification-service: Notify customer
                            └──▶ notifications.outbound.sent

Compensation (if stock reservation fails):
   inventory.stock.reservation_failed
   └──▶ commerce-service: Cancel order
        └──▶ commerce.orders.cancelled
             └──▶ notification-service: Notify customer
```

**Saga Orchestrator:**
- Tracks saga state in a dedicated saga store
- Handles timeouts and compensation
- Emits saga lifecycle events for monitoring
- Supports both choreography (event-driven) and orchestration (centralized) patterns

### 5.4 Dead Letter Queue (DLQ)

Events that fail processing after maximum retries are routed to a Dead Letter Queue:

- **Retry Policy:** 3 retries with exponential backoff (1s, 5s, 30s)
- **DLQ Routing:** Failed events routed to `webwaka.dlq.<original_topic>`
- **DLQ Monitoring:** Alerts triggered when DLQ depth exceeds threshold
- **DLQ Replay:** Manual or automated replay of DLQ events after fix

---

## 6. Real-Time Communication

### 6.1 WebSocket Gateway

The Event Engine includes a WebSocket Gateway for real-time, bidirectional communication with clients:

```
Client (Mobile/Web)
       │
       │ WebSocket (Socket.IO)
       ▼
┌─────────────────────────┐
│   WebSocket Gateway     │
│  ┌───────────────────┐  │
│  │  Connection Mgr   │  │
│  │  (auth, heartbeat)│  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │  Room/Channel Mgr │  │
│  │  (tenant isolation)│  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │  Event Bridge     │  │
│  │  (Kafka ↔ WS)     │  │
│  └───────────────────┘  │
└─────────────────────────┘
```

### 6.2 Channel Design

Real-time channels are organized by tenant and resource:

```
tenant:{tenant_id}:orders          -- Order updates for tenant
tenant:{tenant_id}:inventory       -- Inventory updates for tenant
tenant:{tenant_id}:notifications   -- Notifications for tenant
user:{actor_id}:personal           -- Personal notifications
admin:platform:health              -- Platform health (admin only)
```

### 6.3 Connection Management

- **Authentication:** WebSocket connections require a valid access token
- **Heartbeat:** 30-second ping/pong interval
- **Reconnection:** Automatic reconnection with exponential backoff
- **Offline Transition:** When WebSocket disconnects, client switches to offline queue
- **Catch-Up:** On reconnection, client receives missed events since last checkpoint

---

## 7. Offline Event Queuing

### 7.1 Client-Side Event Queue

When the client is offline, events are queued locally:

```
┌─────────────────────────────────────────┐
│           Client Device                  │
│  ┌─────────────────────────────────┐    │
│  │       Local Event Queue          │    │
│  │  (IndexedDB / SQLite)            │    │
│  │                                  │    │
│  │  ┌──────────────────────────┐   │    │
│  │  │ Pending Events (outbound) │   │    │
│  │  │ - event_id               │   │    │
│  │  │ - event_type             │   │    │
│  │  │ - payload                │   │    │
│  │  │ - created_at (local)     │   │    │
│  │  │ - sync_status: pending   │   │    │
│  │  └──────────────────────────┘   │    │
│  │                                  │    │
│  │  ┌──────────────────────────┐   │    │
│  │  │ Received Events (inbound) │   │    │
│  │  │ - last_checkpoint        │   │    │
│  │  │ - event_log (local copy) │   │    │
│  │  └──────────────────────────┘   │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

### 7.2 Sync Protocol

When connectivity returns, the client syncs with the server:

1. **Upstream Sync:** Client sends pending outbound events as a batch
2. **Server Validation:** Server validates each event, checks for conflicts
3. **Conflict Resolution:** Conflicts resolved per Offline-First Architecture rules
4. **Downstream Sync:** Server sends missed events since last checkpoint
5. **Checkpoint Update:** Client updates its sync checkpoint

**Sync Batch Format:**
```json
{
  "device_id": "dev_01HQ...",
  "actor_id": "uid_01HR...",
  "last_checkpoint": "2026-02-06T08:00:00Z",
  "events": [
    { "event_id": "evt_local_001", "event_type": "...", "payload": {} },
    { "event_id": "evt_local_002", "event_type": "...", "payload": {} }
  ],
  "batch_id": "batch_01HQ...",
  "compression": "gzip"
}
```

---

## 8. Event Routing and Filtering

### 8.1 Routing Rules

The Event Router applies rules to determine which consumers receive which events:

| Rule Type | Description | Example |
|-----------|-------------|---------|
| **Topic-Based** | Subscribe to entire topic | `webwaka.commerce.orders` |
| **Type-Based** | Filter by event type | `commerce.orders.created` only |
| **Tenant-Based** | Filter by tenant ID | Events for tenant `uid_01HR...` only |
| **Content-Based** | Filter by payload content | Orders with `amount > 100000` |

### 8.2 Event Enrichment

The Event Processor can enrich events before delivery:

- **Actor Enrichment:** Add actor display name and role to identity events
- **Tenant Context:** Add tenant configuration to tenant-scoped events
- **Geo-Location:** Add location data to location-relevant events
- **Timestamp Normalization:** Convert all timestamps to UTC

---

## 9. Monitoring and Observability

### 9.1 Metrics

| Metric | Description | Alert Threshold |
|--------|-------------|-----------------|
| `event.published.rate` | Events published per second | > 10,000/s (capacity warning) |
| `event.consumed.rate` | Events consumed per second | < published rate (lag warning) |
| `event.consumer.lag` | Consumer lag (events behind) | > 1000 events |
| `event.processing.latency` | Time from publish to consume | > 5 seconds (p95) |
| `event.dlq.depth` | Dead letter queue depth | > 100 events |
| `event.sync.pending` | Pending offline sync events | > 10,000 per device |
| `websocket.connections` | Active WebSocket connections | > 80% capacity |

### 9.2 Distributed Tracing

- All events carry `correlation_id` for end-to-end tracing
- `causation_id` links events in a causal chain
- Traces are exported to observability platform (OpenTelemetry)

---

## 10. Security

### 10.1 Event Security

- **Authentication:** All event publishers must present a valid service token
- **Authorization:** Publishers can only emit events for their domain
- **Encryption:** Events encrypted in transit (TLS 1.3) and at rest (AES-256)
- **Tenant Isolation:** Events are tenant-scoped; cross-tenant access is forbidden
- **PII Handling:** Events containing PII are flagged and subject to retention policies

### 10.2 WebSocket Security

- **Token-Based Auth:** WebSocket connections require valid JWT
- **Channel Authorization:** Clients can only subscribe to channels they are authorized for
- **Rate Limiting:** 100 messages per second per connection
- **Message Size Limit:** 64KB per message

---

## 11. Scalability and Performance

### 11.1 Performance Targets

| Operation | Target | Notes |
|-----------|--------|-------|
| Event publish latency | < 10ms (p95) | From API to Kafka acknowledgment |
| Event delivery latency | < 100ms (p95) | From publish to consumer delivery |
| WebSocket message latency | < 50ms (p95) | From event to client delivery |
| Throughput | 10,000 events/s | Per Kafka partition |
| Offline sync batch | < 5s for 1000 events | Including conflict resolution |

### 11.2 Scaling Strategy

- **Kafka:** Horizontal scaling via partition increase (start with 12 partitions per topic)
- **WebSocket Gateway:** Horizontal scaling with sticky sessions (Redis adapter for Socket.IO)
- **Event Processors:** Horizontal scaling via consumer group rebalancing
- **Event Store:** PostgreSQL with time-based partitioning for audit events

---

## 12. Dependencies

| Dependency | Type | Purpose |
|-----------|------|---------|
| Identity System (WA3-P2-001) | Internal | Actor authentication for event publishing |
| Offline-First Architecture (WA3-P2-003) | Internal | Offline event queuing and sync |
| Apache Kafka 3.6+ | External | Core event bus |
| Redis 7+ | External | Task queue, WebSocket adapter |
| PostgreSQL 15+ | External | Event store (audit), saga store |
| Socket.IO 4+ | External | WebSocket gateway |

---

## 13. Open Questions and Decisions

| # | Question | Proposed Answer | Status |
|---|----------|----------------|--------|
| 1 | Kafka vs. NATS for core bus? | Kafka (maturity, ecosystem, ordering guarantees) | DECIDED |
| 2 | Event schema format? | JSON Schema with registry | DECIDED |
| 3 | Maximum event payload size? | 1MB (larger payloads use reference pattern) | DECIDED |
| 4 | Exactly-once vs. at-least-once? | At-least-once with idempotent consumers | DECIDED |
| 5 | Multi-region event replication? | Defer to Phase 3 | DEFERRED |

---

## Document Attribution

**Produced by:** webwakaagent3 (Architecture & System Design)  
**Department:** Architecture & System Design  
**Phase:** Phase 2 — Implementation & Infrastructure  
**Milestone:** Milestone 4 — Integration & Optimization  
**Date:** 2026-02-06  
**Authority:** FD-2026-001, WEBWAKA_CANONICAL_EXECUTION_SEQUENCE.md  
**Review Required By:** Chief of Staff (webwakaagent1)
