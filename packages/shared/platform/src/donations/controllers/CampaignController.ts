import { Request, Response } from 'express';
import { DataSource } from 'typeorm';
import { CampaignService } from '../services/CampaignService';
import { CreateCampaignDto } from '../dto/CreateCampaignDto';
import { CampaignStatus } from '../models/Campaign';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

export class CampaignController {
  private service: CampaignService;

  constructor(dataSource: DataSource) {
    this.service = new CampaignService(dataSource);
  }

  /**
   * POST /api/v1/campaigns
   * Create a new campaign
   */
  async createCampaign(req: Request, res: Response): Promise<void> {
    try {
      const dto = plainToClass(CreateCampaignDto, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        res.status(400).json({ error: 'Validation failed', details: errors });
        return;
      }

      const churchId = req.user?.churchId || req.body.churchId;
      const createdBy = req.user?.userId || req.body.createdBy;

      const campaign = await this.service.createCampaign(churchId, createdBy, dto);

      res.status(201).json({ campaignId: campaign.campaignId });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to create campaign' });
    }
  }

  /**
   * GET /api/v1/campaigns/:id
   * Get campaign by ID with progress
   */
  async getCampaign(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const campaign = await this.service.getCampaignById(id);

      if (!campaign) {
        res.status(404).json({ error: 'Campaign not found' });
        return;
      }

      res.status(200).json(campaign);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to get campaign' });
    }
  }

  /**
   * GET /api/v1/campaigns
   * List all campaigns
   */
  async listCampaigns(req: Request, res: Response): Promise<void> {
    try {
      const churchId = req.query.churchId as string | undefined;
      const status = req.query.status as CampaignStatus | undefined;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await this.service.listCampaigns(churchId, { status, page, limit });

      res.status(200).json({
        campaigns: result.campaigns,
        pagination: {
          total: result.total,
          page,
          limit,
          totalPages: Math.ceil(result.total / limit),
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to list campaigns' });
    }
  }

  /**
   * PATCH /api/v1/campaigns/:id/status
   * Update campaign status
   */
  async updateCampaignStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!Object.values(CampaignStatus).includes(status)) {
        res.status(400).json({ error: 'Invalid campaign status' });
        return;
      }

      const campaign = await this.service.updateCampaignStatus(id, status);

      if (!campaign) {
        res.status(404).json({ error: 'Campaign not found' });
        return;
      }

      res.status(200).json(campaign);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to update campaign status' });
    }
  }

  /**
   * GET /api/v1/campaigns/:id/statistics
   * Get campaign statistics
   */
  async getCampaignStatistics(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const statistics = await this.service.getCampaignStatistics(id);

      res.status(200).json(statistics);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to get campaign statistics' });
    }
  }
}
