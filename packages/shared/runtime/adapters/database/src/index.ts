/**
 * RUNTIME-ADAPTER-DATABASE-v0.1.0
 * Public API — Main Entry Point
 *
 * This is the only file consumers should import from.
 * All types, ports, core components, drivers, sync, pool, and config are re-exported here.
 */

// Types
export * from './types';

// Ports (Interfaces)
export * from './ports';

// Core Components
export * from './core';

// Engine Drivers
export * from './drivers';

// Connection Pool
export * from './pool';

// Sync Engine
export * from './sync';

// Configuration
export * from './config';

// Main Facade
export { DatabaseAdapter } from './DatabaseAdapter';
