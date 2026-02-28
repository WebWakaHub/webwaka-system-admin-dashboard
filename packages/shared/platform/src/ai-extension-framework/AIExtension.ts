/**
 * AIExtension - Base class for all AI extensions
 * Provides lifecycle management and event handling
 */

import { EventEmitter } from 'events';

export interface AIExtensionConfig {
  id: string;
  version: string;
  name?: string;
  description?: string;
}

export class AIExtension {
  protected id: string;
  protected version: string;
  protected name: string;
  protected description: string;
  protected eventEmitter: EventEmitter;
  protected subscriptions: Map<string, Function>;
  protected aiGateway: any;
  protected isEnabled: boolean;

  constructor(config: AIExtensionConfig | string, version?: string) {
    if (typeof config === 'string') {
      this.id = config;
      this.version = version || '1.0.0';
      this.name = config;
      this.description = '';
    } else {
      this.id = config.id;
      this.version = config.version;
      this.name = config.name || config.id;
      this.description = config.description || '';
    }

    this.eventEmitter = new EventEmitter();
    this.subscriptions = new Map();
    this.isEnabled = false;
  }

  /**
   * Get extension ID
   */
  getId(): string {
    return this.id;
  }

  /**
   * Get extension version
   */
  getVersion(): string {
    return this.version;
  }

  /**
   * Get extension name
   */
  getName(): string {
    return this.name;
  }

  /**
   * Get extension description
   */
  getDescription(): string {
    return this.description;
  }

  /**
   * Check if extension is enabled
   */
  isExtensionEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Set AI gateway for accessing AI services
   */
  setAIGateway(gateway: any): void {
    this.aiGateway = gateway;
  }

  /**
   * Get AI gateway
   */
  get ai(): any {
    return this.aiGateway;
  }

  /**
   * Subscribe to a platform event
   */
  subscribe(eventType: string, handler: Function): void {
    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, handler);
      this.eventEmitter.on(eventType, handler as any);
    }
  }

  /**
   * Unsubscribe from a platform event
   */
  unsubscribe(eventType: string): void {
    const handler = this.subscriptions.get(eventType);
    if (handler) {
      this.eventEmitter.removeListener(eventType, handler as any);
      this.subscriptions.delete(eventType);
    }
  }

  /**
   * Emit an event to the platform
   */
  emit(eventType: string, data: any): void {
    this.eventEmitter.emit(eventType, data);
  }

  /**
   * Lifecycle hook: called when extension is installed
   */
  async onInstall(): Promise<void> {
    // Override in subclass
  }

  /**
   * Lifecycle hook: called when extension is uninstalled
   */
  async onUninstall(): Promise<void> {
    // Override in subclass
  }

  /**
   * Lifecycle hook: called when extension is enabled
   */
  async onEnable(): Promise<void> {
    this.isEnabled = true;
    // Override in subclass
  }

  /**
   * Lifecycle hook: called when extension is disabled
   */
  async onDisable(): Promise<void> {
    this.isEnabled = false;
    // Override in subclass
  }

  /**
   * Get extension metadata
   */
  getMetadata(): any {
    return {
      id: this.id,
      version: this.version,
      name: this.name,
      description: this.description,
      enabled: this.isEnabled,
      subscriptions: Array.from(this.subscriptions.keys()),
    };
  }
}
