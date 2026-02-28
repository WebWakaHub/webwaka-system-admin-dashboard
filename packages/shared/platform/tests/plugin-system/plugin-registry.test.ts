/**
 * Plugin Registry Unit Tests
 */

import { PluginRegistry } from '../../src/plugin-system/registry/plugin-registry';
import {
  PluginNotFoundError,
  PluginAlreadyInstalledError,
  PluginNotInstalledError,
} from '../../src/plugin-system/errors';
import { Plugin } from '../../src/plugin-system/types';

describe('PluginRegistry', () => {
  let registry: PluginRegistry;

  beforeEach(() => {
    registry = new PluginRegistry();
  });

  describe('registerPlugin', () => {
    it('should register a new plugin', async () => {
      const plugin = await registry.registerPlugin({
        name: 'Test Plugin',
        version: '1.0.0',
        repositoryUrl: 'https://example.com/test-plugin',
      });

      expect(plugin.id).toBeDefined();
      expect(plugin.name).toBe('Test Plugin');
      expect(plugin.version).toBe('1.0.0');
      expect(plugin.createdAt).toBeDefined();
      expect(plugin.updatedAt).toBeDefined();
    });

    it('should generate unique IDs for each plugin', async () => {
      const plugin1 = await registry.registerPlugin({
        name: 'Plugin 1',
        version: '1.0.0',
        repositoryUrl: 'https://example.com/plugin1',
      });

      const plugin2 = await registry.registerPlugin({
        name: 'Plugin 2',
        version: '1.0.0',
        repositoryUrl: 'https://example.com/plugin2',
      });

      expect(plugin1.id).not.toBe(plugin2.id);
    });
  });

  describe('getPlugin', () => {
    it('should retrieve a registered plugin', async () => {
      const registered = await registry.registerPlugin({
        name: 'Test Plugin',
        version: '1.0.0',
        repositoryUrl: 'https://example.com/test-plugin',
      });

      const retrieved = await registry.getPlugin(registered.id);
      expect(retrieved.id).toBe(registered.id);
      expect(retrieved.name).toBe('Test Plugin');
    });

    it('should throw PluginNotFoundError for non-existent plugin', async () => {
      await expect(registry.getPlugin('non-existent-id')).rejects.toThrow(
        PluginNotFoundError
      );
    });
  });

  describe('getAllPlugins', () => {
    it('should return all registered plugins', async () => {
      const plugin1 = await registry.registerPlugin({
        name: 'Plugin 1',
        version: '1.0.0',
        repositoryUrl: 'https://example.com/plugin1',
      });

      const plugin2 = await registry.registerPlugin({
        name: 'Plugin 2',
        version: '2.0.0',
        repositoryUrl: 'https://example.com/plugin2',
      });

      const allPlugins = await registry.getAllPlugins();
      expect(allPlugins).toHaveLength(2);
      expect(allPlugins.map((p) => p.id)).toContain(plugin1.id);
      expect(allPlugins.map((p) => p.id)).toContain(plugin2.id);
    });

    it('should return empty array when no plugins registered', async () => {
      const allPlugins = await registry.getAllPlugins();
      expect(allPlugins).toEqual([]);
    });
  });

  describe('searchPlugins', () => {
    beforeEach(async () => {
      await registry.registerPlugin({
        name: 'Payment Plugin',
        description: 'Handles payment processing',
        version: '1.0.0',
        repositoryUrl: 'https://example.com/payment',
      });

      await registry.registerPlugin({
        name: 'Analytics Plugin',
        description: 'Provides analytics features',
        version: '2.0.0',
        repositoryUrl: 'https://example.com/analytics',
      });
    });

    it('should find plugins by name', async () => {
      const results = await registry.searchPlugins('Payment');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Payment Plugin');
    });

    it('should find plugins by description', async () => {
      const results = await registry.searchPlugins('analytics');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Analytics Plugin');
    });

    it('should be case-insensitive', async () => {
      const results = await registry.searchPlugins('PAYMENT');
      expect(results).toHaveLength(1);
    });

    it('should return empty array for no matches', async () => {
      const results = await registry.searchPlugins('NonExistent');
      expect(results).toEqual([]);
    });
  });

  describe('installPluginForTenant', () => {
    let plugin: Plugin;

    beforeEach(async () => {
      plugin = await registry.registerPlugin({
        name: 'Test Plugin',
        version: '1.0.0',
        repositoryUrl: 'https://example.com/test-plugin',
      });
    });

    it('should install a plugin for a tenant', async () => {
      const tenantPlugin = await registry.installPluginForTenant(
        'tenant-1',
        plugin.id
      );

      expect(tenantPlugin.id).toBeDefined();
      expect(tenantPlugin.tenantId).toBe('tenant-1');
      expect(tenantPlugin.pluginId).toBe(plugin.id);
      expect(tenantPlugin.isActive).toBe(false);
      expect(tenantPlugin.installedAt).toBeDefined();
    });

    it('should throw PluginAlreadyInstalledError if plugin already installed', async () => {
      await registry.installPluginForTenant('tenant-1', plugin.id);

      await expect(
        registry.installPluginForTenant('tenant-1', plugin.id)
      ).rejects.toThrow(PluginAlreadyInstalledError);
    });

    it('should support plugin configuration', async () => {
      const config = { apiKey: 'test-key', enabled: true };
      const tenantPlugin = await registry.installPluginForTenant(
        'tenant-1',
        plugin.id,
        config
      );

      expect(tenantPlugin.configuration).toEqual(config);
    });
  });

  describe('getTenantPlugin', () => {
    let plugin: Plugin;

    beforeEach(async () => {
      plugin = await registry.registerPlugin({
        name: 'Test Plugin',
        version: '1.0.0',
        repositoryUrl: 'https://example.com/test-plugin',
      });

      await registry.installPluginForTenant('tenant-1', plugin.id);
    });

    it('should retrieve an installed plugin for a tenant', async () => {
      const tenantPlugin = await registry.getTenantPlugin('tenant-1', plugin.id);

      expect(tenantPlugin.tenantId).toBe('tenant-1');
      expect(tenantPlugin.pluginId).toBe(plugin.id);
    });

    it('should throw PluginNotInstalledError if not installed', async () => {
      await expect(
        registry.getTenantPlugin('tenant-1', 'non-existent-plugin')
      ).rejects.toThrow(PluginNotInstalledError);
    });
  });

  describe('activatePlugin', () => {
    let plugin: Plugin;

    beforeEach(async () => {
      plugin = await registry.registerPlugin({
        name: 'Test Plugin',
        version: '1.0.0',
        repositoryUrl: 'https://example.com/test-plugin',
      });

      await registry.installPluginForTenant('tenant-1', plugin.id);
    });

    it('should activate an installed plugin', async () => {
      const activated = await registry.activatePlugin('tenant-1', plugin.id);

      expect(activated.isActive).toBe(true);
      expect(activated.activatedAt).toBeDefined();
    });

    it('should return plugin unchanged if already active', async () => {
      await registry.activatePlugin('tenant-1', plugin.id);
      const activated = await registry.activatePlugin('tenant-1', plugin.id);

      expect(activated.isActive).toBe(true);
    });
  });

  describe('deactivatePlugin', () => {
    let plugin: Plugin;

    beforeEach(async () => {
      plugin = await registry.registerPlugin({
        name: 'Test Plugin',
        version: '1.0.0',
        repositoryUrl: 'https://example.com/test-plugin',
      });

      await registry.installPluginForTenant('tenant-1', plugin.id);
      await registry.activatePlugin('tenant-1', plugin.id);
    });

    it('should deactivate an active plugin', async () => {
      const deactivated = await registry.deactivatePlugin('tenant-1', plugin.id);

      expect(deactivated.isActive).toBe(false);
      expect(deactivated.deactivatedAt).toBeDefined();
    });

    it('should return plugin unchanged if already inactive', async () => {
      await registry.deactivatePlugin('tenant-1', plugin.id);
      const deactivated = await registry.deactivatePlugin('tenant-1', plugin.id);

      expect(deactivated.isActive).toBe(false);
    });
  });

  describe('getTenantPlugins', () => {
    let plugin1: Plugin;
    let plugin2: Plugin;

    beforeEach(async () => {
      plugin1 = await registry.registerPlugin({
        name: 'Plugin 1',
        version: '1.0.0',
        repositoryUrl: 'https://example.com/plugin1',
      });

      plugin2 = await registry.registerPlugin({
        name: 'Plugin 2',
        version: '1.0.0',
        repositoryUrl: 'https://example.com/plugin2',
      });

      await registry.installPluginForTenant('tenant-1', plugin1.id);
      await registry.installPluginForTenant('tenant-1', plugin2.id);
    });

    it('should return all plugins installed for a tenant', async () => {
      const tenantPlugins = await registry.getTenantPlugins('tenant-1');

      expect(tenantPlugins).toHaveLength(2);
      expect(tenantPlugins.map((tp) => tp.pluginId)).toContain(plugin1.id);
      expect(tenantPlugins.map((tp) => tp.pluginId)).toContain(plugin2.id);
    });

    it('should return empty array for tenant with no plugins', async () => {
      const tenantPlugins = await registry.getTenantPlugins('tenant-2');

      expect(tenantPlugins).toEqual([]);
    });
  });

  describe('getActiveTenantPlugins', () => {
    let plugin1: Plugin;
    let plugin2: Plugin;

    beforeEach(async () => {
      plugin1 = await registry.registerPlugin({
        name: 'Plugin 1',
        version: '1.0.0',
        repositoryUrl: 'https://example.com/plugin1',
      });

      plugin2 = await registry.registerPlugin({
        name: 'Plugin 2',
        version: '1.0.0',
        repositoryUrl: 'https://example.com/plugin2',
      });

      await registry.installPluginForTenant('tenant-1', plugin1.id);
      await registry.installPluginForTenant('tenant-1', plugin2.id);
      await registry.activatePlugin('tenant-1', plugin1.id);
    });

    it('should return only active plugins for a tenant', async () => {
      const activePlugins = await registry.getActiveTenantPlugins('tenant-1');

      expect(activePlugins).toHaveLength(1);
      expect(activePlugins[0].pluginId).toBe(plugin1.id);
    });
  });

  describe('updatePluginConfiguration', () => {
    let plugin: Plugin;

    beforeEach(async () => {
      plugin = await registry.registerPlugin({
        name: 'Test Plugin',
        version: '1.0.0',
        repositoryUrl: 'https://example.com/test-plugin',
      });

      await registry.installPluginForTenant('tenant-1', plugin.id, {
        apiKey: 'old-key',
      });
    });

    it('should update plugin configuration', async () => {
      const updated = await registry.updatePluginConfiguration('tenant-1', plugin.id, {
        apiKey: 'new-key',
      });

      expect(updated.configuration).toEqual({ apiKey: 'new-key' });
    });
  });

  describe('uninstallPlugin', () => {
    let plugin: Plugin;

    beforeEach(async () => {
      plugin = await registry.registerPlugin({
        name: 'Test Plugin',
        version: '1.0.0',
        repositoryUrl: 'https://example.com/test-plugin',
      });

      await registry.installPluginForTenant('tenant-1', plugin.id);
      await registry.activatePlugin('tenant-1', plugin.id);
    });

    it('should mark plugin as uninstalled', async () => {
      await registry.uninstallPlugin('tenant-1', plugin.id);

      const tenantPlugin = await registry.getTenantPlugin('tenant-1', plugin.id);
      expect(tenantPlugin.uninstalledAt).toBeDefined();
      expect(tenantPlugin.isActive).toBe(false);
    });
  });
});
