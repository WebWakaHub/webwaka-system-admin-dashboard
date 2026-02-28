import crypto from 'crypto';
import {
  IPaymentGatewayAdapter,
  PaymentInitializationResult,
  PaymentVerificationResult,
  RefundResult,
} from './PaymentGatewayAdapter';

export class PaystackAdapter implements IPaymentGatewayAdapter {
  private secretKey: string;
  private baseUrl: string = 'https://api.paystack.co';

  constructor(secretKey: string) {
    this.secretKey = secretKey;
  }

  async initializePayment(params: {
    amount: number;
    currency: string;
    email: string;
    reference: string;
    callbackUrl?: string;
  }): Promise<PaymentInitializationResult> {
    try {
      // Convert amount to kobo (smallest unit for NGN)
      const amountInKobo = Math.round(params.amount * 100);

      const response = await fetch(`${this.baseUrl}/transaction/initialize`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amountInKobo,
          currency: params.currency,
          email: params.email,
          reference: params.reference,
          callback_url: params.callbackUrl,
        }),
      });

      const data = await response.json();

      if (data.status && data.data) {
        return {
          success: true,
          transactionId: data.data.reference,
          paymentUrl: data.data.authorization_url,
        };
      }

      return {
        success: false,
        error: data.message || 'Payment initialization failed',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Payment initialization error',
      };
    }
  }

  async verifyPayment(reference: string): Promise<PaymentVerificationResult> {
    try {
      const response = await fetch(`${this.baseUrl}/transaction/verify/${reference}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
        },
      });

      const data = await response.json();

      if (data.status && data.data) {
        const transaction = data.data;
        return {
          success: transaction.status === 'success',
          amount: transaction.amount / 100, // Convert from kobo to naira
          currency: transaction.currency,
          transactionId: transaction.reference,
          status: transaction.status === 'success' ? 'success' : 'failed',
        };
      }

      return {
        success: false,
        amount: 0,
        currency: 'NGN',
        transactionId: reference,
        status: 'failed',
        error: data.message || 'Verification failed',
      };
    } catch (error: any) {
      return {
        success: false,
        amount: 0,
        currency: 'NGN',
        transactionId: reference,
        status: 'failed',
        error: error.message || 'Verification error',
      };
    }
  }

  async refundPayment(params: {
    transactionId: string;
    amount?: number;
    reason?: string;
  }): Promise<RefundResult> {
    try {
      const body: any = {
        transaction: params.transactionId,
      };

      if (params.amount) {
        body.amount = Math.round(params.amount * 100); // Convert to kobo
      }

      const response = await fetch(`${this.baseUrl}/refund`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.status && data.data) {
        return {
          success: true,
          refundId: data.data.id,
        };
      }

      return {
        success: false,
        error: data.message || 'Refund failed',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Refund error',
      };
    }
  }

  verifyWebhookSignature(payload: any, signature: string): boolean {
    const hash = crypto
      .createHmac('sha512', this.secretKey)
      .update(JSON.stringify(payload))
      .digest('hex');

    return hash === signature;
  }
}
