import { Campaign, CampaignStatus, CampaignChannel, CampaignObjective } from '../models/campaign';

describe('Campaign Model', () => {
  describe('Campaign Creation', () => {
    it('should create a campaign with valid data', () => {
      const campaign = new Campaign({
        tenantId: 'tenant-123',
        name: 'Test Campaign',
        channels: [CampaignChannel.EMAIL],
        targetAudience: { segmentId: 'seg-123' },
        content: {
          email: {
            templateId: 'tpl-123',
            subject: 'Test Subject',
          },
        },
      });

      expect(campaign.id).toBeDefined();
      expect(campaign.name).toBe('Test Campaign');
      expect(campaign.status).toBe(CampaignStatus.DRAFT);
      expect(campaign.createdAt).toBeDefined();
    });

    it('should validate required fields', () => {
      const campaign = new Campaign({
        tenantId: 'tenant-123',
      });

      const errors = campaign.validate();
      expect(errors.length).toBeGreaterThan(0);
      expect(errors).toContain('Campaign name is required');
    });

    it('should require at least one channel', () => {
      const campaign = new Campaign({
        tenantId: 'tenant-123',
        name: 'Test Campaign',
        channels: [],
        targetAudience: { segmentId: 'seg-123' },
        content: { email: { templateId: 'tpl-123' } },
      });

      const errors = campaign.validate();
      expect(errors).toContain('At least one channel must be selected');
    });
  });

  describe('Campaign Status Transitions', () => {
    it('should allow transition from DRAFT to SCHEDULED', () => {
      const campaign = new Campaign({
        status: CampaignStatus.DRAFT,
      });

      expect(campaign.canTransitionTo(CampaignStatus.SCHEDULED)).toBe(true);
    });

    it('should allow transition from DRAFT to ACTIVE', () => {
      const campaign = new Campaign({
        status: CampaignStatus.DRAFT,
      });

      expect(campaign.canTransitionTo(CampaignStatus.ACTIVE)).toBe(true);
    });

    it('should not allow invalid transitions', () => {
      const campaign = new Campaign({
        status: CampaignStatus.DRAFT,
      });

      expect(campaign.canTransitionTo(CampaignStatus.COMPLETED)).toBe(false);
    });

    it('should allow transition from SCHEDULED to ACTIVE', () => {
      const campaign = new Campaign({
        status: CampaignStatus.SCHEDULED,
      });

      expect(campaign.canTransitionTo(CampaignStatus.ACTIVE)).toBe(true);
    });

    it('should allow transition from ACTIVE to PAUSED', () => {
      const campaign = new Campaign({
        status: CampaignStatus.ACTIVE,
      });

      expect(campaign.canTransitionTo(CampaignStatus.PAUSED)).toBe(true);
    });

    it('should allow transition from ACTIVE to COMPLETED', () => {
      const campaign = new Campaign({
        status: CampaignStatus.ACTIVE,
      });

      expect(campaign.canTransitionTo(CampaignStatus.COMPLETED)).toBe(true);
    });
  });

  describe('Campaign Performance Tracking', () => {
    it('should initialize performance metrics to zero', () => {
      const campaign = new Campaign({
        tenantId: 'tenant-123',
        name: 'Test Campaign',
      });

      expect(campaign.performance.sent).toBe(0);
      expect(campaign.performance.delivered).toBe(0);
      expect(campaign.performance.opened).toBe(0);
      expect(campaign.performance.clicked).toBe(0);
      expect(campaign.performance.converted).toBe(0);
    });
  });
});
