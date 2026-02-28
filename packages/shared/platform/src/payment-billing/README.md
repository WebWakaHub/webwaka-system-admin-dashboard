# Payment & Billing System

A comprehensive payment processing and subscription management module for the WebWaka platform.

## Features

- **Payment Gateway Integration**: Supports Paystack and Flutterwave
- **One-Time Payments**: Process single payments for products and services
- **Subscription Management**: Create and manage recurring subscriptions
- **Recurring Billing**: Automatic billing for subscriptions
- **Invoice Generation**: Automatic invoice creation for all payments
- **Webhook Handling**: Secure webhook processing with idempotency
- **Multi-Tenant**: Strict data isolation per tenant

## Installation

```bash
npm install
```

## Usage

### Initialize the Module

```typescript
import { PaymentBilling } from './payment-billing';
import { PaystackProvider } from './providers/PaystackProvider';
import { FlutterwaveProvider } from './providers/FlutterwaveProvider';

const paymentBilling = new PaymentBilling({
  database: databaseConnection,
  eventBus: eventBusInstance,
  permissionSystem: permissionSystemInstance,
  paymentGateways: {
    paystack: new PaystackProvider({ secretKey: process.env.PAYSTACK_SECRET_KEY }),
    flutterwave: new FlutterwaveProvider({ secretKey: process.env.FLUTTERWAVE_SECRET_KEY }),
  },
  defaultGateway: 'paystack',
});

await paymentBilling.initialize();
```

### Process a One-Time Payment

```typescript
const paymentService = paymentBilling.getPaymentService();

const { payment, authorizationUrl } = await paymentService.initializePayment(
  'tenant-123',
  'user-456',
  {
    amount: 500000, // ₦5,000.00 in kobo
    currency: 'NGN',
    email: 'user@example.com',
    gateway: 'paystack',
  }
);

// Redirect user to authorizationUrl to complete payment
```

### Create a Subscription

```typescript
const subscriptionService = paymentBilling.getSubscriptionService();

const subscription = await subscriptionService.createSubscription(
  'tenant-123',
  'user-456',
  {
    planId: 'plan-pro-monthly',
    customerId: 'cus_xxx', // From payment gateway
    trialPeriodDays: 14,
  }
);
```

### Handle Webhooks

```typescript
const webhookService = paymentBilling.getWebhookService();

// In your webhook endpoint
app.post('/webhooks/paystack', async (req, res) => {
  try {
    await webhookService.processWebhook(
      'paystack',
      req.body,
      req.headers['x-paystack-signature']
    );
    res.status(200).send('OK');
  } catch (error) {
    res.status(400).send('Bad Request');
  }
});
```

## Architecture

The module is built around four core services:

1. **PaymentService**: Handles payment processing (one-time and recurring)
2. **SubscriptionService**: Manages subscription lifecycle
3. **InvoiceService**: Generates and manages invoices
4. **WebhookService**: Processes incoming webhooks from payment gateways

## Events

The module emits the following events:

- `payment.initialized`: When a payment is initialized
- `payment.success`: When a payment succeeds
- `payment.failed`: When a payment fails
- `subscription.created`: When a subscription is created
- `subscription.updated`: When a subscription is updated
- `subscription.canceled`: When a subscription is canceled
- `invoice.created`: When an invoice is created
- `invoice.paid`: When an invoice is paid

## Security

- All webhook signatures are verified before processing
- Idempotency is enforced for all webhook events
- PCI-DSS compliant (no card data stored)
- Tenant isolation enforced at the database level

## Testing

```bash
npm test
```

## License

MIT
