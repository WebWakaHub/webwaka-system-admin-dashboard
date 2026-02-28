/**
 * WebhookService - Handles incoming webhooks from payment gateways
 */

import { WebhookEvent, WebhookEventType, PaymentGatewayProvider } from '../types';
import { InvalidWebhookSignatureError, DuplicateWebhookError } from '../errors';

export class WebhookService {
  constructor(
    private database: any,
    private eventBus: any,
    private paymentGateways: Record<string, PaymentGatewayProvider>
  ) {}

  /**
   * Process incoming webhook
   */
  async processWebhook(
    gateway: string,
    payload: any,
    signature: string
  ): Promise<void> {
    const provider = this.paymentGateways[gateway];

    if (!provider) {
      throw new Error(`Payment gateway not configured: ${gateway}`);
    }

    // Verify webhook signature
    const isValid = provider.verifyWebhookSignature(
      JSON.stringify(payload),
      signature
    );

    if (!isValid) {
      throw new InvalidWebhookSignatureError();
    }

    // Extract event ID from payload (gateway-specific)
    const eventId = this.extractEventId(gateway, payload);

    // Check if webhook already processed (idempotency)
    const existing = await this.database.query(
      `SELECT * FROM webhook_events WHERE gateway = $1 AND id = $2`,
      [gateway, eventId]
    );

    if (existing.rows.length > 0 && existing.rows[0].processed) {
      throw new DuplicateWebhookError(eventId);
    }

    // Determine event type
    const eventType = this.mapGatewayEventType(gateway, payload);

    // Store webhook event
    const webhookEvent: WebhookEvent = {
      id: eventId,
      type: eventType,
      gateway,
      payload,
      processed: false,
      createdAt: new Date(),
    };

    if (existing.rows.length === 0) {
      await this.database.query(
        `INSERT INTO webhook_events (id, type, gateway, payload, processed, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          webhookEvent.id,
          webhookEvent.type,
          webhookEvent.gateway,
          JSON.stringify(webhookEvent.payload),
          webhookEvent.processed,
          webhookEvent.createdAt,
        ]
      );
    }

    // Process the webhook based on event type
    await this.handleWebhookEvent(webhookEvent);

    // Mark as processed
    await this.database.query(
      `UPDATE webhook_events SET processed = $1, processed_at = $2 WHERE id = $3`,
      [true, new Date(), webhookEvent.id]
    );
  }

  /**
   * Handle webhook event
   */
  private async handleWebhookEvent(event: WebhookEvent): Promise<void> {
    switch (event.type) {
      case WebhookEventType.PAYMENT_SUCCESS:
        await this.handlePaymentSuccess(event);
        break;
      case WebhookEventType.PAYMENT_FAILED:
        await this.handlePaymentFailed(event);
        break;
      case WebhookEventType.SUBSCRIPTION_CREATED:
        await this.handleSubscriptionCreated(event);
        break;
      case WebhookEventType.SUBSCRIPTION_CANCELED:
        await this.handleSubscriptionCanceled(event);
        break;
      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
    }
  }

  private async handlePaymentSuccess(event: WebhookEvent): Promise<void> {
    // Emit event for other services to handle
    await this.eventBus.publish('payment.webhook.success', {
      gateway: event.gateway,
      payload: event.payload,
    });
  }

  private async handlePaymentFailed(event: WebhookEvent): Promise<void> {
    // Emit event for other services to handle
    await this.eventBus.publish('payment.webhook.failed', {
      gateway: event.gateway,
      payload: event.payload,
    });
  }

  private async handleSubscriptionCreated(event: WebhookEvent): Promise<void> {
    // Emit event for other services to handle
    await this.eventBus.publish('subscription.webhook.created', {
      gateway: event.gateway,
      payload: event.payload,
    });
  }

  private async handleSubscriptionCanceled(event: WebhookEvent): Promise<void> {
    // Emit event for other services to handle
    await this.eventBus.publish('subscription.webhook.canceled', {
      gateway: event.gateway,
      payload: event.payload,
    });
  }

  private extractEventId(gateway: string, payload: any): string {
    // Gateway-specific event ID extraction
    if (gateway === 'paystack') {
      return payload.data?.id || payload.id || `evt-${Date.now()}`;
    } else if (gateway === 'flutterwave') {
      return payload.id || `evt-${Date.now()}`;
    }
    return `evt-${Date.now()}`;
  }

  private mapGatewayEventType(gateway: string, payload: any): WebhookEventType {
    // Gateway-specific event type mapping
    if (gateway === 'paystack') {
      const event = payload.event;
      if (event === 'charge.success') return WebhookEventType.PAYMENT_SUCCESS;
      if (event === 'charge.failed') return WebhookEventType.PAYMENT_FAILED;
      if (event === 'subscription.create') return WebhookEventType.SUBSCRIPTION_CREATED;
      if (event === 'subscription.disable') return WebhookEventType.SUBSCRIPTION_CANCELED;
    }

    // Default
    return WebhookEventType.PAYMENT_SUCCESS;
  }
}
