/**
 * Unit Tests - Module Registry Service
 * 
 * Tests for module registration, discovery, and dependency resolution
 */

import { ModuleRegistryService } from '../../../src/core/modules/module-registry.service';
import { BaseModule, ModuleStatus } from '../../../src/core/modules/module.interface';

class TestModule extends BaseModule {
  constructor(name: string, version: string = '1.0.0', dependencies: Record<string, string> = {}) {
    super({ name, version, dependencies, path: `/modules/${name}` });
  }
}

describe('ModuleRegistryService', () => {
  let registry: ModuleRegistryService;

  beforeEach(() => {
    registry = new ModuleRegistryService();
  });

  describe('register', () => {
    it('should register a module successfully', () => {
      const module = new TestModule('test-module');
      
      registry.register(module);
      
      expect(registry.has('test-module')).toBe(true);
      expect(registry.count()).toBe(1);
    });

    it('should throw error when registering duplicate module', () => {
      const module1 = new TestModule('test-module');
      const module2 = new TestModule('test-module');
      
      registry.register(module1);
      
      expect(() => registry.register(module2)).toThrow('Module test-module is already registered');
    });

    it('should register multiple modules', () => {
      const module1 = new TestModule('module-1');
      const module2 = new TestModule('module-2');
      const module3 = new TestModule('module-3');
      
      registry.register(module1);
      registry.register(module2);
      registry.register(module3);
      
      expect(registry.count()).toBe(3);
    });

    it('should update dependency graph when registering module with dependencies', () => {
      const module = new TestModule('app', '1.0.0', { 'core': '1.0.0', 'utils': '2.0.0' });
      
      registry.register(module);
      
      const deps = registry.getDependencies('app');
      expect(deps).toEqual(['core', 'utils']);
    });
  });

  describe('unregister', () => {
    it('should unregister a module successfully', () => {
      const module = new TestModule('test-module');
      registry.register(module);
      
      registry.unregister('test-module');
      
      expect(registry.has('test-module')).toBe(false);
      expect(registry.count()).toBe(0);
    });

    it('should throw error when unregistering non-existent module', () => {
      expect(() => registry.unregister('non-existent')).toThrow('Module non-existent is not registered');
    });

    it('should throw error when unregistering module with dependents', () => {
      const core = new TestModule('core');
      const app = new TestModule('app', '1.0.0', { 'core': '1.0.0' });
      
      registry.register(core);
      registry.register(app);
      
      expect(() => registry.unregister('core')).toThrow('Cannot unregister module core: modules [app] depend on it');
    });

    it('should remove module from dependency graph', () => {
      const module = new TestModule('test', '1.0.0', { 'dep': '1.0.0' });
      registry.register(module);
      
      registry.unregister('test');
      
      const deps = registry.getDependencies('test');
      expect(deps).toEqual([]);
    });
  });

  describe('get', () => {
    it('should return module when it exists', () => {
      const module = new TestModule('test-module');
      registry.register(module);
      
      const result = registry.get('test-module');
      
      expect(result).toBe(module);
    });

    it('should return undefined when module does not exist', () => {
      const result = registry.get('non-existent');
      
      expect(result).toBeUndefined();
    });
  });

  describe('has', () => {
    it('should return true when module exists', () => {
      const module = new TestModule('test-module');
      registry.register(module);
      
      expect(registry.has('test-module')).toBe(true);
    });

    it('should return false when module does not exist', () => {
      expect(registry.has('non-existent')).toBe(false);
    });
  });

  describe('getAll', () => {
    it('should return empty array when no modules registered', () => {
      const result = registry.getAll();
      
      expect(result).toEqual([]);
    });

    it('should return all registered modules', () => {
      const module1 = new TestModule('module-1');
      const module2 = new TestModule('module-2');
      
      registry.register(module1);
      registry.register(module2);
      
      const result = registry.getAll();
      
      expect(result).toHaveLength(2);
      expect(result).toContain(module1);
      expect(result).toContain(module2);
    });
  });

  describe('getAllNames', () => {
    it('should return empty array when no modules registered', () => {
      const result = registry.getAllNames();
      
      expect(result).toEqual([]);
    });

    it('should return all module names', () => {
      registry.register(new TestModule('module-1'));
      registry.register(new TestModule('module-2'));
      registry.register(new TestModule('module-3'));
      
      const result = registry.getAllNames();
      
      expect(result).toHaveLength(3);
      expect(result).toContain('module-1');
      expect(result).toContain('module-2');
      expect(result).toContain('module-3');
    });
  });

  describe('getMetadata', () => {
    it('should return metadata for existing module', () => {
      const module = new TestModule('test-module', '2.0.0');
      registry.register(module);
      
      const metadata = registry.getMetadata('test-module');
      
      expect(metadata).toBeDefined();
      expect(metadata!.name).toBe('test-module');
      expect(metadata!.version).toBe('2.0.0');
    });

    it('should return undefined for non-existent module', () => {
      const metadata = registry.getMetadata('non-existent');
      
      expect(metadata).toBeUndefined();
    });
  });

  describe('getAllMetadata', () => {
    it('should return empty array when no modules registered', () => {
      const result = registry.getAllMetadata();
      
      expect(result).toEqual([]);
    });

    it('should return metadata for all modules', () => {
      registry.register(new TestModule('module-1', '1.0.0'));
      registry.register(new TestModule('module-2', '2.0.0'));
      
      const result = registry.getAllMetadata();
      
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('module-1');
      expect(result[1].name).toBe('module-2');
    });
  });

  describe('getByStatus', () => {
    it('should return modules with specified status', async () => {
      const module1 = new TestModule('module-1');
      const module2 = new TestModule('module-2');
      const module3 = new TestModule('module-3');
      
      registry.register(module1);
      registry.register(module2);
      registry.register(module3);
      
      await module1.onLoad();
      await module2.onLoad();
      await module2.onStart();
      
      const loaded = registry.getByStatus(ModuleStatus.LOADED);
      const running = registry.getByStatus(ModuleStatus.RUNNING);
      const unloaded = registry.getByStatus(ModuleStatus.UNLOADED);
      
      expect(loaded).toHaveLength(1);
      expect(running).toHaveLength(1);
      expect(unloaded).toHaveLength(1);
    });

    it('should return empty array when no modules match status', () => {
      const module = new TestModule('test');
      registry.register(module);
      
      const result = registry.getByStatus(ModuleStatus.RUNNING);
      
      expect(result).toEqual([]);
    });
  });

  describe('getDependencies', () => {
    it('should return dependencies for a module', () => {
      const module = new TestModule('app', '1.0.0', { 'core': '1.0.0', 'utils': '2.0.0' });
      registry.register(module);
      
      const deps = registry.getDependencies('app');
      
      expect(deps).toEqual(['core', 'utils']);
    });

    it('should return empty array for module with no dependencies', () => {
      const module = new TestModule('standalone');
      registry.register(module);
      
      const deps = registry.getDependencies('standalone');
      
      expect(deps).toEqual([]);
    });

    it('should return empty array for non-existent module', () => {
      const deps = registry.getDependencies('non-existent');
      
      expect(deps).toEqual([]);
    });
  });

  describe('getDependents', () => {
    it('should return modules that depend on the given module', () => {
      const core = new TestModule('core');
      const app1 = new TestModule('app1', '1.0.0', { 'core': '1.0.0' });
      const app2 = new TestModule('app2', '1.0.0', { 'core': '1.0.0' });
      const standalone = new TestModule('standalone');
      
      registry.register(core);
      registry.register(app1);
      registry.register(app2);
      registry.register(standalone);
      
      const dependents = registry.getDependents('core');
      
      expect(dependents).toHaveLength(2);
      expect(dependents).toContain('app1');
      expect(dependents).toContain('app2');
    });

    it('should return empty array when no modules depend on it', () => {
      const module = new TestModule('standalone');
      registry.register(module);
      
      const dependents = registry.getDependents('standalone');
      
      expect(dependents).toEqual([]);
    });
  });

  describe('resolveDependencies', () => {
    it('should resolve dependencies in correct load order', () => {
      const core = new TestModule('core');
      const utils = new TestModule('utils', '1.0.0', { 'core': '1.0.0' });
      const app = new TestModule('app', '1.0.0', { 'core': '1.0.0', 'utils': '1.0.0' });
      
      registry.register(core);
      registry.register(utils);
      registry.register(app);
      
      const order = registry.resolveDependencies('app');
      
      expect(order).toEqual(['core', 'utils', 'app']);
    });

    it('should handle module with no dependencies', () => {
      const module = new TestModule('standalone');
      registry.register(module);
      
      const order = registry.resolveDependencies('standalone');
      
      expect(order).toEqual(['standalone']);
    });

    it('should throw error on circular dependency', () => {
      const moduleA = new TestModule('moduleA', '1.0.0', { 'moduleB': '1.0.0' });
      const moduleB = new TestModule('moduleB', '1.0.0', { 'moduleA': '1.0.0' });
      
      registry.register(moduleA);
      registry.register(moduleB);
      
      expect(() => registry.resolveDependencies('moduleA')).toThrow('Circular dependency detected');
    });

    it('should throw error on missing dependency', () => {
      const module = new TestModule('app', '1.0.0', { 'missing': '1.0.0' });
      registry.register(module);
      
      expect(() => registry.resolveDependencies('app')).toThrow('Missing dependency: missing required by app');
    });

    it('should handle complex dependency tree', () => {
      const a = new TestModule('a');
      const b = new TestModule('b', '1.0.0', { 'a': '1.0.0' });
      const c = new TestModule('c', '1.0.0', { 'a': '1.0.0' });
      const d = new TestModule('d', '1.0.0', { 'b': '1.0.0', 'c': '1.0.0' });
      
      registry.register(a);
      registry.register(b);
      registry.register(c);
      registry.register(d);
      
      const order = registry.resolveDependencies('d');
      
      expect(order[0]).toBe('a');
      expect(order[order.length - 1]).toBe('d');
      expect(order).toContain('b');
      expect(order).toContain('c');
    });
  });

  describe('checkDependencies', () => {
    it('should return satisfied when all dependencies are registered', () => {
      const core = new TestModule('core');
      const utils = new TestModule('utils');
      const app = new TestModule('app', '1.0.0', { 'core': '1.0.0', 'utils': '1.0.0' });
      
      registry.register(core);
      registry.register(utils);
      registry.register(app);
      
      const result = registry.checkDependencies('app');
      
      expect(result.satisfied).toBe(true);
      expect(result.missing).toEqual([]);
    });

    it('should return unsatisfied with missing dependencies', () => {
      const app = new TestModule('app', '1.0.0', { 'core': '1.0.0', 'utils': '1.0.0' });
      registry.register(app);
      
      const result = registry.checkDependencies('app');
      
      expect(result.satisfied).toBe(false);
      expect(result.missing).toEqual(['core', 'utils']);
    });

    it('should return satisfied for module with no dependencies', () => {
      const module = new TestModule('standalone');
      registry.register(module);
      
      const result = registry.checkDependencies('standalone');
      
      expect(result.satisfied).toBe(true);
      expect(result.missing).toEqual([]);
    });

    it('should return unsatisfied for non-existent module', () => {
      const result = registry.checkDependencies('non-existent');
      
      expect(result.satisfied).toBe(false);
      expect(result.missing).toEqual(['non-existent']);
    });
  });

  describe('clear', () => {
    it('should remove all modules', () => {
      registry.register(new TestModule('module-1'));
      registry.register(new TestModule('module-2'));
      registry.register(new TestModule('module-3'));
      
      registry.clear();
      
      expect(registry.count()).toBe(0);
      expect(registry.getAllNames()).toEqual([]);
    });

    it('should clear dependency graph', () => {
      const module = new TestModule('app', '1.0.0', { 'core': '1.0.0' });
      registry.register(module);
      
      registry.clear();
      
      const deps = registry.getDependencies('app');
      expect(deps).toEqual([]);
    });
  });

  describe('count', () => {
    it('should return 0 when no modules registered', () => {
      expect(registry.count()).toBe(0);
    });

    it('should return correct count of registered modules', () => {
      registry.register(new TestModule('module-1'));
      registry.register(new TestModule('module-2'));
      
      expect(registry.count()).toBe(2);
      
      registry.register(new TestModule('module-3'));
      
      expect(registry.count()).toBe(3);
    });

    it('should update count after unregister', () => {
      registry.register(new TestModule('module-1'));
      registry.register(new TestModule('module-2'));
      
      registry.unregister('module-1');
      
      expect(registry.count()).toBe(1);
    });
  });
});
