/**
 * Additional Unit Tests - Module Manager Service
 * 
 * Tests to achieve 100% coverage for uncovered lines
 */

import { ModuleManagerService } from '../../../src/core/modules/module-manager.service';
import { ModuleLoaderService } from '../../../src/core/modules/module-loader.service';
import { ModuleRegistryService } from '../../../src/core/modules/module-registry.service';
import { BaseModule } from '../../../src/core/modules/module.interface';

jest.mock('../../../src/core/modules/module-loader.service');
jest.mock('../../../src/core/modules/module-registry.service');

describe('ModuleManagerService - Additional Coverage', () => {
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

  describe('shutdown error handling', () => {
    it('should handle unload errors during shutdown', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      jest.spyOn(manager, 'getRunningModules').mockReturnValue([]);
      jest.spyOn(manager, 'getLoadedModules').mockReturnValue(['module-1', 'module-2']);
      jest.spyOn(manager, 'unloadModule')
        .mockRejectedValueOnce(new Error('Unload failed'))
        .mockResolvedValueOnce();

      await manager.shutdown();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error unloading module module-1:',
        expect.any(Error)
      );
      consoleErrorSpy.mockRestore();
    });
  });

  describe('checkDependenciesLoaded', () => {
    it('should return satisfied when all dependencies are loaded', () => {
      mockRegistry.has.mockReturnValue(true);

      const result = (manager as any).checkDependenciesLoaded({
        'dep1': '1.0.0',
        'dep2': '2.0.0'
      });

      expect(result.satisfied).toBe(true);
      expect(result.missing).toEqual([]);
    });

    it('should return unsatisfied with missing dependencies', () => {
      mockRegistry.has
        .mockReturnValueOnce(true)  // dep1 exists
        .mockReturnValueOnce(false); // dep2 missing

      const result = (manager as any).checkDependenciesLoaded({
        'dep1': '1.0.0',
        'dep2': '2.0.0'
      });

      expect(result.satisfied).toBe(false);
      expect(result.missing).toEqual(['dep2']);
    });

    it('should handle empty dependencies', () => {
      const result = (manager as any).checkDependenciesLoaded({});

      expect(result.satisfied).toBe(true);
      expect(result.missing).toEqual([]);
    });
  });

  describe('resolveDependencyOrder', () => {
    it('should resolve simple dependency order', async () => {
      mockLoader.getModuleInfo
        .mockResolvedValueOnce({
          name: 'app',
          version: '1.0.0',
          dependencies: { 'core': '1.0.0' },
          status: 'unloaded' as any,
          path: '/modules/app'
        })
        .mockResolvedValueOnce({
          name: 'core',
          version: '1.0.0',
          dependencies: {},
          status: 'unloaded' as any,
          path: '/modules/core'
        });

      const order = await (manager as any).resolveDependencyOrder('app');

      expect(order).toEqual(['core', 'app']);
    });

    it('should handle module with no dependencies', async () => {
      mockLoader.getModuleInfo.mockResolvedValue({
        name: 'standalone',
        version: '1.0.0',
        dependencies: {},
        status: 'unloaded' as any,
        path: '/modules/standalone'
      });

      const order = await (manager as any).resolveDependencyOrder('standalone');

      expect(order).toEqual(['standalone']);
    });

    it('should handle module info with null dependencies', async () => {
      mockLoader.getModuleInfo.mockResolvedValue({
        name: 'test',
        version: '1.0.0',
        dependencies: undefined as any,
        status: 'unloaded' as any,
        path: '/modules/test'
      });

      const order = await (manager as any).resolveDependencyOrder('test');

      expect(order).toEqual(['test']);
    });

    it('should handle module info not found', async () => {
      mockLoader.getModuleInfo.mockResolvedValue(null);

      const order = await (manager as any).resolveDependencyOrder('missing');

      expect(order).toEqual(['missing']);
    });

    it('should skip already visited modules', async () => {
      mockLoader.getModuleInfo
        .mockResolvedValueOnce({
          name: 'app1',
          version: '1.0.0',
          dependencies: { 'core': '1.0.0' },
          status: 'unloaded' as any,
          path: '/modules/app1'
        })
        .mockResolvedValueOnce({
          name: 'core',
          version: '1.0.0',
          dependencies: {},
          status: 'unloaded' as any,
          path: '/modules/core'
        });

      const order = await (manager as any).resolveDependencyOrder('app1');

      expect(order).toEqual(['core', 'app1']);
      expect(mockLoader.getModuleInfo).toHaveBeenCalledTimes(2);
    });

    it('should handle complex dependency tree', async () => {
      mockLoader.getModuleInfo
        .mockImplementation(async (name: string) => {
          const modules: any = {
            'd': { name: 'd', version: '1.0.0', dependencies: { 'b': '1.0.0', 'c': '1.0.0' }, status: 'unloaded', path: '/modules/d' },
            'b': { name: 'b', version: '1.0.0', dependencies: { 'a': '1.0.0' }, status: 'unloaded', path: '/modules/b' },
            'c': { name: 'c', version: '1.0.0', dependencies: { 'a': '1.0.0' }, status: 'unloaded', path: '/modules/c' },
            'a': { name: 'a', version: '1.0.0', dependencies: {}, status: 'unloaded', path: '/modules/a' }
          };
          return modules[name] || null;
        });

      const order = await (manager as any).resolveDependencyOrder('d');

      expect(order[0]).toBe('a');
      expect(order[order.length - 1]).toBe('d');
      expect(order).toContain('b');
      expect(order).toContain('c');
    });
  });
});

  describe('loadModules with dependencies', () => {
    it('should load modules respecting dependency order', async () => {
      mockRegistry.has.mockReturnValue(false);
      
      jest.spyOn(manager as any, 'resolveDependencyOrder')
        .mockResolvedValueOnce(['core', 'utils', 'app'])
        .mockResolvedValueOnce(['core', 'plugin'])
        .mockResolvedValueOnce(['core']);

      const loadSpy = jest.spyOn(manager, 'loadModule').mockResolvedValue();

      await manager.loadModules(['app', 'plugin']);

      // Should load in dependency order
      expect(loadSpy).toHaveBeenCalled();
    });

    it('should handle modules with overlapping dependencies', async () => {
      mockRegistry.has
        .mockReturnValueOnce(false) // core not loaded
        .mockReturnValueOnce(false) // utils not loaded
        .mockReturnValueOnce(false) // app not loaded
        .mockReturnValueOnce(true); // core already loaded from first module

      jest.spyOn(manager as any, 'resolveDependencyOrder')
        .mockResolvedValueOnce(['core', 'utils', 'app'])
        .mockResolvedValueOnce(['core', 'plugin']);

      const loadSpy = jest.spyOn(manager, 'loadModule').mockResolvedValue();

      await manager.loadModules(['app', 'plugin']);

      // core should only be loaded once
      expect(loadSpy).toHaveBeenCalledWith('core');
      expect(loadSpy).toHaveBeenCalledWith('utils');
      expect(loadSpy).toHaveBeenCalledWith('app');
      expect(loadSpy).toHaveBeenCalledWith('plugin');
    });
  });

  describe('error scenarios', () => {
    it('should handle errors in loadModule', async () => {
      const module = new TestModule('test-module');
      
      mockRegistry.has.mockReturnValue(false);
      mockLoader.loadByName.mockResolvedValue(module);
      mockRegistry.register.mockImplementation(() => {
        throw new Error('Registration failed');
      });
      
      jest.spyOn(manager as any, 'checkDependenciesLoaded').mockReturnValue({
        satisfied: true,
        missing: []
      });

      await expect(manager.loadModule('test-module')).rejects.toThrow('Failed to load module test-module');
    });

    it('should handle errors in unloadModule', async () => {
      const module = new TestModule('test-module');
      jest.spyOn(module, 'onUnload').mockRejectedValue(new Error('Unload hook failed'));
      
      mockRegistry.get.mockReturnValue(module);
      mockRegistry.getDependents.mockReturnValue([]);

      await expect(manager.unloadModule('test-module')).rejects.toThrow('Failed to unload module test-module');
    });

    it('should handle errors in startModule', async () => {
      const module = new TestModule('test-module');
      await module.onLoad();
      jest.spyOn(module, 'onStart').mockRejectedValue(new Error('Start hook failed'));
      
      mockRegistry.get.mockReturnValue(module);

      await expect(manager.startModule('test-module')).rejects.toThrow('Failed to start module test-module');
    });

    it('should handle errors in stopModule', async () => {
      const module = new TestModule('test-module');
      await module.onLoad();
      await module.onStart();
      jest.spyOn(module, 'onStop').mockRejectedValue(new Error('Stop hook failed'));
      
      mockRegistry.get.mockReturnValue(module);

      await expect(manager.stopModule('test-module')).rejects.toThrow('Failed to stop module test-module');
    });
  });
});
