import { ExtensionSandbox } from '../../../src/ai-extension-framework/sandbox/ExtensionSandbox';
import { AIExtension } from '../../../src/ai-extension-framework/AIExtension';
import { ExtensionSandboxError } from '../../../src/ai-extension-framework/errors/AIExtensionError';

describe('ExtensionSandbox', () => {
  let sandbox: ExtensionSandbox;
  let extension: AIExtension;

  beforeEach(() => {
    sandbox = new ExtensionSandbox();
    extension = new AIExtension('test-extension', '1.0.0');
  });

  describe('Context Management', () => {
    it('should create a context', () => {
      const context = sandbox.createContext(extension);
      expect(context.extensionId).toBe('test-extension');
      expect(context.createdAt).toBeDefined();
      expect(context.resourceUsage).toBeDefined();
    });

    it('should get a context', () => {
      sandbox.createContext(extension);
      const context = sandbox.getContext('test-extension');
      expect(context.extensionId).toBe('test-extension');
    });

    it('should throw error when getting non-existent context', () => {
      expect(() => sandbox.getContext('non-existent')).toThrow(ExtensionSandboxError);
    });

    it('should destroy a context', () => {
      sandbox.createContext(extension);
      sandbox.destroyContext('test-extension');
      expect(() => sandbox.getContext('test-extension')).toThrow();
    });
  });

  describe('Execution', () => {
    it('should execute a function in sandbox', async () => {
      sandbox.createContext(extension);
      const result = await sandbox.execute('test-extension', async () => 'result');
      expect(result).toBe('result');
    });

    it('should handle async functions', async () => {
      sandbox.createContext(extension);
      const result = await sandbox.execute('test-extension', async () => {
        return new Promise((resolve) => {
          setTimeout(() => resolve('delayed'), 10);
        });
      });
      expect(result).toBe('delayed');
    });

    it('should throw error on execution failure', async () => {
      sandbox.createContext(extension);
      await expect(
        sandbox.execute('test-extension', async () => {
          throw new Error('Test error');
        })
      ).rejects.toThrow(ExtensionSandboxError);
    });

    it('should enforce timeout', async () => {
      sandbox.createContext(extension);
      await expect(
        sandbox.execute(
          'test-extension',
          async () => {
            return new Promise((resolve) => {
              setTimeout(() => resolve('result'), 5000);
            });
          },
          100
        )
      ).rejects.toThrow();
    });
  });

  describe('Resource Tracking', () => {
    it('should track execution time', async () => {
      sandbox.createContext(extension);
      await sandbox.execute('test-extension', async () => {
        return new Promise((resolve) => {
          setTimeout(() => resolve('result'), 10);
        });
      });
      const context = sandbox.getContext('test-extension');
      expect(context.resourceUsage.executionTime).toBeGreaterThan(0);
    });

    it('should update last accessed time', () => {
      const context1 = sandbox.createContext(extension);
      const createdAt = context1.lastAccessedAt;
      setTimeout(() => {
        const context2 = sandbox.getContext('test-extension');
        expect(context2.lastAccessedAt.getTime()).toBeGreaterThanOrEqual(createdAt.getTime());
      }, 10);
    });
  });

  describe('Statistics', () => {
    it('should count contexts', () => {
      sandbox.createContext(extension);
      expect(sandbox.getContextCount()).toBe(1);
    });

    it('should get all contexts', () => {
      sandbox.createContext(extension);
      const ext2 = new AIExtension('ext2', '1.0.0');
      sandbox.createContext(ext2);
      const contexts = sandbox.getAllContexts();
      expect(contexts.length).toBe(2);
    });

    it('should clear all contexts', () => {
      sandbox.createContext(extension);
      sandbox.clearAll();
      expect(sandbox.getContextCount()).toBe(0);
    });
  });

  describe('Configuration', () => {
    it('should get configuration', () => {
      const config = sandbox.getConfig();
      expect(config.maxMemory).toBeDefined();
      expect(config.maxExecutionTime).toBeDefined();
    });

    it('should use custom configuration', () => {
      const customSandbox = new ExtensionSandbox({
        maxMemory: 512 * 1024 * 1024,
        maxExecutionTime: 60000,
      });
      const config = customSandbox.getConfig();
      expect(config.maxMemory).toBe(512 * 1024 * 1024);
      expect(config.maxExecutionTime).toBe(60000);
    });
  });
});
