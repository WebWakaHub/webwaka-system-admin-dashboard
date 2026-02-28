/**
 * Unit tests for PaymentService
 */

import { PaymentService } from '../services/PaymentService';
import { PaymentStatus, PaymentType } from '../types';

describe('PaymentService', () => {
  let service: PaymentService;
  let mockDatabase: any;
  let mockEventBus: any;
  let mockPaymentGateways: any;

  beforeEach(() => {
    mockDatabase = {
      query: jest.fn(),
    };

    mockEventBus = {
      publish: jest.fn().mockResolvedValue(undefined),
    };

    mockPaymentGateways = {
      paystack: {
        name: 'paystack',
        initializePayment: jest.fn().mockResolvedValue({
          authorizationUrl: 'https://checkout.paystack.com/xxx',
          accessCode: 'xxx',
          reference: 'pay_123',
        }),
        verifyPayment: jest.fn().mockResolvedValue({
          status: 'success',
          amount: 500000,
          currency: 'NGN',
          reference: 'pay_123',
          paidAt: new Date(),
        }),
        chargeCustomer: jest.fn().mockResolvedValue({
          status: 'success',
          reference: 'sub_123',
          amount: 500000,
          currency: 'NGN',
        }),
      },
    };

    service = new PaymentService(
      mockDatabase,
      mockEventBus,
      mockPaymentGateways,
      'paystack'
    );
  });

  describe('initializePayment', () => {
    it('should initialize a one-time payment successfully', async () => {
      mockDatabase.query.mockResolvedValueOnce({ rows: [] });

      const result = await service.initializePayment('tenant-1', 'user-1', {
        amount: 500000,
        currency: 'NGN',
        email: 'user@example.com',
      });

      expect(result.payment.status).toBe(PaymentStatus.PENDING);
      expect(result.payment.type).toBe(PaymentType.ONE_TIME);
      expect(result.authorizationUrl).toBe('https://checkout.paystack.com/xxx');
      expect(mockDatabase.query).toHaveBeenCalled();
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'payment.initialized',
        expect.any(Object)
      );
    });

    it('should throw error for unconfigured gateway', async () => {
      await expect(
        service.initializePayment('tenant-1', 'user-1', {
          amount: 500000,
          currency: 'NGN',
          email: 'user@example.com',
          gateway: 'unknown',
        })
      ).rejects.toThrow('Payment gateway not configured');
    });
  });

  describe('verifyPayment', () => {
    it('should verify a successful payment', async () => {
      mockDatabase.query
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'payment-1',
              tenant_id: 'tenant-1',
              user_id: 'user-1',
              amount: 500000,
              currency: 'NGN',
              status: PaymentStatus.PENDING,
              type: PaymentType.ONE_TIME,
              gateway: 'paystack',
              gateway_reference: 'pay_123',
              created_at: new Date(),
              updated_at: new Date(),
            },
          ],
        })
        .mockResolvedValueOnce({ rows: [] });

      const payment = await service.verifyPayment('tenant-1', 'pay_123');

      expect(payment.status).toBe(PaymentStatus.SUCCESS);
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'payment.success',
        expect.any(Object)
      );
    });

    it('should handle failed payment verification', async () => {
      mockPaymentGateways.paystack.verifyPayment.mockResolvedValueOnce({
        status: 'failed',
        amount: 500000,
        currency: 'NGN',
        reference: 'pay_123',
      });

      mockDatabase.query
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'payment-1',
              tenant_id: 'tenant-1',
              user_id: 'user-1',
              amount: 500000,
              currency: 'NGN',
              status: PaymentStatus.PENDING,
              type: PaymentType.ONE_TIME,
              gateway: 'paystack',
              gateway_reference: 'pay_123',
              created_at: new Date(),
              updated_at: new Date(),
            },
          ],
        })
        .mockResolvedValueOnce({ rows: [] });

      const payment = await service.verifyPayment('tenant-1', 'pay_123');

      expect(payment.status).toBe(PaymentStatus.FAILED);
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'payment.failed',
        expect.any(Object)
      );
    });

    it('should throw error for non-existent payment', async () => {
      mockDatabase.query.mockResolvedValueOnce({ rows: [] });

      await expect(
        service.verifyPayment('tenant-1', 'pay_nonexistent')
      ).rejects.toThrow('Payment not found');
    });
  });

  describe('chargeCustomer', () => {
    it('should charge a customer successfully', async () => {
      mockDatabase.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      const payment = await service.chargeCustomer('tenant-1', 'user-1', {
        customerId: 'cus_123',
        amount: 500000,
        currency: 'NGN',
        gateway: 'paystack',
        subscriptionId: 'sub-1',
      });

      expect(payment.status).toBe(PaymentStatus.SUCCESS);
      expect(payment.type).toBe(PaymentType.SUBSCRIPTION);
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'payment.success',
        expect.any(Object)
      );
    });

    it('should handle failed charge', async () => {
      mockPaymentGateways.paystack.chargeCustomer.mockResolvedValueOnce({
        status: 'failed',
        reference: 'sub_123',
        amount: 500000,
        currency: 'NGN',
      });

      mockDatabase.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      const payment = await service.chargeCustomer('tenant-1', 'user-1', {
        customerId: 'cus_123',
        amount: 500000,
        currency: 'NGN',
        gateway: 'paystack',
        subscriptionId: 'sub-1',
      });

      expect(payment.status).toBe(PaymentStatus.FAILED);
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'payment.failed',
        expect.any(Object)
      );
    });
  });

  describe('getPayment', () => {
    it('should retrieve a payment by ID', async () => {
      mockDatabase.query.mockResolvedValueOnce({
        rows: [
          {
            id: 'payment-1',
            tenant_id: 'tenant-1',
            user_id: 'user-1',
            amount: 500000,
            currency: 'NGN',
            status: PaymentStatus.SUCCESS,
            type: PaymentType.ONE_TIME,
            gateway: 'paystack',
            gateway_reference: 'pay_123',
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
      });

      const payment = await service.getPayment('tenant-1', 'payment-1');

      expect(payment.id).toBe('payment-1');
      expect(payment.status).toBe(PaymentStatus.SUCCESS);
    });

    it('should throw error for non-existent payment', async () => {
      mockDatabase.query.mockResolvedValueOnce({ rows: [] });

      await expect(
        service.getPayment('tenant-1', 'payment-nonexistent')
      ).rejects.toThrow('Payment not found');
    });
  });

  describe('listPayments', () => {
    it('should list all payments for a user', async () => {
      mockDatabase.query.mockResolvedValueOnce({
        rows: [
          {
            id: 'payment-1',
            tenant_id: 'tenant-1',
            user_id: 'user-1',
            amount: 500000,
            currency: 'NGN',
            status: PaymentStatus.SUCCESS,
            type: PaymentType.ONE_TIME,
            gateway: 'paystack',
            gateway_reference: 'pay_123',
            created_at: new Date(),
            updated_at: new Date(),
          },
          {
            id: 'payment-2',
            tenant_id: 'tenant-1',
            user_id: 'user-1',
            amount: 300000,
            currency: 'NGN',
            status: PaymentStatus.SUCCESS,
            type: PaymentType.SUBSCRIPTION,
            gateway: 'paystack',
            gateway_reference: 'sub_456',
            subscription_id: 'sub-1',
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
      });

      const payments = await service.listPayments('tenant-1', 'user-1');

      expect(payments).toHaveLength(2);
      expect(payments[0].id).toBe('payment-1');
      expect(payments[1].id).toBe('payment-2');
    });
  });
});
