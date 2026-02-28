/**
 * Fundraising Module - Unit Tests
 * Tests for FundraisingService
 */

import { EventEmitter } from 'events';
import { FundraisingService } from '../services/fundraising.service';
import { FundraisingCampaign } from '../models/fundraising-campaign';

describe('FundraisingService', () => {
  let service: FundraisingService;
  let mockRepository: any;
  let eventEmitter: EventEmitter;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findByTenant: jest.fn(),
      update: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
    };
    eventEmitter = new EventEmitter();
    service = new FundraisingService(mockRepository, eventEmitter);
  });

  describe('createCampaign', () => {
    it('should create a new fundraising campaign', async () => {
      const campaignData = {
        tenantId: 'tenant-1',
        name: 'Build Community Center',
        goal: 1000000,
        description: 'Help us build a new community center',
      };

      const campaign = await service.createCampaign(campaignData, 'user-1');

      expect(campaign).toBeInstanceOf(FundraisingCampaign);
      expect(campaign.name).toBe('Build Community Center');
      expect(campaign.goal).toBe(1000000);
      expect(campaign.status).toBe('draft');
      expect(mockRepository.create).toHaveBeenCalledWith(expect.any(FundraisingCampaign));
    });

    it('should emit campaign.created event', async () => {
      const eventSpy = jest.fn();
      eventEmitter.on('fundraising.campaign.created', eventSpy);

      const campaignData = {
        tenantId: 'tenant-1',
        name: 'Test Campaign',
        goal: 50000,
      };

      await service.createCampaign(campaignData, 'user-1');

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: 'tenant-1',
          createdBy: 'user-1',
        })
      );
    });

    it('should generate unique campaign ID', async () => {
      const campaign1 = await service.createCampaign({ tenantId: 'tenant-1', name: 'Campaign 1', goal: 1000 }, 'user-1');
      // Small delay to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 2));
      const campaign2 = await service.createCampaign({ tenantId: 'tenant-1', name: 'Campaign 2', goal: 2000 }, 'user-1');

      expect(campaign1.id).toBeDefined();
      expect(campaign2.id).toBeDefined();
      expect(campaign1.id).not.toBe(campaign2.id);
    });
  });

  describe('getCampaign', () => {
    it('should retrieve a campaign by ID', async () => {
      const mockCampaign = new FundraisingCampaign({
        id: 'camp-123',
        tenantId: 'tenant-1',
        name: 'Test Campaign',
        goal: 100000,
        status: 'active',
      });

      mockRepository.findById.mockResolvedValue(mockCampaign);

      const campaign = await service.getCampaign('camp-123', 'tenant-1');

      expect(campaign).toBe(mockCampaign);
      expect(mockRepository.findById).toHaveBeenCalledWith('camp-123', 'tenant-1');
    });
  });

  describe('listCampaigns', () => {
    it('should list all campaigns for a tenant', async () => {
      const mockCampaigns = [
        new FundraisingCampaign({ id: 'camp-1', tenantId: 'tenant-1', name: 'Campaign 1', goal: 10000, status: 'active' }),
        new FundraisingCampaign({ id: 'camp-2', tenantId: 'tenant-1', name: 'Campaign 2', goal: 20000, status: 'draft' }),
      ];

      mockRepository.findByTenant.mockResolvedValue(mockCampaigns);

      const campaigns = await service.listCampaigns('tenant-1');

      expect(campaigns).toHaveLength(2);
      expect(campaigns[0].name).toBe('Campaign 1');
      expect(campaigns[1].name).toBe('Campaign 2');
      expect(mockRepository.findByTenant).toHaveBeenCalledWith('tenant-1');
    });

    it('should return empty array when no campaigns exist', async () => {
      mockRepository.findByTenant.mockResolvedValue([]);

      const campaigns = await service.listCampaigns('tenant-1');

      expect(campaigns).toEqual([]);
    });
  });

  describe('updateCampaign', () => {
    it('should update a campaign', async () => {
      const existingCampaign = new FundraisingCampaign({
        id: 'camp-123',
        tenantId: 'tenant-1',
        name: 'Old Name',
        goal: 50000,
        status: 'draft',
      });

      mockRepository.findById.mockResolvedValue(existingCampaign);

      const updated = await service.updateCampaign(
        'camp-123',
        'tenant-1',
        { name: 'New Name', goal: 75000 },
        'user-1'
      );

      expect(updated.name).toBe('New Name');
      expect(updated.goal).toBe(75000);
      expect(updated.updatedAt).toBeInstanceOf(Date);
      expect(mockRepository.update).toHaveBeenCalledWith(expect.any(FundraisingCampaign));
    });

    it('should emit campaign.updated event', async () => {
      const eventSpy = jest.fn();
      eventEmitter.on('fundraising.campaign.updated', eventSpy);

      const existingCampaign = new FundraisingCampaign({
        id: 'camp-123',
        tenantId: 'tenant-1',
        name: 'Test',
        goal: 10000,
        status: 'active',
      });

      mockRepository.findById.mockResolvedValue(existingCampaign);

      await service.updateCampaign('camp-123', 'tenant-1', { goal: 20000 }, 'user-1');

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          campaignId: 'camp-123',
          updatedBy: 'user-1',
        })
      );
    });
  });

  describe('deleteCampaign', () => {
    it('should delete a campaign', async () => {
      await service.deleteCampaign('camp-123', 'tenant-1', 'user-1');

      expect(mockRepository.delete).toHaveBeenCalledWith('camp-123', 'tenant-1');
    });

    it('should emit campaign.deleted event', async () => {
      const eventSpy = jest.fn();
      eventEmitter.on('fundraising.campaign.deleted', eventSpy);

      await service.deleteCampaign('camp-123', 'tenant-1', 'user-1');

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          campaignId: 'camp-123',
          deletedBy: 'user-1',
        })
      );
    });
  });
});
