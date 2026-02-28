import { AIExtensionFramework } from '../../../src/ai-extension-framework/AIExtensionFramework';
import { AIExtension } from '../../../src/ai-extension-framework/AIExtension';

describe('AIExtensionFramework Integration Tests', () => {
  let framework: AIExtensionFramework;

  beforeEach(() => {
    framework = new AIExtensionFramework();
  });

  afterEach(async () => {
    await framework.shutdown();
  });

  describe('Framework Initialization', () => {
    it('should initialize framework', async () => {
      await framework.initialize();
      const status = framework.getStatus();
      expect(status.initialized).toBe(true);
    });

    it('should get framework status', async () => {
      await framework.initialize();
      const status = framework.getStatus();
      expect(status.initialized).toBe(true);
      expect(status.installedExtensions).toBe(0);
      expect(status.enabledExtensions).toBe(0);
    });
  });

  describe('Extension Lifecycle', () => {
    it('should install and enable extension', async () => {
      await framework.initialize();
      const extension = new AIExtension('test-ext', '1.0.0');
      await framework.installExtension(extension);
      await framework.enableExtension('test-ext');
      const status = framework.getStatus();
      expect(status.installedExtensions).toBe(1);
      expect(status.enabledExtensions).toBe(1);
    });

    it('should disable extension', async () => {
      await framework.initialize();
      const extension = new AIExtension('test-ext', '1.0.0');
      await framework.installExtension(extension);
      await framework.enableExtension('test-ext');
      await framework.disableExtension('test-ext');
      const status = framework.getStatus();
      expect(status.enabledExtensions).toBe(0);
    });

    it('should uninstall extension', async () => {
      await framework.initialize();
      const extension = new AIExtension('test-ext', '1.0.0');
      await framework.installExtension(extension);
      await framework.uninstallExtension('test-ext');
      const status = framework.getStatus();
      expect(status.installedExtensions).toBe(0);
    });
  });

  describe('Event Integration', () => {
    it('should subscribe extension to event', async () => {
      await framework.initialize();
      const extension = new AIExtension('test-ext', '1.0.0');
      const handler = jest.fn();
      await framework.installExtension(extension);
      framework.subscribeExtensionToEvent(extension, 'test.event', handler);
      framework.emitEvent('test.event', { data: 'test' });
      expect(handler).toHaveBeenCalledWith({ data: 'test' });
    });

    it('should emit from extension', async () => {
      await framework.initialize();
      const extension = new AIExtension('test-ext', '1.0.0');
      const handler = jest.fn();
      await framework.installExtension(extension);
      framework.subscribeExtensionToEvent(extension, 'response.event', handler);
      framework.emitFromExtension(extension, 'response.event', { result: 'success' });
      expect(handler).toHaveBeenCalled();
    });

    it('should unsubscribe from event', async () => {
      await framework.initialize();
      const extension = new AIExtension('test-ext', '1.0.0');
      const handler = jest.fn();
      await framework.installExtension(extension);
      framework.subscribeExtensionToEvent(extension, 'test.event', handler);
      framework.unsubscribeExtensionFromEvent(extension, 'test.event');
      framework.emitEvent('test.event', { data: 'test' });
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('Sandbox Execution', () => {
    it('should execute function in sandbox', async () => {
      await framework.initialize();
      const extension = new AIExtension('test-ext', '1.0.0');
      await framework.installExtension(extension);
      const result = await framework.executeInSandbox('test-ext', async () => 'result');
      expect(result).toBe('result');
    });

    it('should handle async execution', async () => {
      await framework.initialize();
      const extension = new AIExtension('test-ext', '1.0.0');
      await framework.installExtension(extension);
      const result = await framework.executeInSandbox('test-ext', async () => {
        return new Promise((resolve) => {
          setTimeout(() => resolve('delayed'), 10);
        });
      });
      expect(result).toBe('delayed');
    });
  });

  describe('AI Service Access', () => {
    it('should access AI gateway', async () => {
      await framework.initialize();
      const gateway = framework.getAIGateway();
      expect(gateway).toBeDefined();
      const providers = gateway.getProviders();
      expect(providers).toContain('mock');
    });

    it('should use AI services through extension', async () => {
      await framework.initialize();
      const extension = new AIExtension('test-ext', '1.0.0');
      await framework.installExtension(extension);
      const gateway = framework.getAIGateway();
      const response = await gateway.text.generate({ prompt: 'test' });
      expect(response.text).toBeDefined();
    });
  });

  describe('Component Access', () => {
    it('should get manager', () => {
      const manager = framework.getManager();
      expect(manager).toBeDefined();
    });

    it('should get sandbox', () => {
      const sandbox = framework.getSandbox();
      expect(sandbox).toBeDefined();
    });

    it('should get event bridge', () => {
      const bridge = framework.getEventBridge();
      expect(bridge).toBeDefined();
    });

    it('should get AI gateway', () => {
      const gateway = framework.getAIGateway();
      expect(gateway).toBeDefined();
    });
  });

  describe('Multiple Extensions', () => {
    it('should manage multiple extensions', async () => {
      await framework.initialize();
      const ext1 = new AIExtension('ext1', '1.0.0');
      const ext2 = new AIExtension('ext2', '1.0.0');
      await framework.installExtension(ext1);
      await framework.installExtension(ext2);
      const status = framework.getStatus();
      expect(status.installedExtensions).toBe(2);
    });

    it('should handle multiple event subscriptions', async () => {
      await framework.initialize();
      const ext1 = new AIExtension('ext1', '1.0.0');
      const ext2 = new AIExtension('ext2', '1.0.0');
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      await framework.installExtension(ext1);
      await framework.installExtension(ext2);
      framework.subscribeExtensionToEvent(ext1, 'test.event', handler1);
      framework.subscribeExtensionToEvent(ext2, 'test.event', handler2);
      framework.emitEvent('test.event', { data: 'test' });
      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });
  });

  describe('Framework Shutdown', () => {
    it('should shutdown framework', async () => {
      await framework.initialize();
      const extension = new AIExtension('test-ext', '1.0.0');
      await framework.installExtension(extension);
      await framework.enableExtension('test-ext');
      await framework.shutdown();
      const status = framework.getStatus();
      expect(status.initialized).toBe(false);
    });

    it('should disable all extensions on shutdown', async () => {
      await framework.initialize();
      const ext1 = new AIExtension('ext1', '1.0.0');
      const ext2 = new AIExtension('ext2', '1.0.0');
      await framework.installExtension(ext1);
      await framework.installExtension(ext2);
      await framework.enableExtension('ext1');
      await framework.enableExtension('ext2');
      await framework.shutdown();
      const status = framework.getStatus();
      expect(status.enabledExtensions).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle extension errors', async () => {
      await framework.initialize();
      const extension = new AIExtension('test-ext', '1.0.0');
      await framework.installExtension(extension);
      await expect(framework.enableExtension('non-existent')).rejects.toThrow();
    });

    it('should handle sandbox execution errors', async () => {
      await framework.initialize();
      const extension = new AIExtension('test-ext', '1.0.0');
      await framework.installExtension(extension);
      await expect(
        framework.executeInSandbox('test-ext', async () => {
          throw new Error('Test error');
        })
      ).rejects.toThrow();
    });
  });
});
