/**
 * Order Management Module
 * 
 * Main entry point for the Order Management module.
 * Exports all public interfaces, services, and controllers.
 */

// Models
export { Order, OrderItem } from './models';

// Types
export * from './types';

// Services
export { OrderService } from './services/OrderService';

// Controllers
export { OrderController } from './controllers/OrderController';

// Events
export { EventPublisher, EventBus } from './events/EventPublisher';

// Repository
export { OrderRepository } from './repositories/OrderRepository';
