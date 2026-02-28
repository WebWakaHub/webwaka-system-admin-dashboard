import { describe, it, expect } from '@jest/globals';
import { ModuleSystemFactory } from '../../src/module-system/factory/module-system-factory';
import { DefaultModuleRegistry } from '../../src/module-system/registry/module-registry';
import { DefaultModuleLoader } from '../../src/module-system/loader/module-loader';
import { DefaultModuleManager } from '../../src/module-system/manager/module-manager';
import { DefaultModuleSandbox } from '../../src/module-system/sandbox/module-sandbox';

describe('Module System Factory', () => {
  describe('createRegistry', () => {
    it('should create a registry instance', () => {
      const registry = ModuleSystemFactory.createRegistry();
      expect(registry).toBeInstanceOf(DefaultModuleRegistry);
    });

    it('should create independent registry instances', () => {
      const registry1 = ModuleSystemFactory.createRegistry();
      const registry2 = ModuleSystemFactory.createRegistry();
      expect(registry1).not.toBe(registry2);
    });
  });

  describe('createLoader', () => {
    it('should create a loader instance', () => {
      const loader = ModuleSystemFactory.createLoader();
      expect(loader).toBeInstanceOf(DefaultModuleLoader);
    });

    it('should create independent loader instances', () => {
      const loader1 = ModuleSystemFactory.createLoader();
      const loader2 = ModuleSystemFactory.createLoader();
      expect(loader1).not.toBe(loader2);
    });
  });

  describe('createManager', () => {
    it('should create a manager instance', () => {
      const manager = ModuleSystemFactory.createManager();
      expect(manager).toBeInstanceOf(DefaultModuleManager);
    });

    it('should create manager with provided loader and registry', () => {
      const loader = ModuleSystemFactory.createLoader();
      const registry = ModuleSystemFactory.createRegistry();
      const manager = ModuleSystemFactory.createManager(loader, registry);
      expect(manager).toBeInstanceOf(DefaultModuleManager);
    });
  });

  describe('createSandbox', () => {
    it('should create a sandbox instance', () => {
      const sandbox = ModuleSystemFactory.createSandbox();
      expect(sandbox).toBeInstanceOf(DefaultModuleSandbox);
    });

    it('should create independent sandbox instances', () => {
      const sandbox1 = ModuleSystemFactory.createSandbox();
      const sandbox2 = ModuleSystemFactory.createSandbox();
      expect(sandbox1).not.toBe(sandbox2);
    });
  });

  describe('createCompleteModuleSystem', () => {
    it('should create all components', () => {
      const system = ModuleSystemFactory.createCompleteModuleSystem();
      expect(system.registry).toBeInstanceOf(DefaultModuleRegistry);
      expect(system.loader).toBeInstanceOf(DefaultModuleLoader);
      expect(system.manager).toBeInstanceOf(DefaultModuleManager);
      expect(system.sandbox).toBeInstanceOf(DefaultModuleSandbox);
    });

    it('should create independent systems', () => {
      const system1 = ModuleSystemFactory.createCompleteModuleSystem();
      const system2 = ModuleSystemFactory.createCompleteModuleSystem();
      expect(system1.registry).not.toBe(system2.registry);
      expect(system1.loader).not.toBe(system2.loader);
      expect(system1.manager).not.toBe(system2.manager);
      expect(system1.sandbox).not.toBe(system2.sandbox);
    });
  });
});
