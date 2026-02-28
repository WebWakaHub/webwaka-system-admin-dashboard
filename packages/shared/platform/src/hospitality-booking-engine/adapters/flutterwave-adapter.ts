/**
 * Hospitality Booking Engine - Flutterwave Adapter
 * 
 * Flutterwave payment gateway implementation.
 * 
 * @module hospitality-booking-engine/adapters/flutterwave-adapter
 * @author webwakaagent4
 */

import axios from 'axios';
import { IPaymentGateway, PaymentInitializationRequest, RefundRequest } from './payment-gateway-adapter';
import { PaymentGatewayResponse, PaymentVerificationResponse, PaymentStatus, PaymentMethod } from '../types';

/**
 * Flutterwave Adapter
 * 
 * Implements Flutterwave API integration for payment processing.
 */
export class FlutterwaveAdapter implements IPaymentGateway {
  private secretKey: string;
  private baseUrl: string;

  constructor(secretKey: string, baseUrl: string = 'https://api.flutterwave.com/v3') {
    this.secretKey = secretKey;
    this.baseUrl = baseUrl;
  }

  /**
   * Initialize Payment
   * 
   * Initializes payment transaction with Flutterwave.
   */
  async initializePayment(request: PaymentInitializationRequest): Promise<PaymentGatewayResponse> {
    try {
      const txRef = `${request.bookingId}_${Date.now()}`;
      
      const response = await axios.post(
        `${this.baseUrl}/payments`,
        {
          tx_ref: txRef,
          amount: request.amount,
          currency: request.currency,
          redirect_url: `${process.env.APP_URL}/api/v1/payments/callback/flutterwave`,
          customer: {
            email: request.email,
          },
          customizations: {
            title: 'Hotel Booking Payment',
            description: `Booking ${request.bookingId}`,
          },
          meta: {
            ...request.metadata,
            bookingId: request.bookingId,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.status === 'success') {
        return {
          success: true,
          paymentUrl: response.data.data.link,
          transactionId: response.data.data.id.toString(),
          reference: txRef,
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
   * Verifies payment transaction status with Flutterwave.
   */
  async verifyPayment(reference: string): Promise<PaymentVerificationResponse> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/transactions/verify_by_reference?tx_ref=${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        }
      );

      if (response.data.status === 'success' && response.data.data.status === 'successful') {
        return {
          success: true,
          status: PaymentStatus.COMPLETED,
          amount: response.data.data.amount,
          currency: response.data.data.currency,
          paymentMethod: this.mapPaymentMethod(response.data.data.payment_type),
          cardLast4: response.data.data.card?.last_4digits,
          cardBrand: response.data.data.card?.type,
          transactionId: response.data.data.id.toString(),
          reference: response.data.data.tx_ref,
          paidAt: response.data.data.created_at,
        };
      } else {
        return {
          success: false,
          status: PaymentStatus.FAILED,
          amount: response.data.data.amount,
          currency: response.data.data.currency,
          transactionId: response.data.data.id.toString(),
          reference: response.data.data.tx_ref,
          error: response.data.data.processor_response || 'Payment verification failed',
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
   * Processes refund transaction with Flutterwave.
   */
  async processRefund(request: RefundRequest): Promise<PaymentGatewayResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/transactions/${request.paymentId}/refund`,
        {
          amount: request.amount,
          comments: request.reason || 'Booking cancellation refund',
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.status === 'success') {
        return {
          success: true,
          transactionId: response.data.data.id.toString(),
          reference: response.data.data.flw_ref,
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
   * Map Flutterwave Payment Type to Payment Method
   */
  private mapPaymentMethod(paymentType: string): PaymentMethod {
    switch (paymentType) {
      case 'card':
        return PaymentMethod.CARD;
      case 'bank_transfer':
      case 'banktransfer':
        return PaymentMethod.BANK_TRANSFER;
      case 'ussd':
        return PaymentMethod.USSD;
      case 'mobilemoney':
      case 'mobile_money':
        return PaymentMethod.MOBILE_MONEY;
      default:
        return PaymentMethod.CARD;
    }
  }
}
