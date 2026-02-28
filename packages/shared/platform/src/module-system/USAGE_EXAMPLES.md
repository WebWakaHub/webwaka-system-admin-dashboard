# Module System Usage Examples

## Example 1: Basic Module Loading and Execution

```typescript
import { ModuleSystemFactory } from '@webwaka/module-system';

async function basicModuleExample() {
  // Create a complete Module System
  const system = ModuleSystemFactory.createCompleteModuleSystem();

  // Load a module
  const module = await system.manager.load({
    name: 'auth-module',
    version: '1.0.0',
    path: '/modules/auth',
    dependencies: {},
  });

  console.log(`Module ${module.name} loaded with status: ${module.status}`);

  // Start the module
  await system.manager.start('auth-module');
  console.log('Module started successfully');

  // Stop the module
  await system.manager.stop('auth-module');
  console.log('Module stopped');

  // Unload the module
  await system.manager.unload('auth-module');
  console.log('Module unloaded');
}
```

## Example 2: Module with Dependencies

```typescript
async function modulesWithDependencies() {
  const system = ModuleSystemFactory.createCompleteModuleSystem();

  // Load dependency module first
  const depModule = await system.manager.load({
    name: 'database-module',
    version: '1.0.0',
    path: '/modules/database',
  });

  // Load module that depends on database
  const appModule = await system.manager.load({
    name: 'app-module',
    version: '1.0.0',
    path: '/modules/app',
    dependencies: {
      'database-module': '1.0.0',
    },
  });

  // Resolve dependencies
  const resolved = await system.registry.resolveDependencies(appModule);
  console.log(`Resolved ${resolved.length} dependencies`);
}
```

## Example 3: Inter-Module Communication

```typescript
import { DefaultModuleCommunicationManager } from '@webwaka/module-system';
import { EventPublisher, EventSubscriber } from '@webwaka/event-system';

async function interModuleCommunication(publisher: EventPublisher, subscriber: EventSubscriber) {
  const commManager = new DefaultModuleCommunicationManager(publisher, subscriber);

  // Module A subscribes to messages
  await commManager.subscribeToModule('module-a', async (message) => {
    console.log('Module A received:', message);
    if (message.action === 'process') {
      // Process the message
      console.log('Processing:', message.data);
    }
  });

  // Module B sends a message to Module A
  await commManager.sendMessage('module-b', 'module-a', {
    action: 'process',
    data: { id: 123, name: 'test' },
  });

  // Broadcast message to all modules
  await commManager.broadcast('module-b', {
    event: 'data-updated',
    timestamp: new Date().toISOString(),
  });
}
```

## Example 4: Module Configuration Management

```typescript
import { DefaultModuleConfigManager } from '@webwaka/module-system';

async function moduleConfiguration() {
  const configManager = new DefaultModuleConfigManager();

  // Load configuration
  const config = await configManager.loadConfig('api-module', '/config/api.json');

  // Set configuration values
  configManager.setConfigValue('api-module', 'port', 3000);
  configManager.setConfigValue('api-module', 'host', 'localhost');
  configManager.setConfigValue('api-module', 'debug', true);

  // Get configuration values
  const port = configManager.getConfigValue('api-module', 'port');
  const host = configManager.getConfigValue('api-module', 'host');
  const debug = configManager.getConfigValue('api-module', 'debug');

  console.log(`API Module configured: ${host}:${port} (debug: ${debug})`);

  // Save configuration
  await configManager.saveConfig('api-module', {
    port,
    host,
    debug,
  });
}
```

## Example 5: Module Lifecycle Management

```typescript
import { DefaultModuleLifecycleManager } from '@webwaka/module-system';

async function moduleLifecycle(module: Module) {
  const lifecycleManager = new DefaultModuleLifecycleManager();

  // Get valid next states
  const validStates = lifecycleManager.getValidNextStates('unloaded');
  console.log('Valid next states:', validStates); // ['loaded', 'error']

  // Check if transition is valid
  const isValid = lifecycleManager.isValidTransition('loaded', 'running');
  console.log('Is valid transition:', isValid); // true

  // Listen to state changes
  lifecycleManager.onStateChange(module, (oldState, newState) => {
    console.log(`Module ${module.name} transitioned from ${oldState} to ${newState}`);
  });

  // Transition to new state
  await lifecycleManager.transitionTo(module, 'loaded');
  await lifecycleManager.transitionTo(module, 'running');
}
```

## Example 6: Module Version Management

