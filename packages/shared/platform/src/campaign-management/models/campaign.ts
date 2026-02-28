import { v4 as uuidv4 } from 'uuid';

export enum CampaignStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

export enum CampaignObjective {
  AWARENESS = 'awareness',
  ENGAGEMENT = 'engagement',
  CONVERSION = 'conversion',
  RETENTION = 'retention',
}

export enum CampaignChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app',
  SOCIAL = 'social',
}

export interface TargetAudience {
  segmentId: string;
  criteria?: {
    demographic?: Record<string, any>;
    behavioral?: Record<string, any>;
    geographic?: Record<string, any>;
  };
}

export interface CampaignContent {
  [channel: string]: {
    templateId: string;
    subject?: string;
    message?: string;
    title?: string;
    body?: string;
    variables?: Record<string, string>;
  };
}

export interface CampaignScheduling {
  type: 'one_time' | 'recurring' | 'event_triggered';
  startDate?: string;
  startTime?: string;
  timezone?: string;
  recurrence?: 'daily' | 'weekly' | 'monthly' | 'custom';
  endDate?: string;
  eventTrigger?: string;
}

export interface CampaignCompliance {
  requiresConsent: boolean;
  includeUnsubscribeLink: boolean;
  includePreferenceCenter: boolean;
}

export interface CampaignPerformance {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
  unsubscribed: number;
  complained: number;
}

export class Campaign {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  status: CampaignStatus;
  objectives: CampaignObjective[];
  channels: CampaignChannel[];
  targetAudience: TargetAudience;
  content: CampaignContent;
  scheduling: CampaignScheduling;
  compliance: CampaignCompliance;
  performance: CampaignPerformance;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy?: string;

  constructor(data: Partial<Campaign>) {
    this.id = data.id || uuidv4();
    this.tenantId = data.tenantId || '';
    this.name = data.name || '';
    this.description = data.description;
    this.status = data.status || CampaignStatus.DRAFT;
    this.objectives = data.objectives || [];
    this.channels = data.channels || [];
    this.targetAudience = data.targetAudience || { segmentId: '' };
    this.content = data.content || {};
    this.scheduling = data.scheduling || { type: 'one_time' };
    this.compliance = data.compliance || {
      requiresConsent: true,
      includeUnsubscribeLink: true,
      includePreferenceCenter: true,
    };
    this.performance = data.performance || {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      converted: 0,
      unsubscribed: 0,
      complained: 0,
    };
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.createdBy = data.createdBy || '';
    this.updatedBy = data.updatedBy;
  }

  validate(): string[] {
    const errors: string[] = [];

    if (!this.name || this.name.trim().length === 0) {
      errors.push('Campaign name is required');
    }

    if (this.channels.length === 0) {
      errors.push('At least one channel must be selected');
    }

    if (!this.targetAudience.segmentId) {
      errors.push('Target audience segment is required');
    }

    if (Object.keys(this.content).length === 0) {
      errors.push('Campaign content is required');
    }

    return errors;
  }

  canTransitionTo(newStatus: CampaignStatus): boolean {
    const validTransitions: Record<CampaignStatus, CampaignStatus[]> = {
      [CampaignStatus.DRAFT]: [CampaignStatus.SCHEDULED, CampaignStatus.ACTIVE],
      [CampaignStatus.SCHEDULED]: [CampaignStatus.ACTIVE, CampaignStatus.PAUSED, CampaignStatus.DRAFT],
      [CampaignStatus.ACTIVE]: [CampaignStatus.PAUSED, CampaignStatus.COMPLETED],
      [CampaignStatus.PAUSED]: [CampaignStatus.ACTIVE, CampaignStatus.COMPLETED],
      [CampaignStatus.COMPLETED]: [CampaignStatus.ARCHIVED],
      [CampaignStatus.ARCHIVED]: [],
    };

    return validTransitions[this.status]?.includes(newStatus) || false;
  }
}
