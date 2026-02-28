import { Campaign, CampaignStatus } from '../models/campaign';
import { EventEmitter } from 'events';

export interface ICampaignRepository {
  create(campaign: Campaign): Promise<Campaign>;
  findById(id: string, tenantId: string): Promise<Campaign | null>;
  findByTenant(tenantId: string): Promise<Campaign[]>;
  update(campaign: Campaign): Promise<Campaign>;
  delete(id: string, tenantId: string): Promise<boolean>;
}

export class CampaignService {
  private repository: ICampaignRepository;
  private eventEmitter: EventEmitter;

  constructor(repository: ICampaignRepository, eventEmitter: EventEmitter) {
    this.repository = repository;
    this.eventEmitter = eventEmitter;
  }

  async createCampaign(data: Partial<Campaign>, userId: string): Promise<Campaign> {
    const campaign = new Campaign({
      ...data,
      createdBy: userId,
      updatedBy: userId,
    });

    const errors = campaign.validate();
    if (errors.length > 0) {
      throw new Error(`Campaign validation failed: ${errors.join(', ')}`);
    }

    const created = await this.repository.create(campaign);
    this.eventEmitter.emit('campaign.created', {
      campaignId: created.id,
      tenantId: created.tenantId,
      name: created.name,
      createdBy: userId,
    });

    return created;
  }

  async getCampaign(id: string, tenantId: string): Promise<Campaign> {
    const campaign = await this.repository.findById(id, tenantId);
    if (!campaign) {
      throw new Error(`Campaign not found: ${id}`);
    }
    return campaign;
  }

  async listCampaigns(tenantId: string): Promise<Campaign[]> {
    return this.repository.findByTenant(tenantId);
  }

  async updateCampaign(id: string, tenantId: string, data: Partial<Campaign>, userId: string): Promise<Campaign> {
    const campaign = await this.getCampaign(id, tenantId);

    const updated = new Campaign({
      ...campaign,
      ...data,
      updatedBy: userId,
      updatedAt: new Date(),
    });

    const errors = updated.validate();
    if (errors.length > 0) {
      throw new Error(`Campaign validation failed: ${errors.join(', ')}`);
    }

    const result = await this.repository.update(updated);
    this.eventEmitter.emit('campaign.updated', {
      campaignId: result.id,
      tenantId: result.tenantId,
      changes: data,
      updatedBy: userId,
    });

    return result;
  }

  async deleteCampaign(id: string, tenantId: string, userId: string): Promise<void> {
    const campaign = await this.getCampaign(id, tenantId);

    if (campaign.status !== CampaignStatus.DRAFT && campaign.status !== CampaignStatus.ARCHIVED) {
      throw new Error(`Cannot delete campaign with status: ${campaign.status}`);
    }

    const deleted = await this.repository.delete(id, tenantId);
    if (!deleted) {
      throw new Error(`Failed to delete campaign: ${id}`);
    }

    this.eventEmitter.emit('campaign.deleted', {
      campaignId: id,
      tenantId: tenantId,
      deletedBy: userId,
    });
  }

  async transitionCampaignStatus(
    id: string,
    tenantId: string,
    newStatus: CampaignStatus,
    userId: string,
  ): Promise<Campaign> {
    const campaign = await this.getCampaign(id, tenantId);

    if (!campaign.canTransitionTo(newStatus)) {
      throw new Error(`Cannot transition from ${campaign.status} to ${newStatus}`);
    }

    return this.updateCampaign(id, tenantId, { status: newStatus }, userId);
  }

  async pauseCampaign(id: string, tenantId: string, userId: string): Promise<Campaign> {
    return this.transitionCampaignStatus(id, tenantId, CampaignStatus.PAUSED, userId);
  }

  async resumeCampaign(id: string, tenantId: string, userId: string): Promise<Campaign> {
    const campaign = await this.getCampaign(id, tenantId);

    if (campaign.status === CampaignStatus.PAUSED) {
      return this.transitionCampaignStatus(id, tenantId, CampaignStatus.ACTIVE, userId);
    }

    throw new Error(`Cannot resume campaign with status: ${campaign.status}`);
  }

  async completeCampaign(id: string, tenantId: string, userId: string): Promise<Campaign> {
    return this.transitionCampaignStatus(id, tenantId, CampaignStatus.COMPLETED, userId);
  }

  async archiveCampaign(id: string, tenantId: string, userId: string): Promise<Campaign> {
    const campaign = await this.getCampaign(id, tenantId);

    if (campaign.status !== CampaignStatus.COMPLETED) {
      throw new Error(`Can only archive completed campaigns`);
    }

    return this.transitionCampaignStatus(id, tenantId, CampaignStatus.ARCHIVED, userId);
  }
}
