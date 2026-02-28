# Event System Specification

**Module ID:** Module 3  
**Module Name:** Event System  
**Version:** 1.0  
**Date:** 2026-02-09  
**Status:** DRAFT  
**Author:** webwakaagent3 (Architecture)  
**Reviewers:** webwakaagent4 (Engineering), webwakaagent5 (Quality)

---

## 1. Module Overview

### 1.1 Purpose

The Event System is the central nervous system of the WebWaka platform, providing a scalable and reliable infrastructure for asynchronous communication between modules and services. It is designed to ensure that all state changes within the platform are captured as events and broadcast to interested subscribers, enabling real-time functionality, auditability, and loose coupling between components. This module is a direct implementation of the **Event-Driven** architectural invariant.

### 1.2 Scope

**In Scope:**
- Definition of a standardized event structure and payload format.
- An in-memory event bus for development and testing environments.
- A production-ready, scalable event bus using NATS.
- Mechanisms for subscribing to specific events or topics.
- Guaranteed event delivery (at-least-once semantics).
- Event persistence for auditability and replay.
- Tenant-scoped event broadcasting to ensure data isolation.

**Out of Scope:**
- The business logic of event producers and consumers (which reside in other modules).
- Long-term event storage for analytics (this will be handled by the Data & Analytics module).
- User-facing event stream UIs (to be built by the appropriate frontend modules).

### 1.3 Success Criteria

- [ ] All module-to-module communication is decoupled via the Event System.
- [ ] The system can process at least 10,000 events per second per tenant.
- [ ] Event delivery latency is under 100ms in 99% of cases.
- [ ] All events are persisted and auditable, fulfilling the Audit-Ready invariant.
- [ ] The system supports both an in-memory version for local development and a production-grade NATS implementation.

---

## 2. Requirements

### 2.1 Functional Requirements

**FR-1:** Event Publishing
- **Description:** The system must provide a mechanism for any module or service to publish events to the event bus. This is fundamental to the Event-Driven invariant.
- **Priority:** MUST
- **Acceptance Criteria:**
  - [ ] An API is available for publishing events with a defined payload structure.
  - [ ] Published events are immediately available to the event bus for routing.
  - [ ] The publisher receives a confirmation that the event has been accepted by the bus.

**FR-2:** Event Subscribing
- **Description:** The system must allow modules to subscribe to specific event types or topics (e.g., `user.created`, `order.placed`).
- **Priority:** MUST
- **Acceptance Criteria:**
  - [ ] An API is available for subscribing to one or more event types.
  - [ ] Subscribers receive events that match their subscription criteria.
  - [ ] The system supports wildcard subscriptions (e.g., `user.*`).

**FR-3:** At-Least-Once Delivery
- **Description:** The system must guarantee that a subscribed consumer receives a published event at least once. This ensures reliability even in the case of transient failures.
- **Priority:** MUST
- **Acceptance Criteria:**
  - [ ] Events are persisted before being delivered to consumers.
  - [ ] Acknowledgment mechanism is in place to confirm event processing by the consumer.
  - [ ] Unacknowledged events are redelivered automatically.

**FR-4:** Event Persistence and Auditability
- **Description:** All events must be durably persisted to a data store. This is critical for the Audit-Ready invariant, allowing for a complete historical record of all state changes.
- **Priority:** MUST
- **Acceptance Criteria:**
  - [ ] All events are written to a persistent log (e.g., NATS JetStream).
  - [ ] Events in the log are immutable.
  - [ ] An API is available to query and replay events from the log for a specific tenant.

**FR-5:** Tenant Isolation
- **Description:** Events must be strictly isolated by tenant ID. A tenant must never be able to publish or subscribe to events belonging to another tenant, in adherence with the Multi-Tenant invariant.
- **Priority:** MUST
- **Acceptance Criteria:**
  - [ ] Every event payload must contain a `tenantId` field.
  - [ ] The event bus enforces tenant ID matching for all publish and subscribe operations.
  - [ ] It is impossible for a consumer in one tenant to receive an event from another.

### 2.2 Non-Functional Requirements

**NFR-1: Performance**
- **Requirement:** The event bus must be able to process a high volume of events with low latency to support real-time features.
- **Measurement:** End-to-end latency (from publish to consume) and throughput (events per second).
- **Acceptance Criteria:**
  - [ ] P99 latency for event delivery must be < 100ms.
  - [ ] The system must sustain a throughput of at least 10,000 events/second per tenant.

