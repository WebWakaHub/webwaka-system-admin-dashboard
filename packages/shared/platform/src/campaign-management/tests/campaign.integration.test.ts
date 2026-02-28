import { EventEmitter } from 'events';
import { Campaign, CampaignStatus, CampaignChannel } from '../models/campaign';
import { CampaignExecution, ExecutionStatus } from '../models/campaign-execution';
import { CampaignTemplate, TemplateChannel } from '../models/campaign-template';
import { AudienceSegment } from '../models/audience-segment';
import { CampaignService } from '../services/campaign.service';
import { CampaignExecutionService } from '../services/campaign-execution.service';
import { CampaignTemplateService } from '../services/campaign-template.service';
import { AudienceSegmentService } from '../services/audience-segment.service';

// Mock repositories for testing
class MockCampaignRepository {
  private campaigns = new Map<string, Campaign>();

  async create(campaign: Campaign): Promise<Campaign> {
    this.campaigns.set(campaign.id, campaign);
    return campaign;
  }

  async findById(id: string, tenantId: string): Promise<Campaign | null> {
    const campaign = this.campaigns.get(id);
    return campaign && campaign.tenantId === tenantId ? campaign : null;
  }

  async findByTenant(tenantId: string): Promise<Campaign[]> {
    return Array.from(this.campaigns.values()).filter((c) => c.tenantId === tenantId);
  }

  async update(campaign: Campaign): Promise<Campaign> {
    this.campaigns.set(campaign.id, campaign);
    return campaign;
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    const campaign = this.campaigns.get(id);
    if (campaign && campaign.tenantId === tenantId) {
      this.campaigns.delete(id);
      return true;
    }
    return false;
  }
}

class MockTemplateRepository {
  private templates = new Map<string, CampaignTemplate>();

  async create(template: CampaignTemplate): Promise<CampaignTemplate> {
    this.templates.set(template.id, template);
    return template;
  }

  async findById(id: string, tenantId: string): Promise<CampaignTemplate | null> {
    const template = this.templates.get(id);
    return template && template.tenantId === tenantId ? template : null;
  }

  async findByTenant(tenantId: string): Promise<CampaignTemplate[]> {
    return Array.from(this.templates.values()).filter((t) => t.tenantId === tenantId);
  }

  async update(template: CampaignTemplate): Promise<CampaignTemplate> {
    this.templates.set(template.id, template);
    return template;
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    const template = this.templates.get(id);
    if (template && template.tenantId === tenantId) {
      this.templates.delete(id);
      return true;
    }
    return false;
  }
}

class MockSegmentRepository {
  private segments = new Map<string, AudienceSegment>();

  async create(segment: AudienceSegment): Promise<AudienceSegment> {
    this.segments.set(segment.id, segment);
    return segment;
  }

  async findById(id: string, tenantId: string): Promise<AudienceSegment | null> {
    const segment = this.segments.get(id);
    return segment && segment.tenantId === tenantId ? segment : null;
  }

  async findByTenant(tenantId: string): Promise<AudienceSegment[]> {
    return Array.from(this.segments.values()).filter((s) => s.tenantId === tenantId);
  }

  async update(segment: AudienceSegment): Promise<AudienceSegment> {
    this.segments.set(segment.id, segment);
    return segment;
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    const segment = this.segments.get(id);
    if (segment && segment.tenantId === tenantId) {
      this.segments.delete(id);
      return true;
    }
    return false;
  }
}

class MockExecutionRepository {
  private executions = new Map<string, CampaignExecution>();

  async create(execution: CampaignExecution): Promise<CampaignExecution> {
    this.executions.set(execution.id, execution);
    return execution;
  }

  async findById(id: string): Promise<CampaignExecution | null> {
    return this.executions.get(id) || null;
  }

  async findByCampaign(campaignId: string): Promise<CampaignExecution[]> {
    return Array.from(this.executions.values()).filter((e) => e.campaignId === campaignId);
  }

  async update(execution: CampaignExecution): Promise<CampaignExecution> {
    this.executions.set(execution.id, execution);
    return execution;
  }
}

