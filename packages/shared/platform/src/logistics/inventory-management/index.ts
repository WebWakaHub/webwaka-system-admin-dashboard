/**
 * Inventory Management Module
 * 
 * Main entry point for the Inventory Management module
 * Exports all public interfaces, services, and controllers
 */

// Types
export * from './types';

// Models
export * from './models';

// Services
export { InventoryService } from './services/InventoryService';

// Controllers
export { InventoryController } from './controllers/InventoryController';

// Events
export { EventPublisher } from './events/EventPublisher';

// Repositories
export { InventoryRepository } from './repositories/InventoryRepository';
