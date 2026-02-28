/**
 * Hospitality Booking Engine - Paystack Adapter
 * 
 * Paystack payment gateway implementation.
 * 
 * @module hospitality-booking-engine/adapters/paystack-adapter
 * @author webwakaagent4
 */

import axios from 'axios';
import { IPaymentGateway, PaymentInitializationRequest, RefundRequest } from './payment-gateway-adapter';
import { PaymentGatewayResponse, PaymentVerificationResponse, PaymentStatus, PaymentMethod } from '../types';

/**
 * Paystack Adapter
 * 
 * Implements Paystack API integration for payment processing.
 */
export class PaystackAdapter implements IPaymentGateway {
  private secretKey: string;
  private baseUrl: string;

  constructor(secretKey: string, baseUrl: string = 'https://api.paystack.co') {
    this.secretKey = secretKey;
    this.baseUrl = baseUrl;
  }

  /**
   * Initialize Payment
   * 
   * Initializes payment transaction with Paystack.
   */
  async initializePayment(request: PaymentInitializationRequest): Promise<PaymentGatewayResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/transaction/initialize`,
        {
          email: request.email,
          amount: Math.round(request.amount * 100), // Convert to kobo
          currency: request.currency,
          reference: `${request.bookingId}_${Date.now()}`,
          metadata: {
            ...request.metadata,
            bookingId: request.bookingId,
          },
          callback_url: `${process.env.APP_URL}/api/v1/payments/callback/paystack`,
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.status) {
        return {
          success: true,
          paymentUrl: response.data.data.authorization_url,
          transactionId: response.data.data.access_code,
          reference: response.data.data.reference,
        };
      } else {
        return {
          success: false,
          error: response.data.message || 'Payment initialization failed',
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Payment initialization failed',
      };
    }
  }

  /**
   * Verify Payment
   * 
   * Verifies payment transaction status with Paystack.
   */
  async verifyPayment(reference: string): Promise<PaymentVerificationResponse> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        }
      );

      if (response.data.status && response.data.data.status === 'success') {
        return {
          success: true,
          status: PaymentStatus.COMPLETED,
          amount: response.data.data.amount / 100, // Convert from kobo
          currency: response.data.data.currency,
          paymentMethod: this.mapPaymentMethod(response.data.data.channel),
          cardLast4: response.data.data.authorization?.last4,
          cardBrand: response.data.data.authorization?.brand,
          transactionId: response.data.data.id.toString(),
          reference: response.data.data.reference,
          paidAt: response.data.data.paid_at,
        };
      } else {
        return {
          success: false,
          status: PaymentStatus.FAILED,
          amount: response.data.data.amount / 100,
          currency: response.data.data.currency,
          transactionId: response.data.data.id.toString(),
          reference: response.data.data.reference,
          error: response.data.data.gateway_response || 'Payment verification failed',
        };
      }
    } catch (error: any) {
      return {
        success: false,
        status: PaymentStatus.FAILED,
        amount: 0,
        currency: 'NGN',
        transactionId: '',
        reference,
        error: error.response?.data?.message || error.message || 'Payment verification failed',
      };
    }
  }

  /**
   * Process Refund
   * 
   * Processes refund transaction with Paystack.
   */
  async processRefund(request: RefundRequest): Promise<PaymentGatewayResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/refund`,
        {
          transaction: request.paymentId,
          amount: Math.round(request.amount * 100), // Convert to kobo
          merchant_note: request.reason || 'Booking cancellation refund',
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.status) {
        return {
          success: true,
          transactionId: response.data.data.id.toString(),
          reference: response.data.data.transaction_reference,
        };
      } else {
        return {
          success: false,
          error: response.data.message || 'Refund processing failed',
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Refund processing failed',
      };
    }
  }

  /**
   * Map Paystack Channel to Payment Method
   */
  private mapPaymentMethod(channel: string): PaymentMethod {
    switch (channel) {
      case 'card':
        return PaymentMethod.CARD;
      case 'bank':
        return PaymentMethod.BANK_TRANSFER;
      case 'ussd':
        return PaymentMethod.USSD;
      case 'mobile_money':
        return PaymentMethod.MOBILE_MONEY;
      default:
        return PaymentMethod.CARD;
    }
  }
}
