/**
 * Plugin System Types
 * Defines all types and interfaces for the Plugin System
 */

export interface Plugin {
  id: string;
  name: string;
  description?: string;
  version: string;
  repositoryUrl: string;
  signature?: string;
  dependencies?: PluginDependency[];
  manifest?: PluginManifest;
  createdAt: Date;
  updatedAt: Date;
}

export interface PluginDependency {
  pluginId: string;
  versionRange: string;
  optional?: boolean;
}

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  license?: string;
  main?: string;
  config?: PluginConfigSchema;
  hooks?: string[];
  permissions?: string[];
}

export interface PluginConfigSchema {
  [key: string]: ConfigOption;
}

export interface ConfigOption {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description?: string;
  default?: unknown;
  required?: boolean;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    enum?: unknown[];
  };
}

export interface TenantPlugin {
  id: string;
  tenantId: string;
  pluginId: string;
  isActive: boolean;
  configuration?: Record<string, unknown>;
  installedAt: Date;
  activatedAt?: Date;
  deactivatedAt?: Date;
  uninstalledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PluginInstallRequest {
  pluginId: string;
  version: string;
  configuration?: Record<string, unknown>;
}

export interface PluginActivationRequest {
  pluginId: string;
}

export interface PluginDeactivationRequest {
  pluginId: string;
}

export interface PluginUninstallRequest {
  pluginId: string;
  force?: boolean;
}

export interface PluginConfigurationRequest {
  pluginId: string;
  configuration: Record<string, unknown>;
}

export interface PluginLifecycleEvent {
  eventType: 'plugin.installed' | 'plugin.activated' | 'plugin.deactivated' | 'plugin.uninstalled' | 'plugin.configured' | 'plugin.error';
  tenantId: string;
  pluginId: string;
  timestamp: string;
  data?: Record<string, unknown>;
  error?: {
    code: string;
    message: string;
  };
}

export interface DependencyResolutionResult {
  resolved: boolean;
  dependencies: ResolvedDependency[];
  conflicts?: DependencyConflict[];
  errors?: string[];
}

export interface ResolvedDependency {
  pluginId: string;
  version: string;
  resolved: boolean;
}

export interface DependencyConflict {
  pluginId: string;
  reason: string;
  conflictingVersions?: string[];
}

export enum PluginStatus {
  INSTALLED = 'installed',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  UNINSTALLED = 'uninstalled',
  ERROR = 'error',
}

export interface PluginSystemConfig {
  maxPluginsPerTenant?: number;
  pluginTimeout?: number;
  sandboxMemoryLimit?: string;
  sandboxCpuLimit?: string;
  enableSignatureVerification?: boolean;
  pluginRepositoryUrl?: string;
}
