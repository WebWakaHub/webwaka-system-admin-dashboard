export interface PaymentInitializationResult {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  error?: string;
}

export interface PaymentVerificationResult {
  success: boolean;
  amount: number;
  currency: string;
  transactionId: string;
  status: 'success' | 'failed' | 'pending';
  error?: string;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  error?: string;
}

export interface IPaymentGatewayAdapter {
  /**
   * Initialize a payment transaction
   */
  initializePayment(params: {
    amount: number;
    currency: string;
    email: string;
    reference: string;
    callbackUrl?: string;
  }): Promise<PaymentInitializationResult>;

  /**
   * Verify a payment transaction
   */
  verifyPayment(reference: string): Promise<PaymentVerificationResult>;

  /**
   * Process a refund
   */
  refundPayment(params: {
    transactionId: string;
    amount?: number;
    reason?: string;
  }): Promise<RefundResult>;

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: any, signature: string): boolean;
}
