/**
 * WebWaka Plugin System - Plugin Manager
 * 
 * Core plugin lifecycle management for the Plugin System.
 * Handles plugin loading, unloading, enabling, and disabling.
 * 
 * Key Features:
 * - Plugin registration and discovery
 * - Lifecycle management (load, unload, enable, disable)
 * - State tracking and validation
 * - Dependency resolution
 * - Event-driven architecture
 * - Type-safe plugin interfaces
 * 
 * @module @webwaka/plugin-system/plugin-manager
 * @author webwakaagent4 (Core Platform Engineer)
 */

import {
  IPlugin,
  PluginState,
  PluginInstance,
  PluginContext,
  PluginConfig,
  PluginManagerConfig,
  PluginManagerStats,
  PluginLifecycleEvent,
} from './types';

/**
 * PluginManager Class
 * 
 * Manages the lifecycle of all plugins in the system.
 * Provides methods for loading, unloading, enabling, and disabling plugins.
 */
export class PluginManager {
  private plugins: Map<string, PluginInstance>;
  private config: Required<PluginManagerConfig>;
  private stats: PluginManagerStats;
  private lifecycleListeners: Array<(event: PluginLifecycleEvent) => void>;

  /**
   * Create a new PluginManager instance
   * 
   * @param config - Plugin manager configuration
   */
  constructor(config: PluginManagerConfig = {}) {
    this.plugins = new Map();
    this.config = {
      debug: false,
      lifecycleTimeout: 5000,
      strictDependencies: true,
      ...config,
    };
    this.stats = {
      totalPlugins: 0,
      loadedPlugins: 0,
      enabledPlugins: 0,
      disabledPlugins: 0,
      errorPlugins: 0,
      lifecycleOperations: 0,
      failedOperations: 0,
    };
    this.lifecycleListeners = [];
  }

  /**
   * Register a plugin with the manager
   * 
   * @param plugin - Plugin to register
   * @throws Error if plugin is already registered
   * 
   * @example
   * ```typescript
   * const plugin: IPlugin = {
   *   metadata: {
   *     id: 'my-plugin',
   *     name: 'My Plugin',
   *     version: '1.0.0'
   *   },
   *   onLoad: async (context) => {
   *     console.log('Plugin loaded');
   *   }
   * };
   * 
   * pluginManager.register(plugin);
   * ```
   */
  register(plugin: IPlugin): void {
    const pluginId = plugin.metadata.id;

    if (this.plugins.has(pluginId)) {
      throw new Error(`Plugin ${pluginId} is already registered`);
    }

    const instance: PluginInstance = {
      metadata: plugin.metadata,
      plugin,
      state: PluginState.UNLOADED,
      context: {
        tenantId: '',
        config: {},
      },
    };

    this.plugins.set(pluginId, instance);
    this.stats.totalPlugins++;

    if (this.config.debug) {
      console.log(`[PluginManager] Registered plugin: ${pluginId}`);
    }
  }

  /**
   * Unregister a plugin from the manager
   * 
   * @param pluginId - Plugin ID to unregister
   * @returns true if plugin was unregistered, false if not found
   * @throws Error if plugin is not in UNLOADED state
   */
  unregister(pluginId: string): boolean {
    const instance = this.plugins.get(pluginId);

    if (!instance) {
      return false;
    }

    if (instance.state !== PluginState.UNLOADED) {
      throw new Error(
        `Cannot unregister plugin ${pluginId} in state ${instance.state}. Must be unloaded first.`
      );
    }

    this.plugins.delete(pluginId);
    this.stats.totalPlugins--;

    if (this.config.debug) {
      console.log(`[PluginManager] Unregistered plugin: ${pluginId}`);
    }

    return true;
  }

