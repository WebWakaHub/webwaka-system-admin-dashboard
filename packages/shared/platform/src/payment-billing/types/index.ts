/**
 * Type definitions for the Payment & Billing System module
 */

// ============================================================================
// Payment Gateway Types
// ============================================================================

export interface PaymentGatewayProvider {
  name: string;
  initializePayment(params: InitializePaymentParams): Promise<PaymentInitializationResult>;
  verifyPayment(reference: string): Promise<PaymentVerificationResult>;
  createCustomer(params: CreateCustomerParams): Promise<Customer>;
  chargeCustomer(params: ChargeCustomerParams): Promise<PaymentResult>;
  verifyWebhookSignature(payload: string, signature: string): boolean;
}

export interface InitializePaymentParams {
  amount: number; // Amount in kobo (smallest currency unit)
  currency: string;
  email: string;
  reference: string;
  callbackUrl?: string;
  metadata?: Record<string, any>;
}

export interface PaymentInitializationResult {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}

export interface PaymentVerificationResult {
  status: 'success' | 'failed' | 'pending';
  amount: number;
  currency: string;
  reference: string;
  paidAt?: Date;
  channel?: string;
  gatewayResponse?: any;
}

export interface CreateCustomerParams {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface Customer {
  customerId: string;
  email: string;
  customerCode?: string;
}

export interface ChargeCustomerParams {
  customerId: string;
  amount: number;
  currency: string;
  reference: string;
  metadata?: Record<string, any>;
}

export interface PaymentResult {
  status: 'success' | 'failed' | 'pending';
  reference: string;
  amount: number;
  currency: string;
  message?: string;
}

// ============================================================================
// Product & Plan Types
// ============================================================================

export interface Product {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum BillingInterval {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export interface Plan {
  id: string;
  productId: string;
  tenantId: string;
  name: string;
  description?: string;
  amount: number; // Amount in kobo
  currency: string;
  interval: BillingInterval;
  intervalCount: number; // e.g., 1 for monthly, 3 for quarterly
  trialPeriodDays?: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Subscription Types
// ============================================================================

export enum SubscriptionStatus {
  TRIALING = 'trialing',
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  UNPAID = 'unpaid',
}

export interface Subscription {
  id: string;
  tenantId: string;
  userId: string;
  planId: string;
  customerId?: string; // Gateway customer ID
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialStart?: Date;
  trialEnd?: Date;
  canceledAt?: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Payment Types
// ============================================================================

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

export enum PaymentType {
  ONE_TIME = 'one_time',
  SUBSCRIPTION = 'subscription',
}

export interface Payment {
  id: string;
  tenantId: string;
  userId: string;
  subscriptionId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  type: PaymentType;
  gateway: string;
  gatewayReference: string;
  gatewayResponse?: any;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Invoice Types
// ============================================================================

export enum InvoiceStatus {
  DRAFT = 'draft',
  OPEN = 'open',
  PAID = 'paid',
  VOID = 'void',
  UNCOLLECTIBLE = 'uncollectible',
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitAmount: number;
  amount: number;
}

export interface Invoice {
  id: string;
  tenantId: string;
  userId: string;
  subscriptionId?: string;
  paymentId?: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  lineItems: InvoiceLineItem[];
  dueDate?: Date;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Webhook Types
// ============================================================================

export enum WebhookEventType {
  PAYMENT_SUCCESS = 'payment.success',
  PAYMENT_FAILED = 'payment.failed',
  SUBSCRIPTION_CREATED = 'subscription.created',
  SUBSCRIPTION_CANCELED = 'subscription.canceled',
}

export interface WebhookEvent {
  id: string;
  type: WebhookEventType;
  gateway: string;
  payload: any;
  processed: boolean;
  processedAt?: Date;
  createdAt: Date;
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface PaymentBillingConfig {
  database: any;
  eventBus: any;
  permissionSystem: any;
  paymentGateways: {
    paystack?: PaymentGatewayProvider;
    flutterwave?: PaymentGatewayProvider;
  };
  defaultGateway: 'paystack' | 'flutterwave';
}
