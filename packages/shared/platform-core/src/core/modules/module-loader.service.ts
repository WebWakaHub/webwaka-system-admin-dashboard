/**
 * Module System - Module Loader Service
 * 
 * Responsible for loading module code and dependencies from storage.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { IModule, ModuleMetadata } from './module.interface';

export interface ModuleLoadOptions {
  validateDependencies?: boolean;
  timeout?: number;
}

export class ModuleLoaderService {
  private modulesPath: string;
  private loadedModules: Map<string, any>;

  constructor(modulesPath: string = './modules') {
    this.modulesPath = modulesPath;
    this.loadedModules = new Map();
  }

  /**
   * Load a module from the filesystem
   */
  async loadFromPath(modulePath: string, _options: ModuleLoadOptions = {}): Promise<IModule> {
    try {
      const absolutePath = path.resolve(this.modulesPath, modulePath);
      
      // Check if file exists
      await this.validatePath(absolutePath);

      // Load the module
      const moduleExport = await this.requireModule(absolutePath);
      
      // Validate module structure
      this.validateModule(moduleExport);

      // Create module instance
      const module = this.createModuleInstance(moduleExport, absolutePath);

      // Cache the loaded module
      const metadata = module.getMetadata();
      this.loadedModules.set(metadata.name, moduleExport);

      return module;
    } catch (error) {
      throw new Error(`Failed to load module from ${modulePath}: ${(error as Error).message}`);
    }
  }

  /**
   * Load a module by name
   */
  async loadByName(moduleName: string, options: ModuleLoadOptions = {}): Promise<IModule> {
    const modulePath = `${moduleName}/index.js`;
    return this.loadFromPath(modulePath, options);
  }

  /**
   * Unload a module and clear its cache
   */
  async unload(moduleName: string): Promise<void> {
    if (!this.loadedModules.has(moduleName)) {
      throw new Error(`Module ${moduleName} is not loaded`);
    }

    this.loadedModules.delete(moduleName);
    
    // Clear from Node.js require cache if applicable
    const modulePath = path.resolve(this.modulesPath, moduleName);
    Object.keys(require.cache).forEach(key => {
      if (key.startsWith(modulePath)) {
        delete require.cache[key];
      }
    });
  }

  /**
   * Check if a module is loaded
   */
  isLoaded(moduleName: string): boolean {
    return this.loadedModules.has(moduleName);
  }

  /**
   * Get all loaded module names
   */
  getLoadedModules(): string[] {
    return Array.from(this.loadedModules.keys());
  }

  /**
   * Discover available modules in the modules directory
   */
  async discoverModules(): Promise<string[]> {
    try {
      const entries = await fs.readdir(this.modulesPath, { withFileTypes: true });
      const modules: string[] = [];

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const indexPath = path.join(this.modulesPath, entry.name, 'index.js');
          try {
            await fs.access(indexPath);
            modules.push(entry.name);
          } catch {
            // Skip directories without index.js
          }
        }
      }

      return modules;
    } catch (error) {
      throw new Error(`Failed to discover modules: ${(error as Error).message}`);
    }
  }

  /**
   * Get module metadata from file without loading
   */
  async getModuleInfo(modulePath: string): Promise<ModuleMetadata | null> {
    try {
      const packageJsonPath = path.join(this.modulesPath, modulePath, 'package.json');
      const content = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);

      return {
        name: packageJson.name,
        version: packageJson.version,
        description: packageJson.description,
        author: packageJson.author,
        dependencies: packageJson.dependencies || {},
        status: 'unloaded' as any,
        path: modulePath
      };
    } catch {
      return null;
    }
  }

  /**
   * Validate that the module path exists and is accessible
   */
  private async validatePath(modulePath: string): Promise<void> {
    try {
      await fs.access(modulePath);
    } catch {
      throw new Error(`Module path does not exist: ${modulePath}`);
    }
  }

  /**
   * Require/import the module
   */
  private async requireModule(modulePath: string): Promise<any> {
    try {
      // Dynamic import for ES modules
      const moduleExport = require(modulePath);
      return moduleExport;
    } catch (error) {
      throw new Error(`Failed to require module: ${(error as Error).message}`);
    }
  }

  /**
   * Validate that the module exports the required interface
   */
  private validateModule(moduleExport: any): void {
    if (!moduleExport) {
      throw new Error('Module export is null or undefined');
    }

    // Check for default export or named export
    const ModuleClass = moduleExport.default || moduleExport.Module || moduleExport;

    if (typeof ModuleClass !== 'function') {
      throw new Error('Module must export a class or constructor function');
    }

    // Check for required methods
    const requiredMethods = ['onLoad', 'onUnload', 'onStart', 'onStop', 'getMetadata'];
    const prototype = ModuleClass.prototype;

    for (const method of requiredMethods) {
      if (typeof prototype[method] !== 'function') {
        throw new Error(`Module must implement ${method} method`);
      }
    }
  }

  /**
   * Create an instance of the module
   */
  private createModuleInstance(moduleExport: any, modulePath: string): IModule {
    const ModuleClass = moduleExport.default || moduleExport.Module || moduleExport;
    
    try {
      const instance = new ModuleClass({ path: modulePath });
      return instance as IModule;
    } catch (error) {
      throw new Error(`Failed to instantiate module: ${(error as Error).message}`);
    }
  }

  /**
   * Set the modules path
   */
  setModulesPath(modulesPath: string): void {
    this.modulesPath = modulesPath;
  }

  /**
   * Get the modules path
   */
  getModulesPath(): string {
    return this.modulesPath;
  }

  /**
   * Clear all loaded modules
   */
  clear(): void {
    this.loadedModules.clear();
  }
}
