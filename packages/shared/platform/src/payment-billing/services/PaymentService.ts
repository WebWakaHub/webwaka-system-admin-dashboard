/**
 * PaymentService - Handles payment processing
 */

import {
  Payment,
  PaymentStatus,
  PaymentType,
  PaymentGatewayProvider,
  InitializePaymentParams,
} from '../types';
import { PaymentGatewayError, PaymentNotFoundError } from '../errors';

export class PaymentService {
  constructor(
    private database: any,
    private eventBus: any,
    private paymentGateways: Record<string, PaymentGatewayProvider>,
    private defaultGateway: string
  ) {}

  /**
   * Initialize a one-time payment
   */
  async initializePayment(
    tenantId: string,
    userId: string,
    params: {
      amount: number;
      currency: string;
      email: string;
      gateway?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<{ payment: Payment; authorizationUrl: string }> {
    const gateway = params.gateway || this.defaultGateway;
    const provider = this.paymentGateways[gateway];

    if (!provider) {
      throw new PaymentGatewayError(`Payment gateway not configured: ${gateway}`);
    }

    // Generate unique reference
    const reference = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create payment record
    const payment: Payment = {
      id: `payment-${Date.now()}`,
      tenantId,
      userId,
      amount: params.amount,
      currency: params.currency,
      status: PaymentStatus.PENDING,
      type: PaymentType.ONE_TIME,
      gateway,
      gatewayReference: reference,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.database.query(
      `INSERT INTO payments (id, tenant_id, user_id, amount, currency, status, type, gateway, gateway_reference, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        payment.id,
        payment.tenantId,
        payment.userId,
        payment.amount,
        payment.currency,
        payment.status,
        payment.type,
        payment.gateway,
        payment.gatewayReference,
        payment.createdAt,
        payment.updatedAt,
      ]
    );

    // Initialize payment with gateway
    const initParams: InitializePaymentParams = {
      amount: params.amount,
      currency: params.currency,
      email: params.email,
      reference,
      metadata: params.metadata,
    };

    try {
      const result = await provider.initializePayment(initParams);

      // Emit event
      await this.eventBus.publish('payment.initialized', {
        paymentId: payment.id,
        tenantId,
        userId,
        amount: params.amount,
        currency: params.currency,
        gateway,
      });

      return {
        payment,
        authorizationUrl: result.authorizationUrl,
      };
    } catch (error: any) {
      throw new PaymentGatewayError(
        `Failed to initialize payment: ${error.message}`,
        error
      );
    }
  }

  /**
   * Verify a payment
   */
  async verifyPayment(
    tenantId: string,
    reference: string
  ): Promise<Payment> {
    // Get payment by reference
    const result = await this.database.query(
      `SELECT * FROM payments WHERE tenant_id = $1 AND gateway_reference = $2`,
      [tenantId, reference]
    );

    if (result.rows.length === 0) {
      throw new PaymentNotFoundError(reference);
    }

    const payment = this.mapRowToPayment(result.rows[0]);
    const provider = this.paymentGateways[payment.gateway];

    if (!provider) {
      throw new PaymentGatewayError(`Payment gateway not configured: ${payment.gateway}`);
    }

    try {
      const verification = await provider.verifyPayment(reference);

      // Update payment status
      payment.status =
        verification.status === 'success'
          ? PaymentStatus.SUCCESS
          : PaymentStatus.FAILED;
      payment.paidAt = verification.paidAt;
      payment.gatewayResponse = verification.gatewayResponse;
      payment.updatedAt = new Date();

      await this.database.query(
        `UPDATE payments SET status = $1, paid_at = $2, gateway_response = $3, updated_at = $4 WHERE id = $5`,
        [payment.status, payment.paidAt, JSON.stringify(payment.gatewayResponse), payment.updatedAt, payment.id]
      );

      // Emit event
      await this.eventBus.publish(
        payment.status === PaymentStatus.SUCCESS
          ? 'payment.success'
          : 'payment.failed',
        {
          paymentId: payment.id,
          tenantId: payment.tenantId,
          userId: payment.userId,
          amount: payment.amount,
          currency: payment.currency,
          gateway: payment.gateway,
        }
      );

      return payment;
    } catch (error: any) {
      throw new PaymentGatewayError(
        `Failed to verify payment: ${error.message}`,
        error
      );
    }
  }

  /**
   * Get payment by ID
   */
  async getPayment(tenantId: string, paymentId: string): Promise<Payment> {
    const result = await this.database.query(
      `SELECT * FROM payments WHERE tenant_id = $1 AND id = $2`,
      [tenantId, paymentId]
    );

    if (result.rows.length === 0) {
      throw new PaymentNotFoundError(paymentId);
    }

    return this.mapRowToPayment(result.rows[0]);
  }

  /**
   * List payments for a user
   */
  async listPayments(tenantId: string, userId: string): Promise<Payment[]> {
    const result = await this.database.query(
      `SELECT * FROM payments WHERE tenant_id = $1 AND user_id = $2 ORDER BY created_at DESC`,
      [tenantId, userId]
    );

    return result.rows.map(this.mapRowToPayment);
  }

  /**
   * Charge a customer (for subscriptions)
   */
  async chargeCustomer(
    tenantId: string,
    userId: string,
    params: {
      customerId: string;
      amount: number;
      currency: string;
      gateway: string;
      subscriptionId?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<Payment> {
    const provider = this.paymentGateways[params.gateway];

    if (!provider) {
      throw new PaymentGatewayError(`Payment gateway not configured: ${params.gateway}`);
    }

    // Generate unique reference
    const reference = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create payment record
    const payment: Payment = {
      id: `payment-${Date.now()}`,
      tenantId,
      userId,
      subscriptionId: params.subscriptionId,
      amount: params.amount,
      currency: params.currency,
      status: PaymentStatus.PENDING,
      type: PaymentType.SUBSCRIPTION,
      gateway: params.gateway,
      gatewayReference: reference,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.database.query(
      `INSERT INTO payments (id, tenant_id, user_id, subscription_id, amount, currency, status, type, gateway, gateway_reference, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        payment.id,
        payment.tenantId,
        payment.userId,
        payment.subscriptionId,
        payment.amount,
        payment.currency,
        payment.status,
        payment.type,
        payment.gateway,
        payment.gatewayReference,
        payment.createdAt,
        payment.updatedAt,
      ]
    );

    try {
      const result = await provider.chargeCustomer({
        customerId: params.customerId,
        amount: params.amount,
        currency: params.currency,
        reference,
        metadata: params.metadata,
      });

      // Update payment status
      payment.status =
        result.status === 'success' ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;
      payment.paidAt = result.status === 'success' ? new Date() : undefined;
      payment.updatedAt = new Date();

      await this.database.query(
        `UPDATE payments SET status = $1, paid_at = $2, updated_at = $3 WHERE id = $4`,
        [payment.status, payment.paidAt, payment.updatedAt, payment.id]
      );

      // Emit event
      await this.eventBus.publish(
        payment.status === PaymentStatus.SUCCESS
          ? 'payment.success'
          : 'payment.failed',
        {
          paymentId: payment.id,
          tenantId: payment.tenantId,
          userId: payment.userId,
          subscriptionId: payment.subscriptionId,
          amount: payment.amount,
          currency: payment.currency,
          gateway: payment.gateway,
        }
      );

      return payment;
    } catch (error: any) {
      // Update payment as failed
      payment.status = PaymentStatus.FAILED;
      payment.updatedAt = new Date();

      await this.database.query(
        `UPDATE payments SET status = $1, updated_at = $2 WHERE id = $3`,
        [payment.status, payment.updatedAt, payment.id]
      );

      throw new PaymentGatewayError(
        `Failed to charge customer: ${error.message}`,
        error
      );
    }
  }

  private mapRowToPayment(row: any): Payment {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      userId: row.user_id,
      subscriptionId: row.subscription_id,
      amount: row.amount,
      currency: row.currency,
      status: row.status,
      type: row.type,
      gateway: row.gateway,
      gatewayReference: row.gateway_reference,
      gatewayResponse: row.gateway_response,
      paidAt: row.paid_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
