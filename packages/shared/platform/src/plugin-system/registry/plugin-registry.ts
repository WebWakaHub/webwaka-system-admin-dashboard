/**
 * Plugin Registry
 * Manages the storage and retrieval of plugin metadata
 */

import { v4 as uuidv4 } from 'uuid';
import {
  Plugin,
  PluginManifest,
  TenantPlugin,
  PluginStatus,
} from '../types';
import {
  PluginNotFoundError,
  PluginAlreadyInstalledError,
  PluginNotInstalledError,
} from '../errors';

/**
 * In-memory implementation of Plugin Registry
 * This is a temporary implementation for development
 * Production will use PostgreSQL
 */
export class PluginRegistry {
  private plugins: Map<string, Plugin> = new Map();
  private tenantPlugins: Map<string, TenantPlugin[]> = new Map();

  /**
   * Register a new plugin in the registry
   */
  async registerPlugin(plugin: Omit<Plugin, 'id' | 'createdAt' | 'updatedAt'>): Promise<Plugin> {
    const id = uuidv4();
    const now = new Date();

    const newPlugin: Plugin = {
      ...plugin,
      id,
      createdAt: now,
      updatedAt: now,
    };

    this.plugins.set(id, newPlugin);
    return newPlugin;
  }

  /**
   * Get a plugin by ID
   */
  async getPlugin(pluginId: string): Promise<Plugin> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new PluginNotFoundError(pluginId);
    }
    return plugin;
  }

  /**
   * Get all plugins
   */
  async getAllPlugins(): Promise<Plugin[]> {
    return Array.from(this.plugins.values());
  }

  /**
   * Search plugins by name
   */
  async searchPlugins(query: string): Promise<Plugin[]> {
    return Array.from(this.plugins.values()).filter(
      (plugin) =>
        plugin.name.toLowerCase().includes(query.toLowerCase()) ||
        plugin.description?.toLowerCase().includes(query.toLowerCase())
    );
  }

  /**
   * Update plugin metadata
   */
  async updatePlugin(pluginId: string, updates: Partial<Plugin>): Promise<Plugin> {
    const plugin = await this.getPlugin(pluginId);
    const updated: Plugin = {
      ...plugin,
      ...updates,
      id: plugin.id,
      createdAt: plugin.createdAt,
      updatedAt: new Date(),
    };
    this.plugins.set(pluginId, updated);
    return updated;
  }

  /**
   * Install a plugin for a tenant
   */
  async installPluginForTenant(
    tenantId: string,
    pluginId: string,
    configuration?: Record<string, unknown>
  ): Promise<TenantPlugin> {
    // Verify plugin exists
    await this.getPlugin(pluginId);

    // Check if already installed
    const existing = await this.getTenantPlugin(tenantId, pluginId).catch(() => null);
    if (existing) {
      throw new PluginAlreadyInstalledError(pluginId, tenantId);
    }

    const id = uuidv4();
    const now = new Date();

    const tenantPlugin: TenantPlugin = {
      id,
      tenantId,
      pluginId,
      isActive: false,
      configuration,
      installedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    if (!this.tenantPlugins.has(tenantId)) {
      this.tenantPlugins.set(tenantId, []);
    }

    this.tenantPlugins.get(tenantId)!.push(tenantPlugin);
    return tenantPlugin;
  }

  /**
   * Get a tenant plugin
   */
  async getTenantPlugin(tenantId: string, pluginId: string): Promise<TenantPlugin> {
    const tenantPlugins = this.tenantPlugins.get(tenantId) || [];
    const tenantPlugin = tenantPlugins.find((tp) => tp.pluginId === pluginId);

    if (!tenantPlugin) {
      throw new PluginNotInstalledError(pluginId, tenantId);
    }

    return tenantPlugin;
  }

  /**
   * Get all plugins installed for a tenant
   */
  async getTenantPlugins(tenantId: string): Promise<TenantPlugin[]> {
    return this.tenantPlugins.get(tenantId) || [];
  }

  /**
   * Get active plugins for a tenant
   */
  async getActiveTenantPlugins(tenantId: string): Promise<TenantPlugin[]> {
    const tenantPlugins = await this.getTenantPlugins(tenantId);
    return tenantPlugins.filter((tp) => tp.isActive);
  }

  /**
   * Activate a plugin for a tenant
   */
  async activatePlugin(tenantId: string, pluginId: string): Promise<TenantPlugin> {
    const tenantPlugin = await this.getTenantPlugin(tenantId, pluginId);

    if (tenantPlugin.isActive) {
      return tenantPlugin;
    }

    const updated: TenantPlugin = {
      ...tenantPlugin,
      isActive: true,
      activatedAt: new Date(),
      updatedAt: new Date(),
    };

    const tenantPlugins = this.tenantPlugins.get(tenantId)!;
    const index = tenantPlugins.findIndex((tp) => tp.pluginId === pluginId);
    tenantPlugins[index] = updated;

    return updated;
  }

  /**
   * Deactivate a plugin for a tenant
   */
  async deactivatePlugin(tenantId: string, pluginId: string): Promise<TenantPlugin> {
    const tenantPlugin = await this.getTenantPlugin(tenantId, pluginId);

    if (!tenantPlugin.isActive) {
      return tenantPlugin;
    }

    const updated: TenantPlugin = {
      ...tenantPlugin,
      isActive: false,
      deactivatedAt: new Date(),
      updatedAt: new Date(),
    };

    const tenantPlugins = this.tenantPlugins.get(tenantId)!;
    const index = tenantPlugins.findIndex((tp) => tp.pluginId === pluginId);
    tenantPlugins[index] = updated;

    return updated;
  }

  /**
   * Update plugin configuration
   */
  async updatePluginConfiguration(
    tenantId: string,
    pluginId: string,
    configuration: Record<string, unknown>
  ): Promise<TenantPlugin> {
    const tenantPlugin = await this.getTenantPlugin(tenantId, pluginId);

    const updated: TenantPlugin = {
      ...tenantPlugin,
      configuration,
      updatedAt: new Date(),
    };

    const tenantPlugins = this.tenantPlugins.get(tenantId)!;
    const index = tenantPlugins.findIndex((tp) => tp.pluginId === pluginId);
    tenantPlugins[index] = updated;

    return updated;
  }

  /**
   * Uninstall a plugin for a tenant
   */
  async uninstallPlugin(tenantId: string, pluginId: string): Promise<void> {
    const tenantPlugin = await this.getTenantPlugin(tenantId, pluginId);

    const updated: TenantPlugin = {
      ...tenantPlugin,
      isActive: false,
      uninstalledAt: new Date(),
      updatedAt: new Date(),
    };

    const tenantPlugins = this.tenantPlugins.get(tenantId)!;
    const index = tenantPlugins.findIndex((tp) => tp.pluginId === pluginId);
    tenantPlugins[index] = updated;
  }

  /**
   * Delete a tenant plugin record
   */
  async deleteTenantPlugin(tenantId: string, pluginId: string): Promise<void> {
    const tenantPlugins = this.tenantPlugins.get(tenantId);
    if (!tenantPlugins) {
      throw new PluginNotInstalledError(pluginId, tenantId);
    }

    const index = tenantPlugins.findIndex((tp) => tp.pluginId === pluginId);
    if (index === -1) {
      throw new PluginNotInstalledError(pluginId, tenantId);
    }

    tenantPlugins.splice(index, 1);
  }

  /**
   * Clear all data (for testing)
   */
  async clear(): Promise<void> {
    this.plugins.clear();
    this.tenantPlugins.clear();
  }
}
