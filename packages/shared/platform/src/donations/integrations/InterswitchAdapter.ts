import {
  IPaymentGatewayAdapter,
  PaymentInitializationResult,
  PaymentVerificationResult,
  RefundResult,
} from './PaymentGatewayAdapter';

export class InterswitchAdapter implements IPaymentGatewayAdapter {
  private secretKey: string;
  private baseUrl: string = 'https://webpay.interswitchng.com';

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
    // TODO: Implement Interswitch payment initialization
    console.log('[Interswitch] Initialize payment', params);
    return {
      success: false,
      error: 'Interswitch integration not yet implemented',
    };
  }

  async verifyPayment(reference: string): Promise<PaymentVerificationResult> {
    // TODO: Implement Interswitch payment verification
    console.log('[Interswitch] Verify payment', reference);
    return {
      success: false,
      amount: 0,
      currency: 'NGN',
      transactionId: reference,
      status: 'failed',
      error: 'Interswitch integration not yet implemented',
    };
  }

  async refundPayment(params: {
    transactionId: string;
    amount?: number;
    reason?: string;
  }): Promise<RefundResult> {
    // TODO: Implement Interswitch refund
    console.log('[Interswitch] Refund payment', params);
    return {
      success: false,
      error: 'Interswitch integration not yet implemented',
    };
  }

  verifyWebhookSignature(payload: any, signature: string): boolean {
    // TODO: Implement Interswitch webhook signature verification
    console.log('[Interswitch] Verify webhook signature');
    return false;
  }
}
