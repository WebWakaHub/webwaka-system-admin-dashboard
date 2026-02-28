import { v4 as uuidv4 } from 'uuid';

export enum ExecutionStatus {
  PENDING = 'pending',
  EXECUTING = 'executing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export class CampaignExecution {
  id: string;
  campaignId: string;
  tenantId: string;
  status: ExecutionStatus;
  recipientCount: number;
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  startedAt?: Date;
  completedAt?: Date;
  executedBy: string;

  constructor(data: Partial<CampaignExecution>) {
    this.id = data.id || uuidv4();
    this.campaignId = data.campaignId || '';
    this.tenantId = data.tenantId || '';
    this.status = data.status || ExecutionStatus.PENDING;
    this.recipientCount = data.recipientCount || 0;
    this.sentCount = data.sentCount || 0;
    this.deliveredCount = data.deliveredCount || 0;
    this.failedCount = data.failedCount || 0;
    this.startedAt = data.startedAt;
    this.completedAt = data.completedAt;
    this.executedBy = data.executedBy || '';
  }

  getSuccessRate(): number {
    if (this.sentCount === 0) return 0;
    return (this.deliveredCount / this.sentCount) * 100;
  }

  getFailureRate(): number {
    if (this.sentCount === 0) return 0;
    return (this.failedCount / this.sentCount) * 100;
  }
}
