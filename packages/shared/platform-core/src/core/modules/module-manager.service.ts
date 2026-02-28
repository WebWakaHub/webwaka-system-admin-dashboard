/**
 * Module System - Module Manager Service
 * 
 * Manages the lifecycle of modules (start, stop, load, unload).
 * Orchestrates the Module Loader and Module Registry.
 */

import { ModuleStatus } from './module.interface';
import { ModuleLoaderService } from './module-loader.service';
import { ModuleRegistryService } from './module-registry.service';

export interface ModuleManagerOptions {
  modulesPath?: string;
  autoStart?: boolean;
  timeout?: number;
}

export class ModuleManagerService {
  private loader: ModuleLoaderService;
  private registry: ModuleRegistryService;
  private options: ModuleManagerOptions;

  constructor(options: ModuleManagerOptions = {}) {
    this.options = {
      modulesPath: options.modulesPath || './modules',
      autoStart: options.autoStart !== undefined ? options.autoStart : false,
      timeout: options.timeout || 30000
    };

    this.loader = new ModuleLoaderService(this.options.modulesPath);
    this.registry = new ModuleRegistryService();
  }

  /**
   * Load a module by name
   */
  async loadModule(moduleName: string): Promise<void> {
    try {
      // Check if already loaded
      if (this.registry.has(moduleName)) {
        throw new Error(`Module ${moduleName} is already loaded`);
      }

      // Load the module
      const module = await this.loader.loadByName(moduleName);

      // Check dependencies
      const metadata = module.getMetadata();
      const depCheck = this.checkDependenciesLoaded(metadata.dependencies);
      if (!depCheck.satisfied) {
        throw new Error(
          `Missing dependencies for ${moduleName}: ${depCheck.missing.join(', ')}`
        );
      }

      // Register the module
      this.registry.register(module);

      // Call onLoad lifecycle hook
      await module.onLoad();

      // Auto-start if configured
      if (this.options.autoStart) {
        await this.startModule(moduleName);
      }
    } catch (error) {
      throw new Error(`Failed to load module ${moduleName}: ${(error as Error).message}`);
    }
  }

  /**
   * Unload a module by name
   */
  async unloadModule(moduleName: string): Promise<void> {
    try {
      const module = this.registry.get(moduleName);
      if (!module) {
        throw new Error(`Module ${moduleName} is not loaded`);
      }

      // Check if any modules depend on this
      const dependents = this.registry.getDependents(moduleName);
      if (dependents.length > 0) {
        throw new Error(
          `Cannot unload ${moduleName}: modules [${dependents.join(', ')}] depend on it`
        );
      }

      // Stop the module if running
      const metadata = module.getMetadata();
      if (metadata.status === ModuleStatus.RUNNING) {
        await this.stopModule(moduleName);
      }

      // Call onUnload lifecycle hook
      await module.onUnload();

      // Unregister from registry
      this.registry.unregister(moduleName);

      // Unload from loader
      await this.loader.unload(moduleName);
    } catch (error) {
      throw new Error(`Failed to unload module ${moduleName}: ${(error as Error).message}`);
    }
  }

  /**
   * Start a loaded module
   */
  async startModule(moduleName: string): Promise<void> {
    try {
      const module = this.registry.get(moduleName);
      if (!module) {
        throw new Error(`Module ${moduleName} is not loaded`);
      }

      const metadata = module.getMetadata();
      if (metadata.status === ModuleStatus.RUNNING) {
        throw new Error(`Module ${moduleName} is already running`);
      }

      // Call onStart lifecycle hook
      await module.onStart();
    } catch (error) {
      throw new Error(`Failed to start module ${moduleName}: ${(error as Error).message}`);
    }
  }

  /**
   * Stop a running module
   */
  async stopModule(moduleName: string): Promise<void> {
    try {
      const module = this.registry.get(moduleName);
      if (!module) {
        throw new Error(`Module ${moduleName} is not loaded`);
      }

      const metadata = module.getMetadata();
      if (metadata.status !== ModuleStatus.RUNNING) {
        throw new Error(`Module ${moduleName} is not running`);
      }

      // Call onStop lifecycle hook
      await module.onStop();
    } catch (error) {
      throw new Error(`Failed to stop module ${moduleName}: ${(error as Error).message}`);
    }
  }

  /**
   * Restart a module
   */
  async restartModule(moduleName: string): Promise<void> {
    await this.stopModule(moduleName);
    await this.startModule(moduleName);
  }

  /**
   * Get module status
   */
  getModuleStatus(moduleName: string): ModuleStatus | null {
    const metadata = this.registry.getMetadata(moduleName);
    return metadata ? metadata.status : null;
  }

