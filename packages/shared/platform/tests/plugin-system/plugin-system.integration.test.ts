/**
 * Plugin System Integration Tests
 * Tests interactions between Plugin Manager, Registry, and other components
 */

import { PluginManager } from '../../src/plugin-system/manager/plugin-manager';
import { PluginRegistry } from '../../src/plugin-system/registry/plugin-registry';
import { PluginSandbox } from '../../src/plugin-system/sandbox/plugin-sandbox';
import { PluginLogger } from '../../src/plugin-system/utils/plugin-logger';
import { ConfigValidator } from '../../src/plugin-system/utils/config-validator';
import { InMemoryEventBus } from '../../src/shared/event-bus';

describe('Plugin System Integration Tests', () => {
  let manager: PluginManager;
  let registry: PluginRegistry;
  let sandbox: PluginSandbox;
  let logger: PluginLogger;
  let validator: ConfigValidator;
  let eventBus: InMemoryEventBus;

  beforeEach(() => {
    registry = new PluginRegistry();
    eventBus = new InMemoryEventBus();
    manager = new PluginManager(registry, eventBus);
    sandbox = new PluginSandbox();
    logger = new PluginLogger();
    validator = new ConfigValidator();
  });

  describe('Complete Plugin Lifecycle', () => {
    it('should handle complete plugin lifecycle', async () => {
      // 1. Register plugin
      const plugin = await registry.registerPlugin({
        name: 'Integration Test Plugin',
        version: '1.0.0',
        repositoryUrl: 'https://example.com/plugin',
      });

      expect(plugin.id).toBeDefined();
      logger.info('Integration', 'Plugin registered', { pluginId: plugin.id });

      // 2. Install plugin for tenant
      const installResult = await manager.installPlugin('tenant-1', {
        pluginId: plugin.id,
        version: '1.0.0',
        configuration: { apiKey: 'test-key' },
      });

      expect(installResult.tenantPlugin.pluginId).toBe(plugin.id);
      logger.info('Integration', 'Plugin installed', { tenantId: 'tenant-1' });

      // 3. Activate plugin
      const activateResult = await manager.activatePlugin('tenant-1', {
        pluginId: plugin.id,
      });

      expect(activateResult.isActive).toBe(true);
      logger.info('Integration', 'Plugin activated', { pluginId: plugin.id });

      // 4. Execute plugin in sandbox
      const sandboxResult = await sandbox.executePlugin(
        {
          pluginId: plugin.id,
          tenantId: 'tenant-1',
          eventBus,
          config: installResult.tenantPlugin.configuration,
        },
        'return context.config.apiKey;'
      );

      expect(sandboxResult.success).toBe(true);
      expect(sandboxResult.output).toBe('test-key');
      logger.info('Integration', 'Plugin executed', { data: { output: sandboxResult.output } });

      // 5. Update configuration
      const newConfig = { apiKey: 'new-key' };
      const configResult = await manager.configurePlugin('tenant-1', {
        pluginId: plugin.id,
        configuration: newConfig,
      });

      expect(configResult.configuration).toEqual(newConfig);
      logger.info('Integration', 'Plugin configured', { data: { config: newConfig } });

      // 6. Deactivate plugin
      const deactivateResult = await manager.deactivatePlugin('tenant-1', {
        pluginId: plugin.id,
      });

      expect(deactivateResult.isActive).toBe(false);
      logger.info('Integration', 'Plugin deactivated', { pluginId: plugin.id });

      // 7. Uninstall plugin
      await manager.uninstallPlugin('tenant-1', {
        pluginId: plugin.id,
      });

      logger.info('Integration', 'Plugin uninstalled', { pluginId: plugin.id });

      // Verify event emissions
      const events = eventBus.getEvents();
      expect(events.length).toBeGreaterThan(0);
      expect(events.some((e) => e.eventType === 'plugin.installed')).toBe(true);
      expect(events.some((e) => e.eventType === 'plugin.activated')).toBe(true);
      expect(events.some((e) => e.eventType === 'plugin.deactivated')).toBe(true);
      expect(events.some((e) => e.eventType === 'plugin.uninstalled')).toBe(true);

      // Verify logging
      const logs = logger.getLogs();
      expect(logs.length).toBeGreaterThan(0);
    });
  });

  describe('Multi-Tenant Plugin Management', () => {
    it('should manage plugins for multiple tenants independently', async () => {
      // Register plugin
      const plugin = await registry.registerPlugin({
        name: 'Multi-Tenant Plugin',
        version: '1.0.0',
        repositoryUrl: 'https://example.com/plugin',
      });

      // Install for tenant 1
      await manager.installPlugin('tenant-1', {
        pluginId: plugin.id,
        version: '1.0.0',
        configuration: { apiKey: 'key-1' },
      });

      // Install for tenant 2
      await manager.installPlugin('tenant-2', {
        pluginId: plugin.id,
        version: '1.0.0',
        configuration: { apiKey: 'key-2' },
      });

      // Activate for tenant 1
      await manager.activatePlugin('tenant-1', { pluginId: plugin.id });

      // Verify tenant 1 has active plugin
      const tenant1Plugins = await manager.getActiveTenantPlugins('tenant-1');
      expect(tenant1Plugins).toHaveLength(1);

      // Verify tenant 2 has inactive plugin
      const tenant2Plugins = await manager.getActiveTenantPlugins('tenant-2');
      expect(tenant2Plugins).toHaveLength(0);

      // Verify configurations are separate
      const tenant1Plugin = await registry.getTenantPlugin('tenant-1', plugin.id);
      const tenant2Plugin = await registry.getTenantPlugin('tenant-2', plugin.id);

      expect(tenant1Plugin.configuration).toEqual({ apiKey: 'key-1' });
      expect(tenant2Plugin.configuration).toEqual({ apiKey: 'key-2' });
    });
  });

  describe('Plugin Dependency Management', () => {
    it('should handle plugin dependencies', async () => {
      // Register base plugin
      const basePlugin = await registry.registerPlugin({
        name: 'Base Plugin',
        version: '1.0.0',
        repositoryUrl: 'https://example.com/base',
      });

      // Register dependent plugin
      const dependentPlugin = await registry.registerPlugin({
        name: 'Dependent Plugin',
        version: '1.0.0',
        repositoryUrl: 'https://example.com/dependent',
        dependencies: [{ pluginId: basePlugin.id, versionRange: '^1.0.0' }],
      });

      // Install base plugin
      await manager.installPlugin('tenant-1', {
        pluginId: basePlugin.id,
        version: '1.0.0',
      });

      // Install dependent plugin
      const result = await manager.installPlugin('tenant-1', {
        pluginId: dependentPlugin.id,
        version: '1.0.0',
      });

      expect(result.dependencies).toContainEqual(
        expect.objectContaining({ pluginId: basePlugin.id })
      );
    });
  });

  describe('Configuration Validation Integration', () => {

  describe('Sandbox Integration', () => {
    it('should execute plugins safely in sandbox', async () => {
      const plugin = await registry.registerPlugin({
        name: 'Sandbox Test Plugin',
        version: '1.0.0',
        repositoryUrl: 'https://example.com/sandbox',
      });

      await manager.installPlugin('tenant-1', {
        pluginId: plugin.id,
        version: '1.0.0',
      });

      // Safe code execution
      const safeResult = await sandbox.executePlugin(
        {
          pluginId: plugin.id,
          tenantId: 'tenant-1',
          eventBus,
        },
        'return { status: "ok", value: 42 };'
      );

      expect(safeResult.success).toBe(true);
      expect(safeResult.output).toEqual({ status: 'ok', value: 42 });

      // Dangerous code rejection
      const dangerousResult = await sandbox.executePlugin(
        {
          pluginId: plugin.id,
          tenantId: 'tenant-1',
          eventBus,
        },
        'const fs = require("fs"); return fs;'
      );

      expect(dangerousResult.success).toBe(false);
      expect(dangerousResult.error?.code).toBe('PLUGIN_SANDBOX_ERROR');
    });
  });

  describe('Logging Integration', () => {
    it('should log all plugin operations', async () => {
      const plugin = await registry.registerPlugin({
        name: 'Logging Test Plugin',
        version: '1.0.0',
        repositoryUrl: 'https://example.com/logging',
      });

      logger.info('PluginSystem', 'Starting plugin operations', {
        pluginId: plugin.id,
      });

      await manager.installPlugin('tenant-1', {
        pluginId: plugin.id,
        version: '1.0.0',
      });

      logger.info('PluginSystem', 'Plugin installed', { pluginId: plugin.id });

      await manager.activatePlugin('tenant-1', { pluginId: plugin.id });

      logger.info('PluginSystem', 'Plugin activated', { pluginId: plugin.id });

      const logs = logger.getLogs();
      expect(logs.length).toBeGreaterThanOrEqual(3);

      const stats = logger.getStatistics();
      expect(stats.total).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle errors gracefully across components', async () => {
      // Try to install non-existent plugin
      try {
        await manager.installPlugin('tenant-1', {
          pluginId: 'non-existent',
          version: '1.0.0',
        });
        fail('Should have thrown');
      } catch (error) {
        logger.error('PluginSystem', 'Plugin installation failed', {
          error: error as Error,
        });
        expect(error).toBeDefined();
      }

      // Verify error was logged
      const logs = logger.getLogs({ level: 'ERROR' as any });
      expect(logs.length).toBeGreaterThan(0);
    });
  });

  describe('Performance Integration', () => {
    it('should track execution performance', async () => {
      const plugin = await registry.registerPlugin({
        name: 'Performance Test Plugin',
        version: '1.0.0',
        repositoryUrl: 'https://example.com/perf',
      });

      await manager.installPlugin('tenant-1', {
        pluginId: plugin.id,
        version: '1.0.0',
      });

      const startTime = Date.now();

      const result = await sandbox.executePlugin(
        {
          pluginId: plugin.id,
          tenantId: 'tenant-1',
          eventBus,
        },
        'await new Promise(r => setTimeout(r, 100)); return "done";'
      );

      const totalTime = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(result.executionTime).toBeGreaterThanOrEqual(100);
      expect(totalTime).toBeGreaterThanOrEqual(result.executionTime);

      logger.info('PluginSystem', 'Plugin execution completed', {
        data: {
          executionTime: result.executionTime,
          totalTime,
        },
      });
    });
  });
});
