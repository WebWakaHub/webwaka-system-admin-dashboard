/**
 * Integration Tests - Module System
 * 
 * Tests the complete Module System workflow including:
 * - Module loading with dependencies
 * - Module lifecycle management
 * - Dependency resolution
 * - Module failure scenarios
 */

import { ModuleManagerService } from '../../../src/core/modules/module-manager.service';
import { ModuleStatus } from '../../../src/core/modules/module.interface';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

describe('Module System Integration Tests', () => {
  let manager: ModuleManagerService;
  let testModulesDir: string;

  beforeAll(async () => {
    // Create a temporary directory for test modules
    testModulesDir = await fs.mkdtemp(path.join(os.tmpdir(), 'test-modules-'));
  });

  afterAll(async () => {
    // Clean up test modules directory
    try {
      await fs.rm(testModulesDir, { recursive: true, force: true });
    } catch (error) {
      console.error('Failed to clean up test modules directory:', error);
    }
  });

  beforeEach(async () => {
    // Clean up any existing modules from previous tests
    try {
      const entries = await fs.readdir(testModulesDir);
      for (const entry of entries) {
        await fs.rm(path.join(testModulesDir, entry), { recursive: true, force: true });
      }
    } catch (error) {
      // Directory might not exist yet
    }
    manager = new ModuleManagerService({ modulesPath: testModulesDir });
  });

  afterEach(async () => {
    // Shutdown manager and clean up modules
    try {
      await manager.shutdown();
    } catch (error) {
      // Ignore shutdown errors in tests
    }
  });

  describe('Module Discovery', () => {
    it('should discover modules in the modules directory', async () => {
      // Create test module directories
      await createTestModule('test-module-1', {});
      await createTestModule('test-module-2', {});

      const modules = await manager.discoverModules();

      expect(modules).toContain('test-module-1');
      expect(modules).toContain('test-module-2');
    });

    it('should return empty array when no modules exist', async () => {
      const modules = await manager.discoverModules();

      expect(modules).toEqual([]);
    });
  });

  describe('Module Loading and Lifecycle', () => {
    it('should load a simple module', async () => {
      await createTestModule('simple-module', {});

      await manager.loadModule('simple-module');

      expect(manager.isModuleLoaded('simple-module')).toBe(true);
      expect(manager.getModuleStatus('simple-module')).toBe(ModuleStatus.LOADED);
    });

    it('should start a loaded module', async () => {
      await createTestModule('startable-module', {});
      await manager.loadModule('startable-module');

      await manager.startModule('startable-module');

      expect(manager.isModuleRunning('startable-module')).toBe(true);
      expect(manager.getModuleStatus('startable-module')).toBe(ModuleStatus.RUNNING);
    });

    it('should stop a running module', async () => {
      await createTestModule('stoppable-module', {});
      await manager.loadModule('stoppable-module');
      await manager.startModule('stoppable-module');

      await manager.stopModule('stoppable-module');

      expect(manager.isModuleRunning('stoppable-module')).toBe(false);
      expect(manager.getModuleStatus('stoppable-module')).toBe(ModuleStatus.STOPPED);
    });

    it('should unload a stopped module', async () => {
      await createTestModule('unloadable-module', {});
      await manager.loadModule('unloadable-module');
      await manager.startModule('unloadable-module');
      await manager.stopModule('unloadable-module');

      await manager.unloadModule('unloadable-module');

      expect(manager.isModuleLoaded('unloadable-module')).toBe(false);
    });

    it('should handle complete lifecycle: load -> start -> stop -> unload', async () => {
      await createTestModule('lifecycle-module', {});

      // Load
      await manager.loadModule('lifecycle-module');
      expect(manager.getModuleStatus('lifecycle-module')).toBe(ModuleStatus.LOADED);

      // Start
      await manager.startModule('lifecycle-module');
      expect(manager.getModuleStatus('lifecycle-module')).toBe(ModuleStatus.RUNNING);

      // Stop
      await manager.stopModule('lifecycle-module');
      expect(manager.getModuleStatus('lifecycle-module')).toBe(ModuleStatus.STOPPED);

      // Unload
      await manager.unloadModule('lifecycle-module');
      expect(manager.isModuleLoaded('lifecycle-module')).toBe(false);
    });
  });

  describe('Dependency Management', () => {
    it('should load modules with dependencies in correct order', async () => {
      // Create modules with dependencies
      await createTestModule('core-module', {});
      await createTestModule('utils-module', { 'core-module': '1.0.0' });
      await createTestModule('app-module', { 'core-module': '1.0.0', 'utils-module': '1.0.0' });

      // Load all modules
      await manager.loadModule('core-module');
      await manager.loadModule('utils-module');
      await manager.loadModule('app-module');

      expect(manager.isModuleLoaded('core-module')).toBe(true);
      expect(manager.isModuleLoaded('utils-module')).toBe(true);
      expect(manager.isModuleLoaded('app-module')).toBe(true);
    });

    it('should fail to load module with missing dependencies', async () => {
      await createTestModule('dependent-module', { 'missing-module': '1.0.0' });

      await expect(manager.loadModule('dependent-module')).rejects.toThrow('Missing dependencies');
    });

    it('should prevent unloading module with dependents', async () => {
      await createTestModule('base-module-2', {});
      await createTestModule('dependent-module-2', { 'base-module-2': '1.0.0' });

      await manager.loadModule('base-module-2');
      await manager.loadModule('dependent-module-2');

      await expect(manager.unloadModule('base-module-2')).rejects.toThrow('depend on it');
    });
  });

  describe('Health Checks', () => {
    it('should report healthy status for running module', async () => {
      await createTestModule('healthy-module', {});
      await manager.loadModule('healthy-module');
      await manager.startModule('healthy-module');

      const isHealthy = await manager.healthCheck('healthy-module');

      expect(isHealthy).toBe(true);
    });

    it('should report unhealthy status for stopped module', async () => {
      await createTestModule('stopped-module', {});
      await manager.loadModule('stopped-module');

      const isHealthy = await manager.healthCheck('stopped-module');

      expect(isHealthy).toBe(false);
    });

    it('should check health of all modules', async () => {
      await createTestModule('module-1', {});
      await createTestModule('module-2', {});

      await manager.loadModule('module-1');
      await manager.loadModule('module-2');
      await manager.startModule('module-1');

      const healthStatus = await manager.healthCheckAll();

      expect(healthStatus['module-1']).toBe(true);
      expect(healthStatus['module-2']).toBe(false);
    });
  });

  describe('Shutdown', () => {
    it('should shutdown all modules gracefully', async () => {
      await createTestModule('module-1', {});
      await createTestModule('module-2', {});

      await manager.loadModule('module-1');
      await manager.loadModule('module-2');
      await manager.startModule('module-1');
      await manager.startModule('module-2');

      await manager.shutdown();

      expect(manager.getLoadedModules()).toEqual([]);
    });
  });

  describe('Batch Operations', () => {
    it('should load multiple modules with loadModules', async () => {
      await createTestModule('batch-core', {});
      await createTestModule('batch-utils', { 'batch-core': '1.0.0' });
      await createTestModule('batch-app', { 'batch-core': '1.0.0', 'batch-utils': '1.0.0' });

      await manager.loadModules(['batch-app', 'batch-utils', 'batch-core']);

      expect(manager.isModuleLoaded('batch-core')).toBe(true);
      expect(manager.isModuleLoaded('batch-utils')).toBe(true);
      expect(manager.isModuleLoaded('batch-app')).toBe(true);
    });

    it('should unload multiple modules with unloadModules', async () => {
      await createTestModule('unload-1', {});
      await createTestModule('unload-2', {});
      
      await manager.loadModule('unload-1');
      await manager.loadModule('unload-2');

      await manager.unloadModules(['unload-1', 'unload-2']);

      expect(manager.isModuleLoaded('unload-1')).toBe(false);
      expect(manager.isModuleLoaded('unload-2')).toBe(false);
    });
  });

  describe('Module Restart', () => {
    it('should restart a running module', async () => {
      await createTestModule('restart-module', {});
      await manager.loadModule('restart-module');
      await manager.startModule('restart-module');

      await manager.restartModule('restart-module');

      expect(manager.isModuleRunning('restart-module')).toBe(true);
    });
  });

  // Helper function to create a test module
  async function createTestModule(name: string, dependencies: Record<string, string>) {
    const modulePath = path.join(testModulesDir, name);
    await fs.mkdir(modulePath, { recursive: true });

    // Create package.json
    const packageJson = {
      name,
      version: '1.0.0',
      description: `Test module: ${name}`,
      dependencies
    };
    await fs.writeFile(
      path.join(modulePath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    // Create index.js with a simple module implementation
    const moduleCode = `
const { BaseModule } = require('${path.join(__dirname, '../../../src/core/modules/module.interface')}');

class TestModule extends BaseModule {
  constructor(metadata) {
    super({
      name: '${name}',
      version: '1.0.0',
      dependencies: ${JSON.stringify(dependencies)},
      path: metadata.path || '${modulePath}'
    });
  }
}

module.exports = TestModule;
`;
    await fs.writeFile(path.join(modulePath, 'index.js'), moduleCode);
  }
});
