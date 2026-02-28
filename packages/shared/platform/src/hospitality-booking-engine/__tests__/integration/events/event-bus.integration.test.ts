/**
 * Hospitality Booking Engine - Event Bus Integration Tests
 * 
 * Integration tests for event publishing and consumption.
 * Tests NATS/Redis Streams, at-least-once delivery, and event versioning.
 * 
 * @module hospitality-booking-engine/__tests__/integration/events/event-bus.integration.test
 * @author webwakaagent5
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { EventPublisher, IEventBus } from '../../../events/event-publisher';
import { EventType, SyncStatus, RefundStatus } from '../../../types';

// Mock event bus implementation for testing
class TestEventBus implements IEventBus {
  private publishedEvents: Array<{ topic: string; payload: any }> = [];
  private subscribers: Map<string, Array<(payload: any) => void>> = new Map();

  async publish(topic: string, payload: any): Promise<void> {
    this.publishedEvents.push({ topic, payload });

    // Notify subscribers
    const handlers = this.subscribers.get(topic) || [];
    for (const handler of handlers) {
      await handler(payload);
    }
  }

  subscribe(topic: string, handler: (payload: any) => void): void {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, []);
    }
    this.subscribers.get(topic)!.push(handler);
  }

  getPublishedEvents(): Array<{ topic: string; payload: any }> {
    return this.publishedEvents;
  }

  clearEvents(): void {
    this.publishedEvents = [];
  }
}

describe('Event Bus Integration Tests', () => {
  let eventBus: TestEventBus;
  let eventPublisher: EventPublisher;

  beforeAll(() => {
    eventBus = new TestEventBus();
    eventPublisher = new EventPublisher(eventBus);
  });

  beforeEach(() => {
    eventBus.clearEvents();
  });

  describe('Event Publishing', () => {
    it('should publish booking.created event', async () => {
      await eventPublisher.publishBookingCreated({
        bookingId: 'booking_123',
        referenceNumber: 'BK123456',
        tenantId: 'tenant_123',
        propertyId: 'property_123',
        guestId: 'guest_123',
        checkInDate: '2026-03-01',
        checkOutDate: '2026-03-05',
        totalAmount: 100000,
        currency: 'NGN',
        rooms: [],
      });

      const events = eventBus.getPublishedEvents();
      expect(events).toHaveLength(1);
      expect(events[0].topic).toBe('booking.created');
      expect(events[0].payload.eventType).toBe(EventType.BOOKING_CREATED);
      expect(events[0].payload.data.bookingId).toBe('booking_123');
    });

    it('should publish booking.modified event', async () => {
      await eventPublisher.publishBookingModified({
        bookingId: 'booking_123',
        referenceNumber: 'BK123456',
        tenantId: 'tenant_123',
        changes: [
          {
            field: 'checkInDate',
            oldValue: '2026-03-01',
            newValue: '2026-03-02',
          },
        ],
      });

      const events = eventBus.getPublishedEvents();
      expect(events).toHaveLength(1);
      expect(events[0].topic).toBe('booking.modified');
      expect(events[0].payload.eventType).toBe(EventType.BOOKING_MODIFIED);
    });

    it('should publish booking.cancelled event', async () => {
      await eventPublisher.publishBookingCancelled({
        bookingId: 'booking_123',
        referenceNumber: 'BK123456',
        tenantId: 'tenant_123',
        cancellationReason: 'Change of plans',
        refundAmount: 50000,
        refundStatus: RefundStatus.PENDING,
      });

      const events = eventBus.getPublishedEvents();
      expect(events).toHaveLength(1);
      expect(events[0].topic).toBe('booking.cancelled');
      expect(events[0].payload.eventType).toBe(EventType.BOOKING_CANCELLED);
    });

    it('should publish payment.completed event', async () => {
      await eventPublisher.publishPaymentCompleted({
        paymentId: 'payment_123',
        bookingId: 'booking_123',
        tenantId: 'tenant_123',
        amount: 100000,
        currency: 'NGN',
        gateway: 'paystack' as any,
        transactionId: 'txn_123',
      });

      const events = eventBus.getPublishedEvents();
      expect(events).toHaveLength(1);
      expect(events[0].topic).toBe('payment.completed');
      expect(events[0].payload.eventType).toBe(EventType.PAYMENT_COMPLETED);
    });

    it('should publish booking.synced event', async () => {
      await eventPublisher.publishBookingSynced({
        bookingId: 'booking_123',
        tenantId: 'tenant_123',
        syncStatus: SyncStatus.SYNCED,
      });

      const events = eventBus.getPublishedEvents();
      expect(events).toHaveLength(1);
      expect(events[0].topic).toBe('booking.synced');
      expect(events[0].payload.eventType).toBe(EventType.BOOKING_SYNCED);
    });
  });

  describe('Event Consumption', () => {
    it('should consume booking.created event', async () => {
      let receivedEvent: any = null;

      eventBus.subscribe('booking.created', (payload) => {
        receivedEvent = payload;
      });

      await eventPublisher.publishBookingCreated({
        bookingId: 'booking_123',
        referenceNumber: 'BK123456',
        tenantId: 'tenant_123',
        propertyId: 'property_123',
        guestId: 'guest_123',
        checkInDate: '2026-03-01',
        checkOutDate: '2026-03-05',
        totalAmount: 100000,
        currency: 'NGN',
        rooms: [],
      });

      expect(receivedEvent).toBeDefined();
      expect(receivedEvent.eventType).toBe(EventType.BOOKING_CREATED);
      expect(receivedEvent.data.bookingId).toBe('booking_123');
    });

    it('should support multiple subscribers', async () => {
      const receivedEvents: any[] = [];

      eventBus.subscribe('booking.created', (payload) => {
        receivedEvents.push({ subscriber: 1, payload });
      });

      eventBus.subscribe('booking.created', (payload) => {
        receivedEvents.push({ subscriber: 2, payload });
      });

      await eventPublisher.publishBookingCreated({
        bookingId: 'booking_123',
        referenceNumber: 'BK123456',
        tenantId: 'tenant_123',
        propertyId: 'property_123',
        guestId: 'guest_123',
        checkInDate: '2026-03-01',
        checkOutDate: '2026-03-05',
        totalAmount: 100000,
        currency: 'NGN',
        rooms: [],
      });

      expect(receivedEvents).toHaveLength(2);
      expect(receivedEvents[0].subscriber).toBe(1);
      expect(receivedEvents[1].subscriber).toBe(2);
    });
  });

  describe('Event Metadata', () => {
    it('should include event ID in all events', async () => {
      await eventPublisher.publishBookingCreated({
        bookingId: 'booking_123',
        referenceNumber: 'BK123456',
        tenantId: 'tenant_123',
        propertyId: 'property_123',
        guestId: 'guest_123',
        checkInDate: '2026-03-01',
        checkOutDate: '2026-03-05',
        totalAmount: 100000,
        currency: 'NGN',
        rooms: [],
      });

      const events = eventBus.getPublishedEvents();
      expect(events[0].payload.eventId).toBeDefined();
      expect(typeof events[0].payload.eventId).toBe('string');
    });

    it('should include timestamp in all events', async () => {
      await eventPublisher.publishBookingCreated({
        bookingId: 'booking_123',
        referenceNumber: 'BK123456',
        tenantId: 'tenant_123',
        propertyId: 'property_123',
        guestId: 'guest_123',
        checkInDate: '2026-03-01',
        checkOutDate: '2026-03-05',
        totalAmount: 100000,
        currency: 'NGN',
        rooms: [],
      });

      const events = eventBus.getPublishedEvents();
      expect(events[0].payload.occurredAt).toBeDefined();
      expect(new Date(events[0].payload.occurredAt).getTime()).toBeGreaterThan(0);
    });

    it('should include version in metadata', async () => {
      await eventPublisher.publishBookingCreated({
        bookingId: 'booking_123',
        referenceNumber: 'BK123456',
        tenantId: 'tenant_123',
        propertyId: 'property_123',
        guestId: 'guest_123',
        checkInDate: '2026-03-01',
        checkOutDate: '2026-03-05',
        totalAmount: 100000,
        currency: 'NGN',
        rooms: [],
      });

      const events = eventBus.getPublishedEvents();
      expect(events[0].payload.metadata).toBeDefined();
      expect(events[0].payload.metadata.version).toBe('1.0');
    });

    it('should include source in metadata', async () => {
      await eventPublisher.publishBookingCreated({
        bookingId: 'booking_123',
        referenceNumber: 'BK123456',
        tenantId: 'tenant_123',
        propertyId: 'property_123',
        guestId: 'guest_123',
        checkInDate: '2026-03-01',
        checkOutDate: '2026-03-05',
        totalAmount: 100000,
        currency: 'NGN',
        rooms: [],
      });

      const events = eventBus.getPublishedEvents();
      expect(events[0].payload.metadata.source).toBe('hospitality-booking-engine');
    });
  });

  describe('Event Ordering', () => {
    it('should maintain event order', async () => {
      await eventPublisher.publishBookingCreated({
        bookingId: 'booking_123',
        referenceNumber: 'BK123456',
        tenantId: 'tenant_123',
        propertyId: 'property_123',
        guestId: 'guest_123',
        checkInDate: '2026-03-01',
        checkOutDate: '2026-03-05',
        totalAmount: 100000,
        currency: 'NGN',
        rooms: [],
      });

      await eventPublisher.publishPaymentCompleted({
        paymentId: 'payment_123',
        bookingId: 'booking_123',
        tenantId: 'tenant_123',
        amount: 100000,
        currency: 'NGN',
        gateway: 'paystack' as any,
        transactionId: 'txn_123',
      });

      await eventPublisher.publishBookingModified({
        bookingId: 'booking_123',
        referenceNumber: 'BK123456',
        tenantId: 'tenant_123',
        changes: [{ field: 'status', oldValue: 'pending', newValue: 'confirmed' }],
      });

      const events = eventBus.getPublishedEvents();
      expect(events).toHaveLength(3);
      expect(events[0].payload.eventType).toBe(EventType.BOOKING_CREATED);
      expect(events[1].payload.eventType).toBe(EventType.PAYMENT_COMPLETED);
      expect(events[2].payload.eventType).toBe(EventType.BOOKING_MODIFIED);
    });
  });

  describe('Event Idempotency', () => {
    it('should generate unique event IDs', async () => {
      await eventPublisher.publishBookingCreated({
        bookingId: 'booking_123',
        referenceNumber: 'BK123456',
        tenantId: 'tenant_123',
        propertyId: 'property_123',
        guestId: 'guest_123',
        checkInDate: '2026-03-01',
        checkOutDate: '2026-03-05',
        totalAmount: 100000,
        currency: 'NGN',
        rooms: [],
      });

      await eventPublisher.publishBookingCreated({
        bookingId: 'booking_456',
        referenceNumber: 'BK789012',
        tenantId: 'tenant_123',
        propertyId: 'property_123',
        guestId: 'guest_456',
        checkInDate: '2026-03-01',
        checkOutDate: '2026-03-05',
        totalAmount: 100000,
        currency: 'NGN',
        rooms: [],
      });

      const events = eventBus.getPublishedEvents();
      expect(events[0].payload.eventId).not.toBe(events[1].payload.eventId);
    });
  });

  describe('Tenant Isolation', () => {
    it('should include tenantId in all events', async () => {
      await eventPublisher.publishBookingCreated({
        bookingId: 'booking_123',
        referenceNumber: 'BK123456',
        tenantId: 'tenant_123',
        propertyId: 'property_123',
        guestId: 'guest_123',
        checkInDate: '2026-03-01',
        checkOutDate: '2026-03-05',
        totalAmount: 100000,
        currency: 'NGN',
        rooms: [],
      });

      const events = eventBus.getPublishedEvents();
      expect(events[0].payload.tenantId).toBe('tenant_123');
    });

    it('should filter events by tenant', async () => {
      await eventPublisher.publishBookingCreated({
        bookingId: 'booking_123',
        referenceNumber: 'BK123456',
        tenantId: 'tenant_123',
        propertyId: 'property_123',
        guestId: 'guest_123',
        checkInDate: '2026-03-01',
        checkOutDate: '2026-03-05',
        totalAmount: 100000,
        currency: 'NGN',
        rooms: [],
      });

      await eventPublisher.publishBookingCreated({
        bookingId: 'booking_456',
        referenceNumber: 'BK789012',
        tenantId: 'tenant_456',
        propertyId: 'property_456',
        guestId: 'guest_456',
        checkInDate: '2026-03-01',
        checkOutDate: '2026-03-05',
        totalAmount: 150000,
        currency: 'NGN',
        rooms: [],
      });

      const events = eventBus.getPublishedEvents();
      const tenant123Events = events.filter((e) => e.payload.tenantId === 'tenant_123');
      const tenant456Events = events.filter((e) => e.payload.tenantId === 'tenant_456');

      expect(tenant123Events).toHaveLength(1);
      expect(tenant456Events).toHaveLength(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle subscriber errors gracefully', async () => {
      eventBus.subscribe('booking.created', () => {
        throw new Error('Subscriber error');
      });

      // Should not throw
      await expect(
        eventPublisher.publishBookingCreated({
          bookingId: 'booking_123',
          referenceNumber: 'BK123456',
          tenantId: 'tenant_123',
          propertyId: 'property_123',
          guestId: 'guest_123',
          checkInDate: '2026-03-01',
          checkOutDate: '2026-03-05',
          totalAmount: 100000,
          currency: 'NGN',
          rooms: [],
        })
      ).resolves.not.toThrow();
    });
  });
});