**NFR-2: Scalability**
- **Requirement:** The Event System must be able to scale horizontally to accommodate platform growth without a degradation in performance.
- **Measurement:** Performance testing under increasing load.
- **Acceptance Criteria:**
  - [ ] The event bus (NATS) can be clustered across multiple nodes.
  - [ ] Adding nodes to the cluster results in a near-linear increase in throughput.

**NFR-3: Reliability**
- **Requirement:** The system must be highly available and resilient to failures of individual components.
- **Measurement:** Uptime percentage and successful recovery from simulated failures.
- **Acceptance Criteria:**
  - [ ] The Event System must have an uptime of 99.95%.
  - [ ] The NATS cluster must tolerate the failure of at least one node without data loss.
  - [ ] The system must automatically reconnect publishers and subscribers in case of transient network issues.

**NFR-4: Security**
- **Requirement:** All event data must be secured both in transit and at rest.
- **Measurement:** Security audit and penetration testing.
- **Acceptance Criteria:**
  - [ ] All communication with the event bus must use TLS encryption.
  - [ ] Sensitive data within event payloads should be encrypted.
  - [ ] Access to the event bus requires authentication and authorization.

**NFR-5: Maintainability**
- **Requirement:** The Event System should be easy to operate, monitor, and debug.
- **Measurement:** Review of operational documentation and tooling.
- **Acceptance Criteria:**
  - [ ] The system must expose key metrics for monitoring (e.g., queue depth, latency, error rates).
  - [ ] Comprehensive logging must be in place for all components.
  - [ ] A clear process for updating and upgrading the event bus must be documented.

---

## 3. Architecture

### 3.1 High-Level Architecture

The Event System is based on a standard **Publisher/Subscriber (Pub/Sub)** model, with a central Event Bus acting as the message broker. This decouples event producers from consumers, a core requirement of the platform's architecture. All modules and services interact with the Event Bus through a standardized client, which abstracts the underlying implementation.

For production environments, the Event Bus will be implemented using **NATS**, a high-performance messaging system. Specifically, **NATS JetStream** will be used to provide event persistence, at-least-once delivery, and replay capabilities. For local development and testing, a simple in-memory event bus will be provided to ensure a lightweight and fast developer experience without requiring a full NATS deployment.

**Components:**
1. **Event Publisher:** A client-side library that provides a simple API for services to publish events to the Event Bus.
2. **Event Bus (NATS):** The core messaging backbone. It receives events from publishers, persists them in the Event Store, and delivers them to all interested subscribers.
3. **Event Subscriber:** A client-side library that allows services to subscribe to specific event topics and receive events asynchronously.
4. **Event Store (NATS JetStream):** The persistence layer for all events, enabling auditability and replay functionality. It ensures that events are not lost even if consuming services are temporarily unavailable.

**Data Flow:**
1. A service (the **Publisher**) within a module performs an action that results in a state change (e.g., a user is created).
2. The Publisher constructs a standardized event object containing details of the state change, including a `tenantId`.
3. The Publisher sends the event to the **Event Bus** via the Event Publisher client.
4. The Event Bus receives the event, validates its structure, and immediately persists it to the **Event Store (NATS JetStream)**.
5. The Event Bus identifies all active **Subscribers** for the event's topic (e.g., `user.created`).
6. The Event Bus pushes the event to each identified Subscriber.
7. The Subscriber receives the event, performs its own business logic (e.g., sending a welcome email), and sends an acknowledgment (ACK) back to the Event Bus.
8. The Event Bus records the acknowledgment. If an ACK is not received within a configured timeout, the event will be redelivered to the subscriber.

### 3.2 Component Details

#### Component 1: Event Publisher

**Responsibility:** To provide a simple, high-level API for publishing events from any module or service.

**Interfaces:**
- **Input:** An event object that conforms to the standard event schema (see Data Model).
- **Output:** A confirmation (or error) from the Event Bus.

**Dependencies:**
- NATS Client Library

**Implementation Notes:**
- The publisher will be responsible for injecting the `tenantId` and other metadata into the event.
- It will handle connection management and reconnection logic to the NATS server.

#### Component 2: Event Bus (NATS)

**Responsibility:** To reliably receive, persist, and route all events within the platform.

**Interfaces:**
- **Input:** Events from publishers.
- **Output:** Events to subscribers.

**Dependencies:**
- A persistent volume for the Event Store (NATS JetStream).

