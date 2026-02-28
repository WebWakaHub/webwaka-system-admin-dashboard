/**
 * Error classes for the Payment & Billing System module
 */

export class PaymentBillingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PaymentBillingError';
  }
}

export class PaymentGatewayError extends PaymentBillingError {
  constructor(message: string, public gatewayResponse?: any) {
    super(message);
    this.name = 'PaymentGatewayError';
  }
}

export class SubscriptionNotFoundError extends PaymentBillingError {
  constructor(subscriptionId: string) {
    super(`Subscription not found: ${subscriptionId}`);
    this.name = 'SubscriptionNotFoundError';
  }
}

export class PlanNotFoundError extends PaymentBillingError {
  constructor(planId: string) {
    super(`Plan not found: ${planId}`);
    this.name = 'PlanNotFoundError';
  }
}

export class InvoiceNotFoundError extends PaymentBillingError {
  constructor(invoiceId: string) {
    super(`Invoice not found: ${invoiceId}`);
    this.name = 'InvoiceNotFoundError';
  }
}

export class PaymentNotFoundError extends PaymentBillingError {
  constructor(paymentId: string) {
    super(`Payment not found: ${paymentId}`);
    this.name = 'PaymentNotFoundError';
  }
}

export class InvalidWebhookSignatureError extends PaymentBillingError {
  constructor() {
    super('Invalid webhook signature');
    this.name = 'InvalidWebhookSignatureError';
  }
}

export class DuplicateWebhookError extends PaymentBillingError {
  constructor(webhookId: string) {
    super(`Webhook already processed: ${webhookId}`);
    this.name = 'DuplicateWebhookError';
  }
}

export class PermissionDeniedError extends PaymentBillingError {
  constructor(action: string) {
    super(`Permission denied: ${action}`);
    this.name = 'PermissionDeniedError';
  }
}

export class ValidationError extends PaymentBillingError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
