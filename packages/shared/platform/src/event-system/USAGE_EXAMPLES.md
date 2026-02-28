# Event System Usage Examples

This document provides comprehensive examples of how to use the WebWaka Event System.

## Table of Contents

1. [Basic Setup](#basic-setup)
2. [Publishing Events](#publishing-events)
3. [Subscribing to Events](#subscribing-to-events)
4. [Event Replay](#event-replay)
5. [Tenant Isolation](#tenant-isolation)
6. [Error Handling](#error-handling)
7. [Audit Logging](#audit-logging)
8. [Advanced Patterns](#advanced-patterns)

## Basic Setup

### Initialize Event System (Development)

```typescript
import { EventSystemFactory } from './event-system/factory/event-system-factory';

// Create in-memory event system for development
const system = await EventSystemFactory.createEventSystem({
  type: 'in-memory',
});

const { eventBus, publisher, subscriber } = system;
```

### Initialize Event System (Production)

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

## Publishing Events

### Simple Event Publishing

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

### Publishing with User Context

```typescript
const publisher = new EventBuilder(eventBus)
  .withEventType('order.placed')
  .withTenantId('tenant-123')
  .withUserId('user-456')
  .withSource('orders-module')
  .withData({
    orderId: 'order-789',
    amount: 99.99,
    items: [
      { productId: 'prod-1', quantity: 2, price: 49.99 },
    ],
  })
  .publish();
```

### Publishing with Correlation ID

```typescript
import { generateCorrelationId } from './event-system/utils/id-generator';

const correlationId = generateCorrelationId();

const publisher = new EventBuilder(eventBus)
  .withEventType('payment.processed')
  .withTenantId('tenant-123')
  .withCorrelationId(correlationId)
  .withSource('payments-module')
  .addDataField('transactionId', 'txn-123')
  .addDataField('status', 'completed')
  .publish();
```

### Batch Publishing

```typescript
const events = [
  new EventBuilder(eventBus)
    .withEventType('user.created')
    .withTenantId('tenant-123')
    .withSource('identity-module')
    .withData({ userId: 'user-1' })
    .build(),
  new EventBuilder(eventBus)
    .withEventType('user.created')
    .withTenantId('tenant-123')
    .withSource('identity-module')
    .withData({ userId: 'user-2' })
    .build(),
];

await publisher.publishBatch(events);
```

## Subscribing to Events

### Simple Subscription

```typescript
import { EventListenerBuilder } from './event-system/subscriber/event-subscriber';

const subscriptionId = await new EventListenerBuilder(subscriber)
  .on('user.created')
  .handle(async (event) => {
    console.log(`User created: ${event.data.email}`);
  })
  .subscribe();
```

### Subscription with Retry Logic

```typescript
const subscriptionId = await new EventListenerBuilder(subscriber)
  .on('payment.processed')
  .handle(async (event) => {
    // This handler will be retried up to 3 times with 1000ms delay
    await processPayment(event.data);
  })
  .withMaxRetries(3)
  .withRetryDelayMs(1000)
  .subscribe();
```

### Wildcard Subscription

```typescript
// Subscribe to all user events
const subscriptionId = await new EventListenerBuilder(subscriber)
  .on('user.*')
  .handle(async (event) => {
    console.log(`User event: ${event.eventType}`);
  })
  .subscribe();
```

### Consumer Group Subscription (Load Balancing)

```typescript
// Multiple subscribers in the same consumer group will load balance events
const subscriptionId = await new EventListenerBuilder(subscriber)
  .on('order.placed')
  .handle(async (event) => {
    await processOrder(event.data);
  })
  .withConsumerGroup('order-processors')
  .subscribe();
```

### Replay from Beginning

```typescript
const subscriptionId = await new EventListenerBuilder(subscriber)
  .on('user.created')
  .handle(async (event) => {
    console.log(`Processing user: ${event.data.email}`);
  })
  .startFrom('beginning')
  .subscribe();
```

### Unsubscribe

```typescript
await subscriber.unsubscribe(subscriptionId);
```

## Event Replay

### Replay All Events for Tenant

```typescript
const result = await eventBus.replayEvents({
  tenantId: 'tenant-123',
});

console.log(`Replayed ${result.events.length} events`);
```

### Replay Specific Event Type

```typescript
const result = await eventBus.replayEvents({
  tenantId: 'tenant-123',
  eventType: 'order.placed',
});

console.log(`Replayed ${result.events.length} order events`);
```

### Replay with Time Range

```typescript
const startTime = new Date('2026-02-01');
const endTime = new Date('2026-02-09');

const result = await eventBus.replayEvents({
  tenantId: 'tenant-123',
  startTime,
  endTime,
});

console.log(`Replayed ${result.events.length} events from time range`);
```

### Replay with Limit

```typescript
const result = await eventBus.replayEvents({
  tenantId: 'tenant-123',
  eventType: 'user.created',
  limit: 100,
});

console.log(`Replayed ${result.events.length} events (has more: ${result.hasMore})`);
```

## Tenant Isolation

### Validate Tenant Access

```typescript
import { TenantEnforcer, TenantContext } from './event-system/utils/tenant-enforcer';

const context: TenantContext = {
  tenantId: 'tenant-123',
  userId: 'user-456',
  permissions: ['read:events', 'write:events'],
};

const event = {
  // ... event data with tenantId: 'tenant-123'
};

// This will throw TenantIsolationError if tenant doesn't match
TenantEnforcer.validateTenantAccess(context, event);
```

### Filter Events by Tenant

```typescript
const allEvents = await eventBus.getEvents();
const tenantEvents = TenantEnforcer.filterEventsByTenant(allEvents, 'tenant-123');
```

### Check Permissions

```typescript
TenantEnforcer.validatePermission(context, 'write:events');
// Throws error if permission not available
```

## Error Handling

### Handle Validation Errors

```typescript
import { EventValidationError } from './event-system/errors';

try {
  const event = new EventBuilder(eventBus)
    .withEventType('invalid')  // Invalid format
    .withTenantId('tenant-123')
    .withSource('test')
    .build();
} catch (error) {
  if (error instanceof EventValidationError) {
    console.error(`Validation failed: ${error.message}`);
    console.error(`Details: ${JSON.stringify(error.details)}`);
  }
}
```

### Handle Publishing Errors

```typescript
import { EventPublishError } from './event-system/errors';

try {
  await publisher.publish(event);
} catch (error) {
  if (error instanceof EventPublishError) {
    console.error(`Publishing failed: ${error.message}`);
  }
}
```

### Handle Connection Errors

```typescript
import { ConnectionError } from './event-system/errors';

try {
  await eventBus.connect();
} catch (error) {
  if (error instanceof ConnectionError) {
    console.error(`Connection failed: ${error.message}`);
  }
}
```

### Handle Tenant Isolation Errors

```typescript
import { TenantIsolationError } from './event-system/errors';

try {
  TenantEnforcer.validateTenantAccess(context, event);
} catch (error) {
  if (error instanceof TenantIsolationError) {
    console.error(`Tenant isolation violation: ${error.message}`);
  }
}
```

## Audit Logging

### Access Audit Logs

```typescript
import { globalAuditLogger } from './event-system/utils/audit-logger';

// Get all logs
const allLogs = globalAuditLogger.getLogs();

// Get logs for specific tenant
const tenantLogs = globalAuditLogger.getLogsByTenant('tenant-123');

// Get logs for specific operation
const publishLogs = globalAuditLogger.getLogsByOperation('publish');

// Get logs for time range
const startTime = new Date('2026-02-01');
const endTime = new Date('2026-02-09');
const timeLogs = globalAuditLogger.getLogsByTimeRange(startTime, endTime);
```

### Get Audit Statistics

```typescript
const stats = globalAuditLogger.getStats();
console.log(`Total logs: ${stats.totalLogs}`);
console.log(`Success: ${stats.successCount}`);
console.log(`Failures: ${stats.failureCount}`);
console.log(`Operations: ${JSON.stringify(stats.operationCounts)}`);
```

## Advanced Patterns

### Event Sourcing Pattern

```typescript
// Store all events for a tenant
const events = await eventBus.replayEvents({
  tenantId: 'tenant-123',
});

// Reconstruct state from events
let state = {};
for (const event of events.events) {
  state = applyEvent(state, event);
}
```

### CQRS Pattern

```typescript
// Command: Create order
await new EventBuilder(eventBus)
  .withEventType('order.created')
  .withTenantId('tenant-123')
  .withSource('orders-module')
  .withData({ orderId: 'order-123', items: [...] })
  .publish();

// Query: Subscribe to order events
await new EventListenerBuilder(subscriber)
  .on('order.*')
  .handle(async (event) => {
    // Update read model
    await updateOrderReadModel(event);
  })
  .subscribe();
```

### Saga Pattern

```typescript
// Orchestrate distributed transaction
const correlationId = generateCorrelationId();

// Step 1: Reserve inventory
await new EventBuilder(eventBus)
  .withEventType('inventory.reserved')
  .withTenantId('tenant-123')
  .withCorrelationId(correlationId)
  .withSource('order-saga')
  .withData({ orderId: 'order-123' })
  .publish();

// Step 2: Process payment
await new EventBuilder(eventBus)
  .withEventType('payment.processed')
  .withTenantId('tenant-123')
  .withCorrelationId(correlationId)
  .withSource('order-saga')
  .withData({ orderId: 'order-123' })
  .publish();

// Step 3: Confirm order
await new EventBuilder(eventBus)
  .withEventType('order.confirmed')
  .withTenantId('tenant-123')
  .withCorrelationId(correlationId)
  .withSource('order-saga')
  .withData({ orderId: 'order-123' })
  .publish();
```

### Deadletter Pattern

```typescript
// Subscribe with error handling
await new EventListenerBuilder(subscriber)
  .on('payment.processed')
  .handle(async (event) => {
    try {
      await processPayment(event);
    } catch (error) {
      // Send to deadletter queue
      await new EventBuilder(eventBus)
        .withEventType('payment.failed')
        .withTenantId(event.tenantId)
        .withCorrelationId(event.correlationId)
        .withSource('payment-handler')
        .withData({
          originalEvent: event,
          error: error.message,
        })
        .publish();
    }
  })
  .subscribe();
```

## Best Practices

1. **Always include tenantId** - Required for all events
2. **Use correlation IDs** - For tracing across services
3. **Validate events** - Use EventBuilder which validates automatically
4. **Handle errors** - Use try-catch for all publish/subscribe operations
5. **Use consumer groups** - For load balancing subscribers
6. **Monitor audit logs** - For compliance and debugging
7. **Implement retry logic** - Use withMaxRetries for resilience
8. **Test with in-memory bus** - Use in-memory bus for testing
9. **Use event versioning** - For backward compatibility
10. **Document event schemas** - For API documentation

## Cleanup

```typescript
// Unsubscribe from all subscriptions
for (const subscription of subscriber.getSubscriptions()) {
  await subscriber.unsubscribe(subscription.id);
}

// Disconnect from event bus
await eventBus.disconnect();
```
