/**
 * EventBusBridge - Connects AI extensions to the platform's event bus
 */

import { EventEmitter } from 'events';
import { AIExtension } from '../AIExtension';

export interface BridgeConfig {
  maxListeners?: number;
}

export class EventBusBridge {
  private eventBus: EventEmitter;
  private extensionListeners: Map<string, Map<string, Function>>;
  private config: BridgeConfig;

  constructor(config: BridgeConfig = {}) {
    this.eventBus = new EventEmitter();
    this.extensionListeners = new Map();
    this.config = {
      maxListeners: config.maxListeners || 100,
    };

    this.eventBus.setMaxListeners(this.config.maxListeners!);
  }

  /**
   * Subscribe an extension to a platform event
   */
  subscribe(extension: AIExtension, eventType: string, handler: Function): void {
    const extensionId = extension.getId();

    // Create extension listener map if not exists
    if (!this.extensionListeners.has(extensionId)) {
      this.extensionListeners.set(extensionId, new Map());
    }

    const listeners = this.extensionListeners.get(extensionId)!;

    // Store the handler
    listeners.set(eventType, handler);

    // Subscribe to event bus
    this.eventBus.on(eventType, handler as any);
  }

  /**
   * Unsubscribe an extension from a platform event
   */
  unsubscribe(extension: AIExtension, eventType: string): void {
    const extensionId = extension.getId();
    const listeners = this.extensionListeners.get(extensionId);

    if (!listeners) {
      return;
    }

    const handler = listeners.get(eventType);
    if (handler) {
      this.eventBus.removeListener(eventType, handler as any);
      listeners.delete(eventType);
    }
  }

  /**
   * Emit an event to the platform event bus
   */
  emit(eventType: string, data: any): void {
    this.eventBus.emit(eventType, data);
  }

  /**
   * Emit an event from an extension
   */
  emitFromExtension(extension: AIExtension, eventType: string, data: any): void {
    // Add extension context to event data
    const enrichedData = {
      ...data,
      source: {
        type: 'extension',
        extensionId: extension.getId(),
        extensionName: extension.getName(),
      },
    };

    this.emit(eventType, enrichedData);
  }

  /**
   * Get all listeners for an extension
   */
  getExtensionListeners(extensionId: string): string[] {
    const listeners = this.extensionListeners.get(extensionId);
    return listeners ? Array.from(listeners.keys()) : [];
  }

  /**
   * Get all extensions listening to an event
   */
  getEventListeners(eventType: string): string[] {
    const extensionIds: string[] = [];

    for (const [extensionId, listeners] of this.extensionListeners) {
      if (listeners.has(eventType)) {
        extensionIds.push(extensionId);
      }
    }

    return extensionIds;
  }

  /**
   * Remove all listeners for an extension
   */
  removeExtensionListeners(extensionId: string): void {
    const listeners = this.extensionListeners.get(extensionId);

    if (!listeners) {
      return;
    }

    // Remove all event listeners
    for (const [eventType, handler] of listeners) {
      this.eventBus.removeListener(eventType, handler as any);
    }

    // Remove extension entry
    this.extensionListeners.delete(extensionId);
  }

  /**
   * Get event listener count
   */
  getListenerCount(eventType: string): number {
    return this.eventBus.listenerCount(eventType);
  }

  /**
   * Get all events with listeners
   */
  getAllEvents(): string[] {
    return this.eventBus.eventNames() as string[];
  }

  /**
   * Clear all listeners
   */
  clearAll(): void {
    this.eventBus.removeAllListeners();
    this.extensionListeners.clear();
  }
}
