/**
 * Hospitality Booking Engine - Payment Gateway Adapter
 * 
 * Abstract payment gateway adapter implementing adapter pattern for
 * multi-gateway support (Paystack, Flutterwave, Interswitch).
 * 
 * @module hospitality-booking-engine/adapters/payment-gateway-adapter
 * @author webwakaagent4
 */

import { PaymentGateway, PaymentGatewayResponse, PaymentVerificationResponse } from '../types';

/**
 * Payment Initialization Request
 */
export interface PaymentInitializationRequest {
  bookingId: string;
  amount: number;
  currency: string;
  gateway: PaymentGateway;
  email: string;
  metadata?: Record<string, any>;
}

/**
 * Refund Request
 */
export interface RefundRequest {
  paymentId: string;
  amount: number;
  reason?: string;
}

/**
 * Payment Gateway Adapter Interface
 * 
 * Defines the contract that all payment gateway implementations must follow.
 */
export interface IPaymentGateway {
  /**
   * Initialize payment and get payment URL
   */
  initializePayment(request: PaymentInitializationRequest): Promise<PaymentGatewayResponse>;

  /**
   * Verify payment status
   */
  verifyPayment(reference: string): Promise<PaymentVerificationResponse>;

  /**
   * Process refund
   */
  processRefund(request: RefundRequest): Promise<PaymentGatewayResponse>;
}

/**
 * Payment Gateway Adapter
 * 
 * Implements multi-gateway support with automatic fallback.
 */
export class PaymentGatewayAdapter {
  private gateways: Map<PaymentGateway, IPaymentGateway>;
  private fallbackOrder: PaymentGateway[];

  constructor(gateways: Map<PaymentGateway, IPaymentGateway>) {
    this.gateways = gateways;
    this.fallbackOrder = [
      PaymentGateway.PAYSTACK,
      PaymentGateway.FLUTTERWAVE,
      PaymentGateway.INTERSWITCH,
    ];
  }

  /**
   * Initialize Payment with Fallback
   * 
   * Attempts to initialize payment with primary gateway, falls back to
   * secondary gateways if primary fails.
   */
  async initializePayment(request: PaymentInitializationRequest): Promise<PaymentGatewayResponse> {
    const primaryGateway = this.gateways.get(request.gateway);

    if (!primaryGateway) {
      throw new Error(`Gateway not configured: ${request.gateway}`);
    }

    try {
      const response = await primaryGateway.initializePayment(request);
      
      if (response.success) {
        return response;
      }

      // Primary gateway failed, try fallback
      console.warn(`Primary gateway ${request.gateway} failed: ${response.error}`);
      return await this.tryFallbackGateways(request);
    } catch (error) {
      console.error(`Primary gateway ${request.gateway} error:`, error);
      return await this.tryFallbackGateways(request);
    }
  }

  /**
   * Try Fallback Gateways
   * 
   * Attempts payment initialization with fallback gateways in order.
   */
  private async tryFallbackGateways(
    request: PaymentInitializationRequest
  ): Promise<PaymentGatewayResponse> {
    const fallbackGateways = this.fallbackOrder.filter(g => g !== request.gateway);

    for (const gateway of fallbackGateways) {
      const gatewayImpl = this.gateways.get(gateway);
      
      if (!gatewayImpl) continue;

      try {
        console.log(`Trying fallback gateway: ${gateway}`);
        const response = await gatewayImpl.initializePayment({
          ...request,
          gateway,
        });

        if (response.success) {
          console.log(`Fallback gateway ${gateway} succeeded`);
          return response;
        }
      } catch (error) {
        console.error(`Fallback gateway ${gateway} error:`, error);
        continue;
      }
    }

    return {
      success: false,
      error: 'All payment gateways failed',
    };
  }

  /**
   * Verify Payment
   * 
   * Verifies payment status with the appropriate gateway.
   */
  async verifyPayment(gateway: PaymentGateway, reference: string): Promise<PaymentVerificationResponse> {
    const gatewayImpl = this.gateways.get(gateway);

    if (!gatewayImpl) {
      throw new Error(`Gateway not configured: ${gateway}`);
    }

    return await gatewayImpl.verifyPayment(reference);
  }

  /**
   * Process Refund
   * 
   * Processes refund through the appropriate gateway.
   */
  async processRefund(gateway: PaymentGateway, request: RefundRequest): Promise<PaymentGatewayResponse> {
    const gatewayImpl = this.gateways.get(gateway);

    if (!gatewayImpl) {
      throw new Error(`Gateway not configured: ${gateway}`);
    }

    return await gatewayImpl.processRefund(request);
  }
}
