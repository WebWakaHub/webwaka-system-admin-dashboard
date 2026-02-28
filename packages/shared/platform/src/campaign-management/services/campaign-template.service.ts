import { CampaignTemplate, TemplateStatus } from '../models/campaign-template';
import { EventEmitter } from 'events';

export interface ICampaignTemplateRepository {
  create(template: CampaignTemplate): Promise<CampaignTemplate>;
  findById(id: string, tenantId: string): Promise<CampaignTemplate | null>;
  findByTenant(tenantId: string): Promise<CampaignTemplate[]>;
  update(template: CampaignTemplate): Promise<CampaignTemplate>;
  delete(id: string, tenantId: string): Promise<boolean>;
}

export class CampaignTemplateService {
  private repository: ICampaignTemplateRepository;
  private eventEmitter: EventEmitter;

  constructor(repository: ICampaignTemplateRepository, eventEmitter: EventEmitter) {
    this.repository = repository;
    this.eventEmitter = eventEmitter;
  }

  async createTemplate(data: Partial<CampaignTemplate>, userId: string): Promise<CampaignTemplate> {
    const template = new CampaignTemplate({
      ...data,
      createdBy: userId,
    });

    const errors = template.validate();
    if (errors.length > 0) {
      throw new Error(`Template validation failed: ${errors.join(', ')}`);
    }

    // Extract variables from content
    template.variables = template.extractVariables();

    const created = await this.repository.create(template);
    this.eventEmitter.emit('template.created', {
      templateId: created.id,
      tenantId: created.tenantId,
      name: created.name,
      channel: created.channel,
    });

    return created;
  }

  async getTemplate(id: string, tenantId: string): Promise<CampaignTemplate> {
    const template = await this.repository.findById(id, tenantId);
    if (!template) {
      throw new Error(`Template not found: ${id}`);
    }
    return template;
  }

  async listTemplates(tenantId: string): Promise<CampaignTemplate[]> {
    return this.repository.findByTenant(tenantId);
  }

  async updateTemplate(id: string, tenantId: string, data: Partial<CampaignTemplate>, userId: string): Promise<CampaignTemplate> {
    const template = await this.getTemplate(id, tenantId);

    const updated = new CampaignTemplate({
      ...template,
      ...data,
      version: template.version + 1,
      updatedAt: new Date(),
    });

    const errors = updated.validate();
    if (errors.length > 0) {
      throw new Error(`Template validation failed: ${errors.join(', ')}`);
    }

    // Extract variables from content
    updated.variables = updated.extractVariables();

    const result = await this.repository.update(updated);
    this.eventEmitter.emit('template.updated', {
      templateId: result.id,
      tenantId: result.tenantId,
      version: result.version,
    });

    return result;
  }

  async deleteTemplate(id: string, tenantId: string, userId: string): Promise<void> {
    const template = await this.getTemplate(id, tenantId);

    if (template.status !== TemplateStatus.DRAFT && template.status !== TemplateStatus.ARCHIVED) {
      throw new Error(`Cannot delete template with status: ${template.status}`);
    }

    const deleted = await this.repository.delete(id, tenantId);
    if (!deleted) {
      throw new Error(`Failed to delete template: ${id}`);
    }

    this.eventEmitter.emit('template.deleted', {
      templateId: id,
      tenantId: tenantId,
    });
  }

  async archiveTemplate(id: string, tenantId: string, userId: string): Promise<CampaignTemplate> {
    const template = await this.getTemplate(id, tenantId);

    if (template.status === TemplateStatus.ARCHIVED) {
      throw new Error(`Template is already archived`);
    }

    template.status = TemplateStatus.ARCHIVED;
    template.updatedAt = new Date();

    const updated = await this.repository.update(template);
    this.eventEmitter.emit('template.archived', {
      templateId: updated.id,
      tenantId: updated.tenantId,
    });

    return updated;
  }

  async renderTemplate(id: string, tenantId: string, variables: Record<string, string>): Promise<string> {
    const template = await this.getTemplate(id, tenantId);
    return template.renderContent(variables);
  }
}
