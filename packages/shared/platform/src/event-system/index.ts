/**
 * Event System Module
 * Central export file for the Event System module
 */

// Types
export * from './types';

// Errors
export * from './errors';

// Event Bus implementations
export { InMemoryEventBus } from './bus/in-memory-event-bus';
export { NatsEventBus, type NatsEventBusConfig } from './bus/nats-event-bus';

// Publisher
export { DefaultEventPublisher, EventBuilder } from './publisher/event-publisher';

// Subscriber
export { DefaultEventSubscriber, EventListenerBuilder, type EventHandler } from './subscriber/event-subscriber';

// Factory
export { EventSystemFactory, type EventSystemConfig } from './factory/event-system-factory';

// Utilities
export { validateEvent, validateEventOrThrow } from './utils/event-validator';
export { generateUuid, generateEventId, generateCorrelationId, generateSubscriptionId, generateTimestamp } from './utils/id-generator';
