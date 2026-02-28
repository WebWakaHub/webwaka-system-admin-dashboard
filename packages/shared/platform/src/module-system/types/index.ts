/**
 * Module System Types
 * Defines all types and interfaces for the Module System
 */

export interface Module {
  name: string;
  version: string;
  dependencies: Record<string, string>;
  path: string;
  status: ModuleStatus;

  onLoad(): Promise<void>;
  onUnload(): Promise<void>;
  onStart(): Promise<void>;
  onStop(): Promise<void>;
}

export type ModuleStatus = 'loaded' | 'unloaded' | 'running' | 'stopped' | 'error';

export interface ModuleLoadRequest {
  name: string;
  version: string;
  path: string;
  dependencies?: Record<string, string>;
}

export interface ModuleRegistry {
  modules: Map<string, Module>;
  add(module: Module): void;
  remove(name: string): void;
  get(name: string): Module | undefined;
  list(): Module[];
  resolveDependencies(module: Module): Promise<Module[]>;
}

export interface ModuleLoader {
  load(request: ModuleLoadRequest): Promise<Module>;
  unload(name: string): Promise<void>;
}

export interface ModuleManager {
  load(request: ModuleLoadRequest): Promise<Module>;
  unload(name: string): Promise<void>;
  start(name: string): Promise<void>;
  stop(name: string): Promise<void>;
  list(): Module[];
  get(name: string): Module | undefined;
}

export interface ModuleSandbox {
  run(module: Module): Promise<void>;
  stop(name: string): Promise<void>;
}

export interface ModuleManagerAPI {
  'GET /api/modules': () => Promise<Module[]>;
  'GET /api/modules/:name': (name: string) => Promise<Module>;
  'POST /api/modules/load': (request: ModuleLoadRequest) => Promise<Module>;
  'POST /api/modules/unload': (name: string) => Promise<void>;
  'POST /api/modules/:name/start': (name: string) => Promise<void>;
  'POST /api/modules/:name/stop': (name: string) => Promise<void>;
}