describe('Campaign Management Integration Tests', () => {
  let eventEmitter: EventEmitter;
  let campaignService: CampaignService;
  let templateService: CampaignTemplateService;
  let segmentService: AudienceSegmentService;
  let executionService: CampaignExecutionService;

  beforeEach(() => {
    eventEmitter = new EventEmitter();
    campaignService = new CampaignService(new MockCampaignRepository(), eventEmitter);
    templateService = new CampaignTemplateService(new MockTemplateRepository(), eventEmitter);
    segmentService = new AudienceSegmentService(new MockSegmentRepository(), eventEmitter);
    executionService = new CampaignExecutionService(new MockExecutionRepository(), eventEmitter);
  });

  describe('Campaign Creation to Execution Workflow', () => {
    it('should create campaign, template, segment, and execute', async () => {
      const tenantId = 'tenant-123';
      const userId = 'user-123';

      // Create template
      const template = await templateService.createTemplate(
        {
          tenantId,
          name: 'Welcome Email',
          channel: TemplateChannel.EMAIL,
          subject: 'Welcome {{firstName}}!',
          content: 'Hello {{firstName}}, welcome!',
        },
        userId,
      );

      expect(template.id).toBeDefined();
      expect(template.variables).toContain('firstName');

      // Create segment
      const segment = await segmentService.createSegment(
        {
          tenantId,
          name: 'Active Users',
          criteria: { demographic: { status: 'active' } },
          estimatedSize: 1000,
        },
        userId,
      );

      expect(segment.id).toBeDefined();

      // Create campaign
      const campaign = await campaignService.createCampaign(
        {
          tenantId,
          name: 'Welcome Campaign',
          channels: [CampaignChannel.EMAIL],
          targetAudience: { segmentId: segment.id },
          content: {
            email: {
              templateId: template.id,
              subject: template.subject,
            },
          },
        },
        userId,
      );

      expect(campaign.id).toBeDefined();
      expect(campaign.status).toBe(CampaignStatus.DRAFT);

      // Transition to active
      const activeCampaign = await campaignService.transitionCampaignStatus(
        campaign.id,
        tenantId,
        CampaignStatus.ACTIVE,
        userId,
      );

      expect(activeCampaign.status).toBe(CampaignStatus.ACTIVE);

      // Create execution
      const execution = await executionService.createExecution(campaign.id, tenantId, 100, userId);

      expect(execution.status).toBe(ExecutionStatus.PENDING);
      expect(execution.recipientCount).toBe(100);
    });

    it('should handle multi-channel campaign workflow', async () => {
      const tenantId = 'tenant-123';
      const userId = 'user-123';

      // Create templates for multiple channels
      const emailTemplate = await templateService.createTemplate(
        {
          tenantId,
          name: 'Email Template',
          channel: TemplateChannel.EMAIL,
          subject: 'Special Offer',
          content: 'Check out our offer!',
        },
        userId,
      );

      // Create segment
      const segment = await segmentService.createSegment(
        {
          tenantId,
          name: 'Premium Users',
          criteria: { behavioral: { purchaseHistory: true } },
        },
        userId,
      );

      // Create multi-channel campaign
      const campaign = await campaignService.createCampaign(
        {
          tenantId,
          name: 'Multi-Channel Campaign',
          channels: [CampaignChannel.EMAIL, CampaignChannel.SMS, CampaignChannel.PUSH],
          targetAudience: { segmentId: segment.id },
          content: {
            email: {
              templateId: emailTemplate.id,
              subject: 'Special Offer',
            },
          },
        },
        userId,
      );

      expect(campaign.channels.length).toBe(3);

      // List campaigns
      const campaigns = await campaignService.listCampaigns(tenantId);
      expect(campaigns.length).toBeGreaterThan(0);
    });
  });

  describe('Campaign Lifecycle Management', () => {
    it('should manage campaign status transitions', async () => {
      const tenantId = 'tenant-123';
      const userId = 'user-123';

      const segment = await segmentService.createSegment(
        {
          tenantId,
          name: 'Test Segment',
          criteria: { demographic: { age: '18-65' } },
        },
        userId,
      );

      const campaign = await campaignService.createCampaign(
        {
          tenantId,
          name: 'Lifecycle Test',
          channels: [CampaignChannel.EMAIL],
          targetAudience: { segmentId: segment.id },
          content: { email: { templateId: 'tpl-123' } },
        },
        userId,
      );

      // DRAFT -> SCHEDULED
      let updated = await campaignService.transitionCampaignStatus(
        campaign.id,
        tenantId,
        CampaignStatus.SCHEDULED,
        userId,
      );
      expect(updated.status).toBe(CampaignStatus.SCHEDULED);

      // SCHEDULED -> ACTIVE
      updated = await campaignService.transitionCampaignStatus(
        campaign.id,
        tenantId,
        CampaignStatus.ACTIVE,
        userId,
      );
      expect(updated.status).toBe(CampaignStatus.ACTIVE);

      // ACTIVE -> PAUSED
      updated = await campaignService.pauseCampaign(campaign.id, tenantId, userId);
      expect(updated.status).toBe(CampaignStatus.PAUSED);

      // PAUSED -> ACTIVE
      updated = await campaignService.resumeCampaign(campaign.id, tenantId, userId);
      expect(updated.status).toBe(CampaignStatus.ACTIVE);

      // ACTIVE -> COMPLETED
      updated = await campaignService.completeCampaign(campaign.id, tenantId, userId);
      expect(updated.status).toBe(CampaignStatus.COMPLETED);

      // COMPLETED -> ARCHIVED
      updated = await campaignService.archiveCampaign(campaign.id, tenantId, userId);
      expect(updated.status).toBe(CampaignStatus.ARCHIVED);
    });

    it('should prevent invalid status transitions', async () => {
      const tenantId = 'tenant-123';
      const userId = 'user-123';

      const segment = await segmentService.createSegment(
        {
          tenantId,
          name: 'Test Segment',
          criteria: { demographic: { status: 'active' } },
        },
        userId,
      );

      const campaign = await campaignService.createCampaign(
        {
          tenantId,
          name: 'Invalid Transition Test',
          channels: [CampaignChannel.EMAIL],
          targetAudience: { segmentId: segment.id },
          content: { email: { templateId: 'tpl-123' } },
        },
        userId,
      );

      // Try invalid transition
      await expect(
        campaignService.transitionCampaignStatus(
          campaign.id,
          tenantId,
          CampaignStatus.COMPLETED,
          userId,
        ),
      ).rejects.toThrow();
    });
  });

  describe('Audience Segmentation Workflow', () => {
    it('should evaluate segment against contacts', async () => {
      const tenantId = 'tenant-123';
      const userId = 'user-123';

      const segment = await segmentService.createSegment(
        {
          tenantId,
          name: 'High-Value Customers',
          criteria: {
            demographic: { age: '25-55' },
            behavioral: { purchaseValue: 'high' },
          },
        },
        userId,
      );

      const contacts = [
        { id: '1', age: '25-55', purchaseValue: 'high' },
        { id: '2', age: '18-24', purchaseValue: 'high' },
        { id: '3', age: '25-55', purchaseValue: 'low' },
        { id: '4', age: '25-55', purchaseValue: 'high' },
      ];

      const matched = await segmentService.evaluateSegment(segment.id, tenantId, contacts);
      expect(matched.length).toBe(2);
      expect(matched[0].id).toBe('1');
      expect(matched[1].id).toBe('4');
    });

    it('should update segment criteria', async () => {
      const tenantId = 'tenant-123';
      const userId = 'user-123';

      const segment = await segmentService.createSegment(
        {
          tenantId,
          name: 'Test Segment',
          criteria: { demographic: { age: '18-35' } },
        },
        userId,
      );

      const updated = await segmentService.updateSegment(
        segment.id,
        tenantId,
        {
          criteria: { demographic: { age: '25-55' } },
          estimatedSize: 5000,
        },
        userId,
      );

      expect(updated.criteria.demographic.age).toBe('25-55');
      expect(updated.estimatedSize).toBe(5000);
    });
  });

  describe('Template Management Workflow', () => {
    it('should create, render, and archive template', async () => {
      const tenantId = 'tenant-123';
      const userId = 'user-123';

      const template = await templateService.createTemplate(
        {
          tenantId,
          name: 'Order Confirmation',
          channel: TemplateChannel.EMAIL,
          subject: 'Order {{orderId}} Confirmed',
          content: 'Your order {{orderId}} for {{amount}} has been confirmed.',
        },
        userId,
      );

      expect(template.variables).toContain('orderId');
      expect(template.variables).toContain('amount');

      // Render template
      const rendered = await templateService.renderTemplate(template.id, tenantId, {
        orderId: 'ORD-123',
        amount: '$99.99',
      });

      expect(rendered).toContain('ORD-123');
      expect(rendered).toContain('$99.99');

      // Archive template
      const archived = await templateService.archiveTemplate(template.id, tenantId, userId);
      expect(archived.status).toBe('archived');
    });

    it('should handle template versioning', async () => {
      const tenantId = 'tenant-123';
      const userId = 'user-123';

      const template = await templateService.createTemplate(
        {
          tenantId,
          name: 'Newsletter',
          channel: TemplateChannel.EMAIL,
          content: 'Version 1 content',
        },
        userId,
      );

      expect(template.version).toBe(1);

      // Update template
      const updated = await templateService.updateTemplate(
        template.id,
        tenantId,
        { content: 'Version 2 content' },
        userId,
      );

      expect(updated.version).toBe(2);
    });
  });

  describe('Execution Tracking Workflow', () => {
    it('should track campaign execution lifecycle', async () => {
      const tenantId = 'tenant-123';
      const userId = 'user-123';

      const execution = await executionService.createExecution('camp-123', tenantId, 1000, userId);

      expect(execution.status).toBe(ExecutionStatus.PENDING);

      // Start execution
      const started = await executionService.startExecution(execution.id);
      expect(started.status).toBe(ExecutionStatus.EXECUTING);
      expect(started.startedAt).toBeDefined();

      // Record metrics
      await executionService.recordSent(execution.id);
      await executionService.recordSent(execution.id);
      await executionService.recordDelivered(execution.id);

      // Complete execution
      const completed = await executionService.completeExecution(execution.id);
      expect(completed.status).toBe(ExecutionStatus.COMPLETED);
      expect(completed.completedAt).toBeDefined();
    });

    it('should calculate execution metrics', async () => {
      const tenantId = 'tenant-123';
      const userId = 'user-123';

      const execution = await executionService.createExecution('camp-123', tenantId, 100, userId);

      await executionService.startExecution(execution.id);

      // Simulate sending
      for (let i = 0; i < 100; i++) {
        await executionService.recordSent(execution.id);
      }

      // Simulate delivery
      for (let i = 0; i < 95; i++) {
        await executionService.recordDelivered(execution.id);
      }

      // Simulate failures
      for (let i = 0; i < 5; i++) {
        await executionService.recordFailed(execution.id);
      }

      const final = await executionService.getExecution(execution.id);
      expect(final.sentCount).toBe(100);
      expect(final.deliveredCount).toBe(95);
      expect(final.failedCount).toBe(5);
      expect(final.getSuccessRate()).toBe(95);
      expect(final.getFailureRate()).toBe(5);
    });
  });

  describe('Event Emission', () => {
    it('should emit events on campaign creation', (done) => {
      const tenantId = 'tenant-123';
      const userId = 'user-123';

      eventEmitter.on('campaign.created', (event) => {
        expect(event.campaignId).toBeDefined();
        expect(event.tenantId).toBe(tenantId);
        done();
      });

      const segment = new AudienceSegment({
        tenantId,
        name: 'Test',
        criteria: { demographic: { status: 'active' } },
      });

      campaignService.createCampaign(
        {
          tenantId,
          name: 'Event Test',
          channels: [CampaignChannel.EMAIL],
          targetAudience: { segmentId: segment.id },
          content: { email: { templateId: 'tpl-123' } },
        },
        userId,
      );
    });

    it('should emit events on campaign update', (done) => {
      const tenantId = 'tenant-123';
      const userId = 'user-123';

      eventEmitter.on('campaign.updated', (event) => {
        expect(event.campaignId).toBeDefined();
        done();
      });

      const segment = new AudienceSegment({
        tenantId,
        name: 'Test',
        criteria: { demographic: { status: 'active' } },
      });

      campaignService
        .createCampaign(
          {
            tenantId,
            name: 'Event Test',
            channels: [CampaignChannel.EMAIL],
            targetAudience: { segmentId: segment.id },
            content: { email: { templateId: 'tpl-123' } },
          },
          userId,
        )
        .then((campaign) => {
          campaignService.updateCampaign(
            campaign.id,
            tenantId,
            { name: 'Updated Name' },
            userId,
          );
        });
    });
  });
});
