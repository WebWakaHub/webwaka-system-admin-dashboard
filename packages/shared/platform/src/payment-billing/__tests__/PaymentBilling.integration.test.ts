/**
 * Integration tests for the Payment & Billing System
 */

import { PaymentBilling } from '../PaymentBilling';
import { PaymentBillingConfig, SubscriptionStatus, PaymentStatus } from '../types';

describe('PaymentBilling Integration Tests', () => {
  let paymentBilling: PaymentBilling;
  let mockConfig: PaymentBillingConfig;
  let mockDatabase: any;
  let mockEventBus: any;
  let mockPermissionSystem: any;
  let mockPaymentGateways: any;

  const tenantId = 'tenant-integration-test';
  const userId = 'user-integration-test';

  beforeAll(async () => {
    mockDatabase = {
      query: jest.fn().mockResolvedValue({ rows: [] }),
    };

    mockEventBus = {
      publish: jest.fn().mockResolvedValue(undefined),
    };

    mockPermissionSystem = {
      checkPermission: jest.fn().mockResolvedValue(true),
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
        createCustomer: jest.fn().mockResolvedValue({
          customerId: 'cus_123',
          email: 'user@example.com',
        }),
        verifyWebhookSignature: jest.fn().mockReturnValue(true),
      },
    };

    mockConfig = {
      database: mockDatabase,
      eventBus: mockEventBus,
      permissionSystem: mockPermissionSystem,
      paymentGateways: mockPaymentGateways,
      defaultGateway: 'paystack',
    };

    paymentBilling = new PaymentBilling(mockConfig);
    await paymentBilling.initialize();
  });

  afterAll(async () => {
    await paymentBilling.shutdown();
  });

  describe('Complete Payment Flow', () => {
    it('should process a one-time payment end-to-end', async () => {
      const paymentService = paymentBilling.getPaymentService();

      // Initialize payment
      mockDatabase.query.mockResolvedValueOnce({ rows: [] });

      const { payment, authorizationUrl } = await paymentService.initializePayment(
        tenantId,
        userId,
        {
          amount: 500000,
          currency: 'NGN',
          email: 'user@example.com',
        }
      );

      expect(payment.status).toBe(PaymentStatus.PENDING);
      expect(authorizationUrl).toBe('https://checkout.paystack.com/xxx');

      // Verify payment after user completes checkout
      mockDatabase.query
        .mockResolvedValueOnce({
          rows: [
            {
              id: payment.id,
              tenant_id: tenantId,
              user_id: userId,
              amount: 500000,
              currency: 'NGN',
              status: PaymentStatus.PENDING,
              type: 'one_time',
              gateway: 'paystack',
              gateway_reference: payment.gatewayReference,
              created_at: new Date(),
              updated_at: new Date(),
            },
          ],
        })
        .mockResolvedValueOnce({ rows: [] });

      const verifiedPayment = await paymentService.verifyPayment(
        tenantId,
        payment.gatewayReference
      );

      expect(verifiedPayment.status).toBe(PaymentStatus.SUCCESS);
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'payment.success',
        expect.any(Object)
      );
    });
  });

  describe('Complete Subscription Flow', () => {
    it('should create, renew, and cancel a subscription', async () => {
      const subscriptionService = paymentBilling.getSubscriptionService();
      const paymentService = paymentBilling.getPaymentService();

      // Create a subscription
      mockDatabase.query
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'plan-1',
              product_id: 'product-1',
              tenant_id: tenantId,
              name: 'Pro Plan',
              amount: 500000,
              currency: 'NGN',
              interval: 'monthly',
              interval_count: 1,
              trial_period_days: 0,
              active: true,
              created_at: new Date(),
              updated_at: new Date(),
            },
          ],
        })
        .mockResolvedValueOnce({ rows: [] });

      const subscription = await subscriptionService.createSubscription(
        tenantId,
        userId,
        {
          planId: 'plan-1',
          customerId: 'cus_123',
          trialPeriodDays: 0,
        }
      );

      expect(subscription.status).toBe(SubscriptionStatus.ACTIVE);

      // Process renewal
      mockDatabase.query
        .mockResolvedValueOnce({
          rows: [
            {
              id: subscription.id,
              tenant_id: tenantId,
              user_id: userId,
              plan_id: 'plan-1',
              customer_id: 'cus_123',
              status: SubscriptionStatus.ACTIVE,
              current_period_start: new Date('2026-01-01'),
              current_period_end: new Date('2026-02-01'),
              cancel_at_period_end: false,
              created_at: new Date(),
              updated_at: new Date(),
            },
          ],
        })
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'plan-1',
              product_id: 'product-1',
              tenant_id: tenantId,
              name: 'Pro Plan',
              amount: 500000,
              currency: 'NGN',
              interval: 'monthly',
              interval_count: 1,
              active: true,
              created_at: new Date(),
              updated_at: new Date(),
            },
          ],
        })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      const renewalResult = await subscriptionService.processRenewal(
        tenantId,
        subscription.id
      );

      expect(renewalResult.success).toBe(true);

      // Cancel subscription
      mockDatabase.query
        .mockResolvedValueOnce({
          rows: [
            {
              id: subscription.id,
              tenant_id: tenantId,
              user_id: userId,
              plan_id: 'plan-1',
              status: SubscriptionStatus.ACTIVE,
              current_period_start: new Date(),
              current_period_end: new Date(),
              cancel_at_period_end: false,
              created_at: new Date(),
              updated_at: new Date(),
            },
          ],
        })
        .mockResolvedValueOnce({ rows: [] });

      const canceledSubscription = await subscriptionService.cancelSubscription(
        tenantId,
        userId,
        subscription.id,
        false
      );

      expect(canceledSubscription.status).toBe(SubscriptionStatus.CANCELED);
    });
  });

  describe('Webhook Processing', () => {
    it('should process a payment success webhook', async () => {
      const webhookService = paymentBilling.getWebhookService();

      const payload = {
        event: 'charge.success',
        data: {
          id: 'evt_123',
          reference: 'pay_123',
          amount: 500000,
          currency: 'NGN',
        },
      };

      mockDatabase.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      await webhookService.processWebhook(
        'paystack',
        payload,
        'valid_signature'
      );

      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'payment.webhook.success',
        expect.any(Object)
      );
    });

    it('should reject webhook with invalid signature', async () => {
      const webhookService = paymentBilling.getWebhookService();

      mockPaymentGateways.paystack.verifyWebhookSignature.mockReturnValueOnce(false);

      const payload = {
        event: 'charge.success',
        data: { id: 'evt_123' },
      };

      await expect(
        webhookService.processWebhook('paystack', payload, 'invalid_signature')
      ).rejects.toThrow('Invalid webhook signature');
    });
  });
});
