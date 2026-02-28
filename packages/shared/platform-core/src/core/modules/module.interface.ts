/**
 * Module System - Module Interface
 * 
 * Defines the contract that all platform modules must implement.
 * Based on MODULE_SYSTEM_SPECIFICATION.md
 */

export enum ModuleStatus {
  UNLOADED = 'unloaded',
  LOADED = 'loaded',
  RUNNING = 'running',
  STOPPED = 'stopped',
  FAILED = 'failed'
}

export interface ModuleDependency {
  name: string;
  version: string;
  required: boolean;
}

export interface ModuleMetadata {
  name: string;
  version: string;
  description?: string;
  author?: string;
  dependencies: Record<string, string>;
  status: ModuleStatus;
  path: string;
  loadedAt?: Date;
  startedAt?: Date;
}

export interface IModule {
  /**
   * Get module metadata
   */
  getMetadata(): ModuleMetadata;

  /**
   * Called when the module is loaded into the system
   */
  onLoad(): Promise<void>;

  /**
   * Called when the module is unloaded from the system
   */
  onUnload(): Promise<void>;

  /**
   * Called when the module is started
   */
  onStart(): Promise<void>;

  /**
   * Called when the module is stopped
   */
  onStop(): Promise<void>;

  /**
   * Health check for the module
   */
  healthCheck(): Promise<boolean>;
}

export abstract class BaseModule implements IModule {
  protected metadata: ModuleMetadata;

  constructor(metadata: Partial<ModuleMetadata>) {
    this.metadata = {
      name: metadata.name || 'unknown',
      version: metadata.version || '0.0.0',
      description: metadata.description,
      author: metadata.author,
      dependencies: metadata.dependencies || {},
      status: ModuleStatus.UNLOADED,
      path: metadata.path || ''
    };
  }

  getMetadata(): ModuleMetadata {
    return { ...this.metadata };
  }

  async onLoad(): Promise<void> {
    this.metadata.status = ModuleStatus.LOADED;
    this.metadata.loadedAt = new Date();
  }

  async onUnload(): Promise<void> {
    this.metadata.status = ModuleStatus.UNLOADED;
    this.metadata.loadedAt = undefined;
    this.metadata.startedAt = undefined;
  }

  async onStart(): Promise<void> {
    this.metadata.status = ModuleStatus.RUNNING;
    this.metadata.startedAt = new Date();
  }

  async onStop(): Promise<void> {
    this.metadata.status = ModuleStatus.STOPPED;
    this.metadata.startedAt = undefined;
  }

  async healthCheck(): Promise<boolean> {
    return this.metadata.status === ModuleStatus.RUNNING;
  }
}
