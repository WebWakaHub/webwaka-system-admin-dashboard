/**
 * AIExtensionFramework - Main orchestrator for the AI-Extension Framework
 */

import { AIExtension } from './AIExtension';
import { ExtensionManager } from './manager/ExtensionManager';
import { ExtensionSandbox } from './sandbox/ExtensionSandbox';
import { AIServiceGateway } from './gateway/AIServiceGateway';
import { EventBusBridge } from './bridge/EventBusBridge';

export interface FrameworkConfig {
  sandboxConfig?: any;
  defaultAIProvider?: string;
}

export class AIExtensionFramework {
  private manager: ExtensionManager;
  private sandbox: ExtensionSandbox;
  private aiGateway: AIServiceGateway;
  private eventBridge: EventBusBridge;
  private isInitialized: boolean;

  constructor(config: FrameworkConfig = {}) {
    this.manager = new ExtensionManager();
    this.sandbox = new ExtensionSandbox(config.sandboxConfig);
    this.aiGateway = new AIServiceGateway(config.defaultAIProvider);
    this.eventBridge = new EventBusBridge();
    this.isInitialized = false;
  }

  /**
   * Initialize the framework
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    // Set up AI gateway for extensions
    // This would be done when extensions are enabled

    this.isInitialized = true;
  }

  /**
   * Install an extension
   */
  async installExtension(extension: AIExtension): Promise<void> {
    // Create sandbox context
    this.sandbox.createContext(extension);

    // Set AI gateway
    extension.setAIGateway(this.aiGateway);

    // Install through manager
    await this.manager.install(extension);
  }

  /**
   * Uninstall an extension
   */
  async uninstallExtension(extensionId: string): Promise<void> {
    // Remove event listeners
    this.eventBridge.removeExtensionListeners(extensionId);

    // Destroy sandbox context
    this.sandbox.destroyContext(extensionId);

    // Uninstall through manager
    await this.manager.uninstall(extensionId);
  }

  /**
   * Enable an extension
   */
  async enableExtension(extensionId: string): Promise<void> {
    const extension = this.manager.getRegistry().get(extensionId);

    // Enable through manager
    await this.manager.enable(extensionId);

    // Subscribe to events if extension has subscriptions
    // This is handled in the extension's onEnable method
  }

  /**
   * Disable an extension
   */
  async disableExtension(extensionId: string): Promise<void> {
    const extension = this.manager.getRegistry().get(extensionId);

    // Disable through manager
    await this.manager.disable(extensionId);

    // Unsubscribe from events
    this.eventBridge.removeExtensionListeners(extensionId);
  }

  /**
   * Subscribe an extension to a platform event
   */
  subscribeExtensionToEvent(extension: AIExtension, eventType: string, handler: Function): void {
    this.eventBridge.subscribe(extension, eventType, handler);
  }

  /**
   * Unsubscribe an extension from a platform event
   */
  unsubscribeExtensionFromEvent(extension: AIExtension, eventType: string): void {
    this.eventBridge.unsubscribe(extension, eventType);
  }

  /**
   * Emit an event from an extension
   */
  emitFromExtension(extension: AIExtension, eventType: string, data: any): void {
    this.eventBridge.emitFromExtension(extension, eventType, data);
  }

  /**
   * Emit an event to the platform
   */
  emitEvent(eventType: string, data: any): void {
    this.eventBridge.emit(eventType, data);
  }

  /**
   * Execute a function within an extension's sandbox
   */
  async executeInSandbox<T>(extensionId: string, fn: () => Promise<T>): Promise<T> {
    return this.sandbox.execute(extensionId, fn);
  }

  /**
   * Get extension manager
   */
  getManager(): ExtensionManager {
    return this.manager;
  }

  /**
   * Get extension sandbox
   */
  getSandbox(): ExtensionSandbox {
    return this.sandbox;
  }

  /**
   * Get AI service gateway
   */
  getAIGateway(): AIServiceGateway {
    return this.aiGateway;
  }

  /**
   * Get event bus bridge
   */
  getEventBridge(): EventBusBridge {
    return this.eventBridge;
  }

  /**
   * Get framework status
   */
  getStatus(): any {
    return {
      initialized: this.isInitialized,
      installedExtensions: this.manager.getInstalledCount(),
      enabledExtensions: this.manager.getEnabledCount(),
      sandboxContexts: this.sandbox.getContextCount(),
      aiProviders: this.aiGateway.getProviders(),
      eventListeners: this.eventBridge.getAllEvents(),
    };
  }

  /**
   * Shutdown the framework
   */
  async shutdown(): Promise<void> {
    // Disable all enabled extensions
    const states = this.manager.getAllStates();
    for (const state of states) {
      if (state.enabled) {
        await this.manager.disable(state.extensionId);
      }
    }

    // Clear all listeners
    this.eventBridge.clearAll();

    // Clear all sandbox contexts
    this.sandbox.clearAll();

    this.isInitialized = false;
  }
}
