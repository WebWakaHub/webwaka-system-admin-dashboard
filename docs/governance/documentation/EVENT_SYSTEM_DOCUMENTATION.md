# WebWaka Event System Documentation

**Author:** Manus AI  
**Date:** 2026-02-09  
**Version:** 1.0

## 1. Overview

The Event System is a core module of the WebWaka platform that provides a robust, scalable, and reliable event-driven architecture. It enables loose coupling between services through asynchronous event publishing and subscription, forming the backbone of the platform's real-time and offline-first capabilities.

This document provides comprehensive documentation for the Event System, including its architecture, API, usage examples, and best practices.

### 1.1. Key Features

| Feature | Description |
|---|---|
| **Event Publishing** | Publish events to the event bus with a fluent API. |
| **Event Subscription** | Subscribe to events with flexible patterns, including wildcards and consumer groups. |
| **Event Replay** | Replay historical events for a tenant, enabling event sourcing and state reconstruction. |
| **Tenant Isolation** | Strict multi-tenancy enforcement at all levels of the system. |
| **Audit Logging** | Complete audit trail of all operations for compliance and debugging. |
| **Error Handling** | Comprehensive error handling with a rich set of custom error classes. |
| **Retry Logic** | Automatic retry with exponential backoff for resilient event handling. |
| **Multiple Implementations** | In-memory for development and NATS for production, switchable via configuration. |
| **Fluent APIs** | Easy-to-use builder patterns for creating and subscribing to events. |
| **Type Safety** | Full TypeScript support with strict typing for all components. |

## 2. Architecture

The Event System is designed with a modular and extensible architecture, centered around the `EventBus` interface. This allows for different implementations to be used in different environments.

### 2.1. Core Components

```
┌─────────────────────────────────────────────────────────┐
│                  Event System Module                     │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐      ┌──────────────┐                 │
│  │  Publisher   │      │  Subscriber  │                 │
│  └──────┬───────┘      └──────┬───────┘                 │
│         │                      │                         │
│         └──────────┬───────────┘                         │
│                    │                                     │
│            ┌───────▼────────┐                           │
│            │   Event Bus    │                           │
│            │  (Interface)   │                           │
│            └───────┬────────┘                           │
│                    │                                     │
│         ┌──────────┴──────────┐                         │
│         │                     │                         │
│    ┌────▼────────┐    ┌──────▼────────┐                │
│    │In-Memory Bus│    │ NATS Bus      │                │
│    │(Development)│    │(Production)   │                │
│    └─────────────┘    └───────────────┘                │
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Utilities                                        │   │
│  │ - Event Validator                               │   │
│  │ - ID Generator                                  │   │
│  │ - Tenant Enforcer                               │   │
│  │ - Audit Logger                                  │   │
│  └──────────────────────────────────────────────────┘   │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### 2.2. Event Flow

1.  **Publishing**: A service uses the `EventBuilder` to create and publish an event.
2.  **Validation**: The event is automatically validated against the standard event schema.
3.  **Bus**: The event is sent to the configured `EventBus` (in-memory or NATS).
4.  **Delivery**: The `EventBus` delivers the event to all matching subscribers.
5.  **Handling**: Subscribers process the event, with automatic retries on failure.
6.  **Auditing**: All operations are logged by the `AuditLogger`.
7.  **Security**: Tenant isolation is enforced by the `TenantEnforcer` at each step.

## 3. API Reference

The Event System provides a fluent and intuitive API for publishing and subscribing to events.

### 3.1. Event Interface

All events in the system must conform to the `Event` interface.

```typescript
interface Event {
  eventId: string;              // UUID v4
  eventType: string;            // Format: domain.entity.action
  eventVersion: string;         // e.g., "1.0"
  timestamp: string;            // ISO 8601
  tenantId: string;             // UUID - MANDATORY
  userId?: string;              // UUID - optional
  source: string;               // Module name
  correlationId?: string;       // UUID - optional
  data: Record<string, unknown>; // Event payload
}
```

### 3.2. EventBuilder

The `EventBuilder` provides a fluent API for creating and publishing events.

```typescript
new EventBuilder(publisher)
  .withEventType('user.created')
  .withTenantId('tenant-123')
  .withSource('module-name')
  .withData({ /* event data */ })
  .publish();
```

**Methods:**

| Method | Description |
|---|---|
| `withEventType(type: string)` | Sets the event type (e.g., `user.created`). |
| `withEventVersion(version: string)` | Sets the event version (default: `1.0`). |
| `withTenantId(id: string)` | Sets the tenant ID (mandatory). |
| `withUserId(id: string)` | Sets the user ID (optional). |
| `withSource(source: string)` | Sets the source module (mandatory). |
| `withCorrelationId(id: string)` | Sets the correlation ID for tracing (optional). |
| `withData(data: object)` | Sets the event data payload (mandatory). |
| `addDataField(key: string, value: any)` | Adds a single field to the event data. |
| `publish()` | Builds and publishes the event to the event bus. |
| `build()` | Builds the event object without publishing it. |

### 3.3. EventListenerBuilder

The `EventListenerBuilder` provides a fluent API for subscribing to events.

```typescript
new EventListenerBuilder(subscriber)
  .on('user.*')
  .handle(async (event) => { /* handle event */ })
  .withMaxRetries(3)
  .subscribe();
