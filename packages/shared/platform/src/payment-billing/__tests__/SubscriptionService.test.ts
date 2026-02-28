/**
 * Unit tests for SubscriptionService
 */

import { SubscriptionService } from '../services/SubscriptionService';
import { PaymentService } from '../services/PaymentService';
import { SubscriptionStatus, BillingInterval } from '../types';

describe('SubscriptionService', () => {
  let service: SubscriptionService;
  let mockDatabase: any;
  let mockEventBus: any;
  let mockPermissionSystem: any;
  let mockPaymentService: PaymentService;

  beforeEach(() => {
    mockDatabase = {
      query: jest.fn(),
    };

    mockEventBus = {
      publish: jest.fn().mockResolvedValue(undefined),
    };

    mockPermissionSystem = {
      checkPermission: jest.fn().mockResolvedValue(true),
    };

    mockPaymentService = {
      chargeCustomer: jest.fn(),
    } as any;

    service = new SubscriptionService(
      mockDatabase,
      mockEventBus,
      mockPermissionSystem,
      mockPaymentService
    );
  });

  describe('createSubscription', () => {
    it('should create a subscription with trial period', async () => {
      mockDatabase.query
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'plan-1',
              product_id: 'product-1',
              tenant_id: 'tenant-1',
              name: 'Pro Plan',
              amount: 500000,
              currency: 'NGN',
              interval: BillingInterval.MONTHLY,
              interval_count: 1,
              trial_period_days: 14,
              active: true,
              created_at: new Date(),
              updated_at: new Date(),
            },
          ],
        })
        .mockResolvedValueOnce({ rows: [] });

      const subscription = await service.createSubscription(
        'tenant-1',
        'user-1',
        {
          planId: 'plan-1',
          customerId: 'cus_123',
        }
      );

      expect(subscription.status).toBe(SubscriptionStatus.TRIALING);
      expect(subscription.trialStart).toBeDefined();
      expect(subscription.trialEnd).toBeDefined();
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'subscription.created',
        expect.any(Object)
      );
    });

    it('should create an active subscription without trial', async () => {
      mockDatabase.query
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'plan-1',
              product_id: 'product-1',
              tenant_id: 'tenant-1',
              name: 'Pro Plan',
              amount: 500000,
              currency: 'NGN',
              interval: BillingInterval.MONTHLY,
              interval_count: 1,
              trial_period_days: null,
              active: true,
              created_at: new Date(),
              updated_at: new Date(),
            },
          ],
        })
        .mockResolvedValueOnce({ rows: [] });

      const subscription = await service.createSubscription(
        'tenant-1',
        'user-1',
        {
          planId: 'plan-1',
          customerId: 'cus_123',
          trialPeriodDays: 0,
        }
      );

      expect(subscription.status).toBe(SubscriptionStatus.ACTIVE);
      expect(subscription.trialStart).toBeUndefined();
    });

    it('should throw error if permission denied', async () => {
      mockPermissionSystem.checkPermission.mockResolvedValueOnce(false);

      await expect(
        service.createSubscription('tenant-1', 'user-1', {
          planId: 'plan-1',
        })
      ).rejects.toThrow('Permission denied');
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel subscription at period end', async () => {
      mockDatabase.query
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'sub-1',
              tenant_id: 'tenant-1',
              user_id: 'user-1',
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

      const subscription = await service.cancelSubscription(
        'tenant-1',
        'user-1',
        'sub-1',
        true
      );

      expect(subscription.cancelAtPeriodEnd).toBe(true);
      expect(subscription.status).toBe(SubscriptionStatus.ACTIVE);
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'subscription.canceled',
        expect.any(Object)
      );
    });

    it('should cancel subscription immediately', async () => {
      mockDatabase.query
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'sub-1',
              tenant_id: 'tenant-1',
              user_id: 'user-1',
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

      const subscription = await service.cancelSubscription(
        'tenant-1',
        'user-1',
        'sub-1',
        false
      );

      expect(subscription.status).toBe(SubscriptionStatus.CANCELED);
      expect(subscription.canceledAt).toBeDefined();
    });
  });

  describe('processRenewal', () => {
    it('should successfully renew a subscription', async () => {
      mockDatabase.query
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'sub-1',
              tenant_id: 'tenant-1',
              user_id: 'user-1',
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
              tenant_id: 'tenant-1',
              name: 'Pro Plan',
              amount: 500000,
              currency: 'NGN',
              interval: BillingInterval.MONTHLY,
              interval_count: 1,
              active: true,
              created_at: new Date(),
              updated_at: new Date(),
            },
          ],
        })
        .mockResolvedValueOnce({ rows: [] });

      mockPaymentService.chargeCustomer = jest.fn().mockResolvedValue({
        id: 'payment-1',
        status: 'success',
        amount: 500000,
        currency: 'NGN',
      });

      const result = await service.processRenewal('tenant-1', 'sub-1');

      expect(result.success).toBe(true);
      expect(result.payment).toBeDefined();
    });

    it('should handle failed renewal', async () => {
      mockDatabase.query
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'sub-1',
              tenant_id: 'tenant-1',
              user_id: 'user-1',
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
              tenant_id: 'tenant-1',
              name: 'Pro Plan',
              amount: 500000,
              currency: 'NGN',
              interval: BillingInterval.MONTHLY,
              interval_count: 1,
              active: true,
              created_at: new Date(),
              updated_at: new Date(),
            },
          ],
        })
        .mockResolvedValueOnce({ rows: [] });

      mockPaymentService.chargeCustomer = jest.fn().mockResolvedValue({
        id: 'payment-1',
        status: 'failed',
        amount: 500000,
        currency: 'NGN',
      });

      const result = await service.processRenewal('tenant-1', 'sub-1');

      expect(result.success).toBe(false);
    });
  });
});
