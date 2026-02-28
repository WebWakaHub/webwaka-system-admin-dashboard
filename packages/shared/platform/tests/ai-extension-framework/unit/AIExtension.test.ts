import { AIExtension, AIExtensionConfig } from '../../../src/ai-extension-framework/AIExtension';

describe('AIExtension', () => {
  let extension: AIExtension;

  beforeEach(() => {
    extension = new AIExtension('test-extension', '1.0.0');
  });

  describe('Constructor', () => {
    it('should create extension with string constructor', () => {
      const ext = new AIExtension('my-extension', '2.0.0');
      expect(ext.getId()).toBe('my-extension');
      expect(ext.getVersion()).toBe('2.0.0');
      expect(ext.getName()).toBe('my-extension');
    });

    it('should create extension with config object', () => {
      const config: AIExtensionConfig = {
        id: 'config-extension',
        version: '1.5.0',
        name: 'Config Extension',
        description: 'A test extension',
      };
      const ext = new AIExtension(config);
      expect(ext.getId()).toBe('config-extension');
      expect(ext.getVersion()).toBe('1.5.0');
      expect(ext.getName()).toBe('Config Extension');
      expect(ext.getDescription()).toBe('A test extension');
    });
  });

  describe('Getters', () => {
    it('should return extension ID', () => {
      expect(extension.getId()).toBe('test-extension');
    });

    it('should return extension version', () => {
      expect(extension.getVersion()).toBe('1.0.0');
    });

    it('should return extension name', () => {
      expect(extension.getName()).toBe('test-extension');
    });

    it('should return extension description', () => {
      expect(extension.getDescription()).toBe('');
    });
  });

  describe('Enabled State', () => {
    it('should be disabled by default', () => {
      expect(extension.isExtensionEnabled()).toBe(false);
    });

    it('should be enabled after onEnable', async () => {
      await extension.onEnable();
      expect(extension.isExtensionEnabled()).toBe(true);
    });

    it('should be disabled after onDisable', async () => {
      await extension.onEnable();
      await extension.onDisable();
      expect(extension.isExtensionEnabled()).toBe(false);
    });
  });

  describe('AI Gateway', () => {
    it('should set AI gateway', () => {
      const mockGateway = { test: 'gateway' };
      extension.setAIGateway(mockGateway);
      expect(extension.ai).toBe(mockGateway);
    });
  });

  describe('Event Subscription', () => {
    it('should subscribe to events', () => {
      const handler = jest.fn();
      extension.subscribe('test.event', handler);
      expect(extension['subscriptions'].has('test.event')).toBe(true);
    });

    it('should unsubscribe from events', () => {
      const handler = jest.fn();
      extension.subscribe('test.event', handler);
      extension.unsubscribe('test.event');
      expect(extension['subscriptions'].has('test.event')).toBe(false);
    });

    it('should emit events', () => {
      const handler = jest.fn();
      extension.subscribe('test.event', handler);
      extension.emit('test.event', { data: 'test' });
      expect(handler).toHaveBeenCalledWith({ data: 'test' });
    });
  });

  describe('Lifecycle Hooks', () => {
    it('should call onInstall', async () => {
      const spy = jest.spyOn(extension, 'onInstall');
      await extension.onInstall();
      expect(spy).toHaveBeenCalled();
    });

    it('should call onUninstall', async () => {
      const spy = jest.spyOn(extension, 'onUninstall');
      await extension.onUninstall();
      expect(spy).toHaveBeenCalled();
    });

    it('should call onEnable', async () => {
      const spy = jest.spyOn(extension, 'onEnable');
      await extension.onEnable();
      expect(spy).toHaveBeenCalled();
    });

    it('should call onDisable', async () => {
      const spy = jest.spyOn(extension, 'onDisable');
      await extension.onDisable();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('Metadata', () => {
    it('should return extension metadata', () => {
      const metadata = extension.getMetadata();
      expect(metadata.id).toBe('test-extension');
      expect(metadata.version).toBe('1.0.0');
      expect(metadata.name).toBe('test-extension');
      expect(metadata.enabled).toBe(false);
      expect(Array.isArray(metadata.subscriptions)).toBe(true);
    });

    it('should include subscriptions in metadata', () => {
      const handler = jest.fn();
      extension.subscribe('event1', handler);
      extension.subscribe('event2', handler);
      const metadata = extension.getMetadata();
      expect(metadata.subscriptions).toContain('event1');
      expect(metadata.subscriptions).toContain('event2');
    });
  });
});
