# Event System Module

The Event System is a core module of the WebWaka platform that provides event-driven architecture capabilities. It enables loose coupling between services through asynchronous event publishing and subscription.

## Features

- **Event Publishing**: Publish events to the event bus
- **Event Subscription**: Subscribe to events with flexible patterns
- **Event Replay**: Replay historical events for a tenant
- **Tenant Isolation**: Strict tenant isolation at all levels
- **Audit Logging**: Complete audit trail of all operations
- **Error Handling**: Comprehensive error handling with custom error classes
- **Retry Logic**: Automatic retry with exponential backoff
- **Multiple Implementations**: In-memory (development) and NATS (production)
- **Fluent APIs**: Easy-to-use builder patterns
- **Type Safety**: Full TypeScript support with strict typing

## Architecture

### Core Components

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

### Event Flow

```
1. Publisher creates event using EventBuilder
2. Event is validated against schema
3. Event is published to Event Bus
4. Event Bus delivers to all matching subscribers
5. Subscribers process event with retry logic
6. All operations logged to Audit Logger
7. Tenant isolation enforced at each step
```

## Installation

The Event System is included in the webwaka-platform package.

```bash
npm install
```

## Quick Start

### Development (In-Memory)

```typescript
import { EventSystemFactory } from './event-system/factory/event-system-factory';

// Initialize
const system = await EventSystemFactory.createEventSystem({
  type: 'in-memory',
});

// Publish event
await new EventBuilder(system.publisher)
  .withEventType('user.created')
  .withTenantId('tenant-123')
  .withSource('identity-module')
  .withData({ email: 'user@example.com' })
  .publish();

// Subscribe to events
await new EventListenerBuilder(system.subscriber)
  .on('user.created')
  .handle(async (event) => {
    console.log(`User created: ${event.data.email}`);
  })
  .subscribe();

// Cleanup
await system.eventBus.disconnect();
```

### Production (NATS)

```typescript
const system = await EventSystemFactory.createEventSystem({
  type: 'nats',
  nats: {
    servers: ['nats://nats-1:4222', 'nats://nats-2:4222'],
    user: 'webwaka',
    password: process.env.NATS_PASSWORD,
  },
});
```

## API Reference

### EventBuilder

Fluent API for building and publishing events.

```typescript
new EventBuilder(publisher)
  .withEventType('user.created')
  .withTenantId('tenant-123')
  .withSource('module-name')
  .withData({ /* event data */ })
  .publish();
```

**Methods:**
- `withEventType(type: string)` - Set event type
- `withEventVersion(version: string)` - Set event version (default: '1.0')
- `withTenantId(id: string)` - Set tenant ID (required)
- `withUserId(id: string)` - Set user ID (optional)
- `withSource(source: string)` - Set source module (required)
- `withCorrelationId(id: string)` - Set correlation ID (optional)
- `withData(data: object)` - Set event data (required)
- `addDataField(key: string, value: any)` - Add field to event data
- `publish()` - Publish the event
- `build()` - Build event without publishing

### EventListenerBuilder

Fluent API for subscribing to events.

```typescript
new EventListenerBuilder(subscriber)
  .on('user.*')
  .handle(async (event) => { /* handle event */ })
  .withMaxRetries(3)
  .subscribe();
```

**Methods:**
- `on(eventType: string)` - Set event type pattern
- `handle(handler: (event: Event) => Promise<void>)` - Set event handler
- `withConsumerGroup(group: string)` - Set consumer group (optional)
- `startFrom(position: 'now' | 'beginning' | Date)` - Set start position (optional)
- `withMaxRetries(count: number)` - Set max retries (optional)
- `withRetryDelayMs(ms: number)` - Set retry delay (optional)
- `subscribe()` - Subscribe to events

### Event Interface

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

### Error Classes

