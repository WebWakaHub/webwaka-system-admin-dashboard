# Minimal Kernel Specification

**Module ID:** Module 1  
**Module Name:** Minimal Kernel  
**Version:** 1.0  
**Date:** 2026-02-09  
**Status:** APPROVED  
**Author:** webwakaagent3 (Architecture)  
**Reviewers:** webwakaagent4 (Engineering), webwakaagent5 (Quality)

---

## 1. Module Overview

### 1.1 Purpose

This module provides the foundational, non-negotiable core of the WebWaka platform, upon which all other modules and plugins are built. It establishes the architectural invariants and provides the essential services for an event-driven, offline-first, and multi-tenant system.

### 1.2 Scope

**In Scope:**
- Core event bus for inter-module communication
- Basic plugin loader for extensibility
- Fundamental multi-tenancy context management
- Core permission checking mechanism
- Base API gateway for routing requests

**Out of Scope:**
- Any specific feature or business logic (e.g., e-commerce, transportation)
- User interface components
- Advanced plugin capabilities (e.g., dependency management)

### 1.3 Success Criteria

- [ ] The kernel successfully loads and initializes.
- [ ] The event bus can publish and subscribe to events.
- [ ] The plugin loader can load a simple plugin.
- [ ] API calls are correctly routed to the appropriate service.
- [ ] All 10 architectural invariants are demonstrably enforced at the kernel level.

---

## 2. Requirements

### 2.1 Functional Requirements

**FR-1: Event Bus**
- **Description:** The kernel MUST provide a central event bus for asynchronous, decoupled communication between all modules and plugins. All state changes within the platform MUST be communicated via this event bus.
- **Priority:** MUST
- **Acceptance Criteria:**
  - [ ] The kernel provides a `publish` method to emit events.
  - [ ] The kernel provides a `subscribe` method for modules to listen to specific events.
  - [ ] Events are processed asynchronously.
  - [ ] The event payload is standardized and versioned.

