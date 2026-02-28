/**
 * NATS Event Bus Tests
 */

import { NatsEventBus } from '../../src/event-system/bus/nats-event-bus';
import { Event } from '../../src/event-system/types';
import { ConnectionError, EventPublishError } from '../../src/event-system/errors';

describe('NATS Event Bus', () => {
  let eventBus: NatsEventBus;

  const createEvent = (overrides?: Partial<Event>): Event => ({
    eventId: '550e8400-e29b-41d4-a716-446655440000',
    eventType: 'user.created',
    eventVersion: '1.0',
    timestamp: '2026-02-09T10:00:00Z',
    tenantId: '550e8400-e29b-41d4-a716-446655440001',
    source: 'test-module',
    data: { email: 'test@example.com' },
    ...overrides,
  });

  beforeEach(() => {
    eventBus = new NatsEventBus({
      servers: ['nats://localhost:4222'],
    });
  });

  describe('Connection Management', () => {
    it('should initialize with NATS config', () => {
      expect(eventBus).toBeDefined();
    });

    it('should throw error when connecting without config', () => {
      const busWithoutConfig = new NatsEventBus({});
      expect(() => busWithoutConfig.connect()).rejects.toThrow();
    });

    it('should handle connection failure gracefully', async () => {
      const busWithBadConfig = new NatsEventBus({
        servers: ['nats://invalid-host:9999'],
      });
      await expect(busWithBadConfig.connect()).rejects.toThrow(ConnectionError);
    });
  });

  describe('Publishing', () => {
    it('should throw error when publishing without connection', async () => {
      const event = createEvent();
      await expect(eventBus.publish(event)).rejects.toThrow(EventPublishError);
    });

    it('should validate event before publishing', async () => {
      const invalidEvent = {
        eventId: 'invalid',
        // Missing required fields
      } as any;
      await expect(eventBus.publish(invalidEvent)).rejects.toThrow();
    });
  });

  describe('Subscription', () => {
    it('should throw error when subscribing without connection', async () => {
      const handler = jest.fn();
      await expect(eventBus.subscribe('user.created', handler)).rejects.toThrow();
    });

    it('should throw error when unsubscribing without connection', async () => {
      await expect(eventBus.unsubscribe('sub-123')).rejects.toThrow();
    });
  });

  describe('Statistics', () => {
    it('should return empty stats when not connected', async () => {
      const stats = eventBus.getStats();
      expect(stats).toEqual({
        publishedCount: 0,
        subscriptionCount: 0,
        failedCount: 0,
        uptime: expect.any(Number),
      });
    });
  });

  describe('Event Replay', () => {
    it('should throw error when replaying without connection', async () => {
      await expect(
        eventBus.replayEvents({
          tenantId: 'tenant-123',
        })
      ).rejects.toThrow();
    });
  });

  describe('Connection State', () => {
    it('should report not connected initially', () => {
      expect(eventBus.isConnected()).toBe(false);
    });

    it('should throw error when disconnecting without connection', async () => {
      await expect(eventBus.disconnect()).rejects.toThrow(ConnectionError);
    });
  });
});
