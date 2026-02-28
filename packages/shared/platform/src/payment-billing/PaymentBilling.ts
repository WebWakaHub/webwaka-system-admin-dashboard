/**
 * PaymentBilling - Main class for the Payment & Billing System module
 */

import { PaymentBillingConfig } from './types';
import { PaymentService } from './services/PaymentService';
import { SubscriptionService } from './services/SubscriptionService';
import { InvoiceService } from './services/InvoiceService';
import { WebhookService } from './services/WebhookService';

export class PaymentBilling {
  private paymentService!: PaymentService;
  private subscriptionService!: SubscriptionService;
  private invoiceService!: InvoiceService;
  private webhookService!: WebhookService;

  constructor(private config: PaymentBillingConfig) {}

  /**
   * Initialize the Payment & Billing System
   */
  async initialize(): Promise<void> {
    // Create database tables
    await this.createTables();

    // Initialize services
    this.paymentService = new PaymentService(
      this.config.database,
      this.config.eventBus,
      this.config.paymentGateways,
      this.config.defaultGateway
    );

    this.invoiceService = new InvoiceService(
      this.config.database,
      this.config.eventBus
    );

    this.subscriptionService = new SubscriptionService(
      this.config.database,
      this.config.eventBus,
      this.config.permissionSystem,
      this.paymentService
    );

    this.webhookService = new WebhookService(
      this.config.database,
      this.config.eventBus,
      this.config.paymentGateways
    );

    console.log('Payment & Billing System initialized');
  }

  /**
   * Shutdown the Payment & Billing System
   */
  async shutdown(): Promise<void> {
    console.log('Payment & Billing System shutdown');
  }

  /**
   * Get PaymentService instance
   */
  getPaymentService(): PaymentService {
    return this.paymentService;
  }

  /**
   * Get SubscriptionService instance
   */
  getSubscriptionService(): SubscriptionService {
    return this.subscriptionService;
  }

  /**
   * Get InvoiceService instance
   */
  getInvoiceService(): InvoiceService {
    return this.invoiceService;
  }

  /**
   * Get WebhookService instance
   */
  getWebhookService(): WebhookService {
    return this.webhookService;
  }

  /**
   * Create database tables
   */
  private async createTables(): Promise<void> {
    // Products table
    await this.config.database.query(`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY,
        tenant_id UUID NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_products_tenant_id ON products(tenant_id);
    `);

    // Plans table
    await this.config.database.query(`
      CREATE TABLE IF NOT EXISTS plans (
        id UUID PRIMARY KEY,
        product_id UUID NOT NULL REFERENCES products(id),
        tenant_id UUID NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        amount BIGINT NOT NULL,
        currency VARCHAR(3) NOT NULL,
        interval VARCHAR(50) NOT NULL,
        interval_count INTEGER DEFAULT 1,
        trial_period_days INTEGER,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_plans_tenant_id ON plans(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_plans_product_id ON plans(product_id);
    `);

    // Subscriptions table
    await this.config.database.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id UUID PRIMARY KEY,
        tenant_id UUID NOT NULL,
        user_id UUID NOT NULL,
        plan_id UUID NOT NULL REFERENCES plans(id),
        customer_id TEXT,
        status VARCHAR(50) NOT NULL,
        current_period_start TIMESTAMP NOT NULL,
        current_period_end TIMESTAMP NOT NULL,
        trial_start TIMESTAMP,
        trial_end TIMESTAMP,
        canceled_at TIMESTAMP,
        cancel_at_period_end BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant_id ON subscriptions(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
      CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
    `);

    // Payments table
    await this.config.database.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY,
        tenant_id UUID NOT NULL,
        user_id UUID NOT NULL,
        subscription_id UUID REFERENCES subscriptions(id),
        amount BIGINT NOT NULL,
        currency VARCHAR(3) NOT NULL,
        status VARCHAR(50) NOT NULL,
        type VARCHAR(50) NOT NULL,
        gateway VARCHAR(50) NOT NULL,
        gateway_reference TEXT NOT NULL,
        gateway_response JSONB,
        paid_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_payments_tenant_id ON payments(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
      CREATE INDEX IF NOT EXISTS idx_payments_subscription_id ON payments(subscription_id);
      CREATE INDEX IF NOT EXISTS idx_payments_gateway_reference ON payments(gateway_reference);
    `);

    // Invoices table
    await this.config.database.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id UUID PRIMARY KEY,
        tenant_id UUID NOT NULL,
        user_id UUID NOT NULL,
        subscription_id UUID REFERENCES subscriptions(id),
        payment_id UUID REFERENCES payments(id),
        invoice_number TEXT NOT NULL,
        status VARCHAR(50) NOT NULL,
        subtotal BIGINT NOT NULL,
        tax BIGINT DEFAULT 0,
        total BIGINT NOT NULL,
        currency VARCHAR(3) NOT NULL,
        line_items JSONB NOT NULL,
        due_date TIMESTAMP,
        paid_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_invoices_tenant_id ON invoices(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
      CREATE INDEX IF NOT EXISTS idx_invoices_subscription_id ON invoices(subscription_id);
    `);

    // Webhook events table
    await this.config.database.query(`
      CREATE TABLE IF NOT EXISTS webhook_events (
        id TEXT PRIMARY KEY,
        type VARCHAR(100) NOT NULL,
        gateway VARCHAR(50) NOT NULL,
        payload JSONB NOT NULL,
        processed BOOLEAN DEFAULT false,
        processed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_webhook_events_gateway ON webhook_events(gateway);
      CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed);
    `);
  }
}
