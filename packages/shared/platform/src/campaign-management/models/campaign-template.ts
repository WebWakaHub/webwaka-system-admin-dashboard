import { v4 as uuidv4 } from 'uuid';

export enum TemplateChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app',
}

export enum TemplateStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

export class CampaignTemplate {
  id: string;
  tenantId: string;
  name: string;
  channel: TemplateChannel;
  subject?: string;
  content: string;
  variables: string[];
  version: number;
  status: TemplateStatus;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;

  constructor(data: Partial<CampaignTemplate>) {
    this.id = data.id || uuidv4();
    this.tenantId = data.tenantId || '';
    this.name = data.name || '';
    this.channel = data.channel || TemplateChannel.EMAIL;
    this.subject = data.subject;
    this.content = data.content || '';
    this.variables = data.variables || [];
    this.version = data.version || 1;
    this.status = data.status || TemplateStatus.DRAFT;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.createdBy = data.createdBy || '';
  }

  validate(): string[] {
    const errors: string[] = [];

    if (!this.name || this.name.trim().length === 0) {
      errors.push('Template name is required');
    }

    if (!this.content || this.content.trim().length === 0) {
      errors.push('Template content is required');
    }

    return errors;
  }

  renderContent(variables: Record<string, string>): string {
    let rendered = this.content;

    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      rendered = rendered.replace(new RegExp(placeholder, 'g'), value);
    }

    return rendered;
  }

  extractVariables(): string[] {
    const regex = /\{\{(\w+)\}\}/g;
    const matches = this.content.matchAll(regex);
    const variables = new Set<string>();

    for (const match of matches) {
      variables.add(match[1]);
    }

    return Array.from(variables);
  }
}
