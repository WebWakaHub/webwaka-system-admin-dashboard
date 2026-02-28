/**
 * Plugin Manager
 * Orchestrates the entire lifecycle of plugins
 */

import { v4 as uuidv4 } from 'uuid';
import {
  Plugin,
  TenantPlugin,
  PluginInstallRequest,
  PluginActivationRequest,
  PluginDeactivationRequest,
  PluginUninstallRequest,
  PluginConfigurationRequest,
  PluginLifecycleEvent,
  DependencyResolutionResult,
} from '../types';
import {
  PluginNotFoundError,
  PluginAlreadyActiveError,
  PluginNotActiveError,
  PluginDependencyError,
  InvalidPluginConfigurationError,
} from '../errors';
import { PluginRegistry } from '../registry/plugin-registry';
import { DependencyResolver } from '../utils/dependency-resolver';
import { EventBus } from '../../shared/event-bus';

export class PluginManager {
  private registry: PluginRegistry;
  private dependencyResolver: DependencyResolver;
  private eventBus?: EventBus;

  constructor(registry: PluginRegistry, eventBus?: EventBus) {
    this.registry = registry;
    this.dependencyResolver = new DependencyResolver();
    this.eventBus = eventBus;
  }

  /**
   * Install a plugin for a tenant
   */
  async installPlugin(
    tenantId: string,
    request: PluginInstallRequest
  ): Promise<{ tenantPlugin: TenantPlugin; dependencies: string[] }> {
    // Get the plugin
    const plugin = await this.registry.getPlugin(request.pluginId);

    // Resolve dependencies
    const allPlugins = await this.registry.getAllPlugins();
    const pluginMap = new Map(allPlugins.map((p) => [p.id, p]));

    const dependencyResult = await this.dependencyResolver.resolveDependencies(
      plugin,
      pluginMap
    );

    if (!dependencyResult.resolved) {
      throw new InvalidPluginConfigurationError(
        `Failed to resolve dependencies: ${dependencyResult.errors?.join(', ')}`
      );
    }

    // Validate configuration if provided
    if (request.configuration && plugin.manifest?.config) {
      const validation = this.dependencyResolver.validateConfiguration(
        request.configuration,
        plugin.manifest.config
      );
      if (!validation.valid) {
        throw new InvalidPluginConfigurationError(
          `Invalid configuration: ${validation.errors?.join(', ')}`
        );
      }
    }

    // Install dependencies first
    const installedDependencies: string[] = [];
    for (const dep of dependencyResult.dependencies) {
      try {
        await this.registry.getTenantPlugin(tenantId, dep.pluginId);
        // Already installed
      } catch {
        // Not installed, install it
        await this.registry.installPluginForTenant(tenantId, dep.pluginId);
        installedDependencies.push(dep.pluginId);
      }
    }

    // Install the main plugin
    const tenantPlugin = await this.registry.installPluginForTenant(
      tenantId,
      request.pluginId,
      request.configuration
    );

    // Emit event
    await this.emitEvent({
      eventType: 'plugin.installed',
      tenantId,
      pluginId: request.pluginId,
      timestamp: new Date().toISOString(),
      data: {
        version: request.version,
        dependencies: installedDependencies,
      },
    });

    return {
      tenantPlugin,
      dependencies: installedDependencies,
    };
  }

  /**
   * Activate a plugin for a tenant
   */
  async activatePlugin(
    tenantId: string,
    request: PluginActivationRequest
  ): Promise<TenantPlugin> {
    const tenantPlugin = await this.registry.getTenantPlugin(tenantId, request.pluginId);

    if (tenantPlugin.isActive) {
      throw new PluginAlreadyActiveError(request.pluginId);
    }

    const activated = await this.registry.activatePlugin(tenantId, request.pluginId);

    // Emit event
    await this.emitEvent({
      eventType: 'plugin.activated',
      tenantId,
      pluginId: request.pluginId,
      timestamp: new Date().toISOString(),
    });

    return activated;
  }

  /**
   * Deactivate a plugin for a tenant
   */
  async deactivatePlugin(
    tenantId: string,
    request: PluginDeactivationRequest
  ): Promise<TenantPlugin> {
    const tenantPlugin = await this.registry.getTenantPlugin(tenantId, request.pluginId);

    if (!tenantPlugin.isActive) {
      throw new PluginNotActiveError(request.pluginId);
    }

    const deactivated = await this.registry.deactivatePlugin(tenantId, request.pluginId);

    // Emit event
    await this.emitEvent({
      eventType: 'plugin.deactivated',
      tenantId,
      pluginId: request.pluginId,
      timestamp: new Date().toISOString(),
    });

    return deactivated;
  }

  /**
   * Uninstall a plugin for a tenant
   */
  async uninstallPlugin(
    tenantId: string,
    request: PluginUninstallRequest
  ): Promise<void> {
    const tenantPlugin = await this.registry.getTenantPlugin(tenantId, request.pluginId);

    // Check if other plugins depend on this one
    const allPlugins = await this.registry.getAllPlugins();
    const tenantPlugins = await this.registry.getTenantPlugins(tenantId);
    const installedPluginIds = tenantPlugins.map((tp) => tp.pluginId);

    const canUninstall = await this.dependencyResolver.canUninstall(
      request.pluginId,
      allPlugins,
      installedPluginIds
    );

    if (!canUninstall.canUninstall && !request.force) {
      throw new PluginDependencyError(canUninstall.dependents![0], request.pluginId);
    }

    // Deactivate if active
    if (tenantPlugin.isActive) {
      await this.registry.deactivatePlugin(tenantId, request.pluginId);
    }

    // Uninstall
    await this.registry.uninstallPlugin(tenantId, request.pluginId);

    // Emit event
    await this.emitEvent({
      eventType: 'plugin.uninstalled',
      tenantId,
      pluginId: request.pluginId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Update plugin configuration
   */
  async configurePlugin(
    tenantId: string,
    request: PluginConfigurationRequest
  ): Promise<TenantPlugin> {
    const plugin = await this.registry.getPlugin(request.pluginId);

    // Validate configuration
    if (plugin.manifest?.config) {
      const validation = this.dependencyResolver.validateConfiguration(
        request.configuration,
        plugin.manifest.config
      );
      if (!validation.valid) {
        throw new InvalidPluginConfigurationError(
          `Invalid configuration: ${validation.errors?.join(', ')}`
        );
      }
    }

    const updated = await this.registry.updatePluginConfiguration(
      tenantId,
      request.pluginId,
      request.configuration
    );

    // Emit event
    await this.emitEvent({
      eventType: 'plugin.configured',
      tenantId,
      pluginId: request.pluginId,
      timestamp: new Date().toISOString(),
      data: request.configuration,
    });

    return updated;
  }

  /**
   * Get all plugins for a tenant
   */
  async getTenantPlugins(tenantId: string): Promise<TenantPlugin[]> {
    return this.registry.getTenantPlugins(tenantId);
  }

  /**
   * Get active plugins for a tenant
   */
  async getActiveTenantPlugins(tenantId: string): Promise<TenantPlugin[]> {
    return this.registry.getActiveTenantPlugins(tenantId);
  }

  /**
   * Emit a lifecycle event
   */
  private async emitEvent(event: PluginLifecycleEvent): Promise<void> {
    if (this.eventBus) {
      await this.eventBus.publish(event.eventType, event as unknown as Record<string, unknown>);
    }
  }

  /**
   * Set event bus (for dependency injection)
   */
  setEventBus(eventBus: EventBus): void {
    this.eventBus = eventBus;
  }
}
