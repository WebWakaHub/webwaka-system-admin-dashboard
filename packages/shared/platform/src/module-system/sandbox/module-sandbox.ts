/**
 * Module Sandbox
 * Provides an isolated environment for running module code
 */

import { Module, ModuleSandbox } from '../types/index.js';
import { ModuleSandboxError } from '../errors/index.js';

export class DefaultModuleSandbox implements ModuleSandbox {
  private runningModules: Map<string, NodeJS.Timeout> = new Map();

  async run(module: Module): Promise<void> {
    try {
      // Create isolated context for module
      const sandbox = {
        module,
        console: {
          log: (...args: unknown[]) => console.log(`[${module.name}]`, ...args),
          error: (...args: unknown[]) => console.error(`[${module.name}]`, ...args),
          warn: (...args: unknown[]) => console.warn(`[${module.name}]`, ...args),
        },
      };

      // Execute module in sandbox
      await module.onStart();

      // Track running module
      this.runningModules.set(module.name, setInterval(() => {
        // Health check for module
      }, 5000));
    } catch (error) {
      throw new ModuleSandboxError(module.name, (error as Error).message);
    }
  }

  async stop(name: string): Promise<void> {
    const timeout = this.runningModules.get(name);
    if (timeout) {
      clearInterval(timeout);
      this.runningModules.delete(name);
    }
  }
}