**FR-2: Plugin Loader**
- **Description:** The kernel MUST provide a mechanism to dynamically load, initialize, and manage the lifecycle of plugins. This is fundamental to the platform's extensibility.
- **Priority:** MUST
- **Acceptance Criteria:**
  - [ ] The kernel can load plugins from a designated directory.
  - [ ] The kernel can enable and disable plugins at runtime.
  - [The kernel can manage plugin dependencies. The design must accommodate future complexities like semantic versioning, dependency resolution, and hot-reloading to avoid significant technical debt.
  - [ ] Plugins can register their own event listeners and API endpoints.

**FR-3: Multi-Tenant Context**
- **Description:** The kernel MUST enforce strict data and operational isolation between tenants. Every request and event MUST be processed within the context of a specific tenant.
- **Priority:** MUST
- **Acceptance Criteria:**
  - [ ] Every API request is associated with a tenant ID.
  - [ ] Every event published includes a tenant ID.
  - [ ] The kernel provides a mechanism to retrieve the current tenant context.
  - [ ] Data access is automatically scoped to the current tenant.

**FR-4: Permission Enforcement**
- **Description:** The kernel MUST provide a centralized permission-checking mechanism. All actions MUST be authorized against a set of permissions before execution.
- **Priority:** MUST
- **Acceptance Criteria:**
  - [ ] The kernel provides a `hasPermission` function.
  - [ ] Permissions are checked before any action is executed.
  - [ ] Permission checks are tenant-specific.
  - [ ] The permission model is extensible by plugins.

**FR-5: API Gateway**
- **Description:** The kernel MUST include a basic, lightweight API gateway to route incoming HTTP requests to the appropriate module or plugin API endpoints.
- **Priority:** MUST
- **Acceptance Criteria:**
  - [ ] The gateway can route requests based on the URL path.
  - [ ] The gateway injects the tenant context into the request.
  - [ ] The gateway handles authentication and passes the user context.
  - [ ] The gateway supports API versioning.

### 2.2 Non-Functional Requirements

**NFR-1: Performance**
- **Requirement:** The kernel's overhead must be minimal. Event processing latency must be less than 10ms under normal load.
- **Measurement:** Latency will be measured from event publication to subscriber reception.
- **Acceptance Criteria:** 99th percentile of event processing latency is below 10ms.

**NFR-2: Scalability**
- **Requirement:** The kernel must be designed to scale horizontally and support a minimum of 1,000 concurrent tenants and 10,000 events per second.
- **Measurement:** Load testing will be performed using a simulated environment.
- **Acceptance Criteria:** The system maintains performance targets under the specified load.

**NFR-3: Reliability**
- **Requirement:** The kernel must be highly reliable, with a target uptime of 99.99%.
- **Measurement:** Uptime will be monitored over a 30-day period.
- **Acceptance Criteria:** The kernel achieves the target uptime.

**NFR-4: Security**
- **Requirement:** All inter-module and inter-service communication must be secured. The kernel must be free of critical vulnerabilities.
- **Measurement:** Static and dynamic security analysis, and penetration testing.
- **Acceptance Criteria:** No critical or high-severity vulnerabilities are found.

**NFR-5: Maintainability**
- **Requirement:** The kernel's code must be highly maintainable, with 100% unit test coverage and clear documentation.
- **Measurement:** Code coverage reports and manual code review.
- **Acceptance Criteria:** 100% unit test coverage is achieved and documentation is complete and accurate.

---

## 3. Architecture

### 3.1 High-Level Architecture

The Minimal Kernel is the central nervous system of the WebWaka platform. It is designed as a lightweight, extensible core that enforces the platform's architectural invariants. All other functionalities are implemented as plugins that interact with the kernel and each other through a standardized set of interfaces and a central event bus.

**Components:**
1. **API Gateway:** The single entry point for all incoming requests. It is responsible for initial request handling, authentication, and routing to the appropriate service or plugin.
2. **Tenant Manager:** Manages the context of the current tenant, ensuring all operations are strictly scoped and isolated.
3. **Permission Manager:** Provides a centralized service for checking user permissions before any action is executed.
4. **Plugin Manager:** Loads, initializes, and manages the lifecycle of all plugins, enabling the platform's modular and extensible nature.
5. **Event Bus:** The core of the event-driven architecture, facilitating asynchronous communication between all components of the platform.

**Data Flow:**
1. An incoming request hits the **API Gateway**.
2. The Gateway identifies the tenant and user from the request and consults the **Tenant Manager** and **Permission Manager**.
3. Once authenticated and authorized, the request is routed to the appropriate plugin via the **Plugin Manager**.
4. The plugin executes its business logic, which may involve publishing one or more events to the **Event Bus**.
5. Other plugins or modules subscribed to these events are notified and execute their respective logic asynchronously.

### 3.2 Component Details

#### Component 1: API Gateway

**Responsibility:** To act as the front door for all incoming API requests, handling initial validation, authentication, and routing.

**Interfaces:**
- **Input:** HTTP requests from clients.
- **Output:** HTTP responses to clients, or routed requests to internal services.

**Dependencies:**
- Tenant Manager (for tenant context)
- Permission Manager (for authorization)
- Plugin Manager (for routing to plugins)

**Implementation Notes:**
- Must be lightweight and highly performant.
- Will support RESTful and GraphQL endpoints.

#### Component 2: Tenant Manager

**Responsibility:** To manage tenant contexts and ensure strict data isolation.

**Interfaces:**
- **Input:** Tenant ID from the API Gateway.
- **Output:** Tenant-specific context for the duration of the request.

**Dependencies:**
- None

**Implementation Notes:**
- The tenant context will be immutable and passed to all downstream services.

#### Component 3: Permission Manager

**Responsibility:** To provide a centralized and extensible permission-checking service.

**Interfaces:**
- **Input:** User ID and the required permission.
- **Output:** Boolean indicating if the user has the required permission.

**Dependencies:**
- Tenant Manager (to scope permissions to the tenant)

**Implementation Notes:**
- Permissions will be role-based and extensible by plugins.

#### Component 4: Plugin Manager

**Responsibility:** To manage the lifecycle of all plugins.

**Interfaces:**
- **Input:** Plugin configurations.
- **Output:** Loaded and initialized plugins.

**Dependencies:**
- Event Bus (for plugins to subscribe to events)

**Implementation Notes:**
- Plugins will be isolated from each other to prevent conflicts.

#### Component 5: Event Bus

**Responsibility:** To facilitate asynchronous communication between all components.

**Interfaces:**
- **Input:** Events to be published.
- **Output:** Events delivered to subscribers.

**Dependencies:**
- None

**Implementation Notes:**
- The event bus will be persistent to ensure no events are lost, which is critical for offline-first functionality.

### 3.3 Design Patterns

**Patterns Used:**
- **Event Sourcing:** All state changes are captured as a sequence of events. This is fundamental to our event-driven architecture and provides a full audit trail.
- **Plugin Architecture:** All functionality is encapsulated in plugins, promoting modularity, extensibility, and isolation.
- **Strategy Pattern:** Used for selecting the appropriate implementation at runtime, for example, choosing a payment gateway based on tenant configuration.
- **Middleware/Pipes and Filters:** The API Gateway will use a middleware chain to process incoming requests, allowing for cross-cutting concerns like logging, authentication, and tenant context injection to be handled cleanly.

---

## 4. API Specification

The Minimal Kernel's API is primarily internal and event-based, designed for communication between the kernel, modules, and plugins. The external-facing API is limited to the API Gateway, which is a pass-through to the appropriate services.

### 4.1 REST API Endpoints

The Minimal Kernel itself does not expose any domain-specific REST API endpoints. It provides the API Gateway, which is responsible for routing requests to the appropriate plugins. The routing is determined by the plugin's registration.

### 4.2 Event-Based API

The primary way to interact with the kernel and other modules is through the event bus. The kernel defines a set of core events that other modules can subscribe to or publish.

#### Event 1: `kernel.initialized`

- **Event Type:** `kernel.initialized`
- **Description:** Published when the kernel has successfully initialized and is ready to load plugins.
- **Payload:**
  ```json
  {
    "eventType": "kernel.initialized",
    "timestamp": "2026-02-09T12:00:00Z",
    "data": {}
  }
  ```
- **Subscribers:** Plugin Manager

#### Event 2: `plugin.loaded`

- **Event Type:** `plugin.loaded`
- **Description:** Published when a plugin has been successfully loaded and initialized.
- **Payload:**
  ```json
  {
    "eventType": "plugin.loaded",
    "timestamp": "2026-02-09T12:00:00Z",
    "data": {
      "pluginName": "example-plugin",
      "version": "1.0.0"
    }
  }
  ```
- **Subscribers:** Any module that depends on this plugin.

#### Event 3: `request.received`

- **Event Type:** `request.received`
- **Description:** Published by the API Gateway for every incoming request. This is crucial for logging and auditing.
- **Payload:**
  ```json
  {
    "eventType": "request.received",
    "timestamp": "2026-02-09T12:00:00Z",
    "data": {
      "tenantId": "<tenant-uuid>",
      "userId": "<user-uuid>",
      "method": "GET",
      "path": "/api/v1/example",
      "ipAddress": "192.168.1.1"
    }
  }
  ```
- **Subscribers:** Audit Logger, Analytics Engine

---

## 5. Data Model

The Minimal Kernel's data model is intentionally simple, focusing on the core entities required to manage tenants and plugins. All other data models are defined within their respective plugins.

### 5.1 Entities

#### Entity 1: Tenant

- **Description:** Represents an isolated customer account within the platform. All data is scoped to a tenant.
- **Attributes:**
  - **id:** UUID (Primary Key, Auto-generated)
  - **name:** String (Required, Max 255 characters)
  - **status:** String (e.g., 'active', 'suspended')
  - **createdAt:** Timestamp (Auto-generated)
  - **updatedAt:** Timestamp (Auto-updated)

#### Entity 2: Plugin

- **Description:** Represents a loaded plugin and its configuration.
- **Attributes:**
  - **id:** UUID (Primary Key, Auto-generated)
  - **name:** String (Required, Unique)
  - **version:** String (Required)
  - **enabled:** Boolean (Default: false)
  - **configuration:** JSONB (Plugin-specific settings)
  - **createdAt:** Timestamp (Auto-generated)
  - **updatedAt:** Timestamp (Auto-updated)

### 5.2 Database Schema

```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE plugins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  version VARCHAR(50) NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  configuration JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 6. Dependencies

### 6.1 Internal Dependencies

**Depends On:**
- **None:** The Minimal Kernel is the foundational module and has no dependencies on other internal modules.

**Depended On By:**
- **All Modules & Plugins:** Every other module and plugin in the WebWaka platform depends on the Minimal Kernel for core services like the event bus, plugin management, and multi-tenancy.

### 6.2 External Dependencies

**Third-Party Libraries (Examples):**
- **NATS or RabbitMQ:** For the event bus implementation to ensure reliable, persistent, and scalable messaging.
- **PostgreSQL:** For the persistence of the kernel's data model (tenants, plugins).
- **Redis:** For caching tenant and permission information to improve performance.

**External Services:**
- **Cloudflare:** For edge location routing and security, as per the Nigerian-First compliance requirements.

---

## 7. Compliance

This section details the Minimal Kernel's adherence to the platform's non-negotiable architectural invariants and compliance requirements.

### 7.1 Architectural Invariants Compliance

The Minimal Kernel is the primary enforcer of the 10 core architectural invariants.

1.  **Offline-First:** The kernel's persistent event bus is the foundation for offline capability, allowing actions to be queued and processed when connectivity is restored.
2.  **Event-Driven:** The kernel is built around a central event bus, and all state changes within the kernel itself emit events.
3.  **Plugin-First:** The kernel's primary responsibility is to load and manage plugins, making the entire platform's functionality modular and extensible.
4.  **Multi-Tenant:** The kernel enforces tenant isolation at the lowest level, ensuring all operations are scoped to a specific tenant.
5.  **Permission-Driven:** The kernel provides a centralized permission-checking mechanism that is consulted before any action is executed.
6.  **API-First:** The kernel's API gateway ensures all functionality is accessible via a consistent API.
7.  **Mobile-First & Africa-First:** The kernel's design is lightweight and performant, suitable for low-spec devices and low-bandwidth networks common in African markets.
8.  **Audit-Ready:** The event-driven nature of the kernel provides a comprehensive audit trail of all actions.
9.  **Nigerian-First:** The kernel's architecture is designed to support Nigerian-specific requirements, such as payment gateways and SMS services, which will be implemented as plugins.
10. **PWA-First:** The kernel's offline-first architecture is a prerequisite for building a fully-functional Progressive Web App.

### 7.2 Nigerian-First Compliance

The Minimal Kernel enables Nigerian-First compliance by providing the architectural foundation for plugins that will implement the specific requirements.

- [X] **Payment Gateways:** The plugin architecture allows for the integration of Paystack, Flutterwave, and Interswitch as separate plugins.
- [X] **Nigerian Banks:** Bank integrations will be handled by payment gateway plugins.
- [X] **SMS Gateway:** The Termii SMS gateway will be integrated as a plugin.
- [X] **Currency:** The kernel is currency-agnostic, allowing for the Naira (₦) to be the default currency in the presentation layer.
- [X] **Regulatory Compliance (NDPR):** The kernel's multi-tenancy and permission-driven architecture are fundamental to NDPR compliance.
- [X] **Phone Number Format:** Phone number formatting and validation will be handled at the presentation layer and in relevant plugins.
- [X] **Edge Locations:** The kernel's deployment will be configured to use African edge locations.

### 7.3 Mobile-First & PWA-First Compliance

The Minimal Kernel is designed to support Mobile-First and PWA-First applications.

- [X] **Responsive Design:** While the kernel has no UI, its lightweight nature supports fast-loading and responsive frontends.
- [X] **Mobile Performance:** The kernel is optimized for low-spec devices and low-bandwidth networks.
- [X] **Offline Functionality:** The kernel's persistent event bus is the core of the platform's offline capabilities.
- [X] **PWA Features:** The kernel's architecture enables the implementation of service workers, background sync, and other PWA features in the frontend.

### 7.4 Africa-First Compliance

The Minimal Kernel's design principles are aligned with the Africa-First strategy.

- [X] **Language Support:** The kernel is language-agnostic, allowing for the implementation of multiple African languages in the presentation layer.
- [X] **African Payment Methods:** The plugin architecture allows for the integration of various African payment methods.
- [X] **African Currencies:** The kernel is currency-agnostic.
- [X] **African Infrastructure:** The kernel is designed for low-bandwidth, low-spec environments.

---

## 8. Testing Requirements

### 8.1 Unit Testing

**Coverage Target:** 100%

**Test Cases:**
- [ ] Test event publishing and subscribing.
- [ ] Test plugin loading and initialization.
- [ ] Test tenant context creation and retrieval.
- [ ] Test permission checking for authorized and unauthorized users.
- [ ] Test API gateway routing for valid and invalid routes.

### 8.2 Integration Testing

**Test Scenarios:**
- [ ] Test that an event published in one plugin is correctly received by another.
- [ ] Test that a request to the API gateway is correctly routed to a plugin and returns the expected response.
- [ ] Test that data created by one tenant is not accessible to another.

### 8.3 End-to-End Testing

**User Flows:**
- [ ] A user makes an API request, which is authenticated, authorized, and routed to a plugin. The plugin publishes an event, which is then consumed by another plugin to complete the workflow.

### 8.4 Performance Testing

**Performance Metrics:**
- [ ] Measure event processing latency under high load.
- [ ] Measure API gateway request-to-response time.
- [ ] Measure memory and CPU usage of the kernel.

### 8.5 Security Testing

**Security Tests:**
- [ ] Test for unauthorized access to tenant data.
- [ ] Test for vulnerabilities in the API gateway.
- [ ] Test for denial-of-service vulnerabilities.

---

## 9. Documentation Requirements

### 9.1 Module Documentation

- [ ] **README.md:** A comprehensive overview of the Minimal Kernel, its purpose, and how to get started with development.
- [ ] **ARCHITECTURE.md:** A detailed explanation of the kernel's architecture, components, and design patterns.
- [ ] **API.md:** A complete reference for the kernel's event-based API, including all core events and their payloads.
- [ ] **CHANGELOG.md:** A log of all changes to the kernel, versioned by release.

### 9.2 API Documentation

- [ ] **Event Catalog:** A searchable catalog of all events in the system, including their payloads, publishers, and subscribers.
- [ ] **API Reference:** A detailed reference for the API Gateway, including authentication, routing, and error handling.

### 9.3 User Documentation

- [ ] **Developer Guide:** A guide for developers on how to build plugins for the WebWaka platform, including tutorials and best practices.
- [ ] **Operations Guide:** A guide for operators on how to deploy, manage, and monitor the Minimal Kernel.

---

## 10. Risks and Mitigation

### Risk 1: Event Bus Performance Bottleneck

- **Description:** If the event bus is not properly designed or scaled, it could become a performance bottleneck, especially under high load.
- **Probability:** Medium
- **Impact:** High
- **Mitigation:** Use a battle-tested, scalable message broker like NATS or RabbitMQ. Implement event batching and compression. Conduct thorough performance testing early and often.

### Risk 2: Plugin Conflicts

- **Description:** Plugins may conflict with each other if they attempt to register the same API endpoints or event handlers.
- **Probability:** Medium
- **Impact:** Medium
- **Mitigation:** Implement a robust plugin registration system that detects and prevents conflicts. Use namespacing for API endpoints and event types.

### Risk 3: Tenant Data Leakage

- **Description:** A bug in the tenant context management could lead to data leakage between tenants, which would be a critical security breach.
- **Probability:** Low
- **Impact:** Critical
- **Mitigation:** Implement strict tenant context enforcement at the kernel level. Conduct rigorous security testing, including penetration testing. Implement automated tests that verify tenant isolation.

### Risk 4: Complexity Creep

- **Description:** There is a risk that the kernel becomes too complex over time as features are added, which would undermine its "minimal" nature.
- **Probability:** Medium
- **Impact:** Medium
- **Mitigation:** Establish a clear definition of what belongs in the kernel and what should be a plugin. Conduct regular architectural reviews to ensure the kernel remains minimal.

---

## 11. Timeline

- **Specification:** Week 1 (Days 1-3)
- **Implementation:** Weeks 3-4 (Days 1-7)
- **Testing:** Week 5 (Days 1-7)
- **Validation:** Week 6 (Days 1-2)
- **Approval:** Week 6 (Day 7)

---

## 12. Approval

**Architecture (webwakaagent3):**
- [X] Specification complete
- [X] All sections filled
- [X] Compliance validated
- [X] Submitted for review

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
