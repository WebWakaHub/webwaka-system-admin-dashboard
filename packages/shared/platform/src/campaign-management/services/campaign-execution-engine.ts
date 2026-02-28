import { Campaign, CampaignChannel } from '../models/campaign';
import { CampaignExecution } from '../models/campaign-execution';
import { AudienceSegment } from '../models/audience-segment';
import { CampaignTemplate } from '../models/campaign-template';
import { DeliveryEventType, DeliveryChannel } from '../models/campaign-delivery-event';
import { EventEmitter } from 'events';

export interface IDeliveryProvider {
  send(
    channel: string,
    recipient: string,
    subject: string,
    content: string,
    metadata?: Record<string, any>,
  ): Promise<string>;
}

export class CampaignExecutionEngine {
  private eventEmitter: EventEmitter;
  private deliveryProviders: Map<string, IDeliveryProvider>;

  constructor(eventEmitter: EventEmitter) {
    this.eventEmitter = eventEmitter;
    this.deliveryProviders = new Map();
  }

  registerDeliveryProvider(channel: string, provider: IDeliveryProvider): void {
    this.deliveryProviders.set(channel, provider);
  }

  async executeCampaign(
    campaign: Campaign,
    execution: CampaignExecution,
    audience: Record<string, any>[],
    templates: Map<string, CampaignTemplate>,
  ): Promise<void> {
    try {
      this.eventEmitter.emit('campaign.execution.started', {
        executionId: execution.id,
        campaignId: campaign.id,
        recipientCount: audience.length,
      });

      for (const recipient of audience) {
        await this.deliverToRecipient(campaign, execution, recipient, templates);
      }

      this.eventEmitter.emit('campaign.execution.completed', {
        executionId: execution.id,
        campaignId: campaign.id,
        successRate: execution.getSuccessRate(),
      });
    } catch (error) {
      this.eventEmitter.emit('campaign.execution.failed', {
        executionId: execution.id,
        campaignId: campaign.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  private async deliverToRecipient(
    campaign: Campaign,
    execution: CampaignExecution,
    recipient: Record<string, any>,
    templates: Map<string, CampaignTemplate>,
  ): Promise<void> {
    for (const channel of campaign.channels) {
      try {
        const channelContent = campaign.content[channel];
        if (!channelContent) {
          continue;
        }

        const template = templates.get(channelContent.templateId);
        if (!template) {
          throw new Error(`Template not found: ${channelContent.templateId}`);
        }

        const renderedContent = template.renderContent(recipient);
        const provider = this.deliveryProviders.get(channel);

        if (!provider) {
          throw new Error(`Delivery provider not found for channel: ${channel}`);
        }

        const messageId = await provider.send(
          channel,
          recipient.email || recipient.phone || recipient.id,
          channelContent.subject || '',
          renderedContent,
          { campaignId: campaign.id, executionId: execution.id },
        );

        this.eventEmitter.emit('campaign.delivery.sent', {
          campaignId: campaign.id,
          executionId: execution.id,
          recipientId: recipient.id,
          channel,
          messageId,
        });

        execution.sentCount += 1;
      } catch (error) {
        this.eventEmitter.emit('campaign.delivery.failed', {
          campaignId: campaign.id,
          executionId: execution.id,
          recipientId: recipient.id,
          channel,
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        execution.failedCount += 1;
      }
    }
  }

  async validateCampaignBeforeExecution(campaign: Campaign, audience: Record<string, any>[]): Promise<string[]> {
    const errors: string[] = [];

    if (audience.length === 0) {
      errors.push('Target audience is empty');
    }

    for (const channel of campaign.channels) {
      if (!this.deliveryProviders.has(channel)) {
        errors.push(`Delivery provider not configured for channel: ${channel}`);
      }

      const channelContent = campaign.content[channel];
      if (!channelContent) {
        errors.push(`Content not configured for channel: ${channel}`);
      }
    }

    return errors;
  }
}
