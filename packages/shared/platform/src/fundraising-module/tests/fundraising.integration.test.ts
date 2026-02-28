/**
 * Fundraising Module - Integration Tests
 * End-to-end workflow tests
 */

import { EventEmitter } from 'events';
import { FundraisingService } from '../services/fundraising.service';
import { DonationService } from '../services/donation.service';
import { DonorService } from '../services/donor.service';

describe('Fundraising Module - Integration Tests', () => {
  let fundraisingService: FundraisingService;
  let donationService: DonationService;
  let donorService: DonorService;
  let mockRepository: any;
  let eventEmitter: EventEmitter;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findByTenant: jest.fn().mockResolvedValue([]),
      update: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
    };
    eventEmitter = new EventEmitter();
    fundraisingService = new FundraisingService(mockRepository, eventEmitter);
    donationService = new DonationService(mockRepository, eventEmitter);
    donorService = new DonorService(mockRepository, eventEmitter);
  });

  describe('Complete Fundraising Workflow', () => {
    it('should handle complete campaign lifecycle', async () => {
      // Create campaign
      const campaign = await fundraisingService.createCampaign(
        {
          tenantId: 'tenant-1',
          name: 'Build School',
          goal: 500000,
          description: 'Help us build a new school',
        },
        'user-1'
      );

      expect(campaign.status).toBe('draft');

      // Update campaign to active
      const activeCampaign = await fundraisingService.updateCampaign(
        campaign.id!,
        'tenant-1',
        { status: 'active' },
        'user-1'
      );

      expect(activeCampaign.status).toBe('active');

      // Delete campaign
      await fundraisingService.deleteCampaign(campaign.id!, 'tenant-1', 'user-1');

      expect(mockRepository.delete).toHaveBeenCalledWith(campaign.id, 'tenant-1');
    });

    it('should handle donor registration and donation workflow', async () => {
      // Register donor
      const donor = await donorService.createDonor(
        {
          tenantId: 'tenant-1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+2348012345678',
        },
        'user-1'
      );

      expect(donor.email).toBe('john@example.com');

      // Create campaign
      const campaign = await fundraisingService.createCampaign(
        {
          tenantId: 'tenant-1',
          name: 'Medical Fund',
          goal: 200000,
        },
        'user-1'
      );

      // Make donation
      const donation = await donationService.createDonation(
        {
          tenantId: 'tenant-1',
          campaignId: campaign.id,
          donorId: donor.id,
          amount: 10000,
          currency: 'NGN',
        },
        'user-1'
      );

      expect(donation.amount).toBe(10000);
      expect(donation.campaignId).toBe(campaign.id);
      expect(donation.donorId).toBe(donor.id);
    });
  });

  describe('Event-Driven Workflows', () => {
    it('should emit events throughout campaign lifecycle', async () => {
      const events: string[] = [];

      eventEmitter.on('fundraising.campaign.created', () => events.push('created'));
      eventEmitter.on('fundraising.campaign.updated', () => events.push('updated'));
      eventEmitter.on('fundraising.campaign.deleted', () => events.push('deleted'));

      const campaign = await fundraisingService.createCampaign(
        { tenantId: 'tenant-1', name: 'Test', goal: 10000 },
        'user-1'
      );

      await fundraisingService.updateCampaign(campaign.id!, 'tenant-1', { goal: 20000 }, 'user-1');
      await fundraisingService.deleteCampaign(campaign.id!, 'tenant-1', 'user-1');

      expect(events).toEqual(['created', 'updated', 'deleted']);
    });

    it('should emit donation events', async () => {
      const events: string[] = [];

      eventEmitter.on('fundraising.donation.created', () => events.push('donation_created'));

      await donationService.createDonation(
        {
          tenantId: 'tenant-1',
          campaignId: 'camp-1',
          donorId: 'donor-1',
          amount: 5000,
          currency: 'NGN',
        },
        'user-1'
      );

      expect(events).toContain('donation_created');
    });
  });

  describe('Multi-Campaign Management', () => {
    it('should handle multiple campaigns for same tenant', async () => {
      const campaign1 = await fundraisingService.createCampaign(
        { tenantId: 'tenant-1', name: 'Campaign 1', goal: 10000 },
        'user-1'
      );

      const campaign2 = await fundraisingService.createCampaign(
        { tenantId: 'tenant-1', name: 'Campaign 2', goal: 20000 },
        'user-1'
      );

      const campaign3 = await fundraisingService.createCampaign(
        { tenantId: 'tenant-1', name: 'Campaign 3', goal: 30000 },
        'user-1'
      );

      expect(campaign1.id).not.toBe(campaign2.id);
      expect(campaign2.id).not.toBe(campaign3.id);
      expect(mockRepository.create).toHaveBeenCalledTimes(3);
    });
  });

  describe('Nigerian Context Integration', () => {
    it('should handle NGN currency donations', async () => {
      const donation = await donationService.createDonation(
        {
          tenantId: 'tenant-1',
          campaignId: 'camp-1',
          donorId: 'donor-1',
          amount: 50000,
          currency: 'NGN',
        },
        'user-1'
      );

      expect(donation.currency).toBe('NGN');
      expect(donation.amount).toBe(50000);
    });

    it('should handle Nigerian phone numbers', async () => {
      const donor = await donorService.createDonor(
        {
          tenantId: 'tenant-1',
          name: 'Adebayo Ogunlesi',
          email: 'adebayo@example.com',
          phone: '+2348012345678',
        },
        'user-1'
      );

      expect(donor.phone).toBe('+2348012345678');
    });
  });

  describe('Performance Tests', () => {
    it('should handle rapid campaign creation', async () => {
      const startTime = Date.now();

      const promises = Array.from({ length: 20 }, (_, i) =>
        fundraisingService.createCampaign(
          { tenantId: 'tenant-1', name: `Campaign ${i}`, goal: 10000 * (i + 1) },
          'user-1'
        )
      );

      await Promise.all(promises);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // Should complete in less than 1 second
      expect(mockRepository.create).toHaveBeenCalledTimes(20);
    });
  });
});
