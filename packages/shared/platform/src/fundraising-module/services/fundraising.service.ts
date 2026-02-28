import { EventEmitter } from 'events';
import { FundraisingCampaign } from '../models/fundraising-campaign';

export class FundraisingService {
  constructor(private repository: any, private eventEmitter: EventEmitter) {}

  async createCampaign(data: any, userId: string): Promise<FundraisingCampaign> {
    const campaign = new FundraisingCampaign({
      ...data,
      id: `camp-${Date.now()}`,
      status: 'draft',
    });

    await this.repository.create(campaign);
    this.eventEmitter.emit('fundraising.campaign.created', {
      campaignId: campaign.id,
      tenantId: campaign.tenantId,
      createdBy: userId,
    });

    return campaign;
  }

  async getCampaign(id: string, tenantId: string): Promise<FundraisingCampaign> {
    return await this.repository.findById(id, tenantId);
  }

  async listCampaigns(tenantId: string): Promise<FundraisingCampaign[]> {
    return await this.repository.findByTenant(tenantId);
  }

  async updateCampaign(
    id: string,
    tenantId: string,
    data: Partial<FundraisingCampaign>,
    userId: string,
  ): Promise<FundraisingCampaign> {
    const campaign = await this.getCampaign(id, tenantId);
    Object.assign(campaign, data);
    campaign.updatedAt = new Date();

    await this.repository.update(campaign);
    this.eventEmitter.emit('fundraising.campaign.updated', {
      campaignId: campaign.id,
      updatedBy: userId,
    });

    return campaign;
  }

  async deleteCampaign(id: string, tenantId: string, userId: string): Promise<void> {
    await this.repository.delete(id, tenantId);
    this.eventEmitter.emit('fundraising.campaign.deleted', {
      campaignId: id,
      deletedBy: userId,
    });
  }
}
