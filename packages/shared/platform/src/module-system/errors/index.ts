/**
 * Module System Errors
 * Custom error classes for the Module System
 */

export class ModuleSystemError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ModuleSystemError';
  }
}

export class ModuleNotFoundError extends ModuleSystemError {
  constructor(moduleName: string) {
    super(`Module '${moduleName}' not found`);
    this.name = 'ModuleNotFoundError';
  }
}

export class ModuleAlreadyLoadedError extends ModuleSystemError {
  constructor(moduleName: string) {
    super(`Module '${moduleName}' is already loaded`);
    this.name = 'ModuleAlreadyLoadedError';
  }
}

export class ModuleLoadError extends ModuleSystemError {
  constructor(moduleName: string, reason: string) {
    super(`Failed to load module '${moduleName}': ${reason}`);
    this.name = 'ModuleLoadError';
  }
}

export class ModuleUnloadError extends ModuleSystemError {
  constructor(moduleName: string, reason: string) {
    super(`Failed to unload module '${moduleName}': ${reason}`);
    this.name = 'ModuleUnloadError';
  }
}

export class DependencyResolutionError extends ModuleSystemError {
  constructor(moduleName: string, missingDependency: string) {
    super(`Failed to resolve dependency '${missingDependency}' for module '${moduleName}'`);
    this.name = 'DependencyResolutionError';
  }
}

export class ModuleSandboxError extends ModuleSystemError {
  constructor(moduleName: string, reason: string) {
    super(`Module sandbox error for '${moduleName}': ${reason}`);
    this.name = 'ModuleSandboxError';
  }
}

export class InvalidModuleError extends ModuleSystemError {
  constructor(moduleName: string, reason: string) {
    super(`Invalid module '${moduleName}': ${reason}`);
    this.name = 'InvalidModuleError';
  }
}

export class ModuleStateError extends ModuleSystemError {
  constructor(moduleName: string, currentState: string, requiredState: string) {
    super(`Module '${moduleName}' is in state '${currentState}', expected '${requiredState}'`);
    this.name = 'ModuleStateError';
  }
}
