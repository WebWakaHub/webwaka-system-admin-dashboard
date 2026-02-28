/**
 * Unit Tests - Module Manager Service
 * 
 * Tests for module lifecycle management and orchestration
 */

import { ModuleManagerService } from '../../../src/core/modules/module-manager.service';
import { ModuleLoaderService } from '../../../src/core/modules/module-loader.service';
import { ModuleRegistryService } from '../../../src/core/modules/module-registry.service';
import { BaseModule, ModuleStatus } from '../../../src/core/modules/module.interface';

// Mock dependencies
jest.mock('../../../src/core/modules/module-loader.service');
jest.mock('../../../src/core/modules/module-registry.service');

describe('ModuleManagerService', () => {
  let manager: ModuleManagerService;
  let mockLoader: jest.Mocked<ModuleLoaderService>;
  let mockRegistry: jest.Mocked<ModuleRegistryService>;

  class TestModule extends BaseModule {
    constructor(name: string, dependencies: Record<string, string> = {}) {
      super({ name, version: '1.0.0', dependencies, path: `/modules/${name}` });
    }
  }

  beforeEach(() => {
    jest.clearAllMocks();
    manager = new ModuleManagerService({ modulesPath: '/test/modules' });
    mockLoader = (manager as any).loader as jest.Mocked<ModuleLoaderService>;
    mockRegistry = (manager as any).registry as jest.Mocked<ModuleRegistryService>;
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      const defaultManager = new ModuleManagerService();
      expect(defaultManager).toBeDefined();
    });

    it('should initialize with custom options', () => {
      const customManager = new ModuleManagerService({
        modulesPath: '/custom/path',
        autoStart: true,
        timeout: 60000
      });
      expect(customManager).toBeDefined();
    });
  });

  describe('loadModule', () => {
    it('should load a module successfully', async () => {
      const module = new TestModule('test-module');
      
      mockRegistry.has.mockReturnValue(false);
      mockLoader.loadByName.mockResolvedValue(module);
      mockRegistry.register.mockImplementation(() => {});
      
      jest.spyOn(manager as any, 'checkDependenciesLoaded').mockReturnValue({
        satisfied: true,
        missing: []
      });

      await manager.loadModule('test-module');

      expect(mockLoader.loadByName).toHaveBeenCalledWith('test-module');
      expect(mockRegistry.register).toHaveBeenCalledWith(module);
    });

    it('should throw error when module is already loaded', async () => {
      mockRegistry.has.mockReturnValue(true);

      await expect(manager.loadModule('test-module')).rejects.toThrow('Module test-module is already loaded');
    });

    it('should throw error when dependencies are missing', async () => {
      const module = new TestModule('app', { 'core': '1.0.0' });
      
      mockRegistry.has.mockReturnValue(false);
      mockLoader.loadByName.mockResolvedValue(module);
      
      jest.spyOn(manager as any, 'checkDependenciesLoaded').mockReturnValue({
        satisfied: false,
        missing: ['core']
      });

      await expect(manager.loadModule('app')).rejects.toThrow('Missing dependencies for app: core');
    });

    it('should call onLoad lifecycle hook', async () => {
      const module = new TestModule('test-module');
      const onLoadSpy = jest.spyOn(module, 'onLoad');
      
      mockRegistry.has.mockReturnValue(false);
      mockLoader.loadByName.mockResolvedValue(module);
      mockRegistry.register.mockImplementation(() => {});
      
      jest.spyOn(manager as any, 'checkDependenciesLoaded').mockReturnValue({
        satisfied: true,
        missing: []
      });

      await manager.loadModule('test-module');

      expect(onLoadSpy).toHaveBeenCalled();
    });

    it('should auto-start module when autoStart is enabled', async () => {
      const autoStartManager = new ModuleManagerService({ autoStart: true });
      const module = new TestModule('test-module');
      
      const mockLoaderAuto = (autoStartManager as any).loader as jest.Mocked<ModuleLoaderService>;
      const mockRegistryAuto = (autoStartManager as any).registry as jest.Mocked<ModuleRegistryService>;
      
      mockRegistryAuto.has.mockReturnValue(false);
      mockLoaderAuto.loadByName.mockResolvedValue(module);
      mockRegistryAuto.register.mockImplementation(() => {});
      
      jest.spyOn(autoStartManager as any, 'checkDependenciesLoaded').mockReturnValue({
        satisfied: true,
        missing: []
      });
      
      const startSpy = jest.spyOn(autoStartManager, 'startModule').mockResolvedValue();

      await autoStartManager.loadModule('test-module');

      expect(startSpy).toHaveBeenCalledWith('test-module');
    });
  });

  describe('unloadModule', () => {
    it('should unload a module successfully', async () => {
      const module = new TestModule('test-module');
      await module.onLoad();
      
      mockRegistry.get.mockReturnValue(module);
      mockRegistry.getDependents.mockReturnValue([]);
      mockRegistry.unregister.mockImplementation(() => {});
      mockLoader.unload.mockResolvedValue();

      await manager.unloadModule('test-module');

      expect(mockRegistry.unregister).toHaveBeenCalledWith('test-module');
      expect(mockLoader.unload).toHaveBeenCalledWith('test-module');
    });

    it('should throw error when module is not loaded', async () => {
      mockRegistry.get.mockReturnValue(undefined);

      await expect(manager.unloadModule('non-existent')).rejects.toThrow('Module non-existent is not loaded');
    });

    it('should throw error when module has dependents', async () => {
      const module = new TestModule('core');
      
      mockRegistry.get.mockReturnValue(module);
      mockRegistry.getDependents.mockReturnValue(['app1', 'app2']);

      await expect(manager.unloadModule('core')).rejects.toThrow('Cannot unload core: modules [app1, app2] depend on it');
    });

    it('should stop module before unloading if running', async () => {
      const module = new TestModule('test-module');
      await module.onLoad();
      await module.onStart();
      
      mockRegistry.get.mockReturnValue(module);
      mockRegistry.getDependents.mockReturnValue([]);
      mockRegistry.unregister.mockImplementation(() => {});
      mockLoader.unload.mockResolvedValue();
      
      const stopSpy = jest.spyOn(manager, 'stopModule').mockResolvedValue();

      await manager.unloadModule('test-module');

      expect(stopSpy).toHaveBeenCalledWith('test-module');
    });

    it('should call onUnload lifecycle hook', async () => {
      const module = new TestModule('test-module');
      await module.onLoad();
      const onUnloadSpy = jest.spyOn(module, 'onUnload');
      
      mockRegistry.get.mockReturnValue(module);
      mockRegistry.getDependents.mockReturnValue([]);
      mockRegistry.unregister.mockImplementation(() => {});
      mockLoader.unload.mockResolvedValue();

      await manager.unloadModule('test-module');

      expect(onUnloadSpy).toHaveBeenCalled();
    });
  });

  describe('startModule', () => {
    it('should start a loaded module successfully', async () => {
      const module = new TestModule('test-module');
      await module.onLoad();
      
      mockRegistry.get.mockReturnValue(module);

      await manager.startModule('test-module');

      expect(module.getMetadata().status).toBe(ModuleStatus.RUNNING);
    });

    it('should throw error when module is not loaded', async () => {
      mockRegistry.get.mockReturnValue(undefined);

      await expect(manager.startModule('non-existent')).rejects.toThrow('Module non-existent is not loaded');
    });

    it('should throw error when module is already running', async () => {
      const module = new TestModule('test-module');
      await module.onLoad();
      await module.onStart();
      
      mockRegistry.get.mockReturnValue(module);

      await expect(manager.startModule('test-module')).rejects.toThrow('Module test-module is already running');
    });

    it('should call onStart lifecycle hook', async () => {
      const module = new TestModule('test-module');
      await module.onLoad();
      const onStartSpy = jest.spyOn(module, 'onStart');
      
      mockRegistry.get.mockReturnValue(module);

      await manager.startModule('test-module');

      expect(onStartSpy).toHaveBeenCalled();
    });
  });

  describe('stopModule', () => {
    it('should stop a running module successfully', async () => {
      const module = new TestModule('test-module');
      await module.onLoad();
      await module.onStart();
      
      mockRegistry.get.mockReturnValue(module);

      await manager.stopModule('test-module');

      expect(module.getMetadata().status).toBe(ModuleStatus.STOPPED);
    });

    it('should throw error when module is not loaded', async () => {
      mockRegistry.get.mockReturnValue(undefined);

      await expect(manager.stopModule('non-existent')).rejects.toThrow('Module non-existent is not loaded');
    });

    it('should throw error when module is not running', async () => {
      const module = new TestModule('test-module');
      await module.onLoad();
      
      mockRegistry.get.mockReturnValue(module);

      await expect(manager.stopModule('test-module')).rejects.toThrow('Module test-module is not running');
    });

    it('should call onStop lifecycle hook', async () => {
      const module = new TestModule('test-module');
      await module.onLoad();
      await module.onStart();
      const onStopSpy = jest.spyOn(module, 'onStop');
      
      mockRegistry.get.mockReturnValue(module);

      await manager.stopModule('test-module');

      expect(onStopSpy).toHaveBeenCalled();
    });
  });

  describe('restartModule', () => {
    it('should restart a module successfully', async () => {
      const module = new TestModule('test-module');
      await module.onLoad();
      await module.onStart();
      
      mockRegistry.get.mockReturnValue(module);

      await manager.restartModule('test-module');

      expect(module.getMetadata().status).toBe(ModuleStatus.RUNNING);
    });

    it('should call stop then start', async () => {
      const stopSpy = jest.spyOn(manager, 'stopModule').mockResolvedValue();
      const startSpy = jest.spyOn(manager, 'startModule').mockResolvedValue();

      await manager.restartModule('test-module');

      expect(stopSpy).toHaveBeenCalledWith('test-module');
      expect(startSpy).toHaveBeenCalledWith('test-module');
      // Verify stop was called before start by checking call order
      const stopCallOrder = stopSpy.mock.invocationCallOrder[0];
      const startCallOrder = startSpy.mock.invocationCallOrder[0];
      expect(stopCallOrder).toBeLessThan(startCallOrder);
    });
  });

  describe('getModuleStatus', () => {
    it('should return module status', () => {
      const metadata = { status: ModuleStatus.RUNNING } as any;
      mockRegistry.getMetadata.mockReturnValue(metadata);

      const status = manager.getModuleStatus('test-module');

      expect(status).toBe(ModuleStatus.RUNNING);
    });

    it('should return null for non-existent module', () => {
      mockRegistry.getMetadata.mockReturnValue(undefined);

      const status = manager.getModuleStatus('non-existent');

      expect(status).toBeNull();
    });
  });

  describe('isModuleLoaded', () => {
    it('should return true when module is loaded', () => {
      mockRegistry.has.mockReturnValue(true);

      expect(manager.isModuleLoaded('test-module')).toBe(true);
    });

    it('should return false when module is not loaded', () => {
      mockRegistry.has.mockReturnValue(false);

      expect(manager.isModuleLoaded('test-module')).toBe(false);
    });
  });

  describe('isModuleRunning', () => {
    it('should return true when module is running', () => {
      const metadata = { status: ModuleStatus.RUNNING } as any;
      mockRegistry.getMetadata.mockReturnValue(metadata);

      expect(manager.isModuleRunning('test-module')).toBe(true);
    });

    it('should return false when module is not running', () => {
      const metadata = { status: ModuleStatus.LOADED } as any;
      mockRegistry.getMetadata.mockReturnValue(metadata);

      expect(manager.isModuleRunning('test-module')).toBe(false);
    });

    it('should return false when module does not exist', () => {
      mockRegistry.getMetadata.mockReturnValue(undefined);

      expect(manager.isModuleRunning('non-existent')).toBe(false);
    });
  });

  describe('getLoadedModules', () => {
    it('should return all loaded module names', () => {
      mockRegistry.getAllNames.mockReturnValue(['module-1', 'module-2', 'module-3']);

      const loaded = manager.getLoadedModules();

      expect(loaded).toEqual(['module-1', 'module-2', 'module-3']);
    });

    it('should return empty array when no modules loaded', () => {
      mockRegistry.getAllNames.mockReturnValue([]);

      const loaded = manager.getLoadedModules();

      expect(loaded).toEqual([]);
    });
  });

  describe('getRunningModules', () => {
    it('should return all running module names', () => {
      const runningModules = [
        new TestModule('module-1'),
        new TestModule('module-2')
      ];
      
      mockRegistry.getByStatus.mockReturnValue(runningModules);

      const running = manager.getRunningModules();

      expect(running).toEqual(['module-1', 'module-2']);
    });

    it('should return empty array when no modules running', () => {
      mockRegistry.getByStatus.mockReturnValue([]);

      const running = manager.getRunningModules();

      expect(running).toEqual([]);
    });
  });

  describe('getModuleMetadata', () => {
    it('should return module metadata', () => {
      const metadata = { name: 'test', version: '1.0.0' } as any;
      mockRegistry.getMetadata.mockReturnValue(metadata);

      const result = manager.getModuleMetadata('test');

      expect(result).toEqual(metadata);
    });
  });

  describe('getAllModulesMetadata', () => {
    it('should return all modules metadata', () => {
      const metadata = [
        { name: 'module-1', version: '1.0.0' } as any,
        { name: 'module-2', version: '2.0.0' } as any
      ];
      mockRegistry.getAllMetadata.mockReturnValue(metadata);

      const result = manager.getAllModulesMetadata();

      expect(result).toEqual(metadata);
    });
  });

  describe('discoverModules', () => {
    it('should discover available modules', async () => {
      mockLoader.discoverModules.mockResolvedValue(['module-1', 'module-2']);

      const modules = await manager.discoverModules();

      expect(modules).toEqual(['module-1', 'module-2']);
    });
  });

  describe('loadModules', () => {
    it('should load multiple modules', async () => {
      jest.spyOn(manager as any, 'resolveDependencyOrder')
        .mockResolvedValueOnce(['module-1'])
        .mockResolvedValueOnce(['module-2']);
      
      mockRegistry.has.mockReturnValue(false);
      
      const loadSpy = jest.spyOn(manager, 'loadModule').mockResolvedValue();

      await manager.loadModules(['module-1', 'module-2']);

      expect(loadSpy).toHaveBeenCalledTimes(2);
    });

    it('should skip already loaded modules', async () => {
      jest.spyOn(manager as any, 'resolveDependencyOrder')
        .mockResolvedValue(['module-1']);
      
      mockRegistry.has.mockReturnValue(true);
      
      const loadSpy = jest.spyOn(manager, 'loadModule');

      await manager.loadModules(['module-1']);

      expect(loadSpy).not.toHaveBeenCalled();
    });
  });

  describe('unloadModules', () => {
    it('should unload multiple modules in reverse order', async () => {
      mockRegistry.has.mockReturnValue(true);
      const unloadSpy = jest.spyOn(manager, 'unloadModule').mockResolvedValue();

      await manager.unloadModules(['module-1', 'module-2', 'module-3']);

      expect(unloadSpy).toHaveBeenCalledTimes(3);
      expect(unloadSpy).toHaveBeenNthCalledWith(1, 'module-3');
      expect(unloadSpy).toHaveBeenNthCalledWith(2, 'module-2');
      expect(unloadSpy).toHaveBeenNthCalledWith(3, 'module-1');
    });

    it('should skip non-loaded modules', async () => {
      mockRegistry.has.mockReturnValue(false);
      const unloadSpy = jest.spyOn(manager, 'unloadModule');

      await manager.unloadModules(['module-1']);

      expect(unloadSpy).not.toHaveBeenCalled();
    });
  });

  describe('healthCheck', () => {
    it('should return true for healthy module', async () => {
      const module = new TestModule('test-module');
      jest.spyOn(module, 'healthCheck').mockResolvedValue(true);
      
      mockRegistry.get.mockReturnValue(module);

      const result = await manager.healthCheck('test-module');

      expect(result).toBe(true);
    });

    it('should return false for unhealthy module', async () => {
      const module = new TestModule('test-module');
      jest.spyOn(module, 'healthCheck').mockResolvedValue(false);
      
      mockRegistry.get.mockReturnValue(module);

      const result = await manager.healthCheck('test-module');

      expect(result).toBe(false);
    });

    it('should return false for non-existent module', async () => {
      mockRegistry.get.mockReturnValue(undefined);

      const result = await manager.healthCheck('non-existent');

      expect(result).toBe(false);
    });

    it('should return false when healthCheck throws error', async () => {
      const module = new TestModule('test-module');
      jest.spyOn(module, 'healthCheck').mockRejectedValue(new Error('Health check failed'));
      
      mockRegistry.get.mockReturnValue(module);

      const result = await manager.healthCheck('test-module');

      expect(result).toBe(false);
    });
  });

  describe('healthCheckAll', () => {
    it('should return health status for all modules', async () => {
      const module1 = new TestModule('module-1');
      const module2 = new TestModule('module-2');
      
      jest.spyOn(module1, 'healthCheck').mockResolvedValue(true);
      jest.spyOn(module2, 'healthCheck').mockResolvedValue(false);
      
      mockRegistry.getAllNames.mockReturnValue(['module-1', 'module-2']);
      mockRegistry.get
        .mockReturnValueOnce(module1)
        .mockReturnValueOnce(module2);

      const result = await manager.healthCheckAll();

      expect(result).toEqual({
        'module-1': true,
        'module-2': false
      });
    });
  });

  describe('shutdown', () => {
    it('should stop all running modules and unload all loaded modules', async () => {
      mockRegistry.getAllNames.mockReturnValue(['module-1', 'module-2']);
      
      const stopSpy = jest.spyOn(manager, 'stopModule').mockResolvedValue();
      const unloadSpy = jest.spyOn(manager, 'unloadModule').mockResolvedValue();
      
      jest.spyOn(manager, 'getRunningModules').mockReturnValue(['module-1']);
      jest.spyOn(manager, 'getLoadedModules').mockReturnValue(['module-1', 'module-2']);

      await manager.shutdown();

      expect(stopSpy).toHaveBeenCalledWith('module-1');
      expect(unloadSpy).toHaveBeenCalledTimes(2);
    });

    it('should continue shutdown even if stopping a module fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      jest.spyOn(manager, 'getRunningModules').mockReturnValue(['module-1', 'module-2']);
      jest.spyOn(manager, 'getLoadedModules').mockReturnValue([]);
      jest.spyOn(manager, 'stopModule')
        .mockRejectedValueOnce(new Error('Stop failed'))
        .mockResolvedValueOnce();

      await manager.shutdown();

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getLoader', () => {
    it('should return the module loader instance', () => {
      const loader = manager.getLoader();
      expect(loader).toBe(mockLoader);
    });
  });

  describe('getRegistry', () => {
    it('should return the module registry instance', () => {
      const registry = manager.getRegistry();
      expect(registry).toBe(mockRegistry);
    });
  });
});
