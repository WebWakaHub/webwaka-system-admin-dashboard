import { DataSource } from 'typeorm';
import { Campaign, CampaignStatus } from '../models/Campaign';
import { CampaignRepository } from '../repositories/CampaignRepository';
import { DonationRepository } from '../repositories/DonationRepository';
import { CreateCampaignDto } from '../dto/CreateCampaignDto';

export class CampaignService {
  private campaignRepository: CampaignRepository;
  private donationRepository: DonationRepository;

  constructor(dataSource: DataSource) {
    this.campaignRepository = new CampaignRepository(dataSource);
    this.donationRepository = new DonationRepository(dataSource);
  }

  /**
   * Create a new campaign
   */
  async createCampaign(
    churchId: string,
    createdBy: string,
    dto: CreateCampaignDto
  ): Promise<Campaign> {
    const campaign = await this.campaignRepository.create({
      churchId,
      name: dto.name,
      description: dto.description,
      goalAmount: dto.goalAmount,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      imageUrl: dto.imageUrl,
      status: CampaignStatus.DRAFT,
      createdBy,
      amountRaised: 0,
      donorCount: 0,
    });

    return campaign;
  }

  /**
   * Get campaign by ID with progress
   */
  async getCampaignById(campaignId: string): Promise<Campaign & { progress: { percentageComplete: number } } | null> {
    const campaign = await this.campaignRepository.findById(campaignId);
    
    if (!campaign) {
      return null;
    }

    const percentageComplete = campaign.goalAmount > 0
      ? Math.min((campaign.amountRaised / campaign.goalAmount) * 100, 100)
      : 0;

    return {
      ...campaign,
      progress: {
        percentageComplete,
      },
    };
  }

  /**
   * List campaigns
   */
  async listCampaigns(
    churchId?: string,
    filters?: {
      status?: CampaignStatus;
      page?: number;
      limit?: number;
    }
  ): Promise<{ campaigns: Campaign[]; total: number }> {
    if (churchId) {
      return await this.campaignRepository.findByChurchId(churchId, filters);
    }
    
    return await this.campaignRepository.findAll(filters);
  }

  /**
   * Update campaign status
   */
  async updateCampaignStatus(campaignId: string, status: CampaignStatus): Promise<Campaign | null> {
    return await this.campaignRepository.update(campaignId, { status });
  }

  /**
   * Get campaign statistics
   */
  async getCampaignStatistics(campaignId: string): Promise<{
    totalAmount: number;
    donorCount: number;
    averageDonation: number;
  }> {
    const result = await this.donationRepository.getTotalByCampaign(campaignId);
    
    return {
      totalAmount: result.totalAmount,
      donorCount: result.donorCount,
      averageDonation: result.donorCount > 0 ? result.totalAmount / result.donorCount : 0,
    };
  }
}
