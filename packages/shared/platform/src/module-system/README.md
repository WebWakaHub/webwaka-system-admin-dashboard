# Module System

The Module System is a comprehensive framework for managing modular applications. It provides a complete lifecycle management system for modules, enabling dynamic loading, unloading, and communication between modules.

## Features

- **Module Lifecycle Management** - Load, unload, start, and stop modules
- **Module Registry** - Central registry for managing loaded modules
- **Module Loader** - Load modules from the filesystem
- **Module Manager** - Manage module lifecycle and operations
- **Module Sandbox** - Execute modules in isolated environments
- **Inter-Module Communication** - Communicate between modules via Event System
- **Configuration Management** - Manage module configurations
- **Version Management** - Handle module versioning and compatibility
- **Error Handling** - Comprehensive error handling with custom error classes
- **Factory Pattern** - Easy creation of Module System components

## Architecture

### Core Components

1. **Module Registry** - Stores and manages loaded modules
2. **Module Loader** - Loads modules from filesystem
3. **Module Manager** - Orchestrates module lifecycle
4. **Module Sandbox** - Provides isolated execution environment
5. **Module Lifecycle Manager** - Handles state transitions
6. **Module Communication Manager** - Enables inter-module communication
7. **Module Config Manager** - Manages module configurations
8. **Module Version Manager** - Handles versioning and compatibility

### Module Lifecycle

```
unloaded -> loaded -> running -> stopped -> unloaded
           |                       |
           +------> error <--------+
```

## API Reference

### Module Interface

```typescript
interface Module {
  name: string;
  version: string;
  dependencies: Record<string, string>;
  path: string;
  status: ModuleStatus;
  onLoad: () => Promise<void>;
  onUnload: () => Promise<void>;
  onStart: () => Promise<void>;
  onStop: () => Promise<void>;
}
```

### Module Manager API

```typescript
interface IModuleManager {
  load(request: ModuleLoadRequest): Promise<Module>;
  unload(moduleName: string): Promise<void>;
  start(moduleName: string): Promise<void>;
  stop(moduleName: string): Promise<void>;
  list(): Module[];
  get(moduleName: string): Module | undefined;
}
```

### Module Communication API

```typescript
interface IModuleCommunicationManager {
  sendMessage(fromModule: string, toModule: string, message: any): Promise<void>;
  subscribeToModule(moduleName: string, handler: (message: any) => Promise<void>): Promise<void>;
  broadcast(fromModule: string, message: any): Promise<void>;
  unsubscribe(moduleName: string): Promise<void>;
}
```

## Usage Examples

### Creating a Module System

```typescript
import { ModuleSystemFactory } from '@webwaka/module-system';

const system = ModuleSystemFactory.createCompleteModuleSystem();
```

### Loading a Module

```typescript
const module = await system.manager.load({
  name: 'my-module',
  version: '1.0.0',
  path: '/path/to/module',
});
```

### Starting a Module

```typescript
await system.manager.start('my-module');
```

### Inter-Module Communication

```typescript
const commManager = new DefaultModuleCommunicationManager(publisher, subscriber);

// Send message from one module to another
await commManager.sendMessage('module-a', 'module-b', { action: 'update' });

// Subscribe to messages
await commManager.subscribeToModule('module-b', async (message) => {
  console.log('Received message:', message);
});
```

### Module Configuration

```typescript
const configManager = new DefaultModuleConfigManager();

// Load configuration
const config = await configManager.loadConfig('my-module', '/path/to/config.json');

// Set configuration value
configManager.setConfigValue('my-module', 'debug', true);

// Get configuration value
const debugMode = configManager.getConfigValue('my-module', 'debug');
```

### Version Management

```typescript
const versionManager = new DefaultModuleVersionManager();

// Check compatibility
const isCompatible = versionManager.isCompatible('2.1.0', '2.0.0');

// Get latest compatible version
const latest = versionManager.getLatestCompatibleVersion(
  ['1.0.0', '2.0.0', '2.1.0', '3.0.0'],
  '2.0.0'
);
```

## Best Practices

1. **Always handle errors** - Use try-catch blocks when loading/unloading modules
2. **Use dependency injection** - Pass dependencies to modules via constructor
3. **Implement proper lifecycle hooks** - Implement onLoad, onUnload, onStart, onStop
4. **Use event-driven communication** - Use Event System for inter-module communication
5. **Version your modules** - Use semantic versioning for module versions
6. **Validate configurations** - Validate module configurations before loading
7. **Monitor module health** - Implement health checks for running modules
8. **Log module operations** - Log important module lifecycle events

## Error Handling

The Module System provides comprehensive error handling with custom error classes:

- `ModuleSystemError` - Base error class
- `ModuleNotFoundError` - Module not found in registry
- `ModuleAlreadyLoadedError` - Module already loaded
- `ModuleLoadError` - Error during module loading
- `ModuleUnloadError` - Error during module unloading
- `DependencyResolutionError` - Dependency resolution failure
- `ModuleSandboxError` - Sandbox execution error
- `InvalidModuleError` - Invalid module structure
- `ModuleStateError` - Invalid module state transition

## Testing

The Module System includes comprehensive unit tests covering:

- Module Registry operations
- Module Loader functionality
- Module Manager lifecycle
- Error handling
- Factory pattern
- Lifecycle management
- Communication
- Configuration management
- Version management

Run tests with:

```bash
npm test -- tests/module-system
```

## Performance

- Module loading time: < 500ms per module
- Module startup time: < 100ms per module
- Support for 100+ concurrent modules
- Memory efficient module isolation

## Security

- Module sandboxing for isolation
- Permission-based access control
- Audit logging for all operations
- Tenant isolation enforcement

## Compliance

- Nigerian-First: Support for locally developed modules
- Mobile-First: Lightweight module management
- PWA-First: Works in PWA environments
- Africa-First: Horizontally scalable architecture

## License

WebWaka Platform - All Rights Reserved
