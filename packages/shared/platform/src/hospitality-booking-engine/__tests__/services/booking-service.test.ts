/**
 * Hospitality Booking Engine - Booking Service Unit Tests
 * 
 * Comprehensive unit tests for BookingService with 100% coverage target.
 * 
 * @module hospitality-booking-engine/__tests__/services/booking-service.test
 * @author webwakaagent5
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BookingService } from '../../services/booking-service';
import { EventPublisher } from '../../events/event-publisher';
import { PaymentGatewayAdapter } from '../../adapters/payment-gateway-adapter';
import {
  BookingStatus,
  PaymentStatus,
  RefundStatus,
  CreateBookingRequest,
  ModifyBookingRequest,
  CancelBookingRequest,
} from '../../types';

describe('BookingService', () => {
  let bookingService: BookingService;
  let mockEventPublisher: EventPublisher;
  let mockPaymentGatewayAdapter: PaymentGatewayAdapter;

  beforeEach(() => {
    // Mock EventPublisher
    mockEventPublisher = {
      publishBookingCreated: vi.fn().mockResolvedValue(undefined),
      publishBookingModified: vi.fn().mockResolvedValue(undefined),
      publishBookingCancelled: vi.fn().mockResolvedValue(undefined),
      publishPaymentCompleted: vi.fn().mockResolvedValue(undefined),
      publishBookingSynced: vi.fn().mockResolvedValue(undefined),
    } as any;

    // Mock PaymentGatewayAdapter
    mockPaymentGatewayAdapter = {
      initializePayment: vi.fn().mockResolvedValue({
        success: true,
        paymentUrl: 'https://paystack.com/pay/test123',
        transactionId: 'txn_123',
        reference: 'ref_123',
      }),
      verifyPayment: vi.fn().mockResolvedValue({
        success: true,
        status: PaymentStatus.COMPLETED,
        amount: 100000,
        currency: 'NGN',
        transactionId: 'txn_123',
        reference: 'ref_123',
      }),
      processRefund: vi.fn().mockResolvedValue({
        success: true,
        transactionId: 'refund_123',
        reference: 'ref_123',
      }),
    } as any;

    bookingService = new BookingService(mockEventPublisher, mockPaymentGatewayAdapter);
  });

  describe('createBooking', () => {
    const validBookingRequest: CreateBookingRequest = {
      tenantId: 'tenant_123',
      propertyId: 'property_123',
      checkInDate: '2026-03-01',
      checkOutDate: '2026-03-05',
      adultsCount: 2,
      childrenCount: 0,
      rooms: [
        {
          roomTypeId: 'room_type_123',
          ratePlanId: 'rate_plan_123',
          quantity: 1,
        },
      ],
      guest: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+2348012345678',
        ndprConsent: true,
      },
      paymentGateway: 'paystack' as any,
    };

    it('should create a booking successfully', async () => {
      const result = await bookingService.createBooking(validBookingRequest);

      expect(result).toBeDefined();
      expect(result.bookingId).toBeDefined();
      expect(result.referenceNumber).toBeDefined();
      expect(result.status).toBe(BookingStatus.PENDING);
      expect(result.totalAmount).toBeGreaterThan(0);
      expect(result.currency).toBe('NGN');
      expect(result.paymentUrl).toBe('https://paystack.com/pay/test123');
      expect(result.expiresAt).toBeDefined();
    });

    it('should emit booking.created event', async () => {
      await bookingService.createBooking(validBookingRequest);

      expect(mockEventPublisher.publishBookingCreated).toHaveBeenCalledOnce();
      expect(mockEventPublisher.publishBookingCreated).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: 'tenant_123',
          propertyId: 'property_123',
        })
      );
    });

    it('should initialize payment with correct gateway', async () => {
      await bookingService.createBooking(validBookingRequest);

      expect(mockPaymentGatewayAdapter.initializePayment).toHaveBeenCalledOnce();
      expect(mockPaymentGatewayAdapter.initializePayment).toHaveBeenCalledWith(
        expect.objectContaining({
          gateway: 'paystack',
        })
      );
    });

    it('should throw error if tenantId is missing', async () => {
      const invalidRequest = { ...validBookingRequest, tenantId: '' };

      await expect(bookingService.createBooking(invalidRequest)).rejects.toThrow(
        'Tenant ID is required'
      );
    });

    it('should throw error if propertyId is missing', async () => {
      const invalidRequest = { ...validBookingRequest, propertyId: '' };

      await expect(bookingService.createBooking(invalidRequest)).rejects.toThrow(
        'Property ID is required'
      );
    });

    it('should throw error if checkInDate is missing', async () => {
      const invalidRequest = { ...validBookingRequest, checkInDate: '' };

      await expect(bookingService.createBooking(invalidRequest)).rejects.toThrow(
        'Check-in date is required'
      );
    });

    it('should throw error if checkOutDate is missing', async () => {
      const invalidRequest = { ...validBookingRequest, checkOutDate: '' };

      await expect(bookingService.createBooking(invalidRequest)).rejects.toThrow(
        'Check-out date is required'
      );
    });

    it('should throw error if adultsCount is less than 1', async () => {
      const invalidRequest = { ...validBookingRequest, adultsCount: 0 };

      await expect(bookingService.createBooking(invalidRequest)).rejects.toThrow(
        'At least one adult required'
      );
    });

    it('should throw error if rooms array is empty', async () => {
      const invalidRequest = { ...validBookingRequest, rooms: [] };

      await expect(bookingService.createBooking(invalidRequest)).rejects.toThrow(
        'At least one room required'
      );
    });

    it('should throw error if guest information is missing', async () => {
      const invalidRequest = { ...validBookingRequest, guest: null as any };

      await expect(bookingService.createBooking(invalidRequest)).rejects.toThrow(
        'Guest information is required'
      );
    });

    it('should throw error if NDPR consent is not given', async () => {
      const invalidRequest = {
        ...validBookingRequest,
        guest: { ...validBookingRequest.guest, ndprConsent: false },
      };

      await expect(bookingService.createBooking(invalidRequest)).rejects.toThrow(
        'NDPR consent is required'
      );
    });

    it('should throw error if phone format is invalid', async () => {
      const invalidRequest = {
        ...validBookingRequest,
        guest: { ...validBookingRequest.guest, phone: '08012345678' },
      };

      await expect(bookingService.createBooking(invalidRequest)).rejects.toThrow(
        'Phone number must be in +234XXXXXXXXXX format'
      );
    });

    it('should throw error if email format is invalid', async () => {
      const invalidRequest = {
        ...validBookingRequest,
        guest: { ...validBookingRequest.guest, email: 'invalid-email' },
      };

      await expect(bookingService.createBooking(invalidRequest)).rejects.toThrow(
        'Invalid email format'
      );
    });

    it('should throw error if checkInDate is in the past', async () => {
      const invalidRequest = {
        ...validBookingRequest,
        checkInDate: '2020-01-01',
      };

      await expect(bookingService.createBooking(invalidRequest)).rejects.toThrow(
        'Check-in date cannot be in the past'
      );
    });

    it('should throw error if checkOutDate is before checkInDate', async () => {
      const invalidRequest = {
        ...validBookingRequest,
        checkInDate: '2026-03-05',
        checkOutDate: '2026-03-01',
      };

      await expect(bookingService.createBooking(invalidRequest)).rejects.toThrow(
        'Check-out date must be after check-in date'
      );
    });

    it('should throw error if stay exceeds maximum days', async () => {
      const invalidRequest = {
        ...validBookingRequest,
        checkInDate: '2026-03-01',
        checkOutDate: '2026-07-01', // 122 days
      };

      await expect(bookingService.createBooking(invalidRequest)).rejects.toThrow(
        'Maximum stay is 90 days'
      );
    });

    it('should throw error if payment initialization fails', async () => {
      mockPaymentGatewayAdapter.initializePayment = vi.fn().mockResolvedValue({
        success: false,
        error: 'Payment gateway error',
      });

      await expect(bookingService.createBooking(validBookingRequest)).rejects.toThrow(
        'Payment initialization failed: Payment gateway error'
      );
    });
  });

  describe('getBooking', () => {
    it('should retrieve booking by ID', async () => {
      const result = await bookingService.getBooking('tenant_123', 'booking_123');

      expect(result).toBeDefined();
      expect(result.booking).toBeDefined();
      expect(result.booking.id).toBe('booking_123');
    });

    it('should throw error if booking not found', async () => {
      // Mock fetchBookingById to return null
      bookingService['fetchBookingById'] = vi.fn().mockResolvedValue(null);

      await expect(bookingService.getBooking('tenant_123', 'invalid_id')).rejects.toThrow(
        'Booking not found: invalid_id'
      );
    });
  });

  describe('modifyBooking', () => {
    const modifyRequest: ModifyBookingRequest = {
      checkInDate: '2026-03-02',
      adultsCount: 3,
      version: 1,
    };

    it('should modify booking successfully', async () => {
      const result = await bookingService.modifyBooking('tenant_123', 'booking_123', modifyRequest);

      expect(result).toBeDefined();
      expect(result.booking).toBeDefined();
      expect(mockEventPublisher.publishBookingModified).toHaveBeenCalledOnce();
    });

    it('should throw error if version mismatch (concurrent modification)', async () => {
      const invalidRequest = { ...modifyRequest, version: 999 };

      await expect(
        bookingService.modifyBooking('tenant_123', 'booking_123', invalidRequest)
      ).rejects.toThrow('Concurrent modification detected');
    });

    it('should throw error if booking is cancelled', async () => {
      // Mock fetchBookingById to return cancelled booking
      bookingService['fetchBookingById'] = vi.fn().mockResolvedValue({
        id: 'booking_123',
        status: BookingStatus.CANCELLED,
        version: 1,
      });

      await expect(
        bookingService.modifyBooking('tenant_123', 'booking_123', modifyRequest)
      ).rejects.toThrow('Cannot modify cancelled booking');
    });

    it('should track changes correctly', async () => {
      await bookingService.modifyBooking('tenant_123', 'booking_123', modifyRequest);

      expect(mockEventPublisher.publishBookingModified).toHaveBeenCalledWith(
        expect.objectContaining({
          changes: expect.arrayContaining([
            expect.objectContaining({
              field: 'checkInDate',
            }),
            expect.objectContaining({
              field: 'adultsCount',
            }),
          ]),
        })
      );
    });
  });

  describe('cancelBooking', () => {
    const cancelRequest: CancelBookingRequest = {
      reason: 'Change of plans',
    };

    it('should cancel booking successfully', async () => {
      const result = await bookingService.cancelBooking('tenant_123', 'booking_123', cancelRequest);

      expect(result).toBeDefined();
      expect(result.status).toBe(BookingStatus.CANCELLED);
      expect(result.cancellationDate).toBeDefined();
      expect(mockEventPublisher.publishBookingCancelled).toHaveBeenCalledOnce();
    });

    it('should calculate refund amount correctly (>7 days)', async () => {
      // Mock booking with check-in 10 days from now
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);

      bookingService['fetchBookingById'] = vi.fn().mockResolvedValue({
        id: 'booking_123',
        status: BookingStatus.CONFIRMED,
        checkInDate: futureDate,
        totalAmount: 100000,
      });

      const result = await bookingService.cancelBooking('tenant_123', 'booking_123', cancelRequest);

      expect(result.refundAmount).toBe(100000); // 100% refund
    });

    it('should calculate refund amount correctly (3-7 days)', async () => {
      // Mock booking with check-in 5 days from now
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);

      bookingService['fetchBookingById'] = vi.fn().mockResolvedValue({
        id: 'booking_123',
        status: BookingStatus.CONFIRMED,
        checkInDate: futureDate,
        totalAmount: 100000,
      });

      const result = await bookingService.cancelBooking('tenant_123', 'booking_123', cancelRequest);

      expect(result.refundAmount).toBe(50000); // 50% refund
    });

    it('should calculate refund amount correctly (1-3 days)', async () => {
      // Mock booking with check-in 2 days from now
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2);

      bookingService['fetchBookingById'] = vi.fn().mockResolvedValue({
        id: 'booking_123',
        status: BookingStatus.CONFIRMED,
        checkInDate: futureDate,
        totalAmount: 100000,
      });

      const result = await bookingService.cancelBooking('tenant_123', 'booking_123', cancelRequest);

      expect(result.refundAmount).toBe(25000); // 25% refund
    });

    it('should throw error if cancellation within 24 hours', async () => {
      // Mock booking with check-in 12 hours from now
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 12);

      bookingService['fetchBookingById'] = vi.fn().mockResolvedValue({
        id: 'booking_123',
        status: BookingStatus.CONFIRMED,
        checkInDate: futureDate,
      });

      await expect(
        bookingService.cancelBooking('tenant_123', 'booking_123', cancelRequest)
      ).rejects.toThrow('Cancellation not allowed within 24 hours of check-in');
    });

    it('should throw error if booking already cancelled', async () => {
      bookingService['fetchBookingById'] = vi.fn().mockResolvedValue({
        id: 'booking_123',
        status: BookingStatus.CANCELLED,
      });

      await expect(
        bookingService.cancelBooking('tenant_123', 'booking_123', cancelRequest)
      ).rejects.toThrow('Booking already cancelled');
    });

    it('should throw error if booking already checked out', async () => {
      bookingService['fetchBookingById'] = vi.fn().mockResolvedValue({
        id: 'booking_123',
        status: BookingStatus.CHECKED_OUT,
      });

      await expect(
        bookingService.cancelBooking('tenant_123', 'booking_123', cancelRequest)
      ).rejects.toThrow('Cannot cancel completed booking');
    });
  });

  describe('generateBookingReference', () => {
    it('should generate unique booking references', () => {
      const ref1 = bookingService['generateBookingReference']();
      const ref2 = bookingService['generateBookingReference']();

      expect(ref1).toBeDefined();
      expect(ref2).toBeDefined();
      expect(ref1).not.toBe(ref2);
      expect(ref1).toMatch(/^BK[A-Z0-9]+$/);
    });
  });

  describe('calculateRefundAmount', () => {
    it('should return 100% refund for >168 hours', () => {
      const amount = bookingService['calculateRefundAmount'](100000, 200);
      expect(amount).toBe(100000);
    });

    it('should return 50% refund for 72-168 hours', () => {
      const amount = bookingService['calculateRefundAmount'](100000, 100);
      expect(amount).toBe(50000);
    });

    it('should return 25% refund for 24-72 hours', () => {
      const amount = bookingService['calculateRefundAmount'](100000, 48);
      expect(amount).toBe(25000);
    });

    it('should return 0% refund for <24 hours', () => {
      const amount = bookingService['calculateRefundAmount'](100000, 12);
      expect(amount).toBe(0);
    });
  });
});
