# Module System Documentation

**Version:** 1.0  
**Date:** February 9, 2026  
**Author:** webwakaagent3 (Architecture)  
**Module ID:** Module 4  
**Status:** PRODUCTION READY

---

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture](#2-architecture)
3. [Core Components](#3-core-components)
4. [API Reference](#4-api-reference)
5. [Module Development Guide](#5-module-development-guide)
6. [Usage Examples](#6-usage-examples)
7. [Best Practices](#7-best-practices)
8. [Troubleshooting](#8-troubleshooting)
9. [Performance Considerations](#9-performance-considerations)
10. [Security](#10-security)

---

## 1. Overview

### 1.1 Purpose

The Module System provides a unified framework for managing the lifecycle of all platform modules in the WebWaka platform. It enables dynamic loading, unloading, and management of modules at runtime, ensuring loose coupling and high cohesion across the platform architecture.

### 1.2 Key Features

- **Dynamic Module Loading:** Load and unload modules at runtime without platform restart
- **Dependency Management:** Automatic dependency resolution and load ordering
- **Lifecycle Management:** Complete lifecycle control (load, start, stop, unload)
- **Module Registry:** Centralized registry for module discovery and management
- **Health Monitoring:** Built-in health check capabilities for all modules
- **Isolation:** Module isolation to prevent failures from affecting the core platform

### 1.3 Design Principles

The Module System follows these core design principles:

1. **Loose Coupling:** Modules communicate through events, not direct method calls
2. **High Cohesion:** Each module has a single, well-defined responsibility
3. **Fail-Safe:** Module failures are isolated and do not crash the platform
4. **Extensibility:** New modules can be added without modifying existing code
5. **Discoverability:** Modules are automatically discovered from the filesystem

### 1.4 When to Use

Use the Module System when you need to:

- Add new functionality to the platform without modifying core code
- Enable/disable features dynamically at runtime
- Manage complex dependencies between components
- Isolate third-party or experimental code
- Support plugin architectures

---

## 2. Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Module System                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐          ┌──────────────┐            │
│  │Module Manager│◄────────►│Module Loader │            │
│  └──────┬───────┘          └──────┬───────┘            │
│         │                         │                     │
│         │    ┌────────────────────┘                     │
│         │    │                                          │
│         ▼    ▼                                          │
│  ┌─────────────────┐                                   │
│  │ Module Registry │                                   │
│  └─────────────────┘                                   │
│                                                          │
│  ┌─────────────────────────────────────────┐           │
│  │           Loaded Modules                │           │
│  │  ┌────────┐  ┌────────┐  ┌────────┐   │           │
│  │  │Module A│  │Module B│  │Module C│   │           │
│  │  └────────┘  └────────┘  └────────┘   │           │
│  └─────────────────────────────────────────┘           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Component Interaction

The Module System consists of three primary components that work together:

1. **Module Manager:** Orchestrates the entire module lifecycle
2. **Module Loader:** Handles filesystem operations and module instantiation
3. **Module Registry:** Maintains the state and metadata of all modules

**Typical Flow:**

```
User Request → Module Manager → Module Loader → Load from Filesystem
                    ↓
            Module Registry ← Register Module
                    ↓
            Module.onLoad() ← Execute Lifecycle Hook
                    ↓
            Module.onStart() ← Start Module (if autoStart enabled)
```

### 2.3 Module Lifecycle States

```
┌──────────┐
│ UNLOADED │ ← Initial state
└────┬─────┘
     │ loadModule()
     ▼
┌──────────┐
│  LOADED  │ ← Module loaded, not running
└────┬─────┘
     │ startModule()
     ▼
┌──────────┐
│ RUNNING  │ ← Module active and operational
└────┬─────┘
     │ stopModule()
     ▼
┌──────────┐
│ STOPPED  │ ← Module stopped, still loaded
└────┬─────┘
     │ unloadModule()
     ▼
┌──────────┐
│ UNLOADED │ ← Back to initial state
└──────────┘

     ┌──────────┐
     │  FAILED  │ ← Error state (can occur from any state)
     └──────────┘
```

### 2.4 Dependency Resolution

The Module System automatically resolves dependencies using a topological sort algorithm:

```
Module A (depends on B, C)
Module B (depends on C)
Module C (no dependencies)

Load Order: C → B → A
```

**Circular Dependency Detection:**

The system detects and prevents circular dependencies:

```
Module A → depends on → Module B
Module B → depends on → Module A

Result: Error - "Circular dependency detected"
```

---

## 3. Core Components

### 3.1 Module Interface

All modules must implement the `IModule` interface:

```typescript
interface IModule {
  getMetadata(): ModuleMetadata;
  onLoad(): Promise<void>;
  onUnload(): Promise<void>;
  onStart(): Promise<void>;
  onStop(): Promise<void>;
  healthCheck(): Promise<boolean>;
}
```

**BaseModule Abstract Class:**

For convenience, extend the `BaseModule` class which provides default implementations:

```typescript
abstract class BaseModule implements IModule {
  protected metadata: ModuleMetadata;
  
  constructor(metadata: Partial<ModuleMetadata>);
  getMetadata(): ModuleMetadata;
  async onLoad(): Promise<void>;
  async onUnload(): Promise<void>;
  async onStart(): Promise<void>;
  async onStop(): Promise<void>;
  async healthCheck(): Promise<boolean>;
}
```

### 3.2 Module Metadata

Each module has associated metadata:

```typescript
interface ModuleMetadata {
  name: string;              // Unique module identifier
  version: string;           // Semantic version (e.g., "1.0.0")
  description?: string;      // Human-readable description
  author?: string;           // Module author
  dependencies: Record<string, string>;  // Module dependencies
  status: ModuleStatus;      // Current lifecycle status
  path: string;              // Filesystem path
  loadedAt?: Date;           // When module was loaded
  startedAt?: Date;          // When module was started
}
```

**Module Status Enum:**

```typescript
enum ModuleStatus {
  UNLOADED = 'unloaded',
  LOADED = 'loaded',
  RUNNING = 'running',
  STOPPED = 'stopped',
  FAILED = 'failed'
}
```

### 3.3 Module Manager Service

The `ModuleManagerService` is the primary interface for module management:

**Constructor:**

```typescript
constructor(options?: ModuleManagerOptions)

interface ModuleManagerOptions {
  modulesPath?: string;    // Path to modules directory (default: './modules')
  autoStart?: boolean;     // Auto-start modules after loading (default: false)
  timeout?: number;        // Operation timeout in ms (default: 30000)
}
```

**Key Methods:**

| Method | Description | Returns |
|--------|-------------|---------|
| `loadModule(name)` | Load a module by name | `Promise<void>` |
| `unloadModule(name)` | Unload a loaded module | `Promise<void>` |
| `startModule(name)` | Start a loaded module | `Promise<void>` |
| `stopModule(name)` | Stop a running module | `Promise<void>` |
| `restartModule(name)` | Restart a module | `Promise<void>` |
| `loadModules(names[])` | Load multiple modules with dependency resolution | `Promise<void>` |
| `unloadModules(names[])` | Unload multiple modules | `Promise<void>` |
| `discoverModules()` | Discover available modules | `Promise<string[]>` |
| `getLoadedModules()` | Get all loaded module names | `string[]` |
| `getRunningModules()` | Get all running module names | `string[]` |
| `getModuleStatus(name)` | Get module status | `ModuleStatus \| null` |
| `getModuleMetadata(name)` | Get module metadata | `ModuleMetadata \| undefined` |
| `healthCheck(name)` | Check module health | `Promise<boolean>` |
| `healthCheckAll()` | Check health of all modules | `Promise<{[name: string]: boolean}>` |
| `shutdown()` | Shutdown all modules gracefully | `Promise<void>` |

### 3.4 Module Loader Service

The `ModuleLoaderService` handles filesystem operations:

**Key Methods:**

| Method | Description | Returns |
|--------|-------------|---------|
| `loadFromPath(path, options?)` | Load module from filesystem path | `Promise<IModule>` |
| `loadByName(name, options?)` | Load module by name | `Promise<IModule>` |
| `unload(name)` | Unload and clear module cache | `Promise<void>` |
| `discoverModules()` | Discover available modules | `Promise<string[]>` |
| `getModuleInfo(path)` | Get module metadata without loading | `Promise<ModuleMetadata \| null>` |
| `isLoaded(name)` | Check if module is loaded | `boolean` |
| `getLoadedModules()` | Get all loaded module names | `string[]` |

### 3.5 Module Registry Service

The `ModuleRegistryService` maintains module state:

**Key Methods:**

| Method | Description | Returns |
|--------|-------------|---------|
| `register(module)` | Register a module | `void` |
| `unregister(name)` | Unregister a module | `void` |
| `get(name)` | Get module instance | `IModule \| undefined` |
| `has(name)` | Check if module is registered | `boolean` |
| `getAll()` | Get all registered modules | `IModule[]` |
| `getAllNames()` | Get all module names | `string[]` |
| `getMetadata(name)` | Get module metadata | `ModuleMetadata \| undefined` |
| `getByStatus(status)` | Get modules by status | `IModule[]` |
| `getDependencies(name)` | Get module dependencies | `string[]` |
| `getDependents(name)` | Get modules depending on this module | `string[]` |
| `resolveDependencies(name)` | Resolve dependency load order | `string[]` |
| `checkDependencies(name)` | Check if dependencies are satisfied | `{satisfied: boolean, missing: string[]}` |

---

## 4. API Reference

### 4.1 Module Manager API

#### loadModule(moduleName: string): Promise<void>

Load a module by name.

**Parameters:**
- `moduleName` (string): The name of the module to load

**Throws:**
- Error if module is already loaded
- Error if dependencies are missing
- Error if module fails to load

**Example:**

```typescript
await moduleManager.loadModule('authentication');
```

#### unloadModule(moduleName: string): Promise<void>

Unload a loaded module.

**Parameters:**
- `moduleName` (string): The name of the module to unload

**Throws:**
- Error if module is not loaded
- Error if other modules depend on it
- Error if module fails to unload

**Example:**

```typescript
await moduleManager.unloadModule('authentication');
```

#### startModule(moduleName: string): Promise<void>

Start a loaded module.

**Parameters:**
- `moduleName` (string): The name of the module to start

**Throws:**
- Error if module is not loaded
- Error if module is already running
- Error if module fails to start

**Example:**

```typescript
await moduleManager.startModule('authentication');
```

#### stopModule(moduleName: string): Promise<void>

Stop a running module.

**Parameters:**
- `moduleName` (string): The name of the module to stop

**Throws:**
- Error if module is not loaded
- Error if module is not running
- Error if module fails to stop

**Example:**

```typescript
await moduleManager.stopModule('authentication');
```

#### restartModule(moduleName: string): Promise<void>

Restart a module (stop then start).

**Parameters:**
- `moduleName` (string): The name of the module to restart

**Throws:**
- Error if module is not loaded or running
- Error if restart fails

**Example:**

```typescript
await moduleManager.restartModule('authentication');
```

#### loadModules(moduleNames: string[]): Promise<void>

Load multiple modules with automatic dependency resolution.

**Parameters:**
- `moduleNames` (string[]): Array of module names to load

**Throws:**
- Error if any module fails to load
- Error if circular dependencies detected

**Example:**

```typescript
await moduleManager.loadModules(['database', 'authentication', 'api']);
// Loads in correct dependency order automatically
```

#### discoverModules(): Promise<string[]>

Discover all available modules in the modules directory.

**Returns:**
- Array of module names

**Example:**

```typescript
const availableModules = await moduleManager.discoverModules();
console.log('Available modules:', availableModules);
// Output: ['authentication', 'database', 'api', 'notifications']
```

#### getModuleStatus(moduleName: string): ModuleStatus | null

Get the current status of a module.

**Parameters:**
- `moduleName` (string): The name of the module

**Returns:**
- Module status or null if not found

**Example:**

```typescript
const status = moduleManager.getModuleStatus('authentication');
if (status === ModuleStatus.RUNNING) {
  console.log('Authentication module is running');
}
```

#### healthCheck(moduleName: string): Promise<boolean>

Check if a module is healthy.

**Parameters:**
- `moduleName` (string): The name of the module

**Returns:**
- true if module is healthy, false otherwise

**Example:**

```typescript
const isHealthy = await moduleManager.healthCheck('authentication');
if (!isHealthy) {
  console.error('Authentication module is unhealthy');
  await moduleManager.restartModule('authentication');
}
```

#### healthCheckAll(): Promise<{[moduleName: string]: boolean}>

Check health of all loaded modules.

**Returns:**
- Object mapping module names to health status

**Example:**

```typescript
const healthStatus = await moduleManager.healthCheckAll();
for (const [moduleName, isHealthy] of Object.entries(healthStatus)) {
  console.log(`${moduleName}: ${isHealthy ? 'healthy' : 'unhealthy'}`);
}
```

#### shutdown(): Promise<void>

Gracefully shutdown all modules.

**Example:**

```typescript
// Shutdown all modules before platform exit
await moduleManager.shutdown();
```

---

## 5. Module Development Guide

### 5.1 Creating a New Module

**Step 1: Create Module Directory Structure**

```
modules/
└── my-module/
    ├── index.js          # Module entry point
    ├── package.json      # Module metadata
    └── README.md         # Module documentation (optional)
```

**Step 2: Define package.json**

```json
{
  "name": "my-module",
  "version": "1.0.0",
  "description": "My custom module",
  "author": "Your Name",
  "dependencies": {
    "dependency-module": "1.0.0"
  }
}
```

**Step 3: Implement Module Class**

```typescript
// index.js
const { BaseModule } = require('../../../src/core/modules/module.interface');

class MyModule extends BaseModule {
  constructor(metadata) {
    super({
      name: 'my-module',
      version: '1.0.0',
      description: 'My custom module',
      dependencies: {},
      path: metadata.path
    });
  }

  async onLoad() {
    await super.onLoad();
    console.log('MyModule loaded');
    // Initialize resources, connect to databases, etc.
  }

  async onUnload() {
    console.log('MyModule unloading');
    // Clean up resources, close connections, etc.
    await super.onUnload();
  }

  async onStart() {
    await super.onStart();
    console.log('MyModule started');
    // Start background tasks, listeners, etc.
  }

  async onStop() {
    console.log('MyModule stopping');
    // Stop background tasks, listeners, etc.
    await super.onStop();
  }

  async healthCheck() {
    // Implement custom health check logic
    return this.metadata.status === 'running';
  }
}

module.exports = MyModule;
```

### 5.2 Module Lifecycle Hooks

Implement these lifecycle hooks to control module behavior:

#### onLoad()

Called when the module is loaded into the system.

**Use Cases:**
- Initialize configuration
- Connect to databases
- Set up data structures
- Register event listeners

**Example:**

```typescript
async onLoad() {
  await super.onLoad();
  
  // Load configuration
  this.config = await this.loadConfig();
  
  // Connect to database
  this.db = await connectDatabase(this.config.dbUrl);
  
  // Initialize cache
  this.cache = new Map();
}
```

#### onUnload()

Called when the module is unloaded from the system.

**Use Cases:**
- Close database connections
- Release file handles
- Clear caches
- Unregister event listeners

**Example:**

```typescript
async onUnload() {
  // Close database connection
  if (this.db) {
    await this.db.close();
  }
  
  // Clear cache
  this.cache.clear();
  
  await super.onUnload();
}
```

#### onStart()

Called when the module is started.

**Use Cases:**
- Start background workers
- Begin processing queues
- Start HTTP servers
- Enable features

**Example:**

```typescript
async onStart() {
  await super.onStart();
  
  // Start background worker
  this.worker = setInterval(() => {
    this.processQueue();
  }, 5000);
  
  // Start HTTP server
  this.server = await this.startServer();
}
```

#### onStop()

Called when the module is stopped.

**Use Cases:**
- Stop background workers
- Pause processing
- Stop HTTP servers
- Disable features

**Example:**

```typescript
async onStop() {
  // Stop background worker
  if (this.worker) {
    clearInterval(this.worker);
  }
  
  // Stop HTTP server
  if (this.server) {
    await this.server.close();
  }
  
  await super.onStop();
}
```

#### healthCheck()

Called to check if the module is healthy.

**Use Cases:**
- Check database connectivity
- Verify service availability
- Monitor resource usage
- Validate configuration

**Example:**

```typescript
async healthCheck() {
  try {
    // Check database connection
    if (!this.db || !await this.db.ping()) {
      return false;
    }
    
    // Check if running
    if (this.metadata.status !== ModuleStatus.RUNNING) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
}
```

### 5.3 Handling Dependencies

Declare dependencies in your module:

```typescript
class MyModule extends BaseModule {
  constructor(metadata) {
    super({
      name: 'my-module',
      version: '1.0.0',
      dependencies: {
        'database': '1.0.0',      // Requires database module v1.0.0
        'authentication': '2.x'    // Requires authentication module v2.x
      },
      path: metadata.path
    });
  }
}
```

The Module System will:
1. Check if dependencies are loaded before loading your module
2. Load dependencies in the correct order
3. Prevent unloading dependencies while your module is loaded

### 5.4 Error Handling

Always handle errors gracefully in your module:

```typescript
async onStart() {
  try {
    await super.onStart();
    await this.initializeService();
  } catch (error) {
    console.error('Failed to start module:', error);
    this.metadata.status = ModuleStatus.FAILED;
    throw error;  // Re-throw to notify Module Manager
  }
}
```

---

## 6. Usage Examples

### 6.1 Basic Module Management

```typescript
import { ModuleManagerService } from './src/core/modules';

// Initialize Module Manager
const moduleManager = new ModuleManagerService({
  modulesPath: './modules',
  autoStart: false,
  timeout: 30000
});

// Load a module
await moduleManager.loadModule('authentication');

// Start the module
await moduleManager.startModule('authentication');

// Check module status
const status = moduleManager.getModuleStatus('authentication');
console.log('Module status:', status);  // Output: 'running'

// Stop the module
await moduleManager.stopModule('authentication');

// Unload the module
await moduleManager.unloadModule('authentication');
```

### 6.2 Loading Multiple Modules with Dependencies

```typescript
// Load multiple modules with automatic dependency resolution
await moduleManager.loadModules([
  'database',
  'authentication',
  'api',
  'notifications'
]);

// Modules are loaded in correct dependency order:
// 1. database (no dependencies)
// 2. authentication (depends on database)
// 3. api (depends on authentication)
// 4. notifications (depends on database)
```

### 6.3 Module Discovery

```typescript
// Discover all available modules
const availableModules = await moduleManager.discoverModules();
console.log('Available modules:', availableModules);

// Load all discovered modules
for (const moduleName of availableModules) {
  try {
    await moduleManager.loadModule(moduleName);
    console.log(`Loaded: ${moduleName}`);
  } catch (error) {
    console.error(`Failed to load ${moduleName}:`, error);
  }
}
```

### 6.4 Health Monitoring

```typescript
// Check health of a specific module
const isHealthy = await moduleManager.healthCheck('authentication');
if (!isHealthy) {
  console.error('Authentication module is unhealthy');
  await moduleManager.restartModule('authentication');
}

// Check health of all modules
const healthStatus = await moduleManager.healthCheckAll();
for (const [moduleName, isHealthy] of Object.entries(healthStatus)) {
  if (!isHealthy) {
    console.error(`Module ${moduleName} is unhealthy`);
    // Implement recovery logic
  }
}
```

### 6.5 Graceful Shutdown

```typescript
// Graceful shutdown on process termination
process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await moduleManager.shutdown();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await moduleManager.shutdown();
  process.exit(0);
});
```

### 6.6 Module Restart on Failure

```typescript
// Monitor and restart failed modules
setInterval(async () => {
  const healthStatus = await moduleManager.healthCheckAll();
  
  for (const [moduleName, isHealthy] of Object.entries(healthStatus)) {
    if (!isHealthy) {
      console.log(`Restarting unhealthy module: ${moduleName}`);
      try {
        await moduleManager.restartModule(moduleName);
        console.log(`Successfully restarted: ${moduleName}`);
      } catch (error) {
        console.error(`Failed to restart ${moduleName}:`, error);
      }
    }
  }
}, 60000);  // Check every minute
```

### 6.7 Querying Module Information

```typescript
// Get all loaded modules
const loadedModules = moduleManager.getLoadedModules();
console.log('Loaded modules:', loadedModules);

// Get all running modules
const runningModules = moduleManager.getRunningModules();
console.log('Running modules:', runningModules);

// Get module metadata
const metadata = moduleManager.getModuleMetadata('authentication');
console.log('Module metadata:', metadata);
/*
Output:
{
  name: 'authentication',
  version: '1.0.0',
  description: 'User authentication module',
  status: 'running',
  loadedAt: 2026-02-09T10:00:00.000Z,
  startedAt: 2026-02-09T10:00:05.000Z,
  dependencies: { 'database': '1.0.0' }
}
*/
```

### 6.8 Custom Module with Advanced Features

```typescript
class AdvancedModule extends BaseModule {
  constructor(metadata) {
    super({
      name: 'advanced-module',
      version: '2.0.0',
      dependencies: {
        'database': '1.0.0',
        'cache': '1.0.0'
      },
      path: metadata.path
    });
    
    this.workers = [];
    this.eventHandlers = new Map();
  }

  async onLoad() {
    await super.onLoad();
    
    // Load configuration from file
    this.config = await this.loadConfiguration();
    
    // Get dependencies
    this.db = await this.getDependency('database');
    this.cache = await this.getDependency('cache');
    
    // Register event handlers
    this.registerEventHandlers();
  }

  async onStart() {
    await super.onStart();
    
    // Start background workers
    for (let i = 0; i < this.config.workerCount; i++) {
      const worker = this.createWorker(i);
      this.workers.push(worker);
    }
    
    // Start periodic tasks
    this.startPeriodicTasks();
  }

  async onStop() {
    // Stop periodic tasks
    this.stopPeriodicTasks();
    
    // Stop all workers
    await Promise.all(this.workers.map(w => w.stop()));
    this.workers = [];
    
    await super.onStop();
  }

  async onUnload() {
    // Unregister event handlers
    this.unregisterEventHandlers();
    
    // Close connections
    if (this.db) await this.db.close();
    if (this.cache) await this.cache.close();
    
    await super.onUnload();
  }

  async healthCheck() {
    try {
      // Check database connectivity
      if (!await this.db.ping()) return false;
      
      // Check cache connectivity
      if (!await this.cache.ping()) return false;
      
      // Check if workers are running
      const workersHealthy = this.workers.every(w => w.isHealthy());
      if (!workersHealthy) return false;
      
      return await super.healthCheck();
    } catch (error) {
      return false;
    }
  }

  private async loadConfiguration() {
    // Load configuration logic
    return { workerCount: 4, interval: 5000 };
  }

  private async getDependency(name: string) {
    // Get dependency from registry
    // This would be implemented by the Module System
    return null;
  }

  private registerEventHandlers() {
    // Register event handlers
  }

  private unregisterEventHandlers() {
    // Unregister event handlers
  }

  private createWorker(id: number) {
    // Create worker logic
    return {
      stop: async () => {},
      isHealthy: () => true
    };
  }

  private startPeriodicTasks() {
    // Start periodic tasks
  }

  private stopPeriodicTasks() {
    // Stop periodic tasks
  }
}

module.exports = AdvancedModule;
```

---

## 7. Best Practices

### 7.1 Module Design

**DO:**

✅ Keep modules focused on a single responsibility  
✅ Use semantic versioning for module versions  
✅ Document module dependencies clearly  
✅ Implement proper error handling in all lifecycle hooks  
✅ Provide meaningful health check implementations  
✅ Clean up all resources in onUnload()  
✅ Make modules stateless when possible  
✅ Use configuration files for module settings

**DON'T:**

❌ Create circular dependencies between modules  
❌ Access other modules directly (use events instead)  
❌ Assume dependencies are always available  
❌ Leave resources open after unload  
❌ Block the event loop in lifecycle hooks  
❌ Store large amounts of data in memory  
❌ Ignore errors in lifecycle hooks

### 7.2 Dependency Management

**Declaring Dependencies:**

```typescript
// Good: Specific version constraints
dependencies: {
  'database': '1.2.3',      // Exact version
  'cache': '^2.0.0',        // Compatible with 2.x
  'logger': '~1.5.0'        // Compatible with 1.5.x
}

// Bad: No version constraints
dependencies: {
  'database': '*',          // Any version (dangerous)
  'cache': 'latest'         // Unpredictable
}
```

**Checking Dependencies:**

```typescript
async onLoad() {
  await super.onLoad();
  
  // Verify dependencies are available
  const deps = this.metadata.dependencies;
  for (const depName of Object.keys(deps)) {
    if (!this.isDependencyLoaded(depName)) {
      throw new Error(`Required dependency ${depName} is not loaded`);
    }
  }
}
```

### 7.3 Error Handling

**Graceful Error Handling:**

```typescript
async onStart() {
  try {
    await super.onStart();
    await this.initializeService();
  } catch (error) {
    // Log the error
    console.error('Failed to start module:', error);
    
    // Update status
    this.metadata.status = ModuleStatus.FAILED;
    
    // Clean up partial initialization
    await this.cleanup();
    
    // Re-throw to notify Module Manager
    throw new Error(`Module startup failed: ${error.message}`);
  }
}
```

**Retry Logic:**

```typescript
async onLoad() {
  await super.onLoad();
  
  // Retry connecting to database
  const maxRetries = 3;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      this.db = await connectDatabase(this.config.dbUrl);
      break;
    } catch (error) {
      retries++;
      if (retries === maxRetries) {
        throw new Error(`Failed to connect after ${maxRetries} attempts`);
      }
      await this.sleep(1000 * retries);  // Exponential backoff
    }
  }
}
```

### 7.4 Resource Management

**Proper Resource Cleanup:**

```typescript
class ResourceModule extends BaseModule {
  async onLoad() {
    await super.onLoad();
    
    // Track all resources
    this.resources = {
      db: await connectDatabase(),
      cache: await connectCache(),
      fileHandle: await openFile(),
      timer: null
    };
  }

  async onUnload() {
    // Clean up all resources
    if (this.resources.db) {
      await this.resources.db.close();
    }
    if (this.resources.cache) {
      await this.resources.cache.disconnect();
    }
    if (this.resources.fileHandle) {
      await this.resources.fileHandle.close();
    }
    if (this.resources.timer) {
      clearInterval(this.resources.timer);
    }
    
    await super.onUnload();
  }
}
```

### 7.5 Performance Optimization

**Lazy Loading:**

```typescript
class OptimizedModule extends BaseModule {
  async onLoad() {
    await super.onLoad();
    // Only load essential resources
    this.config = await this.loadConfig();
  }

  async onStart() {
    await super.onStart();
    // Load heavy resources only when starting
    this.heavyResource = await this.loadHeavyResource();
  }

  async onStop() {
    // Release heavy resources when stopping
    if (this.heavyResource) {
      await this.heavyResource.release();
      this.heavyResource = null;
    }
    await super.onStop();
  }
}
```

**Caching:**

```typescript
class CachedModule extends BaseModule {
  async onLoad() {
    await super.onLoad();
    this.cache = new Map();
  }

  async getData(key: string) {
    // Check cache first
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    
    // Fetch and cache
    const data = await this.fetchData(key);
    this.cache.set(key, data);
    return data;
  }
}
```

### 7.6 Testing

**Unit Testing Modules:**

```typescript
describe('MyModule', () => {
  let module;

  beforeEach(() => {
    module = new MyModule({ path: '/test/path' });
  });

  afterEach(async () => {
    if (module.metadata.status !== ModuleStatus.UNLOADED) {
      await module.onUnload();
    }
  });

  it('should load successfully', async () => {
    await module.onLoad();
    expect(module.metadata.status).toBe(ModuleStatus.LOADED);
  });

  it('should start successfully', async () => {
    await module.onLoad();
    await module.onStart();
    expect(module.metadata.status).toBe(ModuleStatus.RUNNING);
  });

  it('should pass health check when running', async () => {
    await module.onLoad();
    await module.onStart();
    const isHealthy = await module.healthCheck();
    expect(isHealthy).toBe(true);
  });
});
```

---

## 8. Troubleshooting

### 8.1 Common Issues

#### Issue: Module fails to load

**Symptoms:**
- Error: "Failed to load module: Module path does not exist"

**Solutions:**
1. Verify the module directory exists in the modules path
2. Check that the module has an `index.js` file
3. Verify the modules path is correctly configured

```typescript
// Check modules path
console.log('Modules path:', moduleManager.getLoader().getModulesPath());

// Discover available modules
const modules = await moduleManager.discoverModules();
console.log('Available modules:', modules);
```

#### Issue: Missing dependencies

**Symptoms:**
- Error: "Missing dependencies for module-name: dependency-name"

**Solutions:**
1. Load dependencies before loading the module
2. Use `loadModules()` for automatic dependency resolution

```typescript
// Manual approach
await moduleManager.loadModule('dependency-module');
await moduleManager.loadModule('my-module');

// Automatic approach
await moduleManager.loadModules(['my-module']);  // Loads dependencies automatically
```

#### Issue: Circular dependency

**Symptoms:**
- Error: "Circular dependency detected"

**Solutions:**
1. Review module dependencies and remove circular references
2. Refactor modules to break the circular dependency
3. Extract shared functionality into a separate module

```typescript
// Bad: Circular dependency
Module A depends on Module B
Module B depends on Module A

// Good: Break the cycle
Module A depends on Module C
Module B depends on Module C
Module C has no dependencies
```

#### Issue: Module won't unload

**Symptoms:**
- Error: "Cannot unload module: modules [X, Y] depend on it"

**Solutions:**
1. Unload dependent modules first
2. Use `unloadModules()` for automatic dependency ordering

```typescript
// Manual approach
await moduleManager.unloadModule('dependent-module');
await moduleManager.unloadModule('base-module');

// Automatic approach
await moduleManager.unloadModules(['base-module', 'dependent-module']);
```

#### Issue: Module health check fails

**Symptoms:**
- `healthCheck()` returns false

**Solutions:**
1. Check module logs for errors
2. Verify all resources are available
3. Restart the module

```typescript
const isHealthy = await moduleManager.healthCheck('my-module');
if (!isHealthy) {
  console.log('Module is unhealthy, restarting...');
  await moduleManager.restartModule('my-module');
}
```

### 8.2 Debugging

**Enable Debug Logging:**

```typescript
// Add logging to lifecycle hooks
class DebugModule extends BaseModule {
  async onLoad() {
    console.log(`[${this.metadata.name}] Loading...`);
    await super.onLoad();
    console.log(`[${this.metadata.name}] Loaded successfully`);
  }

  async onStart() {
    console.log(`[${this.metadata.name}] Starting...`);
    await super.onStart();
    console.log(`[${this.metadata.name}] Started successfully`);
  }
}
```

**Inspect Module State:**

```typescript
// Get all modules metadata
const allMetadata = moduleManager.getAllModulesMetadata();
console.log('All modules:', JSON.stringify(allMetadata, null, 2));

// Check specific module
const metadata = moduleManager.getModuleMetadata('my-module');
console.log('Module metadata:', metadata);

// Check dependencies
const registry = moduleManager.getRegistry();
const dependencies = registry.getDependencies('my-module');
console.log('Dependencies:', dependencies);

const dependents = registry.getDependents('my-module');
console.log('Dependents:', dependents);
```

### 8.3 Performance Issues

**Issue: Slow module loading**

**Solutions:**
1. Reduce initialization work in `onLoad()`
2. Move heavy operations to `onStart()`
3. Use lazy loading for resources

```typescript
// Bad: Heavy work in onLoad
async onLoad() {
  await super.onLoad();
  this.largeData = await this.loadLargeDataset();  // Slow!
}

// Good: Lazy loading
async onLoad() {
  await super.onLoad();
  this.largeData = null;  // Don't load yet
}

async getData() {
  if (!this.largeData) {
    this.largeData = await this.loadLargeDataset();
  }
  return this.largeData;
}
```

**Issue: High memory usage**

**Solutions:**
1. Implement proper cleanup in `onUnload()`
2. Use weak references for caches
3. Limit cache sizes

```typescript
class MemoryEfficientModule extends BaseModule {
  async onLoad() {
    await super.onLoad();
    
    // Use LRU cache with size limit
    this.cache = new LRUCache({ max: 1000 });
  }

  async onUnload() {
    // Clear cache
    this.cache.clear();
    this.cache = null;
    
    await super.onUnload();
  }
}
```

---

## 9. Performance Considerations

### 9.1 Module Loading Performance

**Optimization Strategies:**

1. **Parallel Loading:** Load independent modules in parallel

```typescript
// Sequential loading (slow)
await moduleManager.loadModule('module-a');
await moduleManager.loadModule('module-b');
await moduleManager.loadModule('module-c');

// Parallel loading (fast)
await Promise.all([
  moduleManager.loadModule('module-a'),
  moduleManager.loadModule('module-b'),
  moduleManager.loadModule('module-c')
]);
```

2. **Lazy Loading:** Load modules only when needed

```typescript
// Load modules on-demand
async function ensureModuleLoaded(moduleName) {
  if (!moduleManager.isModuleLoaded(moduleName)) {
    await moduleManager.loadModule(moduleName);
  }
}
```

3. **Preloading:** Load frequently used modules at startup

```typescript
// Preload critical modules
const criticalModules = ['database', 'authentication', 'api'];
await moduleManager.loadModules(criticalModules);
```

### 9.2 Memory Management

**Best Practices:**

1. **Limit Cache Sizes:**

```typescript
class CachedModule extends BaseModule {
  async onLoad() {
    await super.onLoad();
    
    // Use LRU cache with max size
    this.cache = new LRUCache({
      max: 1000,
      maxAge: 1000 * 60 * 60  // 1 hour
    });
  }
}
```

2. **Release Resources:**

```typescript
async onUnload() {
  // Release all resources
  if (this.cache) this.cache.clear();
  if (this.db) await this.db.close();
  if (this.connections) this.connections.forEach(c => c.close());
  
  await super.onUnload();
}
```

3. **Use Weak References:**

```typescript
class WeakRefModule extends BaseModule {
  async onLoad() {
    await super.onLoad();
    
    // Use WeakMap for caching
    this.cache = new WeakMap();
  }
}
```

### 9.3 Startup Time Optimization

**Strategies:**

1. **Defer Non-Critical Initialization:**

```typescript
async onLoad() {
  await super.onLoad();
  
  // Load only essential config
  this.config = await this.loadEssentialConfig();
}

async onStart() {
  await super.onStart();
  
  // Load additional resources when starting
  this.additionalResources = await this.loadAdditionalResources();
}
```

2. **Use Connection Pooling:**

```typescript
async onLoad() {
  await super.onLoad();
  
  // Create connection pool
  this.pool = await createPool({
    min: 2,
    max: 10,
    idleTimeoutMillis: 30000
  });
}
```

### 9.4 Monitoring Performance

**Track Module Performance:**

```typescript
class MonitoredModule extends BaseModule {
  async onLoad() {
    const startTime = Date.now();
    await super.onLoad();
    const loadTime = Date.now() - startTime;
    console.log(`Module loaded in ${loadTime}ms`);
  }

  async onStart() {
    const startTime = Date.now();
    await super.onStart();
    const startTime = Date.now() - startTime;
    console.log(`Module started in ${startTime}ms`);
  }
}
```

---

## 10. Security

### 10.1 Module Isolation

The Module System provides basic isolation through separate module instances, but for production environments, consider additional isolation mechanisms:

**Recommended Isolation Strategies:**

1. **Process Isolation:** Run modules in separate processes
2. **Container Isolation:** Use Docker containers for modules
3. **Sandboxing:** Implement VM-based sandboxing (future enhancement)

### 10.2 Security Best Practices

**DO:**

✅ Validate module metadata before loading  
✅ Implement permission systems for module capabilities  
✅ Sanitize module inputs and outputs  
✅ Use secure communication channels between modules  
✅ Audit module code before deployment  
✅ Limit module resource usage (CPU, memory, disk)  
✅ Implement module signing and verification

**DON'T:**

❌ Load modules from untrusted sources  
❌ Allow modules to access core platform internals  
❌ Share sensitive data between modules directly  
❌ Run untested modules in production  
❌ Grant excessive permissions to modules

### 10.3 Module Permissions (Future Enhancement)

**Planned Permission System:**

```typescript
interface ModulePermissions {
  filesystem: {
    read: string[];    // Allowed read paths
    write: string[];   // Allowed write paths
  };
  network: {
    allowedHosts: string[];  // Allowed network hosts
    allowedPorts: number[];  // Allowed network ports
  };
  database: {
    allowedTables: string[];  // Allowed database tables
  };
  events: {
    canPublish: string[];    // Allowed event types to publish
    canSubscribe: string[];  // Allowed event types to subscribe
  };
}
```

### 10.4 Audit Logging

**Implement Audit Logging:**

```typescript
class AuditedModule extends BaseModule {
  async onLoad() {
    this.logAudit('MODULE_LOAD', { module: this.metadata.name });
    await super.onLoad();
  }

  async onStart() {
    this.logAudit('MODULE_START', { module: this.metadata.name });
    await super.onStart();
  }

  private logAudit(action: string, details: any) {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      action,
      module: this.metadata.name,
      details
    }));
  }
}
```

---

## Appendix A: Module Template

```typescript
/**
 * Module Template
 * 
 * Use this template as a starting point for new modules.
 */

const { BaseModule, ModuleStatus } = require('../../../src/core/modules/module.interface');

class TemplateModule extends BaseModule {
  constructor(metadata) {
    super({
      name: 'template-module',
      version: '1.0.0',
      description: 'Template module description',
      author: 'Your Name',
      dependencies: {
        // 'dependency-module': '1.0.0'
      },
      path: metadata.path
    });

    // Initialize module-specific properties
    this.config = null;
    this.resources = {};
  }

  /**
   * Called when module is loaded
   */
  async onLoad() {
    await super.onLoad();
    
    // Load configuration
    this.config = await this.loadConfiguration();
    
    // Initialize resources
    await this.initializeResources();
    
    console.log(`${this.metadata.name} loaded`);
  }

  /**
   * Called when module is unloaded
   */
  async onUnload() {
    // Clean up resources
    await this.cleanupResources();
    
    console.log(`${this.metadata.name} unloaded`);
    
    await super.onUnload();
  }

  /**
   * Called when module is started
   */
  async onStart() {
    await super.onStart();
    
    // Start services
    await this.startServices();
    
    console.log(`${this.metadata.name} started`);
  }

  /**
   * Called when module is stopped
   */
  async onStop() {
    // Stop services
    await this.stopServices();
    
    console.log(`${this.metadata.name} stopped`);
    
    await super.onStop();
  }

  /**
   * Health check implementation
   */
  async healthCheck() {
    try {
      // Implement custom health check logic
      const isRunning = this.metadata.status === ModuleStatus.RUNNING;
      const resourcesHealthy = await this.checkResourcesHealth();
      
      return isRunning && resourcesHealthy;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  /**
   * Load module configuration
   */
  private async loadConfiguration() {
    // Implement configuration loading
    return {
      // Configuration properties
    };
  }

  /**
   * Initialize module resources
   */
  private async initializeResources() {
    // Implement resource initialization
  }

  /**
   * Clean up module resources
   */
  private async cleanupResources() {
    // Implement resource cleanup
  }

  /**
   * Start module services
   */
  private async startServices() {
    // Implement service startup
  }

  /**
   * Stop module services
   */
  private async stopServices() {
    // Implement service shutdown
  }

  /**
   * Check health of module resources
   */
  private async checkResourcesHealth() {
    // Implement resource health check
    return true;
  }
}

module.exports = TemplateModule;
```

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| **Module** | A self-contained unit of functionality that can be loaded and unloaded dynamically |
| **Module System** | The framework that manages module lifecycle and dependencies |
| **Module Manager** | The service that orchestrates module loading, starting, stopping, and unloading |
| **Module Loader** | The service that handles filesystem operations and module instantiation |
| **Module Registry** | The service that maintains module state and metadata |
| **Lifecycle Hook** | A method called at specific points in a module's lifecycle (onLoad, onStart, etc.) |
| **Dependency** | A module that another module requires to function |
| **Dependency Resolution** | The process of determining the correct order to load modules based on dependencies |
| **Circular Dependency** | A situation where Module A depends on Module B, and Module B depends on Module A |
| **Health Check** | A method to verify that a module is functioning correctly |
| **Module Status** | The current state of a module (UNLOADED, LOADED, RUNNING, STOPPED, FAILED) |
| **Module Metadata** | Information about a module (name, version, dependencies, status, etc.) |

---

## Appendix C: Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-09 | Initial documentation release |

---

## Appendix D: References

- [Module System Specification](../specifications/MODULE_SYSTEM_SPECIFICATION.md)
- [Module System Test Strategy](../test-strategies/MODULE_SYSTEM_TEST_STRATEGY.md)
- [Module System Test Coverage Report](../TEST_COVERAGE_REPORT_WEEK_15.md)
- [WebWaka Platform Architecture](../architecture/)

---

**Document Status:** PRODUCTION READY  
**Last Updated:** February 9, 2026  
**Maintained By:** webwakaagent3 (Architecture)  
**Contact:** architecture@webwaka.com