```typescript
import { DefaultModuleVersionManager } from '@webwaka/module-system';

function moduleVersioning() {
  const versionManager = new DefaultModuleVersionManager();

  // Check compatibility
  console.log(versionManager.isCompatible('2.1.0', '2.0.0')); // true
  console.log(versionManager.isCompatible('1.5.0', '2.0.0')); // false

  // Get latest compatible version
  const versions = ['1.0.0', '2.0.0', '2.1.0', '2.2.0', '3.0.0'];
  const latest = versionManager.getLatestCompatibleVersion(versions, '2.0.0');
  console.log('Latest compatible:', latest); // 2.2.0

  // Compare versions
  console.log(versionManager.compareVersions('2.1.0', '2.0.0')); // 1 (first is newer)
  console.log(versionManager.compareVersions('1.0.0', '2.0.0')); // -1 (second is newer)
}
```

## Example 7: Error Handling

```typescript
import {
  ModuleNotFoundError,
  ModuleLoadError,
  ModuleStateError,
} from '@webwaka/module-system';

async function errorHandling(system: ModuleSystem) {
  try {
    // Try to load a non-existent module
    await system.manager.load({
      name: 'non-existent',
      version: '1.0.0',
      path: '/modules/non-existent',
    });
  } catch (error) {
    if (error instanceof ModuleLoadError) {
      console.error('Failed to load module:', error.message);
    }
  }

  try {
    // Try to start a module that's not loaded
    await system.manager.start('unloaded-module');
  } catch (error) {
    if (error instanceof ModuleStateError) {
      console.error('Invalid state transition:', error.message);
    }
  }

  try {
    // Try to get a module that doesn't exist
    const module = system.manager.get('non-existent');
    if (!module) {
      throw new ModuleNotFoundError('non-existent');
    }
  } catch (error) {
    if (error instanceof ModuleNotFoundError) {
      console.error('Module not found:', error.message);
    }
  }
}
```

## Example 8: Complete Application Example

```typescript
import { ModuleSystemFactory } from '@webwaka/module-system';

async function completeApplication() {
  // Initialize Module System
  const system = ModuleSystemFactory.createCompleteModuleSystem();

  try {
    // Load core modules
    console.log('Loading core modules...');
    const dbModule = await system.manager.load({
      name: 'database',
      version: '1.0.0',
      path: '/modules/database',
    });

    const authModule = await system.manager.load({
      name: 'authentication',
      version: '1.0.0',
      path: '/modules/authentication',
      dependencies: { database: '1.0.0' },
    });

    const apiModule = await system.manager.load({
      name: 'api',
      version: '1.0.0',
      path: '/modules/api',
      dependencies: { authentication: '1.0.0', database: '1.0.0' },
    });

    // Start modules in order
    console.log('Starting modules...');
    await system.manager.start('database');
    await system.manager.start('authentication');
    await system.manager.start('api');

    console.log('All modules started successfully');

    // List all running modules
    const modules = system.manager.list();
    console.log(`Running modules: ${modules.map(m => m.name).join(', ')}`);

    // Application is running...
    // In a real application, this would run indefinitely

    // Graceful shutdown
    console.log('Shutting down...');
    await system.manager.stop('api');
    await system.manager.stop('authentication');
    await system.manager.stop('database');

    await system.manager.unload('api');
    await system.manager.unload('authentication');
    await system.manager.unload('database');

    console.log('Shutdown complete');
  } catch (error) {
    console.error('Application error:', error);
    process.exit(1);
  }
}
```

## Example 9: Module Health Monitoring

```typescript
async function moduleHealthMonitoring(system: ModuleSystem) {
  // Monitor module health
  const healthCheckInterval = setInterval(async () => {
    const modules = system.manager.list();

    for (const module of modules) {
      if (module.status === 'running') {
        try {
          // Perform health check (implementation depends on module)
          console.log(`✓ Module ${module.name} is healthy`);
        } catch (error) {
          console.error(`✗ Module ${module.name} is unhealthy:`, error);
          // Take corrective action
          await system.manager.stop(module.name);
          await system.manager.start(module.name);
        }
      }
    }
  }, 30000); // Check every 30 seconds

  // Clean up on shutdown
  process.on('SIGTERM', () => {
    clearInterval(healthCheckInterval);
  });
}
```

## Example 10: Module Metrics and Monitoring

```typescript
async function moduleMetrics(system: ModuleSystem) {
  const metrics = {
    loadedModules: 0,
    runningModules: 0,
    failedModules: 0,
    totalLoadTime: 0,
    averageLoadTime: 0,
  };

  const modules = system.manager.list();

  metrics.loadedModules = modules.filter(m => m.status !== 'unloaded').length;
  metrics.runningModules = modules.filter(m => m.status === 'running').length;
  metrics.failedModules = modules.filter(m => m.status === 'error').length;

  console.log('Module Metrics:');
  console.log(`- Loaded modules: ${metrics.loadedModules}`);
  console.log(`- Running modules: ${metrics.runningModules}`);
  console.log(`- Failed modules: ${metrics.failedModules}`);
  console.log(`- Total modules: ${modules.length}`);
}
```

These examples demonstrate the key features and usage patterns of the Module System. For more information, refer to the API documentation and the main README.