```

**Methods:**

| Method | Description |
|---|---|
| `on(eventType: string)` | Sets the event type pattern to subscribe to (wildcards supported). |
| `handle(handler: (event: Event) => Promise<void>)` | Sets the event handler function. |
| `withConsumerGroup(group: string)` | Sets the consumer group for load balancing (optional). |
| `startFrom(position: 'now' | 'beginning' | Date)` | Sets the start position for receiving events (optional). |
| `withMaxRetries(count: number)` | Sets the maximum number of retries for a failed handler (optional). |
| `withRetryDelayMs(ms: number)` | Sets the delay between retries in milliseconds (optional). |
| `subscribe()` | Creates the subscription and starts listening for events. |

### 3.4. Error Classes

The Event System uses a set of custom error classes to provide detailed error information.

-   `EventSystemError`: Base error class for all Event System errors.
-   `EventValidationError`: Thrown when an event fails schema validation.
-   `EventPublishError`: Thrown when an event fails to be published.
-   `SubscriptionError`: Thrown for subscription-related errors.
-   `ConnectionError`: Thrown for event bus connection errors.
-   `TenantIsolationError`: Thrown for tenant isolation violations.
-   `AuthenticationError`: Thrown for authentication failures.
-   `AuthorizationError`: Thrown for authorization failures.

## 4. Usage Examples

This section provides practical examples of how to use the Event System.

### 4.1. Basic Setup

**Development (In-Memory):**

```typescript
import { EventSystemFactory } from './event-system/factory/event-system-factory';

// Create in-memory event system for development
const system = await EventSystemFactory.createEventSystem({
  type: 'in-memory',
});

const { eventBus, publisher, subscriber } = system;
```

**Production (NATS):**

```typescript
import { EventSystemFactory } from './event-system/factory/event-system-factory';

// Create NATS-based event system for production
const system = await EventSystemFactory.createEventSystem({
  type: 'nats',
  nats: {
    servers: ['nats://nats-1:4222', 'nats://nats-2:4222'],
    user: 'webwaka',
    password: process.env.NATS_PASSWORD,
  },
});

const { eventBus, publisher, subscriber } = system;
```

### 4.2. Publishing Events

```typescript
import { EventBuilder } from './event-system/publisher/event-publisher';

const publisher = new EventBuilder(eventBus)
  .withEventType('user.created')
  .withTenantId('tenant-123')
  .withSource('identity-module')
  .withData({
    userId: 'user-456',
    email: 'user@example.com',
    firstName: 'John',
    lastName: 'Doe',
  })
  .publish();
```

### 4.3. Subscribing to Events

```typescript
import { EventListenerBuilder } from './event-system/subscriber/event-subscriber';

const subscriptionId = await new EventListenerBuilder(subscriber)
  .on('user.created')
  .handle(async (event) => {
    console.log(`User created: ${event.data.email}`);
  })
  .subscribe();
```

### 4.4. Event Replay

```typescript
const result = await eventBus.replayEvents({
  tenantId: 'tenant-123',
  eventType: 'order.placed',
});

console.log(`Replayed ${result.events.length} order events`);
```

## 5. Best Practices

1.  **Always include `tenantId`**: This is mandatory for all events and is enforced by the system.
2.  **Use Correlation IDs**: Use `withCorrelationId()` to trace requests across multiple services.
3.  **Validate Events**: The `EventBuilder` automatically validates events, so always use it to create events.
4.  **Handle Errors**: Wrap all `publish()` and `subscribe()` calls in `try...catch` blocks to handle potential errors.
5.  **Use Consumer Groups**: Use `withConsumerGroup()` to load balance event processing across multiple subscribers.
6.  **Monitor Audit Logs**: Regularly check the audit logs for compliance and to debug issues.
7.  **Implement Retry Logic**: Use `withMaxRetries()` to make your event handlers more resilient to transient failures.
8.  **Test with In-Memory Bus**: Use the in-memory bus for unit and integration tests to avoid external dependencies.
9.  **Use Event Versioning**: Use `withEventVersion()` to manage changes to your event schemas over time.
10. **Document Event Schemas**: Maintain clear documentation for all your event schemas.

## 6. Troubleshooting

| Error | Solution |
|---|---|
| `ConnectionError` | Ensure the NATS server is running and accessible from your application. |
| `TenantIsolationError` | Check that the `tenantId` of the event matches the `tenantId` of the current context. |
| `EventValidationError` | Verify that your event object includes all required fields and that they are in the correct format. |

## 7. References

[1] WebWakaHub/webwaka-platform. (2026). *Event System README*. [https://github.com/WebWakaHub/webwaka-platform/blob/master/src/event-system/README.md](https://github.com/WebWakaHub/webwaka-platform/blob/master/src/event-system/README.md)

[2] WebWakaHub/webwaka-platform. (2026). *Event System Usage Examples*. [https://github.com/WebWakaHub/webwaka-platform/blob/master/src/event-system/USAGE_EXAMPLES.md](https://github.com/WebWakaHub/webwaka-platform/blob/master/src/event-system/USAGE_EXAMPLES.md)
