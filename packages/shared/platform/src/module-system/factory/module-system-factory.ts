/**
 * Module System Factory
 * Factory for creating Module System instances
 */

import { DefaultModuleRegistry } from '../registry/module-registry.js';
import { DefaultModuleLoader } from '../loader/module-loader.js';
import { DefaultModuleManager } from '../manager/module-manager.js';
import { DefaultModuleSandbox } from '../sandbox/module-sandbox.js';

export class ModuleSystemFactory {
  static createRegistry() {
    return new DefaultModuleRegistry();
  }

  static createLoader() {
    return new DefaultModuleLoader();
  }

  static createManager(loader = this.createLoader(), registry = this.createRegistry()) {
    return new DefaultModuleManager(loader, registry);
  }

  static createSandbox() {
    return new DefaultModuleSandbox();
  }

  static createCompleteModuleSystem() {
    const registry = this.createRegistry();
    const loader = this.createLoader();
    const manager = this.createManager(loader, registry);
    const sandbox = this.createSandbox();

    return {
      registry,
      loader,
      manager,
      sandbox,
    };
  }
}
