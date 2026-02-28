/**
 * Event Publisher
 * 
 * Publishes inventory events to event bus for event-driven architecture
 * Implements IEventPublisher interface
 */

import { IEventPublisher, InventoryEvent } from '../types';

export class EventPublisher implements IEventPublisher {
  private eventBus: any; // Replace with actual event bus client (RabbitMQ, etc.)
  private batchSize: number = 100;
  private eventQueue: InventoryEvent[] = [];

  constructor(eventBus?: any) {
    this.eventBus = eventBus;
  }

  /**
   * Publish single event
   */
  async publish(event: InventoryEvent): Promise<void> {
    // Validate event schema
    this.validateEvent(event);

    // Publish to event bus
    if (this.eventBus) {
      try {
        await this.eventBus.publish('inventory.events', event.eventType, event);
      } catch (error) {
        console.error('Failed to publish event:', error);
        // TODO: Implement retry logic with exponential backoff
        throw error;
      }
    } else {
      // If no event bus configured, log event (development mode)
      console.log('[EVENT]', event.eventType, event);
    }
  }

  /**
   * Publish batch of events (for performance optimization)
   */
  async publishBatch(events: InventoryEvent[]): Promise<void> {
    // Validate all events
    for (const event of events) {
      this.validateEvent(event);
    }

    // Publish batch to event bus
    if (this.eventBus) {
      try {
        await this.eventBus.publishBatch('inventory.events', events);
      } catch (error) {
        console.error('Failed to publish batch:', error);
        // TODO: Implement retry logic with exponential backoff
        throw error;
      }
    } else {
      // If no event bus configured, log events (development mode)
      console.log('[EVENT BATCH]', events.length, 'events');
      for (const event of events) {
        console.log('[EVENT]', event.eventType, event);
      }
    }
  }

  /**
   * Queue event for batch publishing
   */
  async queueEvent(event: InventoryEvent): Promise<void> {
    this.eventQueue.push(event);

    // Auto-flush when batch size reached
    if (this.eventQueue.length >= this.batchSize) {
      await this.flushQueue();
    }
  }

  /**
   * Flush queued events
   */
  async flushQueue(): Promise<void> {
    if (this.eventQueue.length === 0) {
      return;
    }

    const events = [...this.eventQueue];
    this.eventQueue = [];

    await this.publishBatch(events);
  }

  /**
   * Validate event schema
   */
  private validateEvent(event: InventoryEvent): void {
    if (!event.eventType) {
      throw new Error('Event type is required');
    }

    if (!event.eventId) {
      throw new Error('Event ID is required');
    }

    if (!event.timestamp) {
      throw new Error('Event timestamp is required');
    }

    if (!event.tenantId) {
      throw new Error('Event tenant ID is required');
    }

    if (!event.data) {
      throw new Error('Event data is required');
    }

    // Validate event-specific schema
    switch (event.eventType) {
      case 'inventory.stock_level_changed':
        this.validateStockLevelChangedEvent(event);
        break;
      case 'inventory.low_stock_alert':
        this.validateLowStockAlertEvent(event);
        break;
      case 'inventory.reconciliation_completed':
        this.validateReconciliationCompletedEvent(event);
        break;
      case 'inventory.batch_expiring_soon':
        this.validateBatchExpiringSoonEvent(event);
        break;
      default:
        throw new Error(`Unknown event type: ${event.eventType}`);
    }
  }

  private validateStockLevelChangedEvent(event: InventoryEvent): void {
    const data = event.data as any;
    if (!data.sku) throw new Error('SKU is required');
    if (!data.location_id) throw new Error('Location ID is required');
    if (data.new_on_hand === undefined) throw new Error('New on_hand is required');
    if (data.new_available === undefined) throw new Error('New available is required');
  }

  private validateLowStockAlertEvent(event: InventoryEvent): void {
    const data = event.data as any;
    if (!data.sku) throw new Error('SKU is required');
    if (!data.location_id) throw new Error('Location ID is required');
    if (data.current_stock === undefined) throw new Error('Current stock is required');
    if (data.reorder_point === undefined) throw new Error('Reorder point is required');
  }

  private validateReconciliationCompletedEvent(event: InventoryEvent): void {
    const data = event.data as any;
    if (!data.reconciliation_id) throw new Error('Reconciliation ID is required');
    if (!data.location_id) throw new Error('Location ID is required');
  }

  private validateBatchExpiringSoonEvent(event: InventoryEvent): void {
    const data = event.data as any;
    if (!data.sku) throw new Error('SKU is required');
    if (!data.batch_number) throw new Error('Batch number is required');
    if (!data.expiry_date) throw new Error('Expiry date is required');
  }
}
