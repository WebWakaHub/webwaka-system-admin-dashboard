/**
 * Event Emitter Utility
 * Provides a standardized way for modules to emit audit events
 */

import { AuditEvent, Actor, Action, ChangeDetails } from '../types/AuditLog';
import * as crypto from 'crypto';

/**
 * Callback type for event listeners
 */
export type EventListener = (event: AuditEvent) => Promise<void>;

/**
 * EventEmitter class
 * Provides a standardized interface for emitting audit events
 */
export class EventEmitter {
  private listeners: Set<EventListener> = new Set();

  /**
   * Subscribe to audit events
   * @param listener - The callback function to call when an event is emitted
   */
  public subscribe(listener: EventListener): void {
    this.listeners.add(listener);
  }

  /**
   * Unsubscribe from audit events
   * @param listener - The callback function to remove
   */
  public unsubscribe(listener: EventListener): void {
    this.listeners.delete(listener);
  }

  /**
   * Emit an audit event
   * @param sourceModule - The module that is emitting the event
   * @param tenantId - The tenant ID
   * @param actor - The actor performing the action
   * @param action - The action being performed
   * @param details - Optional details about the change
   */
  public async emit(
    sourceModule: string,
    tenantId: string,
    actor: Actor,
    action: Action,
    details?: ChangeDetails
  ): Promise<void> {
    const event: AuditEvent = {
      eventType: 'audit.action.performed',
      eventId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      sourceModule,
      tenantId,
      actor,
      action,
      details,
      traceId: crypto.randomUUID(),
    };

    // Notify all listeners
    const promises = Array.from(this.listeners).map((listener) => listener(event));
    await Promise.all(promises);
  }

  /**
   * Get the number of listeners
   */
  public getListenerCount(): number {
    return this.listeners.size;
  }
}

/**
 * Global event emitter instance
 */
export const globalEventEmitter = new EventEmitter();