**Implementation Notes:**
- NATS will be deployed as a cluster for high availability.
- JetStream will be configured with appropriate stream and consumer policies (e.g., retention policies, acknowledgment timeouts).
- Tenant isolation will be enforced using NATS subjects and authorization.

#### Component 3: Event Subscriber

**Responsibility:** To allow services to subscribe to events and process them reliably.

**Interfaces:**
- **Input:** Event subscription requests (topic, consumer group).
- **Output:** Event payloads to the consuming service.

**Dependencies:**
- NATS Client Library

**Implementation Notes:**
- The subscriber will manage the acknowledgment process with the Event Bus.
- It will support durable subscriptions to ensure no events are missed if the service restarts.
- It will handle deserialization of the event payload.

### 3.3 Design Patterns

**Patterns Used:**
- **Publisher/Subscriber:** This is the core pattern for decoupling components. It allows for a one-to-many distribution of events and enables services to evolve independently.
- **Event Sourcing:** While the Event System itself doesn't enforce this pattern, it is a key enabler for it. By persisting all state changes as a sequence of events, we can reconstruct the state of any entity at any point in time, which is invaluable for auditing, debugging, and analytics.
- **Outbox Pattern:** To ensure that events are published reliably, especially in the context of database transactions, services should implement the Outbox pattern. This involves writing the event to a dedicated 'outbox' table within the same transaction as the state change, and a separate process then reads from this table and publishes the event to the Event Bus.

---

## 4. API Specification

### 4.1 REST API Endpoints

The Event System does not expose any public REST API endpoints. All interactions with the Event System are handled via the Event-Based API through the NATS client.

### 4.2 Event-Based API

All events in the WebWaka platform MUST adhere to the following standardized structure. This ensures consistency and makes it easier for consumers to process events from different sources.

#### Standard Event Schema

```json
{
  "eventId": "<UUID>",
  "eventType": "<domain>.<entity>.<action>",
  "eventVersion": "1.0",
  "timestamp": "<ISO_8601_TIMESTAMP>",
  "tenantId": "<UUID>",
  "userId": "<UUID_OR_NULL>",
  "source": "<module_name>",
  "correlationId": "<UUID>",
  "data": {
    // Event-specific payload
  }
}
```

**Fields:**
- `eventId`: A unique identifier for the event (UUID v4).
- `eventType`: A string that describes the event in the format `domain.entity.action` (e.g., `identity.user.created`).
- `eventVersion`: The version of the event schema.
- `timestamp`: The ISO 8601 timestamp of when the event occurred.
- `tenantId`: The UUID of the tenant this event belongs to. **This is mandatory for all events.**
- `userId`: The UUID of the user who initiated the action, if applicable.
- `source`: The name of the module that published the event.
- `correlationId`: A UUID used to trace a request across multiple services and events.
- `data`: An object containing the event-specific payload.

#### Example Event: `identity.user.created`

**Event Type:** `identity.user.created`  
**Description:** Triggered when a new user is created in the Identity module.

**Payload:**
```json
{
  "eventId": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  "eventType": "identity.user.created",
  "eventVersion": "1.0",
  "timestamp": "2026-02-10T10:00:00Z",
  "tenantId": "t1e2n3a4-n5t6-7890-1234-567890abcdef",
  "userId": "u1s2e3r4-i5d6-7890-1234-567890abcdef",
  "source": "identity-module",
  "correlationId": "c1o2r3r4-e5l6-7890-1234-567890abcdef",
  "data": {
    "userId": "u1s2e3r4-i5d6-7890-1234-567890abcdef",
    "email": "testuser@example.com",
    "firstName": "Test",
    "lastName": "User"
  }
}
```

**Subscribers:**
- **Notifications Module:** To send a welcome email.
- **Audit Module:** To log the user creation event.
- **Analytics Module:** To track user sign-ups.

---

## 5. Data Model

### 5.1 Entities

#### Entity 1: Event

**Description:** Represents a single, immutable state change that has occurred within the platform. This is the core entity of the Event System.

**Attributes:**
- **eventId:** UUID (Primary Key)
- **eventType:** String (Required, e.g., `identity.user.created`)
- **eventVersion:** String (Required, e.g., `1.0`)
- **timestamp:** Timestamp (Required)
- **tenantId:** UUID (Required, Indexed)
- **userId:** UUID (Optional, Indexed)
- **source:** String (Required, e.g., `identity-module`)
- **correlationId:** UUID (Optional, Indexed)
- **data:** JSONB (Required, the event-specific payload)

