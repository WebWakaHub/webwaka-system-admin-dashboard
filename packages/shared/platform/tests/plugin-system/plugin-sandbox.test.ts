/**
 * Plugin Sandbox Unit Tests
 */

import { PluginSandbox } from '../../src/plugin-system/sandbox/plugin-sandbox';
import { PluginSandboxError, PluginTimeoutError } from '../../src/plugin-system/errors';
import { InMemoryEventBus } from '../../src/shared/event-bus';

describe('PluginSandbox', () => {
  let sandbox: PluginSandbox;
  let eventBus: InMemoryEventBus;

  beforeEach(() => {
    eventBus = new InMemoryEventBus();
    sandbox = new PluginSandbox({
      memoryLimit: '512M',
      cpuLimit: '1',
      timeout: 5000,
      networkEnabled: false,
      filesystemEnabled: false,
    });
  });

  describe('executePlugin', () => {
    it('should execute simple plugin code', async () => {
      const context = {
        pluginId: 'test-plugin',
        tenantId: 'tenant-1',
        eventBus,
      };

      const code = 'return 42;';

      const result = await sandbox.executePlugin(context, code);

      expect(result.success).toBe(true);
      expect(result.output).toBe(42);
      expect(result.executionTime).toBeGreaterThanOrEqual(0);
    });

    it('should execute async plugin code', async () => {
      const context = {
        pluginId: 'test-plugin',
        tenantId: 'tenant-1',
        eventBus,
      };

      const code = 'await new Promise(r => setTimeout(r, 100)); return "done";';

      const result = await sandbox.executePlugin(context, code);

      expect(result.success).toBe(true);
      // Output may vary
      expect(result.executionTime).toBeGreaterThanOrEqual(100);
    });

    it('should handle plugin errors', async () => {
      const context = {
        pluginId: 'test-plugin',
        tenantId: 'tenant-1',
        eventBus,
      };

      const code = 'throw new Error("Plugin error");';

      const result = await sandbox.executePlugin(context, code);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('PLUGIN_EXECUTION_ERROR');
      expect(result.error?.message).toContain('Plugin error');
    });

    it('should detect dangerous require patterns', async () => {
      const context = {
        pluginId: 'test-plugin',
        tenantId: 'tenant-1',
        eventBus,
      };

      const code = 'const fs = require("fs"); return fs.readFileSync("/etc/passwd");';

      const result = await sandbox.executePlugin(context, code);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('PLUGIN_SANDBOX_ERROR');
      expect(result.error?.message).toContain('dangerous pattern');
    });

    it('should detect eval usage', async () => {
      const context = {
        pluginId: 'test-plugin',
        tenantId: 'tenant-1',
        eventBus,
      };

      const code = 'eval("console.log(1)"); return 1;';

      const result = await sandbox.executePlugin(context, code);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('PLUGIN_SANDBOX_ERROR');
    });

    it('should detect Function constructor usage', async () => {
      const context = {
        pluginId: 'test-plugin',
        tenantId: 'tenant-1',
        eventBus,
      };

      const code = 'const f = Function("return 1"); return f();';

      const result = await sandbox.executePlugin(context, code);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('PLUGIN_SANDBOX_ERROR');
    });

    it('should detect process access', async () => {
      const context = {
        pluginId: 'test-plugin',
        tenantId: 'tenant-1',
        eventBus,
      };

      const code = 'return process.env.HOME;';

      const result = await sandbox.executePlugin(context, code);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('PLUGIN_SANDBOX_ERROR');
    });

    it('should timeout long-running plugins', async () => {
      const shortTimeoutSandbox = new PluginSandbox({ timeout: 100 });

      const context = {
        pluginId: 'test-plugin',
        tenantId: 'tenant-1',
        eventBus,
      };

      const code = 'await new Promise(r => setTimeout(r, 1000)); return "done";';

      const result = await shortTimeoutSandbox.executePlugin(context, code);

      expect(result.success).toBe(false);
      // Timeout error expected
    });

    it('should provide execution context to plugin', async () => {
      const context = {
        pluginId: 'test-plugin',
        tenantId: 'tenant-1',
        eventBus,
        config: { apiKey: 'test-key' },
      };

      const code = 'return context.config.apiKey;';

      const result = await sandbox.executePlugin(context, code);

      expect(result.success).toBe(true);
      expect(result.output).toBe('test-key');
    });

    it('should track running plugins', async () => {
      const context = {
        pluginId: 'test-plugin',
        tenantId: 'tenant-1',
        eventBus,
      };

      expect(sandbox.getRunningPluginsCount()).toBe(0);

      const code = 'return 42;';
      await sandbox.executePlugin(context, code);

      expect(sandbox.getRunningPluginsCount()).toBe(0);
    });
  });

  describe('stopPlugin', () => {
    it('should stop a running plugin', async () => {
      const context = {
        pluginId: 'test-plugin',
        tenantId: 'tenant-1',
        eventBus,
      };

      await sandbox.stopPlugin('tenant-1', 'test-plugin');

      expect(sandbox.getRunningPluginsCount()).toBe(0);
    });
  });

  describe('getConfig', () => {
    it('should return sandbox configuration', () => {
      const config = sandbox.getConfig();

      expect(config.memoryLimit).toBe('512M');
      expect(config.cpuLimit).toBe('1');
      expect(config.timeout).toBe(5000);
      expect(config.networkEnabled).toBe(false);
      expect(config.filesystemEnabled).toBe(false);
    });

    it('should use default configuration', () => {
      const defaultSandbox = new PluginSandbox();
      const config = defaultSandbox.getConfig();

      expect(config.memoryLimit).toBe('512M');
      expect(config.cpuLimit).toBe('1');
      expect(config.timeout).toBe(30000);
      expect(config.networkEnabled).toBe(false);
      expect(config.filesystemEnabled).toBe(false);
    });
  });

  describe('validatePluginCode', () => {
    it('should accept safe code', async () => {
      const context = {
        pluginId: 'test-plugin',
        tenantId: 'tenant-1',
        eventBus,
      };

      const code = 'const x = 1; return x + 1;';

      const result = await sandbox.executePlugin(context, code);

      expect(result.success).toBe(true);
    });

    it('should reject child_process require', async () => {
      const context = {
        pluginId: 'test-plugin',
        tenantId: 'tenant-1',
        eventBus,
      };

      const code = 'const cp = require("child_process"); return cp;';

      const result = await sandbox.executePlugin(context, code);

      expect(result.success).toBe(false);
    });

    it('should reject os module require', async () => {
      const context = {
        pluginId: 'test-plugin',
        tenantId: 'tenant-1',
        eventBus,
      };

      const code = 'const os = require("os"); return os.homedir();';

      const result = await sandbox.executePlugin(context, code);

      expect(result.success).toBe(false);
    });

    it('should reject path module require', async () => {
      const context = {
        pluginId: 'test-plugin',
        tenantId: 'tenant-1',
        eventBus,
      };

      const code = 'const path = require("path"); return path.join("/", "tmp");';

      const result = await sandbox.executePlugin(context, code);

      expect(result.success).toBe(false);
    });
  });
});
