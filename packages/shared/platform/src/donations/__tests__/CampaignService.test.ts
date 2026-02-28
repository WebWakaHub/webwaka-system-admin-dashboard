import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DataSource } from 'typeorm';
import { CampaignService } from '../services/CampaignService';
import { CampaignStatus } from '../models/Campaign';
import { CreateCampaignDto } from '../dto/CreateCampaignDto';

describe('CampaignService', () => {
  let service: CampaignService;
  let mockDataSource: DataSource;

  beforeEach(() => {
    mockDataSource = {
      getRepository: vi.fn(),
    } as any;
    
    service = new CampaignService(mockDataSource);
  });

  describe('createCampaign', () => {
    it('should create campaign successfully', async () => {
      const dto: CreateCampaignDto = {
        name: 'Building Fund',
        description: 'New church building',
        goalAmount: 5000000,
        startDate: '2026-02-13',
        endDate: '2026-12-31',
      };

      const result = await service.createCampaign('church-123', 'user-123', dto);

      expect(result.name).toBe('Building Fund');
      expect(result.goalAmount).toBe(5000000);
      expect(result.status).toBe(CampaignStatus.DRAFT);
    });

    it('should initialize campaign with zero progress', async () => {
      const dto: CreateCampaignDto = {
        name: 'Mission Trip',
        goalAmount: 1000000,
        startDate: '2026-03-01',
        endDate: '2026-06-30',
      };

      const result = await service.createCampaign('church-123', 'user-123', dto);

      expect(result.amountRaised).toBe(0);
      expect(result.donorCount).toBe(0);
    });

    it('should validate end date is after start date', async () => {
      const dto: CreateCampaignDto = {
        name: 'Invalid Campaign',
        goalAmount: 100000,
        startDate: '2026-12-31',
        endDate: '2026-01-01',
      };

      await expect(
        service.createCampaign('church-123', 'user-123', dto)
      ).rejects.toThrow();
    });

    it('should support optional image URL', async () => {
      const dto: CreateCampaignDto = {
        name: 'Youth Camp',
        goalAmount: 500000,
        startDate: '2026-02-13',
        endDate: '2026-08-31',
        imageUrl: 'https://example.com/image.jpg',
      };

      const result = await service.createCampaign('church-123', 'user-123', dto);

      expect(result.imageUrl).toBe('https://example.com/image.jpg');
    });
  });

  describe('getCampaignById', () => {
    it('should return campaign with progress', async () => {
      const campaignId = 'campaign-123';

      const result = await service.getCampaignById(campaignId);

      expect(result).toBeDefined();
      expect(result?.progress).toBeDefined();
      expect(result?.progress.percentageComplete).toBeGreaterThanOrEqual(0);
      expect(result?.progress.percentageComplete).toBeLessThanOrEqual(100);
    });

    it('should calculate percentage complete correctly', async () => {
      const campaignId = 'campaign-123';

      const result = await service.getCampaignById(campaignId);

      if (result && result.goalAmount > 0) {
        const expected = Math.min((result.amountRaised / result.goalAmount) * 100, 100);
        expect(result.progress.percentageComplete).toBe(expected);
      }
    });

    it('should return null for non-existent campaign', async () => {
      const campaignId = 'non-existent';

      const result = await service.getCampaignById(campaignId);

      expect(result).toBeNull();
    });
  });

  describe('updateCampaignStatus', () => {
    it('should activate draft campaign', async () => {
      const campaignId = 'campaign-123';

      const result = await service.updateCampaignStatus(campaignId, CampaignStatus.ACTIVE);

      expect(result?.status).toBe(CampaignStatus.ACTIVE);
    });

    it('should complete active campaign', async () => {
      const campaignId = 'campaign-123';

      const result = await service.updateCampaignStatus(campaignId, CampaignStatus.COMPLETED);

      expect(result?.status).toBe(CampaignStatus.COMPLETED);
    });

    it('should cancel campaign', async () => {
      const campaignId = 'campaign-123';

      const result = await service.updateCampaignStatus(campaignId, CampaignStatus.CANCELLED);

      expect(result?.status).toBe(CampaignStatus.CANCELLED);
    });
  });

  describe('getCampaignStatistics', () => {
    it('should calculate total amount raised', async () => {
      const campaignId = 'campaign-123';

      const stats = await service.getCampaignStatistics(campaignId);

      expect(stats.totalAmount).toBeGreaterThanOrEqual(0);
    });

    it('should calculate donor count', async () => {
      const campaignId = 'campaign-123';

      const stats = await service.getCampaignStatistics(campaignId);

      expect(stats.donorCount).toBeGreaterThanOrEqual(0);
    });

    it('should calculate average donation', async () => {
      const campaignId = 'campaign-123';

      const stats = await service.getCampaignStatistics(campaignId);

      if (stats.donorCount > 0) {
        expect(stats.averageDonation).toBe(stats.totalAmount / stats.donorCount);
      } else {
        expect(stats.averageDonation).toBe(0);
      }
    });
  });
});