**Relationships:**
- None. Events are self-contained and do not have direct relationships with other entities in the data model.

**Indexes:**
- **Primary:** eventId
- **Secondary:** tenantId, eventType, timestamp
- **Secondary:** correlationId

**Constraints:**
- **Unique:** eventId

### 5.2 Database Schema

While NATS JetStream is not a traditional SQL database, the following conceptual schema represents the structure of the data as it is stored in the event stream.

```sql
-- Conceptual schema for the 'events' stream in NATS JetStream
CREATE STREAM events (
  eventId UUID,
  eventType VARCHAR(255),
  eventVersion VARCHAR(50),
  timestamp TIMESTAMPTZ,
  tenantId UUID,
  userId UUID,
  source VARCHAR(255),
  correlationId UUID,
  data JSONB
);

-- NATS subjects will be used for indexing and filtering, e.g.:
-- events.<tenantId>.<domain>.<entity>.<action>
```

---

## 6. Dependencies

### 6.1 Internal Dependencies

**Depends On:**
- **Module 1: Minimal Kernel:** The Event System will rely on the Minimal Kernel for core configuration management, logging services, and access to environment variables.

**Depended On By:**
- **All Other Modules:** The Event System is a foundational, cross-cutting concern. Every other module in the WebWaka platform will depend on it for asynchronous communication, making it a critical dependency for the entire system.

### 6.2 External Dependencies

**Third-Party Libraries:**
- **nats.js (v2.x):** The official Node.js client library for connecting to the NATS server.
- **nuid (v2.x):** A high-performance, crypto-strong unique ID generator, used for creating `eventId`s.

**External Services:**
- **NATS.io:** The core messaging technology used for the Event Bus. The entire module is designed around the features and guarantees provided by NATS and its JetStream persistence engine.

---

## 7. Compliance

### 7.1 Nigerian-First Compliance

The Event System enables Nigerian-First compliance by providing a reliable transport for events related to Nigerian-specific features. It does not implement these features directly, but its design ensures that the necessary data can be handled.

- [X] **Supports Nigerian-specific data:** The flexible JSONB `data` payload can carry any information required for Nigerian payment gateways, banks, and SMS services.
- [X] **NDPR Compliant:** By enforcing tenant isolation and providing a full audit trail of events, the system provides the foundation for NDPR compliance. Data processors (subscribers) are responsible for handling personal data according to NDPR rules.

### 7.2 Mobile-First Compliance

- [X] **Low-Bandwidth Networks:** The choice of NATS, a lightweight and high-performance messaging system, is ideal for low-bandwidth environments. The client libraries will support efficient reconnection logic.
- [X] **Offline-First Support:** The Event System is a prerequisite for the Offline-First invariant. By guaranteeing event delivery, it ensures that actions taken offline can be queued and reliably synced with the server when connectivity is restored.

### 7.3 PWA-First Compliance

- [X] **Offline Functionality:** The Event System is critical for enabling robust offline functionality in our PWAs. Events generated offline can be stored locally (e.g., in IndexedDB) and published to the Event Bus when the device is back online.
- [X] **Background Sync:** The Event System will be used to trigger background sync processes, allowing PWAs to update their state even when not in the foreground.

### 7.4 Africa-First Compliance

- [X] **Scalability for Diverse Markets:** The horizontally scalable architecture of the Event System ensures that it can handle the load from multiple African markets simultaneously.
- [X] **Support for Localized Data:** The event schema is flexible enough to support data formats and requirements from all 54 African countries, including different languages, currencies, and address formats.

---

## 8. Testing Requirements

### 8.1 Unit Testing

**Coverage Target:** 100%

**Test Cases:**
- [ ] Event object creation and validation against the standard schema.
- [ ] Serialization and deserialization of event payloads.
- [ ] In-memory event bus functionality (publish, subscribe, unsubscribe).
- [ ] NATS client connection and reconnection logic.
- [ ] Graceful handling of connection errors.

### 8.2 Integration Testing

**Test Scenarios:**
- [ ] Verify end-to-end event flow: a publisher sends an event, and a subscriber receives it correctly via NATS.
- [ ] Test at-least-once delivery by simulating consumer failures and ensuring events are redelivered upon recovery.
- [ ] Validate tenant isolation by having two tenants publish events simultaneously and ensuring subscribers only receive events for their own tenant.
- [ ] Test wildcard subscriptions (e.g., subscribing to `identity.user.*` and verifying receipt of `identity.user.created`, `identity.user.updated`, etc.).
- [ ] Test event replay functionality by querying the Event Store for a specific time range and tenant.