  /**
   * Load a plugin
   * 
   * @param pluginId - Plugin ID to load
   * @param tenantId - Tenant ID
   * @param config - Plugin configuration
   * @returns Promise that resolves when plugin is loaded
   * @throws Error if plugin is not found or already loaded
   * 
   * @example
   * ```typescript
   * await pluginManager.load('my-plugin', 'tenant-123', { apiKey: 'secret' });
   * ```
   */
  async load(pluginId: string, tenantId: string, config: PluginConfig = {}): Promise<void> {
    const instance = this.getPlugin(pluginId);

    if (instance.state !== PluginState.UNLOADED) {
      throw new Error(`Plugin ${pluginId} is already loaded (state: ${instance.state})`);
    }

    // Check dependencies
    if (this.config.strictDependencies && instance.metadata.dependencies) {
      this.validateDependencies(instance.metadata.dependencies);
    }

    // Update context
    instance.context = {
      tenantId,
      config,
      logger: this.createLogger(pluginId),
    };

    try {
      this.stats.lifecycleOperations++;

      // Call onLoad hook
      if (instance.plugin.onLoad) {
        await this.executeWithTimeout(
          () => instance.plugin.onLoad!(instance.context),
          this.config.lifecycleTimeout,
          `Plugin ${pluginId} onLoad timeout`
        );
      }

      // Update state
      instance.state = PluginState.LOADED;
      instance.loadedAt = new Date();
      this.stats.loadedPlugins++;

      this.emitLifecycleEvent({
        type: 'loaded',
        pluginId,
        timestamp: new Date(),
      });

      if (this.config.debug) {
        console.log(`[PluginManager] Loaded plugin: ${pluginId}`);
      }
    } catch (error) {
      this.stats.failedOperations++;
      instance.state = PluginState.ERROR;
      instance.error = error instanceof Error ? error.message : String(error);
      this.stats.errorPlugins++;

      this.emitLifecycleEvent({
        type: 'error',
        pluginId,
        timestamp: new Date(),
        error: instance.error,
      });

      throw new Error(`Failed to load plugin ${pluginId}: ${instance.error}`);
    }
  }

  /**
   * Unload a plugin
   * 
   * @param pluginId - Plugin ID to unload
   * @returns Promise that resolves when plugin is unloaded
   * @throws Error if plugin is not found or not loaded
   */
  async unload(pluginId: string): Promise<void> {
    const instance = this.getPlugin(pluginId);

    if (instance.state === PluginState.UNLOADED) {
      throw new Error(`Plugin ${pluginId} is already unloaded`);
    }

    if (instance.state === PluginState.ENABLED) {
      throw new Error(`Plugin ${pluginId} must be disabled before unloading`);
    }

    try {
      this.stats.lifecycleOperations++;

      // Call onUnload hook
      if (instance.plugin.onUnload) {
        await this.executeWithTimeout(
          () => instance.plugin.onUnload!(instance.context),
          this.config.lifecycleTimeout,
          `Plugin ${pluginId} onUnload timeout`
        );
      }

      // Update state
      const previousState = instance.state;
      instance.state = PluginState.UNLOADED;
      instance.loadedAt = undefined;
      instance.enabledAt = undefined;
      instance.error = undefined;

      if (previousState === PluginState.LOADED) {
        this.stats.loadedPlugins--;
      } else if (previousState === PluginState.DISABLED) {
        this.stats.disabledPlugins--;
      } else if (previousState === PluginState.ERROR) {
        this.stats.errorPlugins--;
      }

      this.emitLifecycleEvent({
        type: 'unloaded',
        pluginId,
        timestamp: new Date(),
      });

      if (this.config.debug) {
        console.log(`[PluginManager] Unloaded plugin: ${pluginId}`);
      }
    } catch (error) {
      this.stats.failedOperations++;
      instance.state = PluginState.ERROR;
      instance.error = error instanceof Error ? error.message : String(error);
      this.stats.errorPlugins++;

      this.emitLifecycleEvent({
        type: 'error',
        pluginId,
        timestamp: new Date(),
        error: instance.error,
      });

      throw new Error(`Failed to unload plugin ${pluginId}: ${instance.error}`);
    }
  }

