import { Repository, DataSource } from 'typeorm';
import { Campaign, CampaignStatus } from '../models/Campaign';

export class CampaignRepository {
  private repository: Repository<Campaign>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(Campaign);
  }

  async create(campaign: Partial<Campaign>): Promise<Campaign> {
    const newCampaign = this.repository.create(campaign);
    return await this.repository.save(newCampaign);
  }

  async findById(campaignId: string): Promise<Campaign | null> {
    return await this.repository.findOne({ where: { campaignId } });
  }

  async findByChurchId(
    churchId: string,
    options?: {
      status?: CampaignStatus;
      page?: number;
      limit?: number;
    }
  ): Promise<{ campaigns: Campaign[]; total: number }> {
    const where: any = { churchId };

    if (options?.status) {
      where.status = options.status;
    }

    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const [campaigns, total] = await this.repository.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { campaigns, total };
  }

  async findAll(options?: {
    status?: CampaignStatus;
    page?: number;
    limit?: number;
  }): Promise<{ campaigns: Campaign[]; total: number }> {
    const where: any = {};

    if (options?.status) {
      where.status = options.status;
    }

    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const [campaigns, total] = await this.repository.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { campaigns, total };
  }

  async update(campaignId: string, updates: Partial<Campaign>): Promise<Campaign | null> {
    await this.repository.update({ campaignId }, updates);
    return await this.findById(campaignId);
  }

  async updateProgress(campaignId: string, amountRaised: number, donorCount: number): Promise<void> {
    await this.repository.update({ campaignId }, { amountRaised, donorCount });
  }

  async incrementDonorCount(campaignId: string): Promise<void> {
    await this.repository.increment({ campaignId }, 'donorCount', 1);
  }

  async addToAmountRaised(campaignId: string, amount: number): Promise<void> {
    await this.repository.increment({ campaignId }, 'amountRaised', amount);
  }
}
