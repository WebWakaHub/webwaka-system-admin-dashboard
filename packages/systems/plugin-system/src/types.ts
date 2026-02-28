/**
 * WebWaka Plugin System - Core Types
 * 
 * Type definitions for the Plugin System.
 * 
 * @module @webwaka/plugin-system/types
 * @author webwakaagent4 (Core Platform Engineer)
 */

/**
 * Plugin State
 * 
 * Represents the current state of a plugin in its lifecycle.
 */
export enum PluginState {
  /** Plugin is registered but not loaded */
  UNLOADED = 'unloaded',
  
  /** Plugin is loaded but not enabled */
  LOADED = 'loaded',
  
  /** Plugin is enabled and active */
  ENABLED = 'enabled',
  
  /** Plugin is disabled but still loaded */
  DISABLED = 'disabled',
  
  /** Plugin encountered an error */
  ERROR = 'error',
}

/**
 * Plugin Metadata
 * 
 * Describes a plugin's identity and capabilities.
 */
export interface PluginMetadata {
  /** Unique plugin identifier */
  id: string;
  
  /** Human-readable plugin name */
  name: string;
  
  /** Plugin version (semver) */
  version: string;
  
  /** Plugin description */
  description?: string;
  
  /** Plugin author */
  author?: string;
  
  /** Plugin dependencies (plugin IDs) */
  dependencies?: string[];
  
  /** Plugin configuration schema */
  configSchema?: Record<string, any>;
}

/**
 * Plugin Configuration
 * 
 * Runtime configuration for a plugin instance.
 */
export interface PluginConfig {
  /** Plugin-specific configuration data */
  [key: string]: any;
}

/**
 * Plugin Context
 * 
 * Context provided to plugins at runtime.
 */
export interface PluginContext {
  /** Tenant ID */
  tenantId: string;
  
  /** Plugin configuration */
  config: PluginConfig;
  
  /** Logger instance */
  logger?: {
    info: (message: string, ...args: any[]) => void;
    warn: (message: string, ...args: any[]) => void;
    error: (message: string, ...args: any[]) => void;
    debug: (message: string, ...args: any[]) => void;
  };
}

/**
 * Plugin Interface
 * 
 * Base interface that all plugins must implement.
 */
export interface IPlugin {
  /** Plugin metadata */
  metadata: PluginMetadata;
  
  /**
   * Called when the plugin is loaded
   * 
   * @param context - Plugin context
   */
  onLoad?(context: PluginContext): Promise<void> | void;
  
  /**
   * Called when the plugin is enabled
   * 
   * @param context - Plugin context
   */
  onEnable?(context: PluginContext): Promise<void> | void;
  
  /**
   * Called when the plugin is disabled
   * 
   * @param context - Plugin context
   */
  onDisable?(context: PluginContext): Promise<void> | void;
  
  /**
   * Called when the plugin is unloaded
   * 
   * @param context - Plugin context
   */
  onUnload?(context: PluginContext): Promise<void> | void;
}

/**
 * Plugin Instance
 * 
 * Represents a loaded plugin instance with its state.
 */
export interface PluginInstance {
  /** Plugin metadata */
  metadata: PluginMetadata;
  
  /** Plugin implementation */
  plugin: IPlugin;
  
  /** Current plugin state */
  state: PluginState;
  
  /** Plugin context */
  context: PluginContext;
  
  /** Error message if state is ERROR */
  error?: string;
  
  /** Timestamp when plugin was loaded */
  loadedAt?: Date;
  
  /** Timestamp when plugin was enabled */
  enabledAt?: Date;
}

/**
 * Plugin Manager Configuration
 */
export interface PluginManagerConfig {
  /** Enable debug logging */
  debug?: boolean;
  
  /** Maximum time for lifecycle operations (ms) */
  lifecycleTimeout?: number;
  
  /** Enable strict dependency checking */
  strictDependencies?: boolean;
}

/**
 * Plugin Manager Statistics
 */
export interface PluginManagerStats {
  /** Total number of registered plugins */
  totalPlugins: number;
  
  /** Number of loaded plugins */
  loadedPlugins: number;
  
  /** Number of enabled plugins */
  enabledPlugins: number;
  
  /** Number of disabled plugins */
  disabledPlugins: number;
  
  /** Number of plugins in error state */
  errorPlugins: number;
  
  /** Total lifecycle operations performed */
  lifecycleOperations: number;
  
  /** Number of failed lifecycle operations */
  failedOperations: number;
}

/**
 * Plugin Lifecycle Event
 */
export interface PluginLifecycleEvent {
  /** Event type */
  type: 'loaded' | 'enabled' | 'disabled' | 'unloaded' | 'error';
  
  /** Plugin ID */
  pluginId: string;
  
  /** Timestamp */
  timestamp: Date;
  
  /** Error message if type is 'error' */
  error?: string;
}
