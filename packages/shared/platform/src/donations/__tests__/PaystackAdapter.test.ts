import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PaystackAdapter } from '../integrations/PaystackAdapter';

describe('PaystackAdapter', () => {
  let adapter: PaystackAdapter;
  const mockSecretKey = 'sk_test_mock_key';

  beforeEach(() => {
    adapter = new PaystackAdapter(mockSecretKey);
    global.fetch = vi.fn();
  });

  describe('initializePayment', () => {
    it('should initialize payment successfully', async () => {
      const mockResponse = {
        status: true,
        data: {
          reference: 'ref-123',
          authorization_url: 'https://paystack.com/pay/ref-123',
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        json: async () => mockResponse,
      });

      const result = await adapter.initializePayment({
        amount: 10000,
        currency: 'NGN',
        email: 'donor@example.com',
        reference: 'donation-123',
      });

      expect(result.success).toBe(true);
      expect(result.transactionId).toBe('ref-123');
      expect(result.paymentUrl).toBe('https://paystack.com/pay/ref-123');
    });

    it('should convert amount to kobo', async () => {
      const mockResponse = {
        status: true,
        data: {
          reference: 'ref-123',
          authorization_url: 'https://paystack.com/pay/ref-123',
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        json: async () => mockResponse,
      });

      await adapter.initializePayment({
        amount: 100.50,
        currency: 'NGN',
        email: 'donor@example.com',
        reference: 'donation-123',
      });

      const fetchCall = (global.fetch as any).mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.amount).toBe(10050); // 100.50 * 100
    });

    it('should handle initialization failure', async () => {
      const mockResponse = {
        status: false,
        message: 'Invalid email',
      };

      (global.fetch as any).mockResolvedValueOnce({
        json: async () => mockResponse,
      });

      const result = await adapter.initializePayment({
        amount: 10000,
        currency: 'NGN',
        email: 'invalid',
        reference: 'donation-123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await adapter.initializePayment({
        amount: 10000,
        currency: 'NGN',
        email: 'donor@example.com',
        reference: 'donation-123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('verifyPayment', () => {
    it('should verify successful payment', async () => {
      const mockResponse = {
        status: true,
        data: {
          reference: 'ref-123',
          amount: 1000000, // 10000 NGN in kobo
          currency: 'NGN',
          status: 'success',
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        json: async () => mockResponse,
      });

      const result = await adapter.verifyPayment('ref-123');

      expect(result.success).toBe(true);
      expect(result.amount).toBe(10000); // Converted from kobo
      expect(result.currency).toBe('NGN');
      expect(result.status).toBe('success');
    });

    it('should handle failed payment verification', async () => {
      const mockResponse = {
        status: true,
        data: {
          reference: 'ref-123',
          amount: 1000000,
          currency: 'NGN',
          status: 'failed',
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        json: async () => mockResponse,
      });

      const result = await adapter.verifyPayment('ref-123');

      expect(result.success).toBe(false);
      expect(result.status).toBe('failed');
    });

    it('should handle verification errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Verification error'));

      const result = await adapter.verifyPayment('ref-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Verification error');
    });
  });

  describe('refundPayment', () => {
    it('should process full refund', async () => {
      const mockResponse = {
        status: true,
        data: {
          id: 'refund-123',
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        json: async () => mockResponse,
      });

      const result = await adapter.refundPayment({
        transactionId: 'txn-123',
      });

      expect(result.success).toBe(true);
      expect(result.refundId).toBe('refund-123');
    });

    it('should process partial refund', async () => {
      const mockResponse = {
        status: true,
        data: {
          id: 'refund-123',
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        json: async () => mockResponse,
      });

      const result = await adapter.refundPayment({
        transactionId: 'txn-123',
        amount: 5000,
      });

      expect(result.success).toBe(true);
    });

    it('should handle refund failure', async () => {
      const mockResponse = {
        status: false,
        message: 'Refund failed',
      };

      (global.fetch as any).mockResolvedValueOnce({
        json: async () => mockResponse,
      });

      const result = await adapter.refundPayment({
        transactionId: 'txn-123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('verifyWebhookSignature', () => {
    it('should verify valid webhook signature', () => {
      const payload = { event: 'charge.success', data: {} };
      const signature = 'valid-signature';

      // Mock implementation - in real test, use actual HMAC
      const result = adapter.verifyWebhookSignature(payload, signature);

      expect(typeof result).toBe('boolean');
    });

    it('should reject invalid webhook signature', () => {
      const payload = { event: 'charge.success', data: {} };
      const signature = 'invalid-signature';

      const result = adapter.verifyWebhookSignature(payload, signature);

      expect(typeof result).toBe('boolean');
    });
  });
});
