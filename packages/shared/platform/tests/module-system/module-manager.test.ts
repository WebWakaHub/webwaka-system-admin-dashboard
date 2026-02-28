import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { DefaultModuleManager } from '../../src/module-system/manager/module-manager';
import { DefaultModuleRegistry } from '../../src/module-system/registry/module-registry';
import { DefaultModuleLoader } from '../../src/module-system/loader/module-loader';
import { Module, ModuleLoadRequest } from '../../src/module-system/types';
import { ModuleNotFoundError, ModuleStateError } from '../../src/module-system/errors';

describe('Module Manager', () => {
  let manager: DefaultModuleManager;
  let registry: DefaultModuleRegistry;
  let loader: DefaultModuleLoader;
  let testModule: Module;

  beforeEach(() => {
    registry = new DefaultModuleRegistry();
    loader = new DefaultModuleLoader();
    manager = new DefaultModuleManager(loader, registry);

    testModule = {
      name: 'test-module',
      version: '1.0.0',
      dependencies: {},
      path: '/test/path',
      status: 'unloaded',
      onLoad: jest.fn(),
      onUnload: jest.fn(),
      onStart: jest.fn(),
      onStop: jest.fn(),
    };
  });

  describe('load', () => {
    it('should load a module', async () => {
      registry.add(testModule);
      const request: ModuleLoadRequest = {
        name: 'test-module',
        version: '1.0.0',
        path: '/test/path',
      };

      const loaded = await manager.load(request);
      expect(loaded.status).toBe('loaded');
    });

    it('should call onLoad hook', async () => {
      registry.add(testModule);
      const request: ModuleLoadRequest = {
        name: 'test-module',
        version: '1.0.0',
        path: '/test/path',
      };

      await manager.load(request);
      expect(testModule.onLoad).toHaveBeenCalled();
    });
  });

  describe('unload', () => {
    it('should unload a loaded module', async () => {
      testModule.status = 'loaded';
      registry.add(testModule);

      await manager.unload('test-module');
      expect(testModule.onUnload).toHaveBeenCalled();
      expect(registry.get('test-module')).toBeUndefined();
    });

    it('should throw error for non-existent module', async () => {
      await expect(manager.unload('non-existent')).rejects.toThrow(ModuleNotFoundError);
    });

    it('should stop running module before unloading', async () => {
      testModule.status = 'running';
      registry.add(testModule);

      await manager.unload('test-module');
      expect(testModule.onStop).toHaveBeenCalled();
      expect(testModule.onUnload).toHaveBeenCalled();
    });
  });

  describe('start', () => {
    it('should start a loaded module', async () => {
      testModule.status = 'loaded';
      registry.add(testModule);

      await manager.start('test-module');
      expect(testModule.onStart).toHaveBeenCalled();
      expect(testModule.status).toBe('running');
    });

    it('should throw error for non-existent module', async () => {
      await expect(manager.start('non-existent')).rejects.toThrow(ModuleNotFoundError);
    });

    it('should throw error if module not in loaded state', async () => {
      testModule.status = 'unloaded';
      registry.add(testModule);

      await expect(manager.start('test-module')).rejects.toThrow(ModuleStateError);
    });
  });

  describe('stop', () => {
    it('should stop a running module', async () => {
      testModule.status = 'running';
      registry.add(testModule);

      await manager.stop('test-module');
      expect(testModule.onStop).toHaveBeenCalled();
      expect(testModule.status).toBe('stopped');
    });

    it('should throw error for non-existent module', async () => {
      await expect(manager.stop('non-existent')).rejects.toThrow(ModuleNotFoundError);
    });

    it('should throw error if module not in running state', async () => {
      testModule.status = 'loaded';
      registry.add(testModule);

      await expect(manager.stop('test-module')).rejects.toThrow(ModuleStateError);
    });
  });

  describe('list', () => {
    it('should list all modules', () => {
      registry.add(testModule);
      const modules = manager.list();
      expect(modules).toHaveLength(1);
    });
  });

  describe('get', () => {
    it('should get a module by name', () => {
      registry.add(testModule);
      const module = manager.get('test-module');
      expect(module).toBe(testModule);
    });

    it('should return undefined for non-existent module', () => {
      const module = manager.get('non-existent');
      expect(module).toBeUndefined();
    });
  });
});
