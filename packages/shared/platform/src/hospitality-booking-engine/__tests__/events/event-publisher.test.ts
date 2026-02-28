/**
 * Hospitality Booking Engine - Event Publisher Unit Tests
 * 
 * Unit tests for Event Publisher with schema validation.
 * 
 * @module hospitality-booking-engine/__tests__/events/event-publisher.test
 * @author webwakaagent5
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventPublisher, IEventBus } from '../../events/event-publisher';
import { EventType, SyncStatus, RefundStatus } from '../../types';

describe('EventPublisher', () => {
  let eventPublisher: EventPublisher;
  let mockEventBus: IEventBus;

  beforeEach(() => {
    mockEventBus = {
      publish: vi.fn().mockResolvedValue(undefined),
    };

    eventPublisher = new EventPublisher(mockEventBus);
  });

  describe('publishBookingCreated', () => {
    it('should publish booking.created event successfully', async () => {
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
        rooms: [
          {
            roomTypeId: 'room_type_123',
            quantity: 1,
          },
        ],
      });

      expect(mockEventBus.publish).toHaveBeenCalledOnce();
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'booking.created',
        expect.objectContaining({
          eventType: EventType.BOOKING_CREATED,
          tenantId: 'tenant_123',
          data: expect.objectContaining({
            bookingId: 'booking_123',
            referenceNumber: 'BK123456',
          }),
        })
      );
    });

    it('should include event metadata', async () => {
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

      const publishCall = vi.mocked(mockEventBus.publish).mock.calls[0];
      const payload = publishCall[1];

      expect(payload.metadata).toBeDefined();
      expect(payload.metadata?.version).toBe('1.0');
      expect(payload.metadata?.source).toBe('hospitality-booking-engine');
    });

    it('should throw error if bookingId is missing', async () => {
      await expect(
        eventPublisher.publishBookingCreated({
          bookingId: '',
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
      ).rejects.toThrow('Booking ID is required');
    });

    it('should throw error if tenantId is missing', async () => {
      await expect(
        eventPublisher.publishBookingCreated({
          bookingId: 'booking_123',
          referenceNumber: 'BK123456',
          tenantId: '',
          propertyId: 'property_123',
          guestId: 'guest_123',
          checkInDate: '2026-03-01',
          checkOutDate: '2026-03-05',
          totalAmount: 100000,
          currency: 'NGN',
          rooms: [],
        })
      ).rejects.toThrow('Tenant ID is required');
    });
  });

  describe('publishBookingModified', () => {
    it('should publish booking.modified event successfully', async () => {
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

      expect(mockEventBus.publish).toHaveBeenCalledOnce();
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'booking.modified',
        expect.objectContaining({
          eventType: EventType.BOOKING_MODIFIED,
          data: expect.objectContaining({
            bookingId: 'booking_123',
            changes: expect.arrayContaining([
              expect.objectContaining({
                field: 'checkInDate',
              }),
            ]),
          }),
        })
      );
    });

    it('should throw error if changes array is missing', async () => {
      await expect(
        eventPublisher.publishBookingModified({
          bookingId: 'booking_123',
          referenceNumber: 'BK123456',
          tenantId: 'tenant_123',
          changes: null as any,
        })
      ).rejects.toThrow('Changes array is required');
    });
  });

  describe('publishBookingCancelled', () => {
    it('should publish booking.cancelled event successfully', async () => {
      await eventPublisher.publishBookingCancelled({
        bookingId: 'booking_123',
        referenceNumber: 'BK123456',
        tenantId: 'tenant_123',
        cancellationReason: 'Change of plans',
        refundAmount: 50000,
        refundStatus: RefundStatus.PENDING,
      });

      expect(mockEventBus.publish).toHaveBeenCalledOnce();
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'booking.cancelled',
        expect.objectContaining({
          eventType: EventType.BOOKING_CANCELLED,
          data: expect.objectContaining({
            bookingId: 'booking_123',
            cancellationReason: 'Change of plans',
            refundAmount: 50000,
          }),
        })
      );
    });

    it('should throw error if cancellationReason is missing', async () => {
      await expect(
        eventPublisher.publishBookingCancelled({
          bookingId: 'booking_123',
          referenceNumber: 'BK123456',
          tenantId: 'tenant_123',
          cancellationReason: '',
          refundAmount: 50000,
          refundStatus: RefundStatus.PENDING,
        })
      ).rejects.toThrow('Cancellation reason is required');
    });
  });

  describe('publishPaymentCompleted', () => {
    it('should publish payment.completed event successfully', async () => {
      await eventPublisher.publishPaymentCompleted({
        paymentId: 'payment_123',
        bookingId: 'booking_123',
        tenantId: 'tenant_123',
        amount: 100000,
        currency: 'NGN',
        gateway: 'paystack' as any,
        transactionId: 'txn_123',
      });

      expect(mockEventBus.publish).toHaveBeenCalledOnce();
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'payment.completed',
        expect.objectContaining({
          eventType: EventType.PAYMENT_COMPLETED,
          data: expect.objectContaining({
            paymentId: 'payment_123',
            bookingId: 'booking_123',
            amount: 100000,
          }),
        })
      );
    });

    it('should throw error if transactionId is missing', async () => {
      await expect(
        eventPublisher.publishPaymentCompleted({
          paymentId: 'payment_123',
          bookingId: 'booking_123',
          tenantId: 'tenant_123',
          amount: 100000,
          currency: 'NGN',
          gateway: 'paystack' as any,
          transactionId: '',
        })
      ).rejects.toThrow('Transaction ID is required');
    });
  });

  describe('publishBookingSynced', () => {
    it('should publish booking.synced event successfully', async () => {
      await eventPublisher.publishBookingSynced({
        bookingId: 'booking_123',
        tenantId: 'tenant_123',
        syncStatus: SyncStatus.SYNCED,
      });

      expect(mockEventBus.publish).toHaveBeenCalledOnce();
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'booking.synced',
        expect.objectContaining({
          eventType: EventType.BOOKING_SYNCED,
          data: expect.objectContaining({
            bookingId: 'booking_123',
            syncStatus: SyncStatus.SYNCED,
          }),
        })
      );
    });

    it('should include conflicts if present', async () => {
      await eventPublisher.publishBookingSynced({
        bookingId: 'booking_123',
        tenantId: 'tenant_123',
        syncStatus: SyncStatus.CONFLICT,
        conflicts: [
          {
            field: 'totalAmount',
            localValue: 100000,
            serverValue: 110000,
          },
        ],
      });

      const publishCall = vi.mocked(mockEventBus.publish).mock.calls[0];
      const payload = publishCall[1];

      expect(payload.data.conflicts).toBeDefined();
      expect(payload.data.conflicts).toHaveLength(1);
    });
  });

  describe('event validation', () => {
    it('should throw error if eventType is missing', async () => {
      const invalidPayload = {
        eventId: 'event_123',
        tenantId: 'tenant_123',
        occurredAt: new Date().toISOString(),
        data: {},
      };

      await expect(
        eventPublisher['validateAndPublish']('test.topic', invalidPayload as any)
      ).rejects.toThrow('Event type is required');
    });

    it('should throw error if eventId is missing', async () => {
      const invalidPayload = {
        eventType: EventType.BOOKING_CREATED,
        tenantId: 'tenant_123',
        occurredAt: new Date().toISOString(),
        data: {},
      };

      await expect(
        eventPublisher['validateAndPublish']('test.topic', invalidPayload as any)
      ).rejects.toThrow('Event ID is required');
    });

    it('should throw error if data is not an object', async () => {
      const invalidPayload = {
        eventType: EventType.BOOKING_CREATED,
        eventId: 'event_123',
        tenantId: 'tenant_123',
        occurredAt: new Date().toISOString(),
        data: 'invalid',
      };

      await expect(
        eventPublisher['validateAndPublish']('test.topic', invalidPayload as any)
      ).rejects.toThrow('Event data is required and must be an object');
    });
  });
});