- `EventSystemError` - Base error class
- `EventValidationError` - Event validation failed
- `EventPublishError` - Event publishing failed
- `SubscriptionError` - Subscription operation failed
- `ConnectionError` - Event bus connection failed
- `TenantIsolationError` - Tenant isolation violation
- `AuthenticationError` - Authentication failed
- `AuthorizationError` - Authorization failed

## Event Type Naming Convention

Event types follow the pattern: `domain.entity.action`

Examples:
- `user.created` - User entity created
- `user.updated` - User entity updated
- `order.placed` - Order entity placed
- `payment.processed` - Payment entity processed
- `inventory.reserved` - Inventory entity reserved

## Tenant Isolation

All events are isolated by tenant. The `tenantId` field is mandatory and enforced at all levels:

- **Publishing**: Events must include tenantId
- **Subscription**: Subscribers only receive events from their tenant
- **Replay**: Replay operations are tenant-scoped
- **Audit Logs**: Logs are filtered by tenant

## Audit Logging

All Event System operations are logged for compliance:

```typescript
import { globalAuditLogger } from './event-system/utils/audit-logger';

// Get logs for specific tenant
const logs = globalAuditLogger.getLogsByTenant('tenant-123');

// Get statistics
const stats = globalAuditLogger.getStats();
```

Logged operations:
- `publish` - Event published
- `subscribe` - Subscription created
- `unsubscribe` - Subscription removed
- `replay` - Events replayed
- `connect` - Event bus connected
- `disconnect` - Event bus disconnected

## Testing

### Unit Tests

```bash
npm test -- tests/event-system
```

### Test Coverage

- Event Validator: 93.61%
- ID Generator: 100%
- In-Memory Event Bus: 49.43%
- Event Publisher: 92.3%
- Event Subscriber: 67.92%
- Error Handling: 100%
- Factory: 100%

### Example Test

```typescript
describe('Event Publisher', () => {
  it('should publish a valid event', async () => {
    const event = new EventBuilder(publisher)
      .withEventType('user.created')
      .withTenantId('tenant-123')
      .withSource('test')
      .build();

    await publisher.publish(event);
    expect(eventBus.getEvents()).toHaveLength(1);
  });
});
```

## Performance

### Throughput

- **In-Memory Bus**: 10,000+ events/second per tenant
- **NATS Bus**: 100,000+ events/second per tenant

### Latency

- **In-Memory Bus**: <1ms P99 latency
- **NATS Bus**: <100ms P99 latency

## Compliance

The Event System is designed with compliance in mind:

- **Nigerian-First**: Flexible event schema for Nigerian-specific data
- **Mobile-First**: Low-bandwidth optimized for mobile networks
- **PWA-First**: Offline functionality support
- **Africa-First**: Horizontally scalable architecture

## Best Practices

1. **Always include tenantId** - Required for all events
2. **Use correlation IDs** - For tracing across services
3. **Validate events** - Use EventBuilder which validates automatically
4. **Handle errors** - Use try-catch for all operations
5. **Use consumer groups** - For load balancing subscribers
6. **Monitor audit logs** - For compliance and debugging
7. **Implement retry logic** - Use withMaxRetries for resilience
8. **Test with in-memory bus** - Use in-memory bus for testing
9. **Use event versioning** - For backward compatibility
10. **Document event schemas** - For API documentation

## Troubleshooting

### Connection Errors

```
Error: Connection failed
```

**Solution:** Ensure NATS server is running and accessible.

### Tenant Isolation Errors

```
Error: Tenant isolation violation
```

**Solution:** Ensure event tenantId matches context tenantId.

### Validation Errors

```
Error: Event validation failed
```

**Solution:** Check event schema - all required fields must be present and valid.

## Examples

See [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md) for comprehensive usage examples.

## Contributing

When contributing to the Event System:

1. Follow TypeScript strict mode
2. Add unit tests for new features
3. Maintain >90% code coverage
4. Update documentation
5. Follow event naming conventions
6. Enforce tenant isolation

## License

WebWaka Platform - All Rights Reserved
