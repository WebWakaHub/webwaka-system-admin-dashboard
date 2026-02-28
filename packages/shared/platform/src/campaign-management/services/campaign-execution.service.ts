import { CampaignExecution, ExecutionStatus } from '../models/campaign-execution';
import { EventEmitter } from 'events';

export interface ICampaignExecutionRepository {
  create(execution: CampaignExecution): Promise<CampaignExecution>;
  findById(id: string): Promise<CampaignExecution | null>;
  findByCampaign(campaignId: string): Promise<CampaignExecution[]>;
  update(execution: CampaignExecution): Promise<CampaignExecution>;
}

export class CampaignExecutionService {
  private repository: ICampaignExecutionRepository;
  private eventEmitter: EventEmitter;

  constructor(repository: ICampaignExecutionRepository, eventEmitter: EventEmitter) {
    this.repository = repository;
    this.eventEmitter = eventEmitter;
  }

  async createExecution(
    campaignId: string,
    tenantId: string,
    recipientCount: number,
    executedBy: string,
  ): Promise<CampaignExecution> {
    const execution = new CampaignExecution({
      campaignId,
      tenantId,
      recipientCount,
      executedBy,
      status: ExecutionStatus.PENDING,
    });

    const created = await this.repository.create(execution);
    this.eventEmitter.emit('campaign.execution.created', {
      executionId: created.id,
      campaignId: created.campaignId,
      recipientCount: created.recipientCount,
    });

    return created;
  }

  async getExecution(id: string): Promise<CampaignExecution> {
    const execution = await this.repository.findById(id);
    if (!execution) {
      throw new Error(`Execution not found: ${id}`);
    }
    return execution;
  }

  async listExecutions(campaignId: string): Promise<CampaignExecution[]> {
    return this.repository.findByCampaign(campaignId);
  }

  async startExecution(id: string): Promise<CampaignExecution> {
    const execution = await this.getExecution(id);

    if (execution.status !== ExecutionStatus.PENDING) {
      throw new Error(`Cannot start execution with status: ${execution.status}`);
    }

    execution.status = ExecutionStatus.EXECUTING;
    execution.startedAt = new Date();

    const updated = await this.repository.update(execution);
    this.eventEmitter.emit('campaign.execution.started', {
      executionId: updated.id,
      campaignId: updated.campaignId,
    });

    return updated;
  }

  async completeExecution(id: string): Promise<CampaignExecution> {
    const execution = await this.getExecution(id);

    if (execution.status !== ExecutionStatus.EXECUTING) {
      throw new Error(`Cannot complete execution with status: ${execution.status}`);
    }

    execution.status = ExecutionStatus.COMPLETED;
    execution.completedAt = new Date();

    const updated = await this.repository.update(execution);
    this.eventEmitter.emit('campaign.execution.completed', {
      executionId: updated.id,
      campaignId: updated.campaignId,
      successRate: updated.getSuccessRate(),
      failureRate: updated.getFailureRate(),
    });

    return updated;
  }

  async failExecution(id: string, reason: string): Promise<CampaignExecution> {
    const execution = await this.getExecution(id);

    execution.status = ExecutionStatus.FAILED;
    execution.completedAt = new Date();

    const updated = await this.repository.update(execution);
    this.eventEmitter.emit('campaign.execution.failed', {
      executionId: updated.id,
      campaignId: updated.campaignId,
      reason,
    });

    return updated;
  }

  async recordSent(executionId: string): Promise<void> {
    const execution = await this.getExecution(executionId);
    execution.sentCount += 1;
    await this.repository.update(execution);
  }

  async recordDelivered(executionId: string): Promise<void> {
    const execution = await this.getExecution(executionId);
    execution.deliveredCount += 1;
    await this.repository.update(execution);
  }

  async recordFailed(executionId: string): Promise<void> {
    const execution = await this.getExecution(executionId);
    execution.failedCount += 1;
    await this.repository.update(execution);
  }
}
