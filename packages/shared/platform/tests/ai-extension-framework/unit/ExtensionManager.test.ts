import { ExtensionManager } from '../../../src/ai-extension-framework/manager/ExtensionManager';
import { AIExtension } from '../../../src/ai-extension-framework/AIExtension';
import { ExtensionNotFoundError } from '../../../src/ai-extension-framework/errors/AIExtensionError';

describe('ExtensionManager', () => {
  let manager: ExtensionManager;
  let extension: AIExtension;

  beforeEach(() => {
    manager = new ExtensionManager();
    extension = new AIExtension('test-extension', '1.0.0');
  });

  describe('Installation', () => {
    it('should install an extension', async () => {
      await manager.install(extension);
      expect(manager.isInstalled('test-extension')).toBe(true);
    });

    it('should call onInstall lifecycle hook', async () => {
      const spy = jest.spyOn(extension, 'onInstall');
      await manager.install(extension);
      expect(spy).toHaveBeenCalled();
    });

    it('should create extension state', async () => {
      await manager.install(extension);
      const state = manager.getState('test-extension');
      expect(state.extensionId).toBe('test-extension');
      expect(state.installed).toBe(true);
      expect(state.enabled).toBe(false);
    });

    it('should throw error when installing duplicate extension', async () => {
      await manager.install(extension);
      await expect(manager.install(extension)).rejects.toThrow();
    });
  });

  describe('Uninstallation', () => {
    it('should uninstall an extension', async () => {
      await manager.install(extension);
      await manager.uninstall('test-extension');
      expect(manager.isInstalled('test-extension')).toBe(false);
    });

    it('should call onUninstall lifecycle hook', async () => {
      await manager.install(extension);
      const spy = jest.spyOn(extension, 'onUninstall');
      await manager.uninstall('test-extension');
      expect(spy).toHaveBeenCalled();
    });

    it('should disable extension before uninstalling', async () => {
      await manager.install(extension);
      await manager.enable('test-extension');
      await manager.uninstall('test-extension');
      expect(manager.isInstalled('test-extension')).toBe(false);
    });

    it('should throw error when uninstalling non-existent extension', async () => {
      await expect(manager.uninstall('non-existent')).rejects.toThrow(ExtensionNotFoundError);
    });
  });

  describe('Enablement', () => {
    it('should enable an extension', async () => {
      await manager.install(extension);
      await manager.enable('test-extension');
      expect(manager.isEnabled('test-extension')).toBe(true);
    });

    it('should call onEnable lifecycle hook', async () => {
      await manager.install(extension);
      const spy = jest.spyOn(extension, 'onEnable');
      await manager.enable('test-extension');
      expect(spy).toHaveBeenCalled();
    });

    it('should update extension state', async () => {
      await manager.install(extension);
      await manager.enable('test-extension');
      const state = manager.getState('test-extension');
      expect(state.enabled).toBe(true);
      expect(state.enabledAt).toBeDefined();
    });

    it('should throw error when enabling non-existent extension', async () => {
      await expect(manager.enable('non-existent')).rejects.toThrow(ExtensionNotFoundError);
    });
  });

  describe('Disablement', () => {
    it('should disable an extension', async () => {
      await manager.install(extension);
      await manager.enable('test-extension');
      await manager.disable('test-extension');
      expect(manager.isEnabled('test-extension')).toBe(false);
    });

    it('should call onDisable lifecycle hook', async () => {
      await manager.install(extension);
      await manager.enable('test-extension');
      const spy = jest.spyOn(extension, 'onDisable');
      await manager.disable('test-extension');
      expect(spy).toHaveBeenCalled();
    });

    it('should throw error when disabling non-existent extension', async () => {
      await expect(manager.disable('non-existent')).rejects.toThrow(ExtensionNotFoundError);
    });
  });

  describe('State Management', () => {
    it('should get extension state', async () => {
      await manager.install(extension);
      const state = manager.getState('test-extension');
      expect(state.extensionId).toBe('test-extension');
    });

    it('should get all states', async () => {
      await manager.install(extension);
      const ext2 = new AIExtension('ext2', '1.0.0');
      await manager.install(ext2);
      const states = manager.getAllStates();
      expect(states.length).toBe(2);
    });

    it('should throw error when getting non-existent state', () => {
      expect(() => manager.getState('non-existent')).toThrow(ExtensionNotFoundError);
    });
  });

  describe('Registry Access', () => {
    it('should return registry', () => {
      const registry = manager.getRegistry();
      expect(registry).toBeDefined();
    });
  });

  describe('Statistics', () => {
    it('should count installed extensions', async () => {
      await manager.install(extension);
      expect(manager.getInstalledCount()).toBe(1);
    });

    it('should count enabled extensions', async () => {
      await manager.install(extension);
      await manager.enable('test-extension');
      expect(manager.getEnabledCount()).toBe(1);
    });
  });
});
