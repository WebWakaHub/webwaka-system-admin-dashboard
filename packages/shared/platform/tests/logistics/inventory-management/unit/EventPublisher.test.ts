/**
 * Event Publisher Unit Tests
 * 
 * Tests for event publishing and validation
 */

import { EventPublisher } from '../../../../src/logistics/inventory-management/events/EventPublisher';
import { InventoryStockLevelChangedEvent } from '../../../../src/logistics/inventory-management/types';

describe('EventPublisher', () => {
  let eventPublisher: EventPublisher;
  let mockEventBus: any;

  beforeEach(() => {
    mockEventBus = {
      publish: jest.fn().mockResolvedValue(undefined),
      publishBatch: jest.fn().mockResolvedValue(undefined)
    };

    eventPublisher = new EventPublisher(mockEventBus);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('publish', () => {
    it('should publish event successfully', async () => {
      const event: InventoryStockLevelChangedEvent = {
        eventType: 'inventory.stock_level_changed',
        eventId: 'evt-001',
        timestamp: new Date(),
        tenantId: 'tenant-001',
        data: {
          sku: 'SKU-12345',
          location_id: 'LOC-001',
          previous_on_hand: 100,
          new_on_hand: 150,
          previous_available: 85,
          new_available: 135,
          change_quantity: 50,
          change_reason: 'receipt',
          movement_id: 'MOV-001'
        }
      };

      await eventPublisher.publish(event);

      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'inventory.events',
        'inventory.stock_level_changed',
        event
      );
    });

    it('should throw error if event type is missing', async () => {
      const event: any = {
        eventId: 'evt-001',
        timestamp: new Date(),
        tenantId: 'tenant-001',
        data: {}
      };

      await expect(eventPublisher.publish(event)).rejects.toThrow('Event type is required');
    });

    it('should throw error if event ID is missing', async () => {
      const event: any = {
        eventType: 'inventory.stock_level_changed',
        timestamp: new Date(),
        tenantId: 'tenant-001',
        data: {}
      };

      await expect(eventPublisher.publish(event)).rejects.toThrow('Event ID is required');
    });

    it('should throw error if tenant ID is missing', async () => {
      const event: any = {
        eventType: 'inventory.stock_level_changed',
        eventId: 'evt-001',
        timestamp: new Date(),
        data: {}
      };

      await expect(eventPublisher.publish(event)).rejects.toThrow('Event tenant ID is required');
    });

    it('should throw error if event data is missing required fields', async () => {
      const event: any = {
        eventType: 'inventory.stock_level_changed',
        eventId: 'evt-001',
        timestamp: new Date(),
        tenantId: 'tenant-001',
        data: {
          // Missing required fields
        }
      };

      await expect(eventPublisher.publish(event)).rejects.toThrow('SKU is required');
    });
  });

  describe('publishBatch', () => {
    it('should publish batch of events successfully', async () => {
      const events: InventoryStockLevelChangedEvent[] = [
        {
          eventType: 'inventory.stock_level_changed',
          eventId: 'evt-001',
          timestamp: new Date(),
          tenantId: 'tenant-001',
          data: {
            sku: 'SKU-12345',
            location_id: 'LOC-001',
            previous_on_hand: 100,
            new_on_hand: 150,
            previous_available: 85,
            new_available: 135,
            change_quantity: 50,
            change_reason: 'receipt',
            movement_id: 'MOV-001'
          }
        },
        {
          eventType: 'inventory.stock_level_changed',
          eventId: 'evt-002',
          timestamp: new Date(),
          tenantId: 'tenant-001',
          data: {
            sku: 'SKU-67890',
            location_id: 'LOC-001',
            previous_on_hand: 50,
            new_on_hand: 75,
            previous_available: 40,
            new_available: 65,
            change_quantity: 25,
            change_reason: 'receipt',
            movement_id: 'MOV-002'
          }
        }
      ];

      await eventPublisher.publishBatch(events);

      expect(mockEventBus.publishBatch).toHaveBeenCalledWith('inventory.events', events);
    });

    it('should throw error if any event in batch is invalid', async () => {
      const events: any[] = [
        {
          eventType: 'inventory.stock_level_changed',
          eventId: 'evt-001',
          timestamp: new Date(),
          tenantId: 'tenant-001',
          data: {
            sku: 'SKU-12345',
            location_id: 'LOC-001',
            previous_on_hand: 100,
            new_on_hand: 150,
            previous_available: 85,
            new_available: 135,
            change_quantity: 50,
            change_reason: 'receipt',
            movement_id: 'MOV-001'
          }
        },
        {
          eventType: 'inventory.stock_level_changed',
          eventId: 'evt-002',
          timestamp: new Date(),
          tenantId: 'tenant-001',
          data: {
            // Missing required fields
          }
        }
      ];

      await expect(eventPublisher.publishBatch(events)).rejects.toThrow('SKU is required');
    });
  });

  describe('queueEvent and flushQueue', () => {
    it('should queue events and flush when batch size reached', async () => {
      const eventPublisherWithSmallBatch = new EventPublisher(mockEventBus);
      (eventPublisherWithSmallBatch as any).batchSize = 2;

      const event1: InventoryStockLevelChangedEvent = {
        eventType: 'inventory.stock_level_changed',
        eventId: 'evt-001',
        timestamp: new Date(),
        tenantId: 'tenant-001',
        data: {
          sku: 'SKU-12345',
          location_id: 'LOC-001',
          previous_on_hand: 100,
          new_on_hand: 150,
          previous_available: 85,
          new_available: 135,
          change_quantity: 50,
          change_reason: 'receipt',
          movement_id: 'MOV-001'
        }
      };

      const event2: InventoryStockLevelChangedEvent = {
        ...event1,
        eventId: 'evt-002'
      };

      await eventPublisherWithSmallBatch.queueEvent(event1);
      expect(mockEventBus.publishBatch).not.toHaveBeenCalled();

      await eventPublisherWithSmallBatch.queueEvent(event2);
      expect(mockEventBus.publishBatch).toHaveBeenCalledWith('inventory.events', [event1, event2]);
    });

    it('should flush queue manually', async () => {
      const event: InventoryStockLevelChangedEvent = {
        eventType: 'inventory.stock_level_changed',
        eventId: 'evt-001',
        timestamp: new Date(),
        tenantId: 'tenant-001',
        data: {
          sku: 'SKU-12345',
          location_id: 'LOC-001',
          previous_on_hand: 100,
          new_on_hand: 150,
          previous_available: 85,
          new_available: 135,
          change_quantity: 50,
          change_reason: 'receipt',
          movement_id: 'MOV-001'
        }
      };

      await eventPublisher.queueEvent(event);
      await eventPublisher.flushQueue();

      expect(mockEventBus.publishBatch).toHaveBeenCalledWith('inventory.events', [event]);
    });
  });
});
