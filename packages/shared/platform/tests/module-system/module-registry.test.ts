import { describe, it, expect, beforeEach } from '@jest/globals';
import { DefaultModuleRegistry } from '../../src/module-system/registry/module-registry';
import { Module } from '../../src/module-system/types';
import { ModuleNotFoundError, DependencyResolutionError } from '../../src/module-system/errors';

describe('Module Registry', () => {
  let registry: DefaultModuleRegistry;
  let testModule: Module;

  beforeEach(() => {
    registry = new DefaultModuleRegistry();
    testModule = {
      name: 'test-module',
      version: '1.0.0',
      dependencies: {},
      path: '/test/path',
      status: 'unloaded',
      onLoad: async () => {},
      onUnload: async () => {},
      onStart: async () => {},
      onStop: async () => {},
    };
  });

  describe('add', () => {
    it('should add a module to the registry', () => {
      registry.add(testModule);
      expect(registry.get('test-module')).toBe(testModule);
    });

    it('should overwrite existing module with same name', () => {
      registry.add(testModule);
      const newModule = { ...testModule, version: '2.0.0' };
      registry.add(newModule);
      expect(registry.get('test-module')?.version).toBe('2.0.0');
    });
  });

  describe('remove', () => {
    it('should remove a module from the registry', () => {
      registry.add(testModule);
      registry.remove('test-module');
      expect(registry.get('test-module')).toBeUndefined();
    });

    it('should not throw error when removing non-existent module', () => {
      expect(() => registry.remove('non-existent')).not.toThrow();
    });
  });

  describe('get', () => {
    it('should return module by name', () => {
      registry.add(testModule);
      expect(registry.get('test-module')).toBe(testModule);
    });

    it('should return undefined for non-existent module', () => {
      expect(registry.get('non-existent')).toBeUndefined();
    });
  });

  describe('list', () => {
    it('should return empty array when no modules registered', () => {
      expect(registry.list()).toEqual([]);
    });

    it('should return all registered modules', () => {
      const module2 = { ...testModule, name: 'module-2' };
      registry.add(testModule);
      registry.add(module2);
      expect(registry.list()).toHaveLength(2);
    });
  });

  describe('resolveDependencies', () => {
    it('should resolve module with no dependencies', async () => {
      registry.add(testModule);
      const resolved = await registry.resolveDependencies(testModule);
      expect(resolved).toHaveLength(1);
      expect(resolved[0]).toBe(testModule);
    });

    it('should throw error for missing dependency', async () => {
      const moduleWithDeps = {
        ...testModule,
        dependencies: { 'missing-module': '1.0.0' },
      };
      registry.add(moduleWithDeps);
      await expect(registry.resolveDependencies(moduleWithDeps)).rejects.toThrow(ModuleNotFoundError);
    });

    it('should resolve module with dependencies', async () => {
      const dep = { ...testModule, name: 'dependency' };
      const moduleWithDeps = {
        ...testModule,
        dependencies: { dependency: '1.0.0' },
      };
      registry.add(dep);
      registry.add(moduleWithDeps);
      const resolved = await registry.resolveDependencies(moduleWithDeps);
      expect(resolved).toHaveLength(2);
    });
  });
});
