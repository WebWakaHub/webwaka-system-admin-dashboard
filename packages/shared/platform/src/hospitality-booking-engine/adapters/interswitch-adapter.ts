/**
 * Hospitality Booking Engine - Interswitch Adapter
 * 
 * Interswitch payment gateway implementation.
 * 
 * @module hospitality-booking-engine/adapters/interswitch-adapter
 * @author webwakaagent4
 */

import axios from 'axios';
import crypto from 'crypto';
import { IPaymentGateway, PaymentInitializationRequest, RefundRequest } from './payment-gateway-adapter';
import { PaymentGatewayResponse, PaymentVerificationResponse, PaymentStatus, PaymentMethod } from '../types';

/**
 * Interswitch Adapter
 * 
 * Implements Interswitch Webpay API integration for payment processing.
 */
export class InterswitchAdapter implements IPaymentGateway {
  private clientId: string;
  private clientSecret: string;
  private merchantCode: string;
  private baseUrl: string;

  constructor(
    clientId: string,
    clientSecret: string,
    merchantCode: string,
    baseUrl: string = 'https://webpay.interswitchng.com'
  ) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.merchantCode = merchantCode;
    this.baseUrl = baseUrl;
  }

  /**
   * Initialize Payment
   * 
   * Initializes payment transaction with Interswitch.
   */
  async initializePayment(request: PaymentInitializationRequest): Promise<PaymentGatewayResponse> {
    try {
      const txRef = `${request.bookingId}_${Date.now()}`;
      const amount = Math.round(request.amount * 100); // Convert to kobo

      // Generate MAC (Message Authentication Code)
      const mac = this.generateMAC(txRef, amount);

      const paymentUrl = `${this.baseUrl}/collections/w/pay` +
        `?merchantCode=${this.merchantCode}` +
        `&payItemID=${this.clientId}` +
        `&customerEmail=${request.email}` +
        `&amount=${amount}` +
        `&txn_ref=${txRef}` +
        `&currency=${request.currency === 'NGN' ? '566' : '840'}` + // 566 = NGN, 840 = USD
        `&site_redirect_url=${process.env.APP_URL}/api/v1/payments/callback/interswitch` +
        `&hash=${mac}`;

      return {
        success: true,
        paymentUrl,
        transactionId: txRef,
        reference: txRef,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Payment initialization failed',
      };
    }
  }

  /**
   * Verify Payment
   * 
   * Verifies payment transaction status with Interswitch.
   */
  async verifyPayment(reference: string): Promise<PaymentVerificationResponse> {
    try {
      const amount = 0; // Amount would be retrieved from database
      const httpMethod = 'GET';
      const resourceUrl = `/collections/api/v1/gettransaction.json?merchantcode=${this.merchantCode}&transactionreference=${reference}&amount=${amount}`;
      
      // Generate authorization signature
      const signature = this.generateSignature(httpMethod, resourceUrl);

      const response = await axios.get(
        `${this.baseUrl}${resourceUrl}`,
        {
          headers: {
            'Authorization': `InterswitchAuth ${signature}`,
          },
        }
      );

      if (response.data.ResponseCode === '00') {
        return {
          success: true,
          status: PaymentStatus.COMPLETED,
          amount: response.data.Amount / 100, // Convert from kobo
          currency: response.data.CurrencyCode === '566' ? 'NGN' : 'USD',
          paymentMethod: PaymentMethod.CARD,
          cardLast4: response.data.CardNumber?.slice(-4),
          transactionId: response.data.TransactionReference,
          reference: response.data.PaymentReference,
          paidAt: response.data.TransactionDate,
        };
      } else {
        return {
          success: false,
          status: PaymentStatus.FAILED,
          amount: response.data.Amount / 100,
          currency: response.data.CurrencyCode === '566' ? 'NGN' : 'USD',
          transactionId: response.data.TransactionReference,
          reference: response.data.PaymentReference,
          error: response.data.ResponseDescription || 'Payment verification failed',
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
        error: error.response?.data?.ResponseDescription || error.message || 'Payment verification failed',
      };
    }
  }

  /**
   * Process Refund
   * 
   * Processes refund transaction with Interswitch.
   * Note: Interswitch refunds typically require manual processing or separate API.
   */
  async processRefund(request: RefundRequest): Promise<PaymentGatewayResponse> {
    try {
      // Interswitch refunds may require manual processing
      // This is a placeholder for the refund API when available
      return {
        success: false,
        error: 'Interswitch refunds require manual processing. Please contact support.',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Refund processing failed',
      };
    }
  }

  /**
   * Generate MAC (Message Authentication Code)
   * 
   * Generates MAC for payment initialization.
   */
  private generateMAC(txRef: string, amount: number): string {
    const macString = `${this.clientId}${txRef}${amount}${this.clientSecret}`;
    return crypto.createHash('sha512').update(macString).digest('hex');
  }

  /**
   * Generate Authorization Signature
   * 
   * Generates authorization signature for API requests.
   */
  private generateSignature(httpMethod: string, resourceUrl: string): string {
    const timestamp = Date.now();
    const nonce = crypto.randomBytes(16).toString('hex');
    
    const signatureString = `${httpMethod}&${resourceUrl}&${timestamp}&${nonce}&${this.clientSecret}`;
    const signature = crypto.createHash('sha256').update(signatureString).digest('base64');
    
    return `${this.clientId}:${signature}:${nonce}:${timestamp}`;
  }
}
