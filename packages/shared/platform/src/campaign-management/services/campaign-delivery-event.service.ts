import { CampaignDeliveryEvent, DeliveryEventType } from '../models/campaign-delivery-event';
import { EventEmitter } from 'events';

export interface ICampaignDeliveryEventRepository {
  create(event: CampaignDeliveryEvent): Promise<CampaignDeliveryEvent>;
  findById(id: string): Promise<CampaignDeliveryEvent | null>;
  findByExecution(executionId: string): Promise<CampaignDeliveryEvent[]>;
  findByCampaign(campaignId: string): Promise<CampaignDeliveryEvent[]>;
  update(event: CampaignDeliveryEvent): Promise<CampaignDeliveryEvent>;
}

export class CampaignDeliveryEventService {
  private repository: ICampaignDeliveryEventRepository;
  private eventEmitter: EventEmitter;

  constructor(repository: ICampaignDeliveryEventRepository, eventEmitter: EventEmitter) {
    this.repository = repository;
    this.eventEmitter = eventEmitter;
  }

  async recordDeliveryEvent(
    campaignId: string,
    executionId: string,
    recipientId: string,
    tenantId: string,
    eventType: DeliveryEventType,
    channel: any,
    messageId: string,
    metadata?: Record<string, any>,
  ): Promise<CampaignDeliveryEvent> {
    const event = new CampaignDeliveryEvent({
      campaignId,
      executionId,
      recipientId,
      tenantId,
      channel,
      messageId,
      status: eventType,
      eventType,
      metadata,
    });

    const created = await this.repository.create(event);
    this.eventEmitter.emit(`campaign.delivery.${eventType}`, {
      eventId: created.id,
      campaignId: created.campaignId,
      executionId: created.executionId,
      recipientId: created.recipientId,
      channel: created.channel,
      messageId: created.messageId,
    });

    return created;
  }

  async getEvent(id: string): Promise<CampaignDeliveryEvent> {
    const event = await this.repository.findById(id);
    if (!event) {
      throw new Error(`Delivery event not found: ${id}`);
    }
    return event;
  }

  async listExecutionEvents(executionId: string): Promise<CampaignDeliveryEvent[]> {
    return this.repository.findByExecution(executionId);
  }

  async listCampaignEvents(campaignId: string): Promise<CampaignDeliveryEvent[]> {
    return this.repository.findByCampaign(campaignId);
  }

  async calculateMetrics(campaignId: string): Promise<Record<string, number>> {
    const events = await this.listCampaignEvents(campaignId);

    const metrics = {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      failed: 0,
      bounced: 0,
      complained: 0,
      unsubscribed: 0,
    };

    for (const event of events) {
      switch (event.eventType) {
        case DeliveryEventType.SENT:
          metrics.sent += 1;
          break;
        case DeliveryEventType.DELIVERED:
          metrics.delivered += 1;
          break;
        case DeliveryEventType.OPENED:
          metrics.opened += 1;
          break;
        case DeliveryEventType.CLICKED:
          metrics.clicked += 1;
          break;
        case DeliveryEventType.FAILED:
          metrics.failed += 1;
          break;
        case DeliveryEventType.BOUNCED:
          metrics.bounced += 1;
          break;
        case DeliveryEventType.COMPLAINED:
          metrics.complained += 1;
          break;
        case DeliveryEventType.UNSUBSCRIBED:
          metrics.unsubscribed += 1;
          break;
      }
    }

    return metrics;
  }

  async getSuccessRate(campaignId: string): Promise<number> {
    const metrics = await this.calculateMetrics(campaignId);
    if (metrics.sent === 0) return 0;
    return (metrics.delivered / metrics.sent) * 100;
  }

  async getEngagementRate(campaignId: string): Promise<number> {
    const metrics = await this.calculateMetrics(campaignId);
    if (metrics.delivered === 0) return 0;
    return ((metrics.opened + metrics.clicked) / metrics.delivered) * 100;
  }

  async getClickRate(campaignId: string): Promise<number> {
    const metrics = await this.calculateMetrics(campaignId);
    if (metrics.opened === 0) return 0;
    return (metrics.clicked / metrics.opened) * 100;
  }
}
