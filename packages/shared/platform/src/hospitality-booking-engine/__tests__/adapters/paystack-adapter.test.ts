/**
 * Hospitality Booking Engine - Paystack Adapter Unit Tests
 * 
 * Unit tests for Paystack payment gateway adapter.
 * 
 * @module hospitality-booking-engine/__tests__/adapters/paystack-adapter.test
 * @author webwakaagent5
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import axios from 'axios';
import { PaystackAdapter } from '../../adapters/paystack-adapter';
import { PaymentStatus, PaymentMethod } from '../../types';

vi.mock('axios');

describe('PaystackAdapter', () => {
  let paystackAdapter: PaystackAdapter;
  const mockSecretKey = 'sk_test_123456789';

  beforeEach(() => {
    paystackAdapter = new PaystackAdapter(mockSecretKey);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initializePayment', () => {
    it('should initialize payment successfully', async () => {
      const mockResponse = {
        data: {
          status: true,
          data: {
            authorization_url: 'https://checkout.paystack.com/test123',
            access_code: 'access_123',
            reference: 'ref_123',
          },
        },
      };

      vi.mocked(axios.post).mockResolvedValue(mockResponse);

      const result = await paystackAdapter.initializePayment({
        bookingId: 'booking_123',
        amount: 100000,
        currency: 'NGN',
        gateway: 'paystack' as any,
        email: 'test@example.com',
      });

      expect(result.success).toBe(true);
      expect(result.paymentUrl).toBe('https://checkout.paystack.com/test123');
      expect(result.transactionId).toBe('access_123');
      expect(result.reference).toBe('ref_123');
    });

    it('should convert amount to kobo', async () => {
      const mockResponse = {
        data: {
          status: true,
          data: {
            authorization_url: 'https://checkout.paystack.com/test123',
            access_code: 'access_123',
            reference: 'ref_123',
          },
        },
      };

      vi.mocked(axios.post).mockResolvedValue(mockResponse);

      await paystackAdapter.initializePayment({
        bookingId: 'booking_123',
        amount: 100000,
        currency: 'NGN',
        gateway: 'paystack' as any,
        email: 'test@example.com',
      });

      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          amount: 10000000, // 100000 * 100
        }),
        expect.any(Object)
      );
    });

    it('should handle payment initialization failure', async () => {
      const mockResponse = {
        data: {
          status: false,
          message: 'Invalid API key',
        },
      };

      vi.mocked(axios.post).mockResolvedValue(mockResponse);

      const result = await paystackAdapter.initializePayment({
        bookingId: 'booking_123',
        amount: 100000,
        currency: 'NGN',
        gateway: 'paystack' as any,
        email: 'test@example.com',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid API key');
    });

    it('should handle network errors', async () => {
      vi.mocked(axios.post).mockRejectedValue(new Error('Network error'));

      const result = await paystackAdapter.initializePayment({
        bookingId: 'booking_123',
        amount: 100000,
        currency: 'NGN',
        gateway: 'paystack' as any,
        email: 'test@example.com',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
    });
  });

  describe('verifyPayment', () => {
    it('should verify successful payment', async () => {
      const mockResponse = {
        data: {
          status: true,
          data: {
            status: 'success',
            amount: 10000000,
            currency: 'NGN',
            channel: 'card',
            authorization: {
              last4: '4081',
              brand: 'visa',
            },
            id: 123456,
            reference: 'ref_123',
            paid_at: '2026-02-13T12:00:00Z',
          },
        },
      };

      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const result = await paystackAdapter.verifyPayment('ref_123');

      expect(result.success).toBe(true);
      expect(result.status).toBe(PaymentStatus.COMPLETED);
      expect(result.amount).toBe(100000); // Converted from kobo
      expect(result.currency).toBe('NGN');
      expect(result.paymentMethod).toBe(PaymentMethod.CARD);
      expect(result.cardLast4).toBe('4081');
      expect(result.cardBrand).toBe('visa');
    });

    it('should handle failed payment verification', async () => {
      const mockResponse = {
        data: {
          status: true,
          data: {
            status: 'failed',
            amount: 10000000,
            currency: 'NGN',
            id: 123456,
            reference: 'ref_123',
            gateway_response: 'Insufficient funds',
          },
        },
      };

      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const result = await paystackAdapter.verifyPayment('ref_123');

      expect(result.success).toBe(false);
      expect(result.status).toBe(PaymentStatus.FAILED);
      expect(result.error).toBe('Insufficient funds');
    });

    it('should map payment channels correctly', async () => {
      const channels = [
        { channel: 'card', expected: PaymentMethod.CARD },
        { channel: 'bank', expected: PaymentMethod.BANK_TRANSFER },
        { channel: 'ussd', expected: PaymentMethod.USSD },
        { channel: 'mobile_money', expected: PaymentMethod.MOBILE_MONEY },
      ];

      for (const { channel, expected } of channels) {
        const mockResponse = {
          data: {
            status: true,
            data: {
              status: 'success',
              amount: 10000000,
              currency: 'NGN',
              channel,
              id: 123456,
              reference: 'ref_123',
              paid_at: '2026-02-13T12:00:00Z',
            },
          },
        };

        vi.mocked(axios.get).mockResolvedValue(mockResponse);

        const result = await paystackAdapter.verifyPayment('ref_123');

        expect(result.paymentMethod).toBe(expected);
      }
    });
  });

  describe('processRefund', () => {
    it('should process refund successfully', async () => {
      const mockResponse = {
        data: {
          status: true,
          data: {
            id: 789,
            transaction_reference: 'ref_123',
          },
        },
      };

      vi.mocked(axios.post).mockResolvedValue(mockResponse);

      const result = await paystackAdapter.processRefund({
        paymentId: 'payment_123',
        amount: 50000,
        reason: 'Booking cancellation',
      });

      expect(result.success).toBe(true);
      expect(result.transactionId).toBe('789');
      expect(result.reference).toBe('ref_123');
    });

    it('should convert refund amount to kobo', async () => {
      const mockResponse = {
        data: {
          status: true,
          data: {
            id: 789,
            transaction_reference: 'ref_123',
          },
        },
      };

      vi.mocked(axios.post).mockResolvedValue(mockResponse);

      await paystackAdapter.processRefund({
        paymentId: 'payment_123',
        amount: 50000,
      });

      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          amount: 5000000, // 50000 * 100
        }),
        expect.any(Object)
      );
    });

    it('should handle refund failure', async () => {
      const mockResponse = {
        data: {
          status: false,
          message: 'Transaction not found',
        },
      };

      vi.mocked(axios.post).mockResolvedValue(mockResponse);

      const result = await paystackAdapter.processRefund({
        paymentId: 'invalid_payment',
        amount: 50000,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Transaction not found');
    });
  });
});
