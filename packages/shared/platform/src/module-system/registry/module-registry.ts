/**
 * Module Registry
 * Maintains a registry of all available and loaded modules
 */

import { Module, ModuleRegistry } from '../types/index.js';
import { ModuleNotFoundError, DependencyResolutionError } from '../errors/index.js';

export class DefaultModuleRegistry implements ModuleRegistry {
  public modules: Map<string, Module> = new Map();

  add(module: Module): void {
    this.modules.set(module.name, module);
  }

  remove(name: string): void {
    this.modules.delete(name);
  }

  get(name: string): Module | undefined {
    return this.modules.get(name);
  }

  list(): Module[] {
    return Array.from(this.modules.values());
  }

  async resolveDependencies(module: Module): Promise<Module[]> {
    const resolved: Module[] = [];
    const visited = new Set<string>();

    const visit = async (moduleName: string): Promise<void> => {
      if (visited.has(moduleName)) {
        return;
      }

      visited.add(moduleName);

      const mod = this.get(moduleName);
      if (!mod) {
        throw new ModuleNotFoundError(moduleName);
      }

      for (const depName of Object.keys(mod.dependencies)) {
        await visit(depName);
      }

      resolved.push(mod);
    };

    await visit(module.name);
    return resolved;
  }
}