  /**
   * Enable a plugin
   * 
   * @param pluginId - Plugin ID to enable
   * @returns Promise that resolves when plugin is enabled
   * @throws Error if plugin is not found or not in correct state
   */
  async enable(pluginId: string): Promise<void> {
    const instance = this.getPlugin(pluginId);

    if (instance.state !== PluginState.LOADED && instance.state !== PluginState.DISABLED) {
      throw new Error(
        `Plugin ${pluginId} must be loaded or disabled to enable (current state: ${instance.state})`
      );
    }

    try {
      this.stats.lifecycleOperations++;

      // Call onEnable hook
      if (instance.plugin.onEnable) {
        await this.executeWithTimeout(
          () => instance.plugin.onEnable!(instance.context),
          this.config.lifecycleTimeout,
          `Plugin ${pluginId} onEnable timeout`
        );
      }

      // Update state
      const previousState = instance.state;
      instance.state = PluginState.ENABLED;
      instance.enabledAt = new Date();

      if (previousState === PluginState.LOADED) {
        this.stats.loadedPlugins--;
      } else if (previousState === PluginState.DISABLED) {
        this.stats.disabledPlugins--;
      }
      this.stats.enabledPlugins++;

      this.emitLifecycleEvent({
        type: 'enabled',
        pluginId,
        timestamp: new Date(),
      });

      if (this.config.debug) {
        console.log(`[PluginManager] Enabled plugin: ${pluginId}`);
      }
    } catch (error) {
      this.stats.failedOperations++;
      instance.state = PluginState.ERROR;
      instance.error = error instanceof Error ? error.message : String(error);
      this.stats.errorPlugins++;

      this.emitLifecycleEvent({
        type: 'error',
        pluginId,
        timestamp: new Date(),
        error: instance.error,
      });

      throw new Error(`Failed to enable plugin ${pluginId}: ${instance.error}`);
    }
  }

  /**
   * Disable a plugin
   * 
   * @param pluginId - Plugin ID to disable
   * @returns Promise that resolves when plugin is disabled
   * @throws Error if plugin is not found or not enabled
   */
  async disable(pluginId: string): Promise<void> {
    const instance = this.getPlugin(pluginId);

    if (instance.state !== PluginState.ENABLED) {
      throw new Error(`Plugin ${pluginId} is not enabled (current state: ${instance.state})`);
    }

    try {
      this.stats.lifecycleOperations++;

      // Call onDisable hook
      if (instance.plugin.onDisable) {
        await this.executeWithTimeout(
          () => instance.plugin.onDisable!(instance.context),
          this.config.lifecycleTimeout,
          `Plugin ${pluginId} onDisable timeout`
        );
      }

      // Update state
      instance.state = PluginState.DISABLED;
      instance.enabledAt = undefined;
      this.stats.enabledPlugins--;
      this.stats.disabledPlugins++;

      this.emitLifecycleEvent({
        type: 'disabled',
        pluginId,
        timestamp: new Date(),
      });

      if (this.config.debug) {
        console.log(`[PluginManager] Disabled plugin: ${pluginId}`);
      }
    } catch (error) {
      this.stats.failedOperations++;
      instance.state = PluginState.ERROR;
      instance.error = error instanceof Error ? error.message : String(error);
      this.stats.errorPlugins++;

      this.emitLifecycleEvent({
        type: 'error',
        pluginId,
        timestamp: new Date(),
        error: instance.error,
      });

      throw new Error(`Failed to disable plugin ${pluginId}: ${instance.error}`);
    }
  }

  /**
   * Get a plugin instance
   * 
   * @param pluginId - Plugin ID
   * @returns Plugin instance
   * @throws Error if plugin is not found
   */
  getPlugin(pluginId: string): PluginInstance {
    const instance = this.plugins.get(pluginId);

    if (!instance) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    return instance;
  }

