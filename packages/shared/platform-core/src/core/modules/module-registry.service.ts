/**
 * Module System - Module Registry Service
 * 
 * Maintains a registry of all available and loaded modules.
 * Handles module discovery and dependency resolution.
 */

import { IModule, ModuleMetadata, ModuleStatus } from './module.interface';

export interface DependencyGraph {
  [moduleName: string]: string[];
}

export class ModuleRegistryService {
  private modules: Map<string, IModule>;
  private dependencyGraph: DependencyGraph;

  constructor() {
    this.modules = new Map();
    this.dependencyGraph = {};
  }

  /**
   * Register a module in the registry
   */
  register(module: IModule): void {
    const metadata = module.getMetadata();
    
    if (this.modules.has(metadata.name)) {
      throw new Error(`Module ${metadata.name} is already registered`);
    }

    this.modules.set(metadata.name, module);
    this.updateDependencyGraph(metadata);
  }

  /**
   * Unregister a module from the registry
   */
  unregister(moduleName: string): void {
    if (!this.modules.has(moduleName)) {
      throw new Error(`Module ${moduleName} is not registered`);
    }

    // Check if any other modules depend on this module
    const dependents = this.getDependents(moduleName);
    if (dependents.length > 0) {
      throw new Error(
        `Cannot unregister module ${moduleName}: modules [${dependents.join(', ')}] depend on it`
      );
    }

    this.modules.delete(moduleName);
    delete this.dependencyGraph[moduleName];
  }

  /**
   * Get a module by name
   */
  get(moduleName: string): IModule | undefined {
    return this.modules.get(moduleName);
  }

  /**
   * Check if a module is registered
   */
  has(moduleName: string): boolean {
    return this.modules.has(moduleName);
  }

  /**
   * Get all registered modules
   */
  getAll(): IModule[] {
    return Array.from(this.modules.values());
  }

  /**
   * Get all module names
   */
  getAllNames(): string[] {
    return Array.from(this.modules.keys());
  }

  /**
   * Get module metadata by name
   */
  getMetadata(moduleName: string): ModuleMetadata | undefined {
    const module = this.modules.get(moduleName);
    return module?.getMetadata();
  }

  /**
   * Get all modules metadata
   */
  getAllMetadata(): ModuleMetadata[] {
    return Array.from(this.modules.values()).map(m => m.getMetadata());
  }

  /**
   * Get modules by status
   */
  getByStatus(status: ModuleStatus): IModule[] {
    return Array.from(this.modules.values()).filter(
      m => m.getMetadata().status === status
    );
  }

  /**
   * Get module dependencies
   */
  getDependencies(moduleName: string): string[] {
    return this.dependencyGraph[moduleName] || [];
  }

  /**
   * Get modules that depend on the given module
   */
  getDependents(moduleName: string): string[] {
    const dependents: string[] = [];
    
    for (const [name, deps] of Object.entries(this.dependencyGraph)) {
      if (deps.includes(moduleName)) {
        dependents.push(name);
      }
    }
    
    return dependents;
  }

  /**
   * Resolve module dependencies in load order
   */
  resolveDependencies(moduleName: string): string[] {
    const visited = new Set<string>();
    const loadOrder: string[] = [];
    const visiting = new Set<string>();

    const visit = (name: string) => {
      if (visited.has(name)) {
        return;
      }

      if (visiting.has(name)) {
        throw new Error(`Circular dependency detected: ${name}`);
      }

      visiting.add(name);

      const deps = this.getDependencies(name);
      for (const dep of deps) {
        if (!this.modules.has(dep)) {
          throw new Error(`Missing dependency: ${dep} required by ${name}`);
        }
        visit(dep);
      }

      visiting.delete(name);
      visited.add(name);
      loadOrder.push(name);
    };

    visit(moduleName);
    return loadOrder;
  }

  /**
   * Check if all dependencies are satisfied
   */
  checkDependencies(moduleName: string): { satisfied: boolean; missing: string[] } {
    const module = this.modules.get(moduleName);
    if (!module) {
      return { satisfied: false, missing: [moduleName] };
    }

    const metadata = module.getMetadata();
    const missing: string[] = [];

    for (const depName of Object.keys(metadata.dependencies)) {
      if (!this.modules.has(depName)) {
        missing.push(depName);
      }
    }

    return {
      satisfied: missing.length === 0,
      missing
    };
  }

  /**
   * Clear all modules from the registry
   */
  clear(): void {
    this.modules.clear();
    this.dependencyGraph = {};
  }

  /**
   * Get the total number of registered modules
   */
  count(): number {
    return this.modules.size;
  }

  /**
   * Update the dependency graph when a module is registered
   */
  private updateDependencyGraph(metadata: ModuleMetadata): void {
    this.dependencyGraph[metadata.name] = Object.keys(metadata.dependencies);
  }
}
