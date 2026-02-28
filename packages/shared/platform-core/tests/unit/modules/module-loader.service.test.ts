/**
 * Unit Tests - Module Loader Service
 * 
 * Tests for module loading from filesystem
 */

import { ModuleLoaderService } from '../../../src/core/modules/module-loader.service';
import { BaseModule } from '../../../src/core/modules/module.interface';
import * as fs from 'fs/promises';
import * as path from 'path';

// Mock fs module
jest.mock('fs/promises');
const mockFs = fs as jest.Mocked<typeof fs>;

// Mock require - Jest mocking setup
jest.mock('module', () => ({
  ...jest.requireActual('module'),
  _load: jest.fn()
}));

describe('ModuleLoaderService', () => {
  let loader: ModuleLoaderService;
  const testModulesPath = '/test/modules';

  beforeEach(() => {
    loader = new ModuleLoaderService(testModulesPath);
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with provided modules path', () => {
      const customLoader = new ModuleLoaderService('/custom/path');
      expect(customLoader.getModulesPath()).toBe('/custom/path');
    });

    it('should initialize with default modules path', () => {
      const defaultLoader = new ModuleLoaderService();
      expect(defaultLoader.getModulesPath()).toBe('./modules');
    });
  });

  describe('loadFromPath', () => {
    class TestModule extends BaseModule {
      constructor(metadata: any) {
        super(metadata);
      }
    }

    beforeEach(() => {
      mockFs.access.mockResolvedValue(undefined);
    });

    it('should load a valid module successfully', async () => {
      const modulePath = 'test-module/index.js';
      const mockModuleExport = TestModule;

      mockFs.access.mockResolvedValue(undefined);
      jest.spyOn(loader as any, 'requireModule').mockResolvedValue(mockModuleExport);
      jest.spyOn(loader as any, 'validateModule').mockReturnValue(undefined);
      jest.spyOn(loader as any, 'createModuleInstance').mockReturnValue(new TestModule({ name: 'test' }));

      const module = await loader.loadFromPath(modulePath);

      expect(module).toBeDefined();
      expect(module.getMetadata().name).toBe('test');
    });

    it('should throw error when module path does not exist', async () => {
      mockFs.access.mockRejectedValue(new Error('ENOENT'));

      await expect(loader.loadFromPath('non-existent/index.js')).rejects.toThrow('Module path does not exist');
    });

    it('should throw error when module fails to load', async () => {
      mockFs.access.mockResolvedValue(undefined);
      jest.spyOn(loader as any, 'requireModule').mockRejectedValue(new Error('Syntax error'));

      await expect(loader.loadFromPath('bad-module/index.js')).rejects.toThrow('Failed to load module');
    });

    it('should throw error when module validation fails', async () => {
      mockFs.access.mockResolvedValue(undefined);
      jest.spyOn(loader as any, 'requireModule').mockResolvedValue({});
      jest.spyOn(loader as any, 'validateModule').mockImplementation(() => {
        throw new Error('Invalid module structure');
      });

      await expect(loader.loadFromPath('invalid-module/index.js')).rejects.toThrow('Failed to load module');
    });

    it('should cache loaded module', async () => {
      const mockModuleExport = TestModule;
      mockFs.access.mockResolvedValue(undefined);
      jest.spyOn(loader as any, 'requireModule').mockResolvedValue(mockModuleExport);
      jest.spyOn(loader as any, 'validateModule').mockReturnValue(undefined);
      jest.spyOn(loader as any, 'createModuleInstance').mockReturnValue(new TestModule({ name: 'cached' }));

      await loader.loadFromPath('cached-module/index.js');

      expect(loader.isLoaded('cached')).toBe(true);
    });
  });

  describe('loadByName', () => {
    it('should load module by name', async () => {
      const loadFromPathSpy = jest.spyOn(loader, 'loadFromPath').mockResolvedValue({} as any);

      await loader.loadByName('test-module');

      expect(loadFromPathSpy).toHaveBeenCalledWith('test-module/index.js', {});
    });

    it('should pass options to loadFromPath', async () => {
      const loadFromPathSpy = jest.spyOn(loader, 'loadFromPath').mockResolvedValue({} as any);
      const options = { validateDependencies: true, timeout: 5000 };

      await loader.loadByName('test-module', options);

      expect(loadFromPathSpy).toHaveBeenCalledWith('test-module/index.js', options);
    });
  });

  describe('unload', () => {
    it('should unload a loaded module', async () => {
      const moduleName = 'test-module';
      (loader as any).loadedModules.set(moduleName, {});

      await loader.unload(moduleName);

      expect(loader.isLoaded(moduleName)).toBe(false);
    });

    it('should throw error when unloading non-loaded module', async () => {
      await expect(loader.unload('non-loaded')).rejects.toThrow('Module non-loaded is not loaded');
    });

    it('should clear module from require cache', async () => {
      const moduleName = 'test-module';
      (loader as any).loadedModules.set(moduleName, {});
      const modulePath = path.resolve(testModulesPath, moduleName);
      
      // Mock require.cache
      require.cache[`${modulePath}/index.js`] = {} as any;

      await loader.unload(moduleName);

      expect(require.cache[`${modulePath}/index.js`]).toBeUndefined();
    });
  });

  describe('isLoaded', () => {
    it('should return true for loaded module', () => {
      (loader as any).loadedModules.set('test-module', {});

      expect(loader.isLoaded('test-module')).toBe(true);
    });

    it('should return false for non-loaded module', () => {
      expect(loader.isLoaded('non-loaded')).toBe(false);
    });
  });

  describe('getLoadedModules', () => {
    it('should return empty array when no modules loaded', () => {
      expect(loader.getLoadedModules()).toEqual([]);
    });

    it('should return all loaded module names', () => {
      (loader as any).loadedModules.set('module-1', {});
      (loader as any).loadedModules.set('module-2', {});
      (loader as any).loadedModules.set('module-3', {});

      const loaded = loader.getLoadedModules();

      expect(loaded).toHaveLength(3);
      expect(loaded).toContain('module-1');
      expect(loaded).toContain('module-2');
      expect(loaded).toContain('module-3');
    });
  });

  describe('discoverModules', () => {
    it('should discover modules with index.js', async () => {
      mockFs.readdir.mockResolvedValue([
        { name: 'module-1', isDirectory: () => true } as any,
        { name: 'module-2', isDirectory: () => true } as any,
        { name: 'file.txt', isDirectory: () => false } as any
      ]);

      mockFs.access.mockResolvedValue(undefined);

      const modules = await loader.discoverModules();

      expect(modules).toEqual(['module-1', 'module-2']);
    });

    it('should skip directories without index.js', async () => {
      mockFs.readdir.mockResolvedValue([
        { name: 'valid-module', isDirectory: () => true } as any,
        { name: 'invalid-module', isDirectory: () => true } as any
      ]);

      mockFs.access
        .mockResolvedValueOnce(undefined) // valid-module has index.js
        .mockRejectedValueOnce(new Error('ENOENT')); // invalid-module missing index.js

      const modules = await loader.discoverModules();

      expect(modules).toEqual(['valid-module']);
    });

    it('should return empty array when modules directory is empty', async () => {
      mockFs.readdir.mockResolvedValue([]);

      const modules = await loader.discoverModules();

      expect(modules).toEqual([]);
    });

    it('should throw error when modules directory does not exist', async () => {
      mockFs.readdir.mockRejectedValue(new Error('ENOENT'));

      await expect(loader.discoverModules()).rejects.toThrow('Failed to discover modules');
    });
  });

  describe('getModuleInfo', () => {
    it('should return module info from package.json', async () => {
      const packageJson = {
        name: 'test-module',
        version: '1.2.3',
        description: 'Test module',
        author: 'Test Author',
        dependencies: { 'dep1': '1.0.0' }
      };

      mockFs.readFile.mockResolvedValue(JSON.stringify(packageJson));

      const info = await loader.getModuleInfo('test-module');

      expect(info).toBeDefined();
      expect(info!.name).toBe('test-module');
      expect(info!.version).toBe('1.2.3');
      expect(info!.description).toBe('Test module');
      expect(info!.dependencies).toEqual({ 'dep1': '1.0.0' });
    });

    it('should return null when package.json does not exist', async () => {
      mockFs.readFile.mockRejectedValue(new Error('ENOENT'));

      const info = await loader.getModuleInfo('non-existent');

      expect(info).toBeNull();
    });

    it('should return null when package.json is invalid JSON', async () => {
      mockFs.readFile.mockResolvedValue('invalid json {');

      const info = await loader.getModuleInfo('bad-module');

      expect(info).toBeNull();
    });

    it('should handle module with no dependencies', async () => {
      const packageJson = {
        name: 'standalone-module',
        version: '1.0.0'
      };

      mockFs.readFile.mockResolvedValue(JSON.stringify(packageJson));

      const info = await loader.getModuleInfo('standalone-module');

      expect(info!.dependencies).toEqual({});
    });
  });

  describe('setModulesPath', () => {
    it('should update modules path', () => {
      loader.setModulesPath('/new/path');

      expect(loader.getModulesPath()).toBe('/new/path');
    });
  });

  describe('getModulesPath', () => {
    it('should return current modules path', () => {
      expect(loader.getModulesPath()).toBe(testModulesPath);
    });
  });

  describe('clear', () => {
    it('should clear all loaded modules', () => {
      (loader as any).loadedModules.set('module-1', {});
      (loader as any).loadedModules.set('module-2', {});

      loader.clear();

      expect(loader.getLoadedModules()).toEqual([]);
    });
  });

  describe('validateModule (private)', () => {
    it('should validate module with all required methods', () => {
      class ValidModule {
        onLoad() {}
        onUnload() {}
        onStart() {}
        onStop() {}
        getMetadata() {}
      }

      expect(() => (loader as any).validateModule(ValidModule)).not.toThrow();
    });

    it('should throw error for null module export', () => {
      expect(() => (loader as any).validateModule(null)).toThrow('Module export is null or undefined');
    });

    it('should throw error for non-function module export', () => {
      expect(() => (loader as any).validateModule({})).toThrow('Module must export a class or constructor function');
    });

    it('should throw error for missing onLoad method', () => {
      class InvalidModule {
        onUnload() {}
        onStart() {}
        onStop() {}
        getMetadata() {}
      }

      expect(() => (loader as any).validateModule(InvalidModule)).toThrow('Module must implement onLoad method');
    });

    it('should validate module with default export', () => {
      class ValidModule {
        onLoad() {}
        onUnload() {}
        onStart() {}
        onStop() {}
        getMetadata() {}
      }

      expect(() => (loader as any).validateModule({ default: ValidModule })).not.toThrow();
    });

    it('should validate module with named Module export', () => {
      class ValidModule {
        onLoad() {}
        onUnload() {}
        onStart() {}
        onStop() {}
        getMetadata() {}
      }

      expect(() => (loader as any).validateModule({ Module: ValidModule })).not.toThrow();
    });
  });
});
