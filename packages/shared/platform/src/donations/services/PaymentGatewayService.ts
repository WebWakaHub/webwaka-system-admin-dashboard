import { DataSource } from 'typeorm';
import { PaymentGatewayConfigRepository } from '../repositories/PaymentGatewayConfigRepository';
import { Gateway } from '../models/PaymentGatewayConfig';
import { IPaymentGatewayAdapter, PaymentInitializationResult, PaymentVerificationResult, RefundResult } from '../integrations/PaymentGatewayAdapter';
import { PaystackAdapter } from '../integrations/PaystackAdapter';
import { FlutterwaveAdapter } from '../integrations/FlutterwaveAdapter';
import { InterswitchAdapter } from '../integrations/InterswitchAdapter';

export class PaymentGatewayService {
  private configRepository: PaymentGatewayConfigRepository;

  constructor(dataSource: DataSource) {
    this.configRepository = new PaymentGatewayConfigRepository(dataSource);
  }

  /**
   * Get payment gateway adapter for a church
   */
  private async getGatewayAdapter(churchId: string): Promise<IPaymentGatewayAdapter | null> {
    const configs = await this.configRepository.findActiveByChurchId(churchId);
    
    if (configs.length === 0) {
      return null;
    }

    // Use the first active gateway (highest priority)
    const config = configs[0];

    switch (config.gateway) {
      case Gateway.PAYSTACK:
        return new PaystackAdapter(config.secretKey);
      case Gateway.FLUTTERWAVE:
        return new FlutterwaveAdapter(config.secretKey);
      case Gateway.INTERSWITCH:
        return new InterswitchAdapter(config.secretKey);
      default:
        return null;
    }
  }

  /**
   * Initialize payment
   */
  async initializePayment(
    churchId: string,
    params: {
      amount: number;
      currency: string;
      email: string;
      reference: string;
      callbackUrl?: string;
    }
  ): Promise<PaymentInitializationResult> {
    const adapter = await this.getGatewayAdapter(churchId);
    
    if (!adapter) {
      return {
        success: false,
        error: 'No active payment gateway configured for this church',
      };
    }

    return await adapter.initializePayment(params);
  }

  /**
   * Verify payment
   */
  async verifyPayment(reference: string): Promise<PaymentVerificationResult> {
    // TODO: Determine which gateway to use based on transaction reference
    // For now, we'll try Paystack as the default
    // In production, store gateway info with the transaction
    
    const adapter = new PaystackAdapter(process.env.PAYSTACK_SECRET_KEY || '');
    return await adapter.verifyPayment(reference);
  }

  /**
   * Refund payment
   */
  async refundPayment(params: {
    transactionId: string;
    amount?: number;
    reason?: string;
  }): Promise<RefundResult> {
    // TODO: Determine which gateway to use based on transaction ID
    // For now, we'll try Paystack as the default
    
    const adapter = new PaystackAdapter(process.env.PAYSTACK_SECRET_KEY || '');
    return await adapter.refundPayment(params);
  }

  /**
   * Verify webhook signature
   */
  async verifyWebhookSignature(
    churchId: string,
    gateway: Gateway,
    payload: any,
    signature: string
  ): Promise<boolean> {
    const config = await this.configRepository.findByChurchAndGateway(churchId, gateway);
    
    if (!config) {
      return false;
    }

    let adapter: IPaymentGatewayAdapter;

    switch (gateway) {
      case Gateway.PAYSTACK:
        adapter = new PaystackAdapter(config.secretKey);
        break;
      case Gateway.FLUTTERWAVE:
        adapter = new FlutterwaveAdapter(config.secretKey);
        break;
      case Gateway.INTERSWITCH:
        adapter = new InterswitchAdapter(config.secretKey);
        break;
      default:
        return false;
    }

    return adapter.verifyWebhookSignature(payload, signature);
  }
}
