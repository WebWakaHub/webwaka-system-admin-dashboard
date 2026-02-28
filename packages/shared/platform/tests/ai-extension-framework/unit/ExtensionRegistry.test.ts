import { ExtensionRegistry } from '../../../src/ai-extension-framework/registry/ExtensionRegistry';
import { AIExtension } from '../../../src/ai-extension-framework/AIExtension';
import { ExtensionNotFoundError, ExtensionAlreadyInstalledError } from '../../../src/ai-extension-framework/errors/AIExtensionError';

describe('ExtensionRegistry', () => {
  let registry: ExtensionRegistry;
  let extension: AIExtension;

  beforeEach(() => {
    registry = new ExtensionRegistry();
    extension = new AIExtension('test-extension', '1.0.0');
  });

  describe('Registration', () => {
    it('should register an extension', () => {
      registry.register(extension);
      expect(registry.has('test-extension')).toBe(true);
    });

    it('should throw error when registering duplicate', () => {
      registry.register(extension);
      expect(() => registry.register(extension)).toThrow(ExtensionAlreadyInstalledError);
    });

    it('should create metadata on registration', () => {
      registry.register(extension);
      const metadata = registry.getMetadata('test-extension');
      expect(metadata.id).toBe('test-extension');
      expect(metadata.version).toBe('1.0.0');
      expect(metadata.enabled).toBe(false);
    });
  });

  describe('Unregistration', () => {
    it('should unregister an extension', () => {
      registry.register(extension);
      registry.unregister('test-extension');
      expect(registry.has('test-extension')).toBe(false);
    });

    it('should throw error when unregistering non-existent', () => {
      expect(() => registry.unregister('non-existent')).toThrow(ExtensionNotFoundError);
    });
  });

  describe('Retrieval', () => {
    it('should get an extension', () => {
      registry.register(extension);
      const retrieved = registry.get('test-extension');
      expect(retrieved.getId()).toBe('test-extension');
    });

    it('should throw error when getting non-existent', () => {
      expect(() => registry.get('non-existent')).toThrow(ExtensionNotFoundError);
    });

    it('should get all extensions', () => {
      registry.register(extension);
      const ext2 = new AIExtension('ext2', '1.0.0');
      registry.register(ext2);
      const all = registry.getAll();
      expect(all.length).toBe(2);
    });

    it('should check if extension exists', () => {
      registry.register(extension);
      expect(registry.has('test-extension')).toBe(true);
      expect(registry.has('non-existent')).toBe(false);
    });
  });

  describe('Enabled Extensions', () => {
    it('should get enabled extensions', () => {
      registry.register(extension);
      extension.onEnable();
      const enabled = registry.getEnabled();
      expect(enabled.length).toBe(1);
    });

    it('should not include disabled extensions', () => {
      registry.register(extension);
      const enabled = registry.getEnabled();
      expect(enabled.length).toBe(0);
    });
  });

  describe('Metadata Management', () => {
    it('should get metadata', () => {
      registry.register(extension);
      const metadata = registry.getMetadata('test-extension');
      expect(metadata.id).toBe('test-extension');
    });

    it('should update metadata', () => {
      registry.register(extension);
      registry.updateMetadata('test-extension', { enabled: true });
      const metadata = registry.getMetadata('test-extension');
      expect(metadata.enabled).toBe(true);
    });

    it('should throw error when updating non-existent', () => {
      expect(() => registry.updateMetadata('non-existent', { enabled: true })).toThrow(ExtensionNotFoundError);
    });
  });

  describe('Statistics', () => {
    it('should count extensions', () => {
      registry.register(extension);
      expect(registry.count()).toBe(1);
    });

    it('should clear all extensions', () => {
      registry.register(extension);
      registry.clear();
      expect(registry.count()).toBe(0);
    });
  });
});
