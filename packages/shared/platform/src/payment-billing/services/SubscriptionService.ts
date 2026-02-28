/**
 * SubscriptionService - Manages subscription lifecycle
 */

import {
  Subscription,
  SubscriptionStatus,
  Plan,
  BillingInterval,
} from '../types';
import {
  SubscriptionNotFoundError,
  PlanNotFoundError,
  PermissionDeniedError,
} from '../errors';
import { PaymentService } from './PaymentService';

export class SubscriptionService {
  constructor(
    private database: any,
    private eventBus: any,
    private permissionSystem: any,
    private paymentService: PaymentService
  ) {}

  /**
   * Create a new subscription
   */
  async createSubscription(
    tenantId: string,
    userId: string,
    params: {
      planId: string;
      customerId?: string;
      trialPeriodDays?: number;
    }
  ): Promise<Subscription> {
    // Check permission
    const hasPermission = await this.permissionSystem.checkPermission(
      userId,
      'billing.subscription.create'
    );
    if (!hasPermission) {
      throw new PermissionDeniedError('billing.subscription.create');
    }

    // Get plan
    const plan = await this.getPlan(tenantId, params.planId);

    // Calculate period dates
    const now = new Date();
    const trialDays = params.trialPeriodDays ?? plan.trialPeriodDays ?? 0;
    const trialStart = trialDays > 0 ? now : undefined;
    const trialEnd = trialDays > 0 ? this.addDays(now, trialDays) : undefined;
    const currentPeriodStart = trialEnd || now;
    const currentPeriodEnd = this.calculatePeriodEnd(
      currentPeriodStart,
      plan.interval,
      plan.intervalCount
    );

    const subscription: Subscription = {
      id: `sub-${Date.now()}`,
      tenantId,
      userId,
      planId: params.planId,
      customerId: params.customerId,
      status: trialDays > 0 ? SubscriptionStatus.TRIALING : SubscriptionStatus.ACTIVE,
      currentPeriodStart,
      currentPeriodEnd,
      trialStart,
      trialEnd,
      cancelAtPeriodEnd: false,
      createdAt: now,
      updatedAt: now,
    };

    await this.database.query(
      `INSERT INTO subscriptions (id, tenant_id, user_id, plan_id, customer_id, status, current_period_start, current_period_end, trial_start, trial_end, cancel_at_period_end, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        subscription.id,
        subscription.tenantId,
        subscription.userId,
        subscription.planId,
        subscription.customerId,
        subscription.status,
        subscription.currentPeriodStart,
        subscription.currentPeriodEnd,
        subscription.trialStart,
        subscription.trialEnd,
        subscription.cancelAtPeriodEnd,
        subscription.createdAt,
        subscription.updatedAt,
      ]
    );

    // Emit event
    await this.eventBus.publish('subscription.created', {
      subscriptionId: subscription.id,
      tenantId,
      userId,
      planId: params.planId,
      status: subscription.status,
    });

    return subscription;
  }

  /**
   * Get subscription by ID
   */
  async getSubscription(
    tenantId: string,
    subscriptionId: string
  ): Promise<Subscription> {
    const result = await this.database.query(
      `SELECT * FROM subscriptions WHERE tenant_id = $1 AND id = $2`,
      [tenantId, subscriptionId]
    );

    if (result.rows.length === 0) {
      throw new SubscriptionNotFoundError(subscriptionId);
    }

    return this.mapRowToSubscription(result.rows[0]);
  }

  /**
   * List subscriptions for a user
   */
  async listSubscriptions(tenantId: string, userId: string): Promise<Subscription[]> {
    const result = await this.database.query(
      `SELECT * FROM subscriptions WHERE tenant_id = $1 AND user_id = $2 ORDER BY created_at DESC`,
      [tenantId, userId]
    );

    return result.rows.map(this.mapRowToSubscription);
  }

  /**
   * Update subscription plan (upgrade/downgrade)
   */
  async updateSubscriptionPlan(
    tenantId: string,
    userId: string,
    subscriptionId: string,
    newPlanId: string
  ): Promise<Subscription> {
    // Check permission
    const hasPermission = await this.permissionSystem.checkPermission(
      userId,
      'billing.subscription.update'
    );
    if (!hasPermission) {
      throw new PermissionDeniedError('billing.subscription.update');
    }

    const subscription = await this.getSubscription(tenantId, subscriptionId);
    const newPlan = await this.getPlan(tenantId, newPlanId);

    subscription.planId = newPlanId;
    subscription.updatedAt = new Date();

    await this.database.query(
      `UPDATE subscriptions SET plan_id = $1, updated_at = $2 WHERE id = $3`,
      [subscription.planId, subscription.updatedAt, subscription.id]
    );

    // Emit event
    await this.eventBus.publish('subscription.updated', {
      subscriptionId: subscription.id,
      tenantId,
      userId,
      oldPlanId: subscription.planId,
      newPlanId,
    });

    return subscription;
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    tenantId: string,
    userId: string,
    subscriptionId: string,
    cancelAtPeriodEnd: boolean = true
  ): Promise<Subscription> {
    // Check permission
    const hasPermission = await this.permissionSystem.checkPermission(
      userId,
      'billing.subscription.cancel'
    );
    if (!hasPermission) {
      throw new PermissionDeniedError('billing.subscription.cancel');
    }

    const subscription = await this.getSubscription(tenantId, subscriptionId);

    if (cancelAtPeriodEnd) {
      subscription.cancelAtPeriodEnd = true;
      subscription.updatedAt = new Date();

      await this.database.query(
        `UPDATE subscriptions SET cancel_at_period_end = $1, updated_at = $2 WHERE id = $3`,
        [subscription.cancelAtPeriodEnd, subscription.updatedAt, subscription.id]
      );
    } else {
      subscription.status = SubscriptionStatus.CANCELED;
      subscription.canceledAt = new Date();
      subscription.updatedAt = new Date();

      await this.database.query(
        `UPDATE subscriptions SET status = $1, canceled_at = $2, updated_at = $3 WHERE id = $4`,
        [subscription.status, subscription.canceledAt, subscription.updatedAt, subscription.id]
      );
    }

    // Emit event
    await this.eventBus.publish('subscription.canceled', {
      subscriptionId: subscription.id,
      tenantId,
      userId,
      cancelAtPeriodEnd,
    });

    return subscription;
  }

  /**
   * Process subscription renewal (called by BillingService)
   */
  async processRenewal(
    tenantId: string,
    subscriptionId: string
  ): Promise<{ success: boolean; payment?: any }> {
    const subscription = await this.getSubscription(tenantId, subscriptionId);
    const plan = await this.getPlan(tenantId, subscription.planId);

    if (!subscription.customerId) {
      // No payment method on file
      subscription.status = SubscriptionStatus.UNPAID;
      subscription.updatedAt = new Date();

      await this.database.query(
        `UPDATE subscriptions SET status = $1, updated_at = $2 WHERE id = $3`,
        [subscription.status, subscription.updatedAt, subscription.id]
      );

      return { success: false };
    }

    try {
      // Charge the customer
      const payment = await this.paymentService.chargeCustomer(
        tenantId,
        subscription.userId,
        {
          customerId: subscription.customerId,
          amount: plan.amount,
          currency: plan.currency,
          gateway: 'paystack', // Default gateway
          subscriptionId: subscription.id,
        }
      );

      if (payment.status === 'success') {
        // Update subscription period
        const newPeriodStart = subscription.currentPeriodEnd;
        const newPeriodEnd = this.calculatePeriodEnd(
          newPeriodStart,
          plan.interval,
          plan.intervalCount
        );

        subscription.status = SubscriptionStatus.ACTIVE;
        subscription.currentPeriodStart = newPeriodStart;
        subscription.currentPeriodEnd = newPeriodEnd;
        subscription.updatedAt = new Date();

        await this.database.query(
          `UPDATE subscriptions SET status = $1, current_period_start = $2, current_period_end = $3, updated_at = $4 WHERE id = $5`,
          [
            subscription.status,
            subscription.currentPeriodStart,
            subscription.currentPeriodEnd,
            subscription.updatedAt,
            subscription.id,
          ]
        );

        return { success: true, payment };
      } else {
        // Payment failed
        subscription.status = SubscriptionStatus.PAST_DUE;
        subscription.updatedAt = new Date();

        await this.database.query(
          `UPDATE subscriptions SET status = $1, updated_at = $2 WHERE id = $3`,
          [subscription.status, subscription.updatedAt, subscription.id]
        );

        return { success: false, payment };
      }
    } catch (error) {
      // Payment failed
      subscription.status = SubscriptionStatus.PAST_DUE;
      subscription.updatedAt = new Date();

      await this.database.query(
        `UPDATE subscriptions SET status = $1, updated_at = $2 WHERE id = $3`,
        [subscription.status, subscription.updatedAt, subscription.id]
      );

      return { success: false };
    }
  }

  /**
   * Get plan by ID
   */
  private async getPlan(tenantId: string, planId: string): Promise<Plan> {
    const result = await this.database.query(
      `SELECT * FROM plans WHERE tenant_id = $1 AND id = $2`,
      [tenantId, planId]
    );

    if (result.rows.length === 0) {
      throw new PlanNotFoundError(planId);
    }

    return this.mapRowToPlan(result.rows[0]);
  }

  private calculatePeriodEnd(
    start: Date,
    interval: BillingInterval,
    intervalCount: number
  ): Date {
    const end = new Date(start);

    switch (interval) {
      case BillingInterval.DAILY:
        end.setDate(end.getDate() + intervalCount);
        break;
      case BillingInterval.WEEKLY:
        end.setDate(end.getDate() + intervalCount * 7);
        break;
      case BillingInterval.MONTHLY:
        end.setMonth(end.getMonth() + intervalCount);
        break;
      case BillingInterval.YEARLY:
        end.setFullYear(end.getFullYear() + intervalCount);
        break;
    }

    return end;
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  private mapRowToSubscription(row: any): Subscription {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      userId: row.user_id,
      planId: row.plan_id,
      customerId: row.customer_id,
      status: row.status,
      currentPeriodStart: row.current_period_start,
      currentPeriodEnd: row.current_period_end,
      trialStart: row.trial_start,
      trialEnd: row.trial_end,
      canceledAt: row.canceled_at,
      cancelAtPeriodEnd: row.cancel_at_period_end,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapRowToPlan(row: any): Plan {
    return {
      id: row.id,
      productId: row.product_id,
      tenantId: row.tenant_id,
      name: row.name,
      description: row.description,
      amount: row.amount,
      currency: row.currency,
      interval: row.interval,
      intervalCount: row.interval_count,
      trialPeriodDays: row.trial_period_days,
      active: row.active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
