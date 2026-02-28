import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

export interface ContractTemplate {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  category: string;
  content: string;
  sections: TemplateSection[];
  variables: TemplateVariable[];
  version: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface TemplateSection {
  id: string;
  name: string;
  content: string;
  required: boolean;
  order: number;
}

export interface TemplateVariable {
  name: string;
  type: 'text' | 'number' | 'date' | 'select';
  required: boolean;
  defaultValue?: string;
  options?: string[];
}

export class TemplateEngine extends EventEmitter {
  private templates: Map<string, ContractTemplate> = new Map();
  private templateVersions: Map<string, ContractTemplate[]> = new Map();

  constructor() {
    super();
  }

  /**
   * Create contract template
   */
  async createTemplate(
    tenantId: string,
    data: Partial<ContractTemplate>,
    userId: string
  ): Promise<ContractTemplate> {
    const template: ContractTemplate = {
      id: uuidv4(),
      tenantId,
      name: data.name || '',
      description: data.description || '',
      category: data.category || 'general',
      content: data.content || '',
      sections: data.sections || [],
      variables: data.variables || [],
      version: 1,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };

    this.templates.set(template.id, template);
    this.templateVersions.set(template.id, [template]);
    this.emit('template:created', template);

    return template;
  }

  /**
   * Get template by ID
   */
  async getTemplate(templateId: string, tenantId: string): Promise<ContractTemplate | null> {
    const template = this.templates.get(templateId);
    if (!template || template.tenantId !== tenantId) {
      return null;
    }
    return template;
  }

  /**
   * Update template
   */
  async updateTemplate(
    templateId: string,
    tenantId: string,
    updates: Partial<ContractTemplate>,
    userId: string
  ): Promise<ContractTemplate> {
    const template = await this.getTemplate(templateId, tenantId);
    if (!template) {
      throw new Error('Template not found');
    }

    const updatedTemplate: ContractTemplate = {
      ...template,
      ...updates,
      version: template.version + 1,
      updatedAt: new Date()
    };

    this.templates.set(templateId, updatedTemplate);
    const versions = this.templateVersions.get(templateId) || [];
    versions.push(updatedTemplate);
    this.templateVersions.set(templateId, versions);

    this.emit('template:updated', updatedTemplate);

    return updatedTemplate;
  }

  /**
   * List templates
   */
  async listTemplates(
    tenantId: string,
    filters?: {
      category?: string;
      isActive?: boolean;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ templates: ContractTemplate[]; total: number }> {
    let templates = Array.from(this.templates.values()).filter(
      t => t.tenantId === tenantId && t.isActive
    );

    if (filters?.category) {
      templates = templates.filter(t => t.category === filters.category);
    }

    const total = templates.length;
    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;

    return {
      templates: templates.slice(offset, offset + limit),
      total
    };
  }

  /**
   * Generate contract from template
   */
  async generateFromTemplate(
    templateId: string,
    tenantId: string,
    variables: Record<string, any>
  ): Promise<string> {
    const template = await this.getTemplate(templateId, tenantId);
    if (!template) {
      throw new Error('Template not found');
    }

    let content = template.content;

    // Replace variables
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      content = content.replace(regex, String(value));
    }

    return content;
  }

  /**
   * Delete template
   */
  async deleteTemplate(
    templateId: string,
    tenantId: string
  ): Promise<void> {
    const template = await this.getTemplate(templateId, tenantId);
    if (!template) {
      throw new Error('Template not found');
    }

    template.isActive = false;
    this.templates.set(templateId, template);
    this.emit('template:deleted', template);
  }

  /**
   * Get template versions
   */
  async getTemplateVersions(templateId: string): Promise<ContractTemplate[]> {
    return this.templateVersions.get(templateId) || [];
  }

  /**
   * Search templates
   */
  async searchTemplates(
    tenantId: string,
    query: string
  ): Promise<ContractTemplate[]> {
    const templates = Array.from(this.templates.values()).filter(
      t => t.tenantId === tenantId &&
        t.isActive &&
        (t.name.toLowerCase().includes(query.toLowerCase()) ||
         t.description.toLowerCase().includes(query.toLowerCase()))
    );
    return templates;
  }

  /**
   * Clone template
   */
  async cloneTemplate(
    templateId: string,
    tenantId: string,
    userId: string
  ): Promise<ContractTemplate> {
    const template = await this.getTemplate(templateId, tenantId);
    if (!template) {
      throw new Error('Template not found');
    }

    const clonedTemplate: ContractTemplate = {
      ...template,
      id: uuidv4(),
      name: `${template.name} (Clone)`,
      version: 1,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.templates.set(clonedTemplate.id, clonedTemplate);
    this.templateVersions.set(clonedTemplate.id, [clonedTemplate]);
    this.emit('template:cloned', clonedTemplate);

    return clonedTemplate;
  }
}
