import { v4 as uuidv4 } from 'uuid';

export enum DeliveryEventType {
  SENT = 'sent',
  DELIVERED = 'delivered',
  OPENED = 'opened',
  CLICKED = 'clicked',
  FAILED = 'failed',
  BOUNCED = 'bounced',
  COMPLAINED = 'complained',
  UNSUBSCRIBED = 'unsubscribed',
}

export enum DeliveryChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app',
}

export class CampaignDeliveryEvent {
  id: string;
  campaignId: string;
  executionId: string;
  recipientId: string;
  tenantId: string;
  channel: DeliveryChannel;
  messageId: string;
  status: DeliveryEventType;
  eventType: DeliveryEventType;
  timestamp: Date;
  metadata?: Record<string, any>;

  constructor(data: Partial<CampaignDeliveryEvent>) {
    this.id = data.id || uuidv4();
    this.campaignId = data.campaignId || '';
    this.executionId = data.executionId || '';
    this.recipientId = data.recipientId || '';
    this.tenantId = data.tenantId || '';
    this.channel = data.channel || DeliveryChannel.EMAIL;
    this.messageId = data.messageId || '';
    this.status = data.status || DeliveryEventType.SENT;
    this.eventType = data.eventType || DeliveryEventType.SENT;
    this.timestamp = data.timestamp || new Date();
    this.metadata = data.metadata;
  }

  isSuccessful(): boolean {
    return [DeliveryEventType.DELIVERED, DeliveryEventType.OPENED, DeliveryEventType.CLICKED].includes(
      this.status,
    );
  }

  isFailed(): boolean {
    return [DeliveryEventType.FAILED, DeliveryEventType.BOUNCED].includes(this.status);
  }
}
