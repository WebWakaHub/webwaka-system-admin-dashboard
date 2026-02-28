import { CampaignExecution, ExecutionStatus } from '../models/campaign-execution';

describe('CampaignExecution Model', () => {
  describe('Execution Creation', () => {
    it('should create an execution with valid data', () => {
      const execution = new CampaignExecution({
        campaignId: 'camp-123',
        tenantId: 'tenant-123',
        recipientCount: 1000,
        executedBy: 'user-123',
      });

      expect(execution.id).toBeDefined();
      expect(execution.status).toBe(ExecutionStatus.PENDING);
      expect(execution.recipientCount).toBe(1000);
      expect(execution.sentCount).toBe(0);
    });
  });

  describe('Execution Metrics', () => {
    it('should calculate success rate', () => {
      const execution = new CampaignExecution({
        campaignId: 'camp-123',
        tenantId: 'tenant-123',
        recipientCount: 100,
        executedBy: 'user-123',
        sentCount: 100,
        deliveredCount: 95,
      });

      expect(execution.getSuccessRate()).toBe(95);
    });

    it('should return 0 success rate when no messages sent', () => {
      const execution = new CampaignExecution({
        campaignId: 'camp-123',
        tenantId: 'tenant-123',
        recipientCount: 100,
        executedBy: 'user-123',
        sentCount: 0,
      });

      expect(execution.getSuccessRate()).toBe(0);
    });

    it('should calculate failure rate', () => {
      const execution = new CampaignExecution({
        campaignId: 'camp-123',
        tenantId: 'tenant-123',
        recipientCount: 100,
        executedBy: 'user-123',
        sentCount: 100,
        failedCount: 5,
      });

      expect(execution.getFailureRate()).toBe(5);
    });

    it('should return 0 failure rate when no messages sent', () => {
      const execution = new CampaignExecution({
        campaignId: 'camp-123',
        tenantId: 'tenant-123',
        recipientCount: 100,
        executedBy: 'user-123',
        sentCount: 0,
      });

      expect(execution.getFailureRate()).toBe(0);
    });
  });

  describe('Execution Status', () => {
    it('should initialize with PENDING status', () => {
      const execution = new CampaignExecution({
        campaignId: 'camp-123',
        tenantId: 'tenant-123',
        executedBy: 'user-123',
      });

      expect(execution.status).toBe(ExecutionStatus.PENDING);
    });

    it('should allow status update to EXECUTING', () => {
      const execution = new CampaignExecution({
        campaignId: 'camp-123',
        tenantId: 'tenant-123',
        executedBy: 'user-123',
        status: ExecutionStatus.PENDING,
      });

      execution.status = ExecutionStatus.EXECUTING;
      expect(execution.status).toBe(ExecutionStatus.EXECUTING);
    });

    it('should allow status update to COMPLETED', () => {
      const execution = new CampaignExecution({
        campaignId: 'camp-123',
        tenantId: 'tenant-123',
        executedBy: 'user-123',
        status: ExecutionStatus.EXECUTING,
      });

      execution.status = ExecutionStatus.COMPLETED;
      expect(execution.status).toBe(ExecutionStatus.COMPLETED);
    });

    it('should allow status update to FAILED', () => {
      const execution = new CampaignExecution({
        campaignId: 'camp-123',
        tenantId: 'tenant-123',
        executedBy: 'user-123',
        status: ExecutionStatus.EXECUTING,
      });

      execution.status = ExecutionStatus.FAILED;
      expect(execution.status).toBe(ExecutionStatus.FAILED);
    });
  });

  describe('Execution Timestamps', () => {
    it('should set startedAt timestamp', () => {
      const now = new Date();
      const execution = new CampaignExecution({
        campaignId: 'camp-123',
        tenantId: 'tenant-123',
        executedBy: 'user-123',
        startedAt: now,
      });

      expect(execution.startedAt).toEqual(now);
    });

    it('should set completedAt timestamp', () => {
      const now = new Date();
      const execution = new CampaignExecution({
        campaignId: 'camp-123',
        tenantId: 'tenant-123',
        executedBy: 'user-123',
        completedAt: now,
      });

      expect(execution.completedAt).toEqual(now);
    });
  });
});
