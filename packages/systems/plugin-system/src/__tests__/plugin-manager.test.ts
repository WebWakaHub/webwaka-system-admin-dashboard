/**
 * WebWaka Plugin System - Plugin Manager Tests
 * 
 * Comprehensive unit tests for the Plugin Manager implementation.
 * Tests cover plugin lifecycle management, state transitions,
 * dependency resolution, and error handling.
 * 
 * @module @webwaka/plugin-system/tests
 * @author webwakaagent4 (Core Platform Engineer)
 */

import { PluginManager, createPluginManager } from '../plugin-manager';
import { IPlugin, PluginState, PluginContext } from '../types';

describe('PluginManager', () => {
  let manager: PluginManager;

  beforeEach(() => {
    manager = new PluginManager({ debug: false });
  });

  describe('Plugin Registration', () => {
    it('should register a plugin', () => {
      const plugin: IPlugin = {
        metadata: {
          id: 'test-plugin',
          name: 'Test Plugin',
          version: '1.0.0',
        },
      };

      manager.register(plugin);

      expect(manager.hasPlugin('test-plugin')).toBe(true);
      expect(manager.getStats().totalPlugins).toBe(1);
    });

    it('should throw error when registering duplicate plugin', () => {
      const plugin: IPlugin = {
        metadata: {
          id: 'test-plugin',
          name: 'Test Plugin',
          version: '1.0.0',
        },
      };

      manager.register(plugin);

      expect(() => manager.register(plugin)).toThrow('Plugin test-plugin is already registered');
    });

    it('should get registered plugin', () => {
      const plugin: IPlugin = {
        metadata: {
          id: 'test-plugin',
          name: 'Test Plugin',
          version: '1.0.0',
        },
      };

      manager.register(plugin);

      const instance = manager.getPlugin('test-plugin');
      expect(instance.metadata.id).toBe('test-plugin');
      expect(instance.state).toBe(PluginState.UNLOADED);
    });

    it('should throw error when getting non-existent plugin', () => {
      expect(() => manager.getPlugin('non-existent')).toThrow('Plugin non-existent not found');
    });

    it('should get all registered plugins', () => {
      const plugin1: IPlugin = {
        metadata: { id: 'plugin-1', name: 'Plugin 1', version: '1.0.0' },
      };
      const plugin2: IPlugin = {
        metadata: { id: 'plugin-2', name: 'Plugin 2', version: '1.0.0' },
      };

      manager.register(plugin1);
      manager.register(plugin2);

      const plugins = manager.getAllPlugins();
      expect(plugins).toHaveLength(2);
    });
  });

  describe('Plugin Unregistration', () => {
    it('should unregister a plugin', () => {
      const plugin: IPlugin = {
        metadata: { id: 'test-plugin', name: 'Test Plugin', version: '1.0.0' },
      };

      manager.register(plugin);
      const result = manager.unregister('test-plugin');

      expect(result).toBe(true);
      expect(manager.hasPlugin('test-plugin')).toBe(false);
      expect(manager.getStats().totalPlugins).toBe(0);
    });

    it('should return false when unregistering non-existent plugin', () => {
      const result = manager.unregister('non-existent');
      expect(result).toBe(false);
    });

    it('should throw error when unregistering loaded plugin', async () => {
      const plugin: IPlugin = {
        metadata: { id: 'test-plugin', name: 'Test Plugin', version: '1.0.0' },
      };

      manager.register(plugin);
      await manager.load('test-plugin', 'tenant-123');

      expect(() => manager.unregister('test-plugin')).toThrow(
        'Cannot unregister plugin test-plugin in state loaded'
      );
    });
  });

  describe('Plugin Loading', () => {
    it('should load a plugin', async () => {
      const onLoadMock = jest.fn();
      const plugin: IPlugin = {
        metadata: { id: 'test-plugin', name: 'Test Plugin', version: '1.0.0' },
        onLoad: onLoadMock,
      };

      manager.register(plugin);
      await manager.load('test-plugin', 'tenant-123', { apiKey: 'secret' });

      const instance = manager.getPlugin('test-plugin');
      expect(instance.state).toBe(PluginState.LOADED);
      expect(instance.context.tenantId).toBe('tenant-123');
      expect(instance.context.config).toEqual({ apiKey: 'secret' });
      expect(instance.loadedAt).toBeDefined();
      expect(onLoadMock).toHaveBeenCalledTimes(1);
      expect(manager.getStats().loadedPlugins).toBe(1);
    });

    it('should load a plugin without onLoad hook', async () => {
      const plugin: IPlugin = {
        metadata: { id: 'test-plugin', name: 'Test Plugin', version: '1.0.0' },
      };

      manager.register(plugin);
      await manager.load('test-plugin', 'tenant-123');

      const instance = manager.getPlugin('test-plugin');
      expect(instance.state).toBe(PluginState.LOADED);
    });

    it('should throw error when loading already loaded plugin', async () => {
      const plugin: IPlugin = {
        metadata: { id: 'test-plugin', name: 'Test Plugin', version: '1.0.0' },
      };

      manager.register(plugin);
      await manager.load('test-plugin', 'tenant-123');

      await expect(manager.load('test-plugin', 'tenant-123')).rejects.toThrow(
        'Plugin test-plugin is already loaded'
      );
    });

    it('should handle onLoad hook errors', async () => {
      const plugin: IPlugin = {
        metadata: { id: 'test-plugin', name: 'Test Plugin', version: '1.0.0' },
        onLoad: async () => {
          throw new Error('Load error');
        },
      };

      manager.register(plugin);

      await expect(manager.load('test-plugin', 'tenant-123')).rejects.toThrow(
        'Failed to load plugin test-plugin: Load error'
      );

      const instance = manager.getPlugin('test-plugin');
      expect(instance.state).toBe(PluginState.ERROR);
      expect(instance.error).toBe('Load error');
      expect(manager.getStats().errorPlugins).toBe(1);
      expect(manager.getStats().failedOperations).toBe(1);
    });

    it('should provide logger to plugin context', async () => {
      let capturedContext: PluginContext | null = null;
      const plugin: IPlugin = {
        metadata: { id: 'test-plugin', name: 'Test Plugin', version: '1.0.0' },
        onLoad: async (context) => {
          capturedContext = context;
        },
      };

      manager.register(plugin);
      await manager.load('test-plugin', 'tenant-123');

      expect(capturedContext).not.toBeNull();
      expect(capturedContext!.logger).toBeDefined();
      expect(typeof capturedContext!.logger!.info).toBe('function');
      expect(typeof capturedContext!.logger!.warn).toBe('function');
      expect(typeof capturedContext!.logger!.error).toBe('function');
      expect(typeof capturedContext!.logger!.debug).toBe('function');
    });
  });

  describe('Plugin Unloading', () => {
    it('should unload a plugin', async () => {
      const onUnloadMock = jest.fn();
      const plugin: IPlugin = {
        metadata: { id: 'test-plugin', name: 'Test Plugin', version: '1.0.0' },
        onUnload: onUnloadMock,
      };

      manager.register(plugin);
      await manager.load('test-plugin', 'tenant-123');
      await manager.unload('test-plugin');

      const instance = manager.getPlugin('test-plugin');
      expect(instance.state).toBe(PluginState.UNLOADED);
      expect(instance.loadedAt).toBeUndefined();
      expect(onUnloadMock).toHaveBeenCalledTimes(1);
      expect(manager.getStats().loadedPlugins).toBe(0);
    });

    it('should unload a plugin without onUnload hook', async () => {
      const plugin: IPlugin = {
        metadata: { id: 'test-plugin', name: 'Test Plugin', version: '1.0.0' },
      };

      manager.register(plugin);
      await manager.load('test-plugin', 'tenant-123');
      await manager.unload('test-plugin');

      const instance = manager.getPlugin('test-plugin');
      expect(instance.state).toBe(PluginState.UNLOADED);
    });

    it('should throw error when unloading already unloaded plugin', async () => {
      const plugin: IPlugin = {
        metadata: { id: 'test-plugin', name: 'Test Plugin', version: '1.0.0' },
      };

      manager.register(plugin);

      await expect(manager.unload('test-plugin')).rejects.toThrow(
        'Plugin test-plugin is already unloaded'
      );
    });

    it('should throw error when unloading enabled plugin', async () => {
      const plugin: IPlugin = {
        metadata: { id: 'test-plugin', name: 'Test Plugin', version: '1.0.0' },
      };

      manager.register(plugin);
      await manager.load('test-plugin', 'tenant-123');
      await manager.enable('test-plugin');

      await expect(manager.unload('test-plugin')).rejects.toThrow(
        'Plugin test-plugin must be disabled before unloading'
      );
    });

    it('should handle onUnload hook errors', async () => {
      const plugin: IPlugin = {
        metadata: { id: 'test-plugin', name: 'Test Plugin', version: '1.0.0' },
        onUnload: async () => {
          throw new Error('Unload error');
        },
      };

      manager.register(plugin);
      await manager.load('test-plugin', 'tenant-123');

      await expect(manager.unload('test-plugin')).rejects.toThrow(
        'Failed to unload plugin test-plugin: Unload error'
      );

      const instance = manager.getPlugin('test-plugin');
      expect(instance.state).toBe(PluginState.ERROR);
      expect(instance.error).toBe('Unload error');
    });
  });

  describe('Plugin Enabling', () => {
    it('should enable a loaded plugin', async () => {
      const onEnableMock = jest.fn();
      const plugin: IPlugin = {
        metadata: { id: 'test-plugin', name: 'Test Plugin', version: '1.0.0' },
        onEnable: onEnableMock,
      };

      manager.register(plugin);
      await manager.load('test-plugin', 'tenant-123');
      await manager.enable('test-plugin');

      const instance = manager.getPlugin('test-plugin');
      expect(instance.state).toBe(PluginState.ENABLED);
      expect(instance.enabledAt).toBeDefined();
      expect(onEnableMock).toHaveBeenCalledTimes(1);
      expect(manager.getStats().enabledPlugins).toBe(1);
      expect(manager.getStats().loadedPlugins).toBe(0);
    });

    it('should enable a disabled plugin', async () => {
      const plugin: IPlugin = {
        metadata: { id: 'test-plugin', name: 'Test Plugin', version: '1.0.0' },
      };

      manager.register(plugin);
      await manager.load('test-plugin', 'tenant-123');
      await manager.enable('test-plugin');
      await manager.disable('test-plugin');
      await manager.enable('test-plugin');

      const instance = manager.getPlugin('test-plugin');
      expect(instance.state).toBe(PluginState.ENABLED);
    });

    it('should throw error when enabling unloaded plugin', async () => {
      const plugin: IPlugin = {
        metadata: { id: 'test-plugin', name: 'Test Plugin', version: '1.0.0' },
      };

      manager.register(plugin);

      await expect(manager.enable('test-plugin')).rejects.toThrow(
        'Plugin test-plugin must be loaded or disabled to enable'
      );
    });

    it('should handle onEnable hook errors', async () => {
      const plugin: IPlugin = {
        metadata: { id: 'test-plugin', name: 'Test Plugin', version: '1.0.0' },
        onEnable: async () => {
          throw new Error('Enable error');
        },
      };

      manager.register(plugin);
      await manager.load('test-plugin', 'tenant-123');

      await expect(manager.enable('test-plugin')).rejects.toThrow(
        'Failed to enable plugin test-plugin: Enable error'
      );

      const instance = manager.getPlugin('test-plugin');
      expect(instance.state).toBe(PluginState.ERROR);
    });
  });

  describe('Plugin Disabling', () => {
    it('should disable an enabled plugin', async () => {
      const onDisableMock = jest.fn();
      const plugin: IPlugin = {
        metadata: { id: 'test-plugin', name: 'Test Plugin', version: '1.0.0' },
        onDisable: onDisableMock,
      };

      manager.register(plugin);
      await manager.load('test-plugin', 'tenant-123');
      await manager.enable('test-plugin');
      await manager.disable('test-plugin');

      const instance = manager.getPlugin('test-plugin');
      expect(instance.state).toBe(PluginState.DISABLED);
      expect(instance.enabledAt).toBeUndefined();
      expect(onDisableMock).toHaveBeenCalledTimes(1);
      expect(manager.getStats().disabledPlugins).toBe(1);
      expect(manager.getStats().enabledPlugins).toBe(0);
    });

    it('should throw error when disabling non-enabled plugin', async () => {
      const plugin: IPlugin = {
        metadata: { id: 'test-plugin', name: 'Test Plugin', version: '1.0.0' },
      };

      manager.register(plugin);
      await manager.load('test-plugin', 'tenant-123');

      await expect(manager.disable('test-plugin')).rejects.toThrow(
        'Plugin test-plugin is not enabled'
      );
    });

    it('should handle onDisable hook errors', async () => {
      const plugin: IPlugin = {
        metadata: { id: 'test-plugin', name: 'Test Plugin', version: '1.0.0' },
        onDisable: async () => {
          throw new Error('Disable error');
        },
      };

      manager.register(plugin);
      await manager.load('test-plugin', 'tenant-123');
      await manager.enable('test-plugin');

      await expect(manager.disable('test-plugin')).rejects.toThrow(
        'Failed to disable plugin test-plugin: Disable error'
      );

      const instance = manager.getPlugin('test-plugin');
      expect(instance.state).toBe(PluginState.ERROR);
    });
  });

  describe('Plugin State Queries', () => {
    it('should get plugins by state', async () => {
      const plugin1: IPlugin = {
        metadata: { id: 'plugin-1', name: 'Plugin 1', version: '1.0.0' },
      };
      const plugin2: IPlugin = {
        metadata: { id: 'plugin-2', name: 'Plugin 2', version: '1.0.0' },
      };
      const plugin3: IPlugin = {
        metadata: { id: 'plugin-3', name: 'Plugin 3', version: '1.0.0' },
      };

      manager.register(plugin1);
      manager.register(plugin2);
      manager.register(plugin3);

      await manager.load('plugin-1', 'tenant-123');
      await manager.load('plugin-2', 'tenant-123');
      await manager.enable('plugin-2');

      const unloadedPlugins = manager.getPluginsByState(PluginState.UNLOADED);
      const loadedPlugins = manager.getPluginsByState(PluginState.LOADED);
      const enabledPlugins = manager.getPluginsByState(PluginState.ENABLED);

      expect(unloadedPlugins).toHaveLength(1);
      expect(loadedPlugins).toHaveLength(1);
      expect(enabledPlugins).toHaveLength(1);
    });
  });

  describe('Lifecycle Events', () => {
    it('should emit lifecycle events', async () => {
      const events: any[] = [];
      const plugin: IPlugin = {
        metadata: { id: 'test-plugin', name: 'Test Plugin', version: '1.0.0' },
      };

      manager.onLifecycleEvent((event) => events.push(event));
      manager.register(plugin);

      await manager.load('test-plugin', 'tenant-123');
      await manager.enable('test-plugin');
      await manager.disable('test-plugin');
      await manager.unload('test-plugin');

      expect(events).toHaveLength(4);
      expect(events[0].type).toBe('loaded');
      expect(events[1].type).toBe('enabled');
      expect(events[2].type).toBe('disabled');
      expect(events[3].type).toBe('unloaded');
    });

    it('should emit error events', async () => {
      const events: any[] = [];
      const plugin: IPlugin = {
        metadata: { id: 'test-plugin', name: 'Test Plugin', version: '1.0.0' },
        onLoad: async () => {
          throw new Error('Load error');
        },
      };

      manager.onLifecycleEvent((event) => events.push(event));
      manager.register(plugin);

      try {
        await manager.load('test-plugin', 'tenant-123');
      } catch (error) {
        // Expected
      }

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('error');
      expect(events[0].error).toBe('Load error');
    });

    it('should remove lifecycle event listener', async () => {
      const events: any[] = [];
      const listener = (event: any) => events.push(event);
      const plugin: IPlugin = {
        metadata: { id: 'test-plugin', name: 'Test Plugin', version: '1.0.0' },
      };

      manager.onLifecycleEvent(listener);
      manager.register(plugin);
      await manager.load('test-plugin', 'tenant-123');

      manager.offLifecycleEvent(listener);
      await manager.enable('test-plugin');

      expect(events).toHaveLength(1); // Only loaded event
    });
  });

  describe('Dependency Management', () => {
    it('should validate dependencies when loading plugin', async () => {
      const depPlugin: IPlugin = {
        metadata: { id: 'dep-plugin', name: 'Dependency Plugin', version: '1.0.0' },
      };
      const plugin: IPlugin = {
        metadata: {
          id: 'test-plugin',
          name: 'Test Plugin',
          version: '1.0.0',
          dependencies: ['dep-plugin'],
        },
      };

      manager.register(depPlugin);
      manager.register(plugin);

      await expect(manager.load('test-plugin', 'tenant-123')).rejects.toThrow(
        'Dependency dep-plugin is not loaded'
      );
    });

    it('should load plugin with satisfied dependencies', async () => {
      const depPlugin: IPlugin = {
        metadata: { id: 'dep-plugin', name: 'Dependency Plugin', version: '1.0.0' },
      };
      const plugin: IPlugin = {
        metadata: {
          id: 'test-plugin',
          name: 'Test Plugin',
          version: '1.0.0',
          dependencies: ['dep-plugin'],
        },
      };

      manager.register(depPlugin);
      manager.register(plugin);

      await manager.load('dep-plugin', 'tenant-123');
      await manager.load('test-plugin', 'tenant-123');

      const instance = manager.getPlugin('test-plugin');
      expect(instance.state).toBe(PluginState.LOADED);
    });

    it('should throw error for missing dependency', async () => {
      const plugin: IPlugin = {
        metadata: {
          id: 'test-plugin',
          name: 'Test Plugin',
          version: '1.0.0',
          dependencies: ['missing-dep'],
        },
      };

      manager.register(plugin);

      await expect(manager.load('test-plugin', 'tenant-123')).rejects.toThrow(
        'Dependency missing-dep is not registered'
      );
    });

    it('should skip dependency validation when strictDependencies is false', async () => {
      const managerNonStrict = new PluginManager({ strictDependencies: false });
      const plugin: IPlugin = {
        metadata: {
          id: 'test-plugin',
          name: 'Test Plugin',
          version: '1.0.0',
          dependencies: ['missing-dep'],
        },
      };

      managerNonStrict.register(plugin);
      await managerNonStrict.load('test-plugin', 'tenant-123');

      const instance = managerNonStrict.getPlugin('test-plugin');
      expect(instance.state).toBe(PluginState.LOADED);
    });
  });

  describe('Statistics', () => {
    it('should track plugin manager statistics', async () => {
      const plugin1: IPlugin = {
        metadata: { id: 'plugin-1', name: 'Plugin 1', version: '1.0.0' },
      };
      const plugin2: IPlugin = {
        metadata: { id: 'plugin-2', name: 'Plugin 2', version: '1.0.0' },
      };

      manager.register(plugin1);
      manager.register(plugin2);

      await manager.load('plugin-1', 'tenant-123');
      await manager.enable('plugin-1');

      const stats = manager.getStats();
      expect(stats.totalPlugins).toBe(2);
      expect(stats.loadedPlugins).toBe(0);
      expect(stats.enabledPlugins).toBe(1);
      expect(stats.lifecycleOperations).toBe(2); // load + enable
    });

    it('should reset statistics', async () => {
      const plugin: IPlugin = {
        metadata: { id: 'test-plugin', name: 'Test Plugin', version: '1.0.0' },
      };

      manager.register(plugin);
      await manager.load('test-plugin', 'tenant-123');

      manager.resetStats();

      const stats = manager.getStats();
      expect(stats.lifecycleOperations).toBe(0);
      expect(stats.failedOperations).toBe(0);
      expect(stats.totalPlugins).toBe(1); // Not reset
    });
  });

  describe('Configuration', () => {
    it('should handle debug logging when enabled', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const debugManager = new PluginManager({ debug: true });
      const plugin: IPlugin = {
        metadata: { id: 'test-plugin', name: 'Test Plugin', version: '1.0.0' },
      };

      debugManager.register(plugin);
      await debugManager.load('test-plugin', 'tenant-123');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle lifecycle timeout', async () => {
      const plugin: IPlugin = {
        metadata: { id: 'test-plugin', name: 'Test Plugin', version: '1.0.0' },
        onLoad: async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
        },
      };

      const timeoutManager = new PluginManager({ lifecycleTimeout: 50 });
      timeoutManager.register(plugin);

      await expect(timeoutManager.load('test-plugin', 'tenant-123')).rejects.toThrow(
        'Plugin test-plugin onLoad timeout'
      );
    });
  });

  describe('Factory Function', () => {
    it('should create plugin manager using factory function', () => {
      const pm = createPluginManager({ debug: true });
      expect(pm).toBeInstanceOf(PluginManager);
    });

    it('should create plugin manager with default config', () => {
      const pm = createPluginManager();
      expect(pm).toBeInstanceOf(PluginManager);
    });
  });
});
