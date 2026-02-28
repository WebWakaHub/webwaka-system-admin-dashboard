/**
 * Plugin Manager Unit Tests
 */

import { PluginManager } from '../../src/plugin-system/manager/plugin-manager';
import { PluginRegistry } from '../../src/plugin-system/registry/plugin-registry';
import { InMemoryEventBus } from '../../src/shared/event-bus';
import {
  PluginAlreadyActiveError,
  PluginNotActiveError,
  InvalidPluginConfigurationError,
} from '../../src/plugin-system/errors';
import { Plugin } from '../../src/plugin-system/types';

describe('PluginManager', () => {
  let manager: PluginManager;
  let registry: PluginRegistry;
  let eventBus: InMemoryEventBus;

  beforeEach(() => {
    registry = new PluginRegistry();
    eventBus = new InMemoryEventBus();
    manager = new PluginManager(registry, eventBus);
  });

  describe('installPlugin', () => {
    let plugin: Plugin;

    beforeEach(async () => {
      plugin = await registry.registerPlugin({
        name: 'Test Plugin',
        version: '1.0.0',
        repositoryUrl: 'https://example.com/test-plugin',
      });
    });

    it('should install a plugin for a tenant', async () => {
      const result = await manager.installPlugin('tenant-1', {
        pluginId: plugin.id,
        version: '1.0.0',
      });

      expect(result.tenantPlugin).toBeDefined();
      expect(result.tenantPlugin.pluginId).toBe(plugin.id);
      expect(result.tenantPlugin.tenantId).toBe('tenant-1');
      expect(result.dependencies).toEqual([]);
    });

    it('should emit plugin.installed event', async () => {
      await manager.installPlugin('tenant-1', {
        pluginId: plugin.id,
        version: '1.0.0',
      });

      const events = eventBus.getEvents();
      expect(events.some((e) => e.eventType === 'plugin.installed')).toBe(true);
    });

    it('should support plugin configuration', async () => {
      const config = { apiKey: 'test-key' };
      const result = await manager.installPlugin('tenant-1', {
        pluginId: plugin.id,
        version: '1.0.0',
        configuration: config,
      });

      expect(result.tenantPlugin.configuration).toEqual(config);
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

      await manager.installPlugin('tenant-1', {
        pluginId: plugin.id,
        version: '1.0.0',
      });
    });

    it('should activate an installed plugin', async () => {
      const result = await manager.activatePlugin('tenant-1', {
        pluginId: plugin.id,
      });

      expect(result.isActive).toBe(true);
      expect(result.activatedAt).toBeDefined();
    });

    it('should throw PluginAlreadyActiveError if already active', async () => {
      await manager.activatePlugin('tenant-1', {
        pluginId: plugin.id,
      });

      await expect(
        manager.activatePlugin('tenant-1', {
          pluginId: plugin.id,
        })
      ).rejects.toThrow(PluginAlreadyActiveError);
    });

    it('should emit plugin.activated event', async () => {
      await manager.activatePlugin('tenant-1', {
        pluginId: plugin.id,
      });

      const events = eventBus.getEvents();
      expect(events.some((e) => e.eventType === 'plugin.activated')).toBe(true);
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

      await manager.installPlugin('tenant-1', {
        pluginId: plugin.id,
        version: '1.0.0',
      });

      await manager.activatePlugin('tenant-1', {
        pluginId: plugin.id,
      });
    });

    it('should deactivate an active plugin', async () => {
      const result = await manager.deactivatePlugin('tenant-1', {
        pluginId: plugin.id,
      });

      expect(result.isActive).toBe(false);
      expect(result.deactivatedAt).toBeDefined();
    });

    it('should throw PluginNotActiveError if not active', async () => {
      await manager.deactivatePlugin('tenant-1', {
        pluginId: plugin.id,
      });

      await expect(
        manager.deactivatePlugin('tenant-1', {
          pluginId: plugin.id,
        })
      ).rejects.toThrow(PluginNotActiveError);
    });

    it('should emit plugin.deactivated event', async () => {
      await manager.deactivatePlugin('tenant-1', {
        pluginId: plugin.id,
      });

      const events = eventBus.getEvents();
      expect(events.some((e) => e.eventType === 'plugin.deactivated')).toBe(true);
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

      await manager.installPlugin('tenant-1', {
        pluginId: plugin.id,
        version: '1.0.0',
      });
    });

    it('should uninstall a plugin', async () => {
      await manager.uninstallPlugin('tenant-1', {
        pluginId: plugin.id,
      });

      const tenantPlugin = await registry.getTenantPlugin('tenant-1', plugin.id);
      expect(tenantPlugin.uninstalledAt).toBeDefined();
    });

    it('should deactivate plugin before uninstalling', async () => {
      await manager.activatePlugin('tenant-1', {
        pluginId: plugin.id,
      });

      await manager.uninstallPlugin('tenant-1', {
        pluginId: plugin.id,
      });

      const tenantPlugin = await registry.getTenantPlugin('tenant-1', plugin.id);
      expect(tenantPlugin.isActive).toBe(false);
    });

    it('should emit plugin.uninstalled event', async () => {
      await manager.uninstallPlugin('tenant-1', {
        pluginId: plugin.id,
      });

      const events = eventBus.getEvents();
      expect(events.some((e) => e.eventType === 'plugin.uninstalled')).toBe(true);
    });
  });

  describe('configurePlugin', () => {
    let plugin: Plugin;

    beforeEach(async () => {
      plugin = await registry.registerPlugin({
        name: 'Test Plugin',
        version: '1.0.0',
        repositoryUrl: 'https://example.com/test-plugin',
      });

      await manager.installPlugin('tenant-1', {
        pluginId: plugin.id,
        version: '1.0.0',
      });
    });

    it('should update plugin configuration', async () => {
      const config = { apiKey: 'new-key' };
      const result = await manager.configurePlugin('tenant-1', {
        pluginId: plugin.id,
        configuration: config,
      });

      expect(result.configuration).toEqual(config);
    });

    it('should emit plugin.configured event', async () => {
      const config = { apiKey: 'test-key' };
      await manager.configurePlugin('tenant-1', {
        pluginId: plugin.id,
        configuration: config,
      });

      const events = eventBus.getEvents();
      expect(events.some((e) => e.eventType === 'plugin.configured')).toBe(true);
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

      await manager.installPlugin('tenant-1', {
        pluginId: plugin1.id,
        version: '1.0.0',
      });

      await manager.installPlugin('tenant-1', {
        pluginId: plugin2.id,
        version: '1.0.0',
      });
    });

    it('should return all plugins for a tenant', async () => {
      const plugins = await manager.getTenantPlugins('tenant-1');

      expect(plugins).toHaveLength(2);
      expect(plugins.map((p) => p.pluginId)).toContain(plugin1.id);
      expect(plugins.map((p) => p.pluginId)).toContain(plugin2.id);
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

      await manager.installPlugin('tenant-1', {
        pluginId: plugin1.id,
        version: '1.0.0',
      });

      await manager.installPlugin('tenant-1', {
        pluginId: plugin2.id,
        version: '1.0.0',
      });

      await manager.activatePlugin('tenant-1', {
        pluginId: plugin1.id,
      });
    });

    it('should return only active plugins for a tenant', async () => {
      const plugins = await manager.getActiveTenantPlugins('tenant-1');

      expect(plugins).toHaveLength(1);
      expect(plugins[0].pluginId).toBe(plugin1.id);
    });
  });
});
