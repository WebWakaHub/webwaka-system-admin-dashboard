/**
 * ExtensionManager - Manages the lifecycle of AI extensions
 */

import { AIExtension } from '../AIExtension';
import { ExtensionRegistry } from '../registry/ExtensionRegistry';
import { ExtensionNotFoundError, ExtensionNotEnabledError } from '../errors/AIExtensionError';

export interface ExtensionState {
  extensionId: string;
  installed: boolean;
  enabled: boolean;
  installedAt: Date;
  enabledAt?: Date;
}

export class ExtensionManager {
  private registry: ExtensionRegistry;
  private states: Map<string, ExtensionState>;

  constructor() {
    this.registry = new ExtensionRegistry();
    this.states = new Map();
  }

  /**
   * Install an extension
   */
  async install(extension: AIExtension): Promise<void> {
    const extensionId = extension.getId();

    // Register the extension
    this.registry.register(extension);

    // Call onInstall lifecycle hook
    await extension.onInstall();

    // Create state entry
    this.states.set(extensionId, {
      extensionId,
      installed: true,
      enabled: false,
      installedAt: new Date(),
    });
  }

  /**
   * Uninstall an extension
   */
  async uninstall(extensionId: string): Promise<void> {
    const extension = this.registry.get(extensionId);

    // Disable if enabled
    if (extension.isExtensionEnabled()) {
      await this.disable(extensionId);
    }

    // Call onUninstall lifecycle hook
    await extension.onUninstall();

    // Unregister the extension
    this.registry.unregister(extensionId);
    this.states.delete(extensionId);
  }

  /**
   * Enable an extension
   */
  async enable(extensionId: string): Promise<void> {
    const extension = this.registry.get(extensionId);
    const state = this.states.get(extensionId);

    if (!state) {
      throw new ExtensionNotFoundError(extensionId);
    }

    // Call onEnable lifecycle hook
    await extension.onEnable();

    // Update state
    state.enabled = true;
    state.enabledAt = new Date();
  }

  /**
   * Disable an extension
   */
  async disable(extensionId: string): Promise<void> {
    const extension = this.registry.get(extensionId);
    const state = this.states.get(extensionId);

    if (!state) {
      throw new ExtensionNotFoundError(extensionId);
    }

    // Call onDisable lifecycle hook
    await extension.onDisable();

    // Update state
    state.enabled = false;
  }

  /**
   * Get extension state
   */
  getState(extensionId: string): ExtensionState {
    const state = this.states.get(extensionId);
    if (!state) {
      throw new ExtensionNotFoundError(extensionId);
    }
    return state;
  }

  /**
   * Get all extension states
   */
  getAllStates(): ExtensionState[] {
    return Array.from(this.states.values());
  }

  /**
   * Get registry
   */
  getRegistry(): ExtensionRegistry {
    return this.registry;
  }

  /**
   * Check if extension is installed
   */
  isInstalled(extensionId: string): boolean {
    return this.registry.has(extensionId);
  }

  /**
   * Check if extension is enabled
   */
  isEnabled(extensionId: string): boolean {
    const extension = this.registry.get(extensionId);
    return extension.isExtensionEnabled();
  }

  /**
   * Get installed extensions count
   */
  getInstalledCount(): number {
    return this.registry.count();
  }

  /**
   * Get enabled extensions count
   */
  getEnabledCount(): number {
    return this.registry.getEnabled().length;
  }
}
