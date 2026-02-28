/**
 * Module Manager
 * Manages the lifecycle of modules (load, unload, start, stop)
 */

import { Module, ModuleLoadRequest, ModuleManager, ModuleLoader, ModuleRegistry } from '../types/index.js';
import { ModuleNotFoundError, ModuleStateError, ModuleUnloadError } from '../errors/index.js';

export class DefaultModuleManager implements ModuleManager {
  constructor(private loader: ModuleLoader, private registry: ModuleRegistry) {}

  async load(request: ModuleLoadRequest): Promise<Module> {
    const module = await this.loader.load(request);

    // Resolve dependencies
    const dependencies = await this.registry.resolveDependencies(module);

    // Load all dependencies first
    for (const dep of dependencies) {
      if (dep.status === 'unloaded') {
        await dep.onLoad();
      }
    }

    // Load the module itself
    await module.onLoad();
    module.status = 'loaded';

    // Register the module
    this.registry.add(module);

    return module;
  }

  async unload(name: string): Promise<void> {
    const module = this.registry.get(name);
    if (!module) {
      throw new ModuleNotFoundError(name);
    }

    if (module.status === 'running') {
      await this.stop(name);
    }

    try {
      await module.onUnload();
      module.status = 'unloaded';
      this.registry.remove(name);
    } catch (error) {
      throw new ModuleUnloadError(name, (error as Error).message);
    }
  }

  async start(name: string): Promise<void> {
    const module = this.registry.get(name);
    if (!module) {
      throw new ModuleNotFoundError(name);
    }

    if (module.status !== 'loaded') {
      throw new ModuleStateError(name, module.status, 'loaded');
    }

    await module.onStart();
    module.status = 'running';
  }

  async stop(name: string): Promise<void> {
    const module = this.registry.get(name);
    if (!module) {
      throw new ModuleNotFoundError(name);
    }

    if (module.status !== 'running') {
      throw new ModuleStateError(name, module.status, 'running');
    }

    await module.onStop();
    module.status = 'stopped';
  }

  list(): Module[] {
    return this.registry.list();
  }

  get(name: string): Module | undefined {
    return this.registry.get(name);
  }
}