  /**
   * Check if a module is loaded
   */
  isModuleLoaded(moduleName: string): boolean {
    return this.registry.has(moduleName);
  }

  /**
   * Check if a module is running
   */
  isModuleRunning(moduleName: string): boolean {
    const status = this.getModuleStatus(moduleName);
    return status === ModuleStatus.RUNNING;
  }

  /**
   * Get all loaded modules
   */
  getLoadedModules(): string[] {
    return this.registry.getAllNames();
  }

  /**
   * Get all running modules
   */
  getRunningModules(): string[] {
    return this.registry
      .getByStatus(ModuleStatus.RUNNING)
      .map(m => m.getMetadata().name);
  }

  /**
   * Get module metadata
   */
  getModuleMetadata(moduleName: string) {
    return this.registry.getMetadata(moduleName);
  }

  /**
   * Get all modules metadata
   */
  getAllModulesMetadata() {
    return this.registry.getAllMetadata();
  }

  /**
   * Discover available modules
   */
  async discoverModules(): Promise<string[]> {
    return this.loader.discoverModules();
  }

  /**
   * Load multiple modules with dependency resolution
   */
  async loadModules(moduleNames: string[]): Promise<void> {
    const loadOrder: string[] = [];
    const toLoad = new Set(moduleNames);

    // Build load order respecting dependencies
    for (const moduleName of moduleNames) {
      const order = await this.resolveDependencyOrder(moduleName);
      for (const name of order) {
        if (!loadOrder.includes(name) && toLoad.has(name)) {
          loadOrder.push(name);
        }
      }
    }

    // Load modules in order
    for (const moduleName of loadOrder) {
      if (!this.registry.has(moduleName)) {
        await this.loadModule(moduleName);
      }
    }
  }

  /**
   * Unload multiple modules
   */
  async unloadModules(moduleNames: string[]): Promise<void> {
    // Unload in reverse dependency order
    const unloadOrder = [...moduleNames].reverse();
    
    for (const moduleName of unloadOrder) {
      if (this.registry.has(moduleName)) {
        await this.unloadModule(moduleName);
      }
    }
  }

  /**
   * Health check for a module
   */
  async healthCheck(moduleName: string): Promise<boolean> {
    const module = this.registry.get(moduleName);
    if (!module) {
      return false;
    }

    try {
      return await module.healthCheck();
    } catch {
      return false;
    }
  }

  /**
   * Health check for all modules
   */
  async healthCheckAll(): Promise<{ [moduleName: string]: boolean }> {
    const results: { [moduleName: string]: boolean } = {};
    const modules = this.registry.getAllNames();

    for (const moduleName of modules) {
      results[moduleName] = await this.healthCheck(moduleName);
    }

    return results;
  }

  /**
   * Shutdown all modules
   */
  async shutdown(): Promise<void> {
    const runningModules = this.getRunningModules();
    
    // Stop all running modules
    for (const moduleName of runningModules) {
      try {
        await this.stopModule(moduleName);
      } catch (error) {
        console.error(`Error stopping module ${moduleName}:`, error);
      }
    }

    // Unload all modules
    const loadedModules = this.getLoadedModules();
    for (const moduleName of loadedModules) {
      try {
        await this.unloadModule(moduleName);
      } catch (error) {
        console.error(`Error unloading module ${moduleName}:`, error);
      }
    }
  }

  /**
   * Get the module loader
   */
  getLoader(): ModuleLoaderService {
    return this.loader;
  }

  /**
   * Get the module registry
   */
  getRegistry(): ModuleRegistryService {
    return this.registry;
  }

  /**
   * Check if dependencies are loaded
   */
  private checkDependenciesLoaded(dependencies: Record<string, string>): {
    satisfied: boolean;
    missing: string[];
  } {
    const missing: string[] = [];

    for (const depName of Object.keys(dependencies)) {
      if (!this.registry.has(depName)) {
        missing.push(depName);
      }
    }

    return {
      satisfied: missing.length === 0,
      missing
    };
  }

  /**
   * Resolve dependency load order for a module
   */
  private async resolveDependencyOrder(moduleName: string): Promise<string[]> {
    const order: string[] = [];
    const visited = new Set<string>();

    const visit = async (name: string) => {
      if (visited.has(name)) {
        return;
      }

      visited.add(name);

      // Get module info
      const info = await this.loader.getModuleInfo(name);
      if (info && info.dependencies) {
        for (const depName of Object.keys(info.dependencies)) {
          await visit(depName);
        }
      }

      order.push(name);
    };

    await visit(moduleName);
    return order;
  }
}