### 8.3 System Flow Testing

**System Flows:**
- [ ] **User Creation Flow:** Trigger a `user.created` event in the Identity module and verify that the Notifications module receives it and simulates sending a welcome email.
- [ ] **Order Placement Flow:** Trigger an `order.placed` event in the Commerce module and verify that the Inventory module receives it and updates stock levels accordingly.

### 8.4 Performance Testing

**Performance Metrics:**
- [ ] **Throughput:** The system must sustain a load of at least 10,000 events per second per tenant for a period of 1 hour.
- [ ] **Latency:** The P99 latency from event publication to consumption must be below 100ms under normal load.
- [ ] **Scalability:** Verify that adding a new node to the NATS cluster increases overall throughput capacity.

### 8.5 Security Testing

**Security Tests:**
- [ ] **Authentication:** Attempt to connect to the NATS server with invalid credentials and verify that the connection is rejected.
- [ ] **Authorization:** Verify that a client authenticated for Tenant A cannot subscribe to or publish on subjects belonging to Tenant B.
- [ ] **Data Encryption:** Confirm that all traffic between clients and the NATS server is encrypted using TLS.
- [ ] **Payload Security:** Ensure that there are no vulnerabilities related to the parsing of event payloads (e.g., injection attacks).

---

## 9. Documentation Requirements

### 9.1 Module Documentation

- [ ] **README.md:** A comprehensive overview of the Event System module, its purpose, and instructions for setting up the in-memory event bus for local development.
- [ ] **ARCHITECTURE.md:** Detailed documentation of the Event System's architecture, including the roles of NATS and JetStream, data flow diagrams, and design pattern implementations.

### 9.2 API Documentation

- [ ] **Event Schema:** A formal definition of the standard event schema, including all mandatory and optional fields.
- [ ] **Event Catalog:** A centralized, searchable catalog of all event types in the platform, including their descriptions, payloads, and publishers/subscribers.
- [ ] **Usage Examples:** Code snippets demonstrating how to publish and subscribe to events using the client libraries.

### 9.3 Operational Documentation

- [ ] **Deployment Guide:** Step-by-step instructions for deploying and configuring the NATS cluster in a production environment.
- [ ] **Monitoring & Alerting Guide:** A guide to the key metrics exposed by the Event System and how to set up monitoring and alerting for them.
- [ ] **Troubleshooting Guide:** A guide to diagnosing and resolving common issues with the Event System.

---

## 10. Risks and Mitigation

### Risk 1: NATS Complexity

**Description:** NATS, and particularly JetStream, can be complex to configure and manage correctly. Misconfiguration could lead to performance issues, data loss, or downtime.
**Probability:** Medium
**Impact:** High
**Mitigation:**
- Allocate sufficient time for learning and experimentation with NATS.
- Develop a comprehensive set of configuration scripts and automate the deployment process.
- Create detailed operational documentation and runbooks.

### Risk 2: Vendor Lock-in

**Description:** Tightly coupling our architecture to NATS could make it difficult to switch to a different messaging system in the future if required.
**Probability:** Low
**Impact:** Medium
**Mitigation:**
- Abstract all interactions with NATS behind a generic Event System client. This will ensure that other modules are not directly dependent on the NATS API.
- The in-memory event bus for development serves as a proof-of-concept for this abstraction.

---

## 11. Timeline

**Specification:** Week 10  
**Implementation:** Weeks 11-12  
**Testing:** Week 12  
**Validation:** Week 12  
**Approval:** Week 12

---

## 12. Approval

**Architecture (webwakaagent3):**
- [X] Specification complete
- [X] All sections filled
- [X] Compliance validated
- [ ] Submitted for review

**Engineering (webwakaagent4):**
- [ ] Specification reviewed
- [ ] Feedback provided
- [ ] Approved for implementation

**Quality (webwakaagent5):**
- [ ] Test strategy defined
- [ ] Test cases identified
- [ ] Approved for implementation

**Founder Agent (webwaka007):**
- [ ] Final approval
- [ ] Ready for implementation

---

**Document Status:** DRAFT  
**Created By:** webwakaagent3 (Architecture)  
**Date:** 2026-02-09  
**Last Updated:** 2026-02-09
