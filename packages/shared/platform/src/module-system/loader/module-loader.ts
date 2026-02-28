/**
 * Module Loader
 * Responsible for loading module code and dependencies from storage
 */

import { Module, ModuleLoadRequest, ModuleLoader } from '../types/index.js';
import { ModuleLoadError, InvalidModuleError } from '../errors/index.js';
import * as fs from 'fs/promises';
import * as path from 'path';

export class DefaultModuleLoader implements ModuleLoader {
  async load(request: ModuleLoadRequest): Promise<Module> {
    try {
      // Validate module path exists
      const modulePath = request.path;
      await fs.access(modulePath);

      // Load module package.json
      const packageJsonPath = path.join(modulePath, 'package.json');
      const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(packageJsonContent);

      // Validate module structure
      if (!packageJson.name || !packageJson.version) {
        throw new InvalidModuleError(request.name, 'Missing name or version in package.json');
      }

      // Create module instance
      const module: Module = {
        name: request.name,
        version: request.version,
        dependencies: request.dependencies || packageJson.dependencies || {},
        path: modulePath,
        status: 'unloaded',
        onLoad: async () => {
          // Module-specific load logic
        },
        onUnload: async () => {
          // Module-specific unload logic
        },
        onStart: async () => {
          // Module-specific start logic
        },
        onStop: async () => {
          // Module-specific stop logic
        },
      };

      return module;
    } catch (error) {
      if (error instanceof InvalidModuleError) {
        throw error;
      }
      throw new ModuleLoadError(request.name, (error as Error).message);
    }
  }

  async unload(name: string): Promise<void> {
    // Module-specific unload logic
  }
}
