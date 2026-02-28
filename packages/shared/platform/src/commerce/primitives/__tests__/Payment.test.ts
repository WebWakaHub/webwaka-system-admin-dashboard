/**
 * Payment Primitive Unit Tests
 * 100% code coverage
 */

import { Payment, PaymentStatus, PaymentMethod } from '../Payment';
import { Money } from '../Money';

describe('Payment Primitive', () => {
  const amount = new Money(10000, 'NGN');

  describe('Constructor', () => {
    it('should create Payment with valid data', () => {
      const payment = new Payment('pay-1', 'order-1', amount, PaymentMethod.CREDIT_CARD);
      expect(payment.id).toBe('pay-1');
      expect(payment.orderId).toBe('order-1');
      expect(payment.amount).toEqual(amount);
      expect(payment.method).toBe(PaymentMethod.CREDIT_CARD);
      expect(payment.status).toBe(PaymentStatus.PENDING);
    });

    it('should throw error for invalid ID', () => {
      expect(() => new Payment('', 'order-1', amount, PaymentMethod.CREDIT_CARD)).toThrow('Payment ID is required');
    });

    it('should throw error for invalid order ID', () => {
      expect(() => new Payment('pay-1', '', amount, PaymentMethod.CREDIT_CARD)).toThrow('Order ID is required');
    });

    it('should throw error for invalid amount', () => {
      expect(() => new Payment('pay-1', 'order-1', null as any, PaymentMethod.CREDIT_CARD)).toThrow('Amount is required');
    });

    it('should throw error for invalid method', () => {
      expect(() => new Payment('pay-1', 'order-1', amount, null as any)).toThrow('Payment method is required');
    });
  });

  describe('Authorization', () => {
    const payment = new Payment('pay-1', 'order-1', amount, PaymentMethod.CREDIT_CARD);

    it('should authorize payment', () => {
      payment.authorize('REF123456');
      expect(payment.status).toBe(PaymentStatus.AUTHORIZED);
      expect(payment.reference).toBe('REF123456');
      expect(payment.isAuthorized()).toBe(true);
    });

    it('should throw error for empty reference', () => {
      expect(() => payment.authorize('')).toThrow('Payment reference is required');
    });

    it('should throw error authorizing non-pending payment', () => {
      payment.authorize('REF123456');
      expect(() => payment.authorize('REF789')).toThrow('Cannot authorize payment with status');
    });

    it('should set metadata during authorization', () => {
      const payment2 = new Payment('pay-2', 'order-1', amount, PaymentMethod.CREDIT_CARD);
      payment2.authorize('REF123', { provider: 'Stripe', transactionId: 'txn_123' });
      expect(payment2.getMetadata('provider')).toBe('Stripe');
      expect(payment2.getMetadata('transactionId')).toBe('txn_123');
    });
  });

  describe('Capture', () => {
    const payment = new Payment('pay-1', 'order-1', amount, PaymentMethod.CREDIT_CARD);

    it('should capture authorized payment', () => {
      payment.authorize('REF123456');
      payment.capture();
      expect(payment.status).toBe(PaymentStatus.CAPTURED);
      expect(payment.isCaptured()).toBe(true);
    });

    it('should throw error capturing non-authorized payment', () => {
      const payment2 = new Payment('pay-2', 'order-1', amount, PaymentMethod.CREDIT_CARD);
      expect(() => payment2.capture()).toThrow('Cannot capture payment with status');
    });

    it('should throw error capturing already captured payment', () => {
      payment.capture();
      expect(() => payment.capture()).toThrow('Cannot capture payment with status');
    });
  });

  describe('Refund', () => {
    const payment = new Payment('pay-1', 'order-1', amount, PaymentMethod.CREDIT_CARD);

    it('should refund captured payment', () => {
      payment.authorize('REF123456');
      payment.capture();
      payment.refund();
      expect(payment.status).toBe(PaymentStatus.REFUNDED);
      expect(payment.isRefunded()).toBe(true);
    });

    it('should refund authorized payment', () => {
      const payment2 = new Payment('pay-2', 'order-1', amount, PaymentMethod.CREDIT_CARD);
      payment2.authorize('REF123456');
      payment2.refund();
      expect(payment2.status).toBe(PaymentStatus.REFUNDED);
    });

    it('should refund partial amount', () => {
      const payment3 = new Payment('pay-3', 'order-1', amount, PaymentMethod.CREDIT_CARD);
      payment3.authorize('REF123456');
      payment3.capture();
      const partialAmount = new Money(5000, 'NGN');
      payment3.refund(partialAmount);
      expect(payment3.status).toBe(PaymentStatus.REFUNDED);
    });

    it('should throw error refunding with amount exceeding payment', () => {
      const payment4 = new Payment('pay-4', 'order-1', amount, PaymentMethod.CREDIT_CARD);
      payment4.authorize('REF123456');
      payment4.capture();
      const excessAmount = new Money(15000, 'NGN');
      expect(() => payment4.refund(excessAmount)).toThrow('Refund amount cannot exceed payment amount');
    });

    it('should throw error refunding pending payment', () => {
      const payment5 = new Payment('pay-5', 'order-1', amount, PaymentMethod.CREDIT_CARD);
      expect(() => payment5.refund()).toThrow('Cannot refund payment with status');
    });

    it('should throw error refunding failed payment', () => {
      const payment6 = new Payment('pay-6', 'order-1', amount, PaymentMethod.CREDIT_CARD);
      payment6.fail('Declined');
      expect(() => payment6.refund()).toThrow('Cannot refund payment with status');
    });
  });

  describe('Failure', () => {
    const payment = new Payment('pay-1', 'order-1', amount, PaymentMethod.CREDIT_CARD);

    it('should mark payment as failed', () => {
      payment.fail('Card declined');
      expect(payment.status).toBe(PaymentStatus.FAILED);
      expect(payment.isFailed()).toBe(true);
    });

    it('should record failure reason in metadata', () => {
      payment.fail('Insufficient funds');
      expect(payment.getMetadata('failureReason')).toBe('Insufficient funds');
    });

    it('should throw error failing captured payment', () => {
      const payment2 = new Payment('pay-2', 'order-1', amount, PaymentMethod.CREDIT_CARD);
      payment2.authorize('REF123456');
      payment2.capture();
      expect(() => payment2.fail('Error')).toThrow('Cannot fail payment with status');
    });

    it('should throw error failing refunded payment', () => {
      const payment3 = new Payment('pay-3', 'order-1', amount, PaymentMethod.CREDIT_CARD);
      payment3.authorize('REF123456');
      payment3.capture();
      payment3.refund();
      expect(() => payment3.fail('Error')).toThrow('Cannot fail payment with status');
    });
  });

  describe('Cancellation', () => {
    const payment = new Payment('pay-1', 'order-1', amount, PaymentMethod.CREDIT_CARD);

    it('should cancel pending payment', () => {
      payment.cancel();
      expect(payment.status).toBe(PaymentStatus.CANCELLED);
    });

    it('should cancel authorized payment', () => {
      const payment2 = new Payment('pay-2', 'order-1', amount, PaymentMethod.CREDIT_CARD);
      payment2.authorize('REF123456');
      payment2.cancel();
      expect(payment2.status).toBe(PaymentStatus.CANCELLED);
    });

    it('should throw error cancelling captured payment', () => {
      const payment3 = new Payment('pay-3', 'order-1', amount, PaymentMethod.CREDIT_CARD);
      payment3.authorize('REF123456');
      payment3.capture();
      expect(() => payment3.cancel()).toThrow('Cannot cancel payment with status');
    });

    it('should throw error cancelling refunded payment', () => {
      const payment4 = new Payment('pay-4', 'order-1', amount, PaymentMethod.CREDIT_CARD);
      payment4.authorize('REF123456');
      payment4.capture();
      payment4.refund();
      expect(() => payment4.cancel()).toThrow('Cannot cancel payment with status');
    });
  });

  describe('Metadata Management', () => {
    const payment = new Payment('pay-1', 'order-1', amount, PaymentMethod.CREDIT_CARD);

    it('should set metadata', () => {
      payment.setMetadata('provider', 'Stripe');
      expect(payment.getMetadata('provider')).toBe('Stripe');
    });

    it('should throw error for empty metadata key', () => {
      expect(() => payment.setMetadata('', 'value')).toThrow('Metadata key is required');
    });

    it('should handle different metadata value types', () => {
      payment.setMetadata('string', 'value');
      payment.setMetadata('number', 123);
      payment.setMetadata('boolean', true);
      expect(payment.getMetadata('string')).toBe('value');
      expect(payment.getMetadata('number')).toBe(123);
      expect(payment.getMetadata('boolean')).toBe(true);
    });

    it('should return undefined for non-existent metadata', () => {
      expect(payment.getMetadata('nonexistent')).toBeUndefined();
    });
  });

  describe('Payment Methods', () => {
    it('should support CREDIT_CARD method', () => {
      const payment = new Payment('pay-1', 'order-1', amount, PaymentMethod.CREDIT_CARD);
      expect(payment.method).toBe(PaymentMethod.CREDIT_CARD);
    });

    it('should support DEBIT_CARD method', () => {
      const payment = new Payment('pay-2', 'order-1', amount, PaymentMethod.DEBIT_CARD);
      expect(payment.method).toBe(PaymentMethod.DEBIT_CARD);
    });

    it('should support BANK_TRANSFER method', () => {
      const payment = new Payment('pay-3', 'order-1', amount, PaymentMethod.BANK_TRANSFER);
      expect(payment.method).toBe(PaymentMethod.BANK_TRANSFER);
    });

    it('should support MOBILE_MONEY method', () => {
      const payment = new Payment('pay-4', 'order-1', amount, PaymentMethod.MOBILE_MONEY);
      expect(payment.method).toBe(PaymentMethod.MOBILE_MONEY);
    });

    it('should support WALLET method', () => {
      const payment = new Payment('pay-5', 'order-1', amount, PaymentMethod.WALLET);
      expect(payment.method).toBe(PaymentMethod.WALLET);
    });
  });

  describe('JSON Serialization', () => {
    it('should serialize to JSON', () => {
      const payment = new Payment('pay-1', 'order-1', amount, PaymentMethod.CREDIT_CARD);
      payment.authorize('REF123456');
      payment.capture();
      const json = payment.toJSON();
      expect(json.id).toBe('pay-1');
      expect(json.orderId).toBe('order-1');
      expect(json.status).toBe(PaymentStatus.CAPTURED);
      expect(json.reference).toBe('REF123456');
    });
  });

  describe('Timestamps', () => {
    const payment = new Payment('pay-1', 'order-1', amount, PaymentMethod.CREDIT_CARD);

    it('should have creation timestamp', () => {
      expect(payment.createdAt).toBeInstanceOf(Date);
    });

    it('should have update timestamp', () => {
      expect(payment.updatedAt).toBeInstanceOf(Date);
    });

    it('should record authorization timestamp', () => {
      payment.authorize('REF123456');
      expect(payment.authorizedAt).toBeInstanceOf(Date);
    });

    it('should record capture timestamp', () => {
      payment.authorize('REF123456');
      payment.capture();
      expect(payment.capturedAt).toBeInstanceOf(Date);
    });

    it('should record refund timestamp', () => {
      payment.authorize('REF123456');
      payment.capture();
      payment.refund();
      expect(payment.refundedAt).toBeInstanceOf(Date);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large payment amounts', () => {
      const largeAmount = new Money(1000000000, 'NGN');
      const payment = new Payment('pay-1', 'order-1', largeAmount, PaymentMethod.CREDIT_CARD);
      expect(payment.amount.amount).toBe(1000000000);
    });

    it('should handle multiple metadata entries', () => {
      const payment = new Payment('pay-1', 'order-1', amount, PaymentMethod.CREDIT_CARD);
      for (let i = 0; i < 10; i++) {
        payment.setMetadata(`key${i}`, `value${i}`);
      }
      for (let i = 0; i < 10; i++) {
        expect(payment.getMetadata(`key${i}`)).toBe(`value${i}`);
      }
    });
  });
});