  /**
   * Get all registered plugins
   * 
   * @returns Array of plugin instances
   */
  getAllPlugins(): PluginInstance[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get plugins by state
   * 
   * @param state - Plugin state to filter by
   * @returns Array of plugin instances in the specified state
   */
  getPluginsByState(state: PluginState): PluginInstance[] {
    return this.getAllPlugins().filter((instance) => instance.state === state);
  }

  /**
   * Check if a plugin is registered
   * 
   * @param pluginId - Plugin ID
   * @returns true if plugin is registered, false otherwise
   */
  hasPlugin(pluginId: string): boolean {
    return this.plugins.has(pluginId);
  }

  /**
   * Get plugin manager statistics
   * 
   * @returns Plugin manager statistics
   */
  getStats(): PluginManagerStats {
    return { ...this.stats };
  }

  /**
   * Reset plugin manager statistics
   */
  resetStats(): void {
    this.stats = {
      totalPlugins: this.plugins.size,
      loadedPlugins: this.getPluginsByState(PluginState.LOADED).length,
      enabledPlugins: this.getPluginsByState(PluginState.ENABLED).length,
      disabledPlugins: this.getPluginsByState(PluginState.DISABLED).length,
      errorPlugins: this.getPluginsByState(PluginState.ERROR).length,
      lifecycleOperations: 0,
      failedOperations: 0,
    };
  }

  /**
   * Add a lifecycle event listener
   * 
   * @param listener - Listener function
   */
  onLifecycleEvent(listener: (event: PluginLifecycleEvent) => void): void {
    this.lifecycleListeners.push(listener);
  }

  /**
   * Remove a lifecycle event listener
   * 
   * @param listener - Listener function to remove
   */
  offLifecycleEvent(listener: (event: PluginLifecycleEvent) => void): void {
    const index = this.lifecycleListeners.indexOf(listener);
    if (index !== -1) {
      this.lifecycleListeners.splice(index, 1);
    }
  }

  /**
   * Emit a lifecycle event to all listeners
   * 
   * @param event - Lifecycle event
   */
  private emitLifecycleEvent(event: PluginLifecycleEvent): void {
    for (const listener of this.lifecycleListeners) {
      try {
        listener(event);
      } catch (error) {
        console.error('[PluginManager] Error in lifecycle event listener:', error);
      }
    }
  }

  /**
   * Validate plugin dependencies
   * 
   * @param dependencies - Array of plugin IDs
   * @throws Error if any dependency is not loaded
   */
  private validateDependencies(dependencies: string[]): void {
    for (const depId of dependencies) {
      const depInstance = this.plugins.get(depId);

      if (!depInstance) {
        throw new Error(`Dependency ${depId} is not registered`);
      }

      if (depInstance.state === PluginState.UNLOADED) {
        throw new Error(`Dependency ${depId} is not loaded`);
      }
    }
  }

  /**
   * Execute a function with a timeout
   * 
   * @param fn - Function to execute
   * @param timeout - Timeout in milliseconds
   * @param timeoutMessage - Error message if timeout occurs
   * @returns Promise that resolves with the function result
   */
  private async executeWithTimeout<T>(
    fn: () => Promise<T> | T,
    timeout: number,
    timeoutMessage: string
  ): Promise<T> {
    return Promise.race([
      Promise.resolve(fn()),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(timeoutMessage)), timeout)
      ),
    ]);
  }

  /**
   * Create a logger for a plugin
   * 
   * @param pluginId - Plugin ID
   * @returns Logger instance
   */
  private createLogger(pluginId: string) {
    return {
      info: (message: string, ...args: any[]) => {
        console.log(`[Plugin:${pluginId}] ${message}`, ...args);
      },
      warn: (message: string, ...args: any[]) => {
        console.warn(`[Plugin:${pluginId}] ${message}`, ...args);
      },
      error: (message: string, ...args: any[]) => {
        console.error(`[Plugin:${pluginId}] ${message}`, ...args);
      },
      debug: (message: string, ...args: any[]) => {
        if (this.config.debug) {
          console.debug(`[Plugin:${pluginId}] ${message}`, ...args);
        }
      },
    };
  }
}

/**
 * Create a new PluginManager instance
 * 
 * @param config - Plugin manager configuration
 * @returns New PluginManager instance
 */
export function createPluginManager(config?: PluginManagerConfig): PluginManager {
  return new PluginManager(config);
}
