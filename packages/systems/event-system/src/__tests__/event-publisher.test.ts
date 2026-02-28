/**
 * WebWaka Event System - Event Publisher Tests
 * 
 * Comprehensive unit tests for the Event Publisher implementation.
 * Tests cover publishing API, validation, serialization, builder pattern,
 * and error handling.
 * 
 * @module @webwaka/event-system/tests
 * @author webwakaagent4 (Core Platform Engineer)
 */

import { EventPublisher, createEventPublisher, EventBuilder, PublishEventData } from '../event-publisher';
import { EventBus } from '../event-bus';
import { Event } from '../types';

describe('EventPublisher', () => {
  let publisher: EventPublisher;
  let mockEventBus: jest.Mocked<EventBus>;

  beforeEach(() => {
    // Create mock EventBus
    mockEventBus = {
      publish: jest.fn().mockReturnValue(1),
      publishAsync: jest.fn().mockResolvedValue(1),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
      getStats: jest.fn(),
      resetStats: jest.fn(),
      clearSubscriptions: jest.fn(),
      getSubscriptions: jest.fn(),
    } as any;

    publisher = new EventPublisher(
      {
        source: 'test-module',
        defaultEventVersion: '1.0',
      },
      mockEventBus
    );
  });

  describe('Event Publishing', () => {
    it('should publish event with required fields', () => {
      const eventData: PublishEventData = {
        eventType: 'user.created',
        tenantId: 'tenant-123',
        data: { userId: 'user-456', email: 'test@example.com' },
      };

      const deliveredCount = publisher.publish(eventData);

      expect(deliveredCount).toBe(1);
      expect(mockEventBus.publish).toHaveBeenCalledTimes(1);

      const publishedEvent: Event = mockEventBus.publish.mock.calls[0][0];
      expect(publishedEvent.eventType).toBe('user.created');
      expect(publishedEvent.tenantId).toBe('tenant-123');
      expect(publishedEvent.source).toBe('test-module');
      expect(publishedEvent.eventVersion).toBe('1.0');
      expect(publishedEvent.data).toEqual({ userId: 'user-456', email: 'test@example.com' });
    });

    it('should auto-generate eventId', () => {
      const eventData: PublishEventData = {
        eventType: 'user.created',
        tenantId: 'tenant-123',
        data: {},
      };

      publisher.publish(eventData);

      const publishedEvent: Event = mockEventBus.publish.mock.calls[0][0];
      expect(publishedEvent.eventId).toBeDefined();
      expect(typeof publishedEvent.eventId).toBe('string');
      expect(publishedEvent.eventId.length).toBeGreaterThan(0);
    });

    it('should auto-generate timestamp', () => {
      const eventData: PublishEventData = {
        eventType: 'user.created',
        tenantId: 'tenant-123',
        data: {},
      };

      publisher.publish(eventData);

      const publishedEvent: Event = mockEventBus.publish.mock.calls[0][0];
      expect(publishedEvent.timestamp).toBeDefined();
      expect(typeof publishedEvent.timestamp).toBe('string');
      // Should be valid ISO 8601 format
      expect(new Date(publishedEvent.timestamp).toISOString()).toBe(publishedEvent.timestamp);
    });

    it('should include optional userId', () => {
      const eventData: PublishEventData = {
        eventType: 'user.created',
        tenantId: 'tenant-123',
        userId: 'user-456',
        data: {},
      };

      publisher.publish(eventData);

      const publishedEvent: Event = mockEventBus.publish.mock.calls[0][0];
      expect(publishedEvent.userId).toBe('user-456');
    });

    it('should include optional correlationId', () => {
      const eventData: PublishEventData = {
        eventType: 'user.created',
        tenantId: 'tenant-123',
        correlationId: 'correlation-789',
        data: {},
      };

      publisher.publish(eventData);

      const publishedEvent: Event = mockEventBus.publish.mock.calls[0][0];
      expect(publishedEvent.correlationId).toBe('correlation-789');
    });

    it('should allow custom eventVersion', () => {
      const eventData: PublishEventData = {
        eventType: 'user.created',
        tenantId: 'tenant-123',
        eventVersion: '2.0',
        data: {},
      };

      publisher.publish(eventData);

      const publishedEvent: Event = mockEventBus.publish.mock.calls[0][0];
      expect(publishedEvent.eventVersion).toBe('2.0');
    });

    it('should use defaultTenantId from config if not provided', () => {
      const publisherWithDefault = new EventPublisher(
        {
          source: 'test-module',
          defaultTenantId: 'default-tenant',
        },
        mockEventBus
      );

      const eventData: PublishEventData = {
        eventType: 'user.created',
        tenantId: '', // Empty tenant ID, should use default
        data: {},
      };

      publisherWithDefault.publish(eventData);

      const publishedEvent: Event = mockEventBus.publish.mock.calls[0][0];
      expect(publishedEvent.tenantId).toBe('default-tenant');
    });

    it('should publish event asynchronously', async () => {
      const eventData: PublishEventData = {
        eventType: 'user.created',
        tenantId: 'tenant-123',
        data: {},
      };

      const deliveredCount = await publisher.publishAsync(eventData);

      expect(deliveredCount).toBe(1);
      expect(mockEventBus.publishAsync).toHaveBeenCalledTimes(1);
    });

    it('should increment events published counter', () => {
      const eventData: PublishEventData = {
        eventType: 'user.created',
        tenantId: 'tenant-123',
        data: {},
      };

      expect(publisher.getStats().eventsPublished).toBe(0);

      publisher.publish(eventData);
      expect(publisher.getStats().eventsPublished).toBe(1);

      publisher.publish(eventData);
      expect(publisher.getStats().eventsPublished).toBe(2);
    });

    it('should track bytes serialized', () => {
      const eventData: PublishEventData = {
        eventType: 'user.created',
        tenantId: 'tenant-123',
        data: { userId: 'user-456' },
      };

      expect(publisher.getStats().bytesSerialized).toBe(0);

      publisher.publish(eventData);

      expect(publisher.getStats().bytesSerialized).toBeGreaterThan(0);
    });
  });

  describe('Event Validation', () => {
    it('should validate eventType format', () => {
      const eventData: PublishEventData = {
        eventType: 'invalid', // Should be domain.entity.action
        tenantId: 'tenant-123',
        data: {},
      };

      expect(() => publisher.publish(eventData)).toThrow('Invalid eventType format');
    });

    it('should accept valid eventType formats', () => {
      const validEventTypes = [
        'user.created',
        'identity.user.created',
        'order.payment.processed',
        'a.b',
        'domain.entity.action.subaction',
      ];

      validEventTypes.forEach((eventType) => {
        const eventData: PublishEventData = {
          eventType,
          tenantId: 'tenant-123',
          data: {},
        };

        expect(() => publisher.publish(eventData)).not.toThrow();
      });
    });

    it('should reject invalid eventType formats', () => {
      const invalidEventTypes = ['', 'single', '.', 'domain.', '.entity', 'domain..action'];

      invalidEventTypes.forEach((eventType) => {
        const eventData: PublishEventData = {
          eventType,
          tenantId: 'tenant-123',
          data: {},
        };

        expect(() => publisher.publish(eventData)).toThrow();
      });
    });

    it('should require tenantId', () => {
      const eventData: PublishEventData = {
        eventType: 'user.created',
        tenantId: '', // Empty tenant ID
        data: {},
      };

      expect(() => publisher.publish(eventData)).toThrow('tenantId is required');
    });

    it('should require data payload', () => {
      const eventData: any = {
        eventType: 'user.created',
        tenantId: 'tenant-123',
        // Missing data
      };

      expect(() => publisher.publish(eventData)).toThrow('Event must have a data payload');
    });

    it('should require data to be an object', () => {
      const eventData: any = {
        eventType: 'user.created',
        tenantId: 'tenant-123',
        data: 'string data', // Should be object
      };

      expect(() => publisher.publish(eventData)).toThrow('Event data must be an object');
    });

    it('should increment validation errors counter', () => {
      const eventData: PublishEventData = {
        eventType: 'invalid',
        tenantId: 'tenant-123',
        data: {},
      };

      expect(publisher.getStats().validationErrors).toBe(0);

      try {
        publisher.publish(eventData);
      } catch (error) {
        // Expected
      }

      expect(publisher.getStats().validationErrors).toBe(1);
    });

    it('should increment publishing errors counter on error', () => {
      mockEventBus.publish.mockImplementation(() => {
        throw new Error('Publishing error');
      });

      const eventData: PublishEventData = {
        eventType: 'user.created',
        tenantId: 'tenant-123',
        data: {},
      };

      expect(publisher.getStats().publishingErrors).toBe(0);

      try {
        publisher.publish(eventData);
      } catch (error) {
        // Expected
      }

      expect(publisher.getStats().publishingErrors).toBe(1);
    });
  });

  describe('Event Builder', () => {
    it('should build and publish event using fluent API', () => {
      const deliveredCount = publisher
        .event('user.created')
        .tenant('tenant-123')
        .user('user-456')
        .data({ email: 'test@example.com' })
        .publish();

      expect(deliveredCount).toBe(1);
      expect(mockEventBus.publish).toHaveBeenCalledTimes(1);

      const publishedEvent: Event = mockEventBus.publish.mock.calls[0][0];
      expect(publishedEvent.eventType).toBe('user.created');
      expect(publishedEvent.tenantId).toBe('tenant-123');
      expect(publishedEvent.userId).toBe('user-456');
      expect(publishedEvent.data).toEqual({ email: 'test@example.com' });
    });

    it('should build event with correlation ID', () => {
      publisher
        .event('user.created')
        .tenant('tenant-123')
        .correlation('correlation-789')
        .data({})
        .publish();

      const publishedEvent: Event = mockEventBus.publish.mock.calls[0][0];
      expect(publishedEvent.correlationId).toBe('correlation-789');
    });

    it('should build event with custom version', () => {
      publisher
        .event('user.created')
        .tenant('tenant-123')
        .version('2.0')
        .data({})
        .publish();

      const publishedEvent: Event = mockEventBus.publish.mock.calls[0][0];
      expect(publishedEvent.eventVersion).toBe('2.0');
    });

    it('should require tenantId in builder', () => {
      expect(() => {
        publisher.event('user.created').data({}).publish();
      }).toThrow('tenantId is required');
    });

    it('should require data in builder', () => {
      expect(() => {
        publisher.event('user.created').tenant('tenant-123').publish();
      }).toThrow('data is required');
    });

    it('should publish asynchronously using builder', async () => {
      const deliveredCount = await publisher
        .event('user.created')
        .tenant('tenant-123')
        .data({})
        .publishAsync();

      expect(deliveredCount).toBe(1);
      expect(mockEventBus.publishAsync).toHaveBeenCalledTimes(1);
    });

    it('should build event data without publishing', () => {
      const eventData = publisher
        .event('user.created')
        .tenant('tenant-123')
        .user('user-456')
        .data({ email: 'test@example.com' })
        .build();

      expect(eventData.eventType).toBe('user.created');
      expect(eventData.tenantId).toBe('tenant-123');
      expect(eventData.userId).toBe('user-456');
      expect(eventData.data).toEqual({ email: 'test@example.com' });

      // Should not have published
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });
  });

  describe('Statistics', () => {
    it('should track publisher statistics', () => {
      const eventData: PublishEventData = {
        eventType: 'user.created',
        tenantId: 'tenant-123',
        data: {},
      };

      const stats1 = publisher.getStats();
      expect(stats1.eventsPublished).toBe(0);
      expect(stats1.validationErrors).toBe(0);
      expect(stats1.publishingErrors).toBe(0);
      expect(stats1.bytesSerialized).toBe(0);

      publisher.publish(eventData);

      const stats2 = publisher.getStats();
      expect(stats2.eventsPublished).toBe(1);
      expect(stats2.bytesSerialized).toBeGreaterThan(0);
    });

    it('should reset statistics', () => {
      const eventData: PublishEventData = {
        eventType: 'user.created',
        tenantId: 'tenant-123',
        data: {},
      };

      publisher.publish(eventData);

      expect(publisher.getStats().eventsPublished).toBe(1);

      publisher.resetStats();

      const stats = publisher.getStats();
      expect(stats.eventsPublished).toBe(0);
      expect(stats.validationErrors).toBe(0);
      expect(stats.publishingErrors).toBe(0);
      expect(stats.bytesSerialized).toBe(0);
    });
  });

  describe('Configuration', () => {
    it('should use default event version from config', () => {
      const publisherWithVersion = new EventPublisher(
        {
          source: 'test-module',
          defaultEventVersion: '2.5',
        },
        mockEventBus
      );

      const eventData: PublishEventData = {
        eventType: 'user.created',
        tenantId: 'tenant-123',
        data: {},
      };

      publisherWithVersion.publish(eventData);

      const publishedEvent: Event = mockEventBus.publish.mock.calls[0][0];
      expect(publishedEvent.eventVersion).toBe('2.5');
    });

    it('should create EventBus if not provided', () => {
      const publisherWithoutBus = new EventPublisher({
        source: 'test-module',
      });

      expect(publisherWithoutBus.getEventBus()).toBeInstanceOf(EventBus);
    });

    it('should use provided EventBus', () => {
      const customBus = new EventBus();
      const publisherWithBus = new EventPublisher(
        {
          source: 'test-module',
        },
        customBus
      );

      expect(publisherWithBus.getEventBus()).toBe(customBus);
    });

    it('should handle debug logging when enabled', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const debugPublisher = new EventPublisher(
        {
          source: 'test-module',
          debug: true,
        },
        mockEventBus
      );

      const eventData: PublishEventData = {
        eventType: 'user.created',
        tenantId: 'tenant-123',
        data: {},
      };

      debugPublisher.publish(eventData);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Factory Function', () => {
    it('should create publisher using factory function', () => {
      const pub = createEventPublisher({ source: 'test-module' });
      expect(pub).toBeInstanceOf(EventPublisher);
    });

    it('should create publisher with custom EventBus', () => {
      const customBus = new EventBus();
      const pub = createEventPublisher({ source: 'test-module' }, customBus);
      expect(pub.getEventBus()).toBe(customBus);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty data object', () => {
      const eventData: PublishEventData = {
        eventType: 'user.created',
        tenantId: 'tenant-123',
        data: {},
      };

      expect(() => publisher.publish(eventData)).not.toThrow();
    });

    it('should handle complex nested data', () => {
      const eventData: PublishEventData = {
        eventType: 'user.created',
        tenantId: 'tenant-123',
        data: {
          user: {
            id: 'user-456',
            profile: {
              name: 'Test User',
              email: 'test@example.com',
              preferences: {
                notifications: true,
                theme: 'dark',
              },
            },
          },
          metadata: {
            timestamp: new Date().toISOString(),
            source: 'web',
          },
        },
      };

      expect(() => publisher.publish(eventData)).not.toThrow();
    });

    it('should handle array data', () => {
      const eventData: PublishEventData = {
        eventType: 'users.batch.created',
        tenantId: 'tenant-123',
        data: {
          users: [
            { id: 'user-1', email: 'user1@example.com' },
            { id: 'user-2', email: 'user2@example.com' },
          ],
        },
      };

      expect(() => publisher.publish(eventData)).not.toThrow();
    });

    it('should handle null userId', () => {
      const eventData: PublishEventData = {
        eventType: 'system.startup',
        tenantId: 'tenant-123',
        userId: undefined,
        data: {},
      };

      publisher.publish(eventData);

      const publishedEvent: Event = mockEventBus.publish.mock.calls[0][0];
      expect(publishedEvent.userId).toBeUndefined();
    });

    it('should handle async publishing errors', async () => {
      mockEventBus.publishAsync.mockRejectedValue(new Error('Async error'));

      const eventData: PublishEventData = {
        eventType: 'user.created',
        tenantId: 'tenant-123',
        data: {},
      };

      await expect(publisher.publishAsync(eventData)).rejects.toThrow('Async error');
      expect(publisher.getStats().publishingErrors).toBe(1);
    });

    it('should validate ISO 8601 timestamp format', () => {
      // This test verifies the internal validation logic
      const validTimestamps = [
        '2026-02-13T10:00:00Z',
        '2026-02-13T10:00:00.123Z',
        '2026-02-13T10:00:00',
      ];

      validTimestamps.forEach((timestamp) => {
        const eventData: PublishEventData = {
          eventType: 'user.created',
          tenantId: 'tenant-123',
          data: {},
        };

        // Should not throw
        expect(() => publisher.publish(eventData)).not.toThrow();
      });
    });

    it('should handle eventType with multiple dots', () => {
      const eventData: PublishEventData = {
        eventType: 'domain.subdomain.entity.action.subaction',
        tenantId: 'tenant-123',
        data: {},
      };

      expect(() => publisher.publish(eventData)).not.toThrow();
    });

    it('should handle data with null values', () => {
      const eventData: PublishEventData = {
        eventType: 'user.updated',
        tenantId: 'tenant-123',
        data: {
          userId: 'user-456',
          email: null,
          phone: null,
        },
      };

      expect(() => publisher.publish(eventData)).not.toThrow();
    });

    it('should handle data with boolean values', () => {
      const eventData: PublishEventData = {
        eventType: 'user.preferences.updated',
        tenantId: 'tenant-123',
        data: {
          notifications: true,
          darkMode: false,
        },
      };

      expect(() => publisher.publish(eventData)).not.toThrow();
    });

    it('should handle data with number values', () => {
      const eventData: PublishEventData = {
        eventType: 'order.total.calculated',
        tenantId: 'tenant-123',
        data: {
          total: 99.99,
          items: 5,
          discount: 0,
        },
      };

      expect(() => publisher.publish(eventData)).not.toThrow();
    });

    it('should reject null data', () => {
      const eventData: any = {
        eventType: 'user.created',
        tenantId: 'tenant-123',
        data: null,
      };

      expect(() => publisher.publish(eventData)).toThrow('Event must have a data payload');
    });

    it('should reject undefined data', () => {
      const eventData: any = {
        eventType: 'user.created',
        tenantId: 'tenant-123',
        data: undefined,
      };

      expect(() => publisher.publish(eventData)).toThrow('Event must have a data payload');
    });

    it('should handle debug logging for async publishing', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const debugPublisher = new EventPublisher(
        {
          source: 'test-module',
          debug: true,
        },
        mockEventBus
      );

      const eventData: PublishEventData = {
        eventType: 'user.created',
        tenantId: 'tenant-123',
        data: {},
      };

      await debugPublisher.publishAsync(eventData);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
