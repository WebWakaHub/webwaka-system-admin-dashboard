import { TemplateEngine, ContractTemplate } from '../../components/TemplateEngine';

describe('TemplateEngine', () => {
  let templateEngine: TemplateEngine;
  const tenantId = 'tenant-123';
  const userId = 'user-123';

  beforeEach(() => {
    templateEngine = new TemplateEngine();
  });

  describe('createTemplate', () => {
    it('should create a template with valid data', async () => {
      const data: Partial<ContractTemplate> = {
        name: 'Service Agreement',
        description: 'Standard service agreement template',
        category: 'services',
        content: 'Template content here',
        sections: [{ id: '1', name: 'Terms', content: 'Terms content', required: true, order: 1 }],
        variables: [{ name: 'SERVICE_NAME', type: 'text', required: true }]
      };

      const template = await templateEngine.createTemplate(tenantId, data, userId);

      expect(template).toBeDefined();
      expect(template.id).toBeDefined();
      expect(template.name).toBe('Service Agreement');
      expect(template.version).toBe(1);
      expect(template.isActive).toBe(true);
    });

    it('should emit template:created event', async () => {
      const spy = jest.fn();
      templateEngine.on('template:created', spy);

      const data: Partial<ContractTemplate> = { name: 'Test Template' };

      await templateEngine.createTemplate(tenantId, data, userId);

      expect(spy).toHaveBeenCalled();
    });

    it('should initialize template with default values', async () => {
      const data: Partial<ContractTemplate> = {};

      const template = await templateEngine.createTemplate(tenantId, data, userId);

      expect(template.name).toBe('');
      expect(template.description).toBe('');
      expect(template.category).toBe('general');
      expect(template.content).toBe('');
      expect(template.sections).toEqual([]);
      expect(template.variables).toEqual([]);
    });
  });

  describe('getTemplate', () => {
    it('should retrieve a template by ID', async () => {
      const data: Partial<ContractTemplate> = { name: 'Test Template' };
      const created = await templateEngine.createTemplate(tenantId, data, userId);

      const retrieved = await templateEngine.getTemplate(created.id, tenantId);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.name).toBe('Test Template');
    });

    it('should return null for non-existent template', async () => {
      const retrieved = await templateEngine.getTemplate('non-existent', tenantId);

      expect(retrieved).toBeNull();
    });

    it('should return null for template from different tenant', async () => {
      const data: Partial<ContractTemplate> = { name: 'Test Template' };
      const created = await templateEngine.createTemplate(tenantId, data, userId);

      const retrieved = await templateEngine.getTemplate(created.id, 'different-tenant');

      expect(retrieved).toBeNull();
    });
  });

  describe('updateTemplate', () => {
    it('should update template with new data', async () => {
      const data: Partial<ContractTemplate> = { name: 'Original Name' };
      const created = await templateEngine.createTemplate(tenantId, data, userId);

      const updated = await templateEngine.updateTemplate(
        created.id,
        tenantId,
        { name: 'Updated Name' },
        userId
      );

      expect(updated.name).toBe('Updated Name');
      expect(updated.version).toBe(2);
    });

    it('should throw error for non-existent template', async () => {
      await expect(
        templateEngine.updateTemplate('non-existent', tenantId, {}, userId)
      ).rejects.toThrow('Template not found');
    });

    it('should emit template:updated event', async () => {
      const spy = jest.fn();
      templateEngine.on('template:updated', spy);

      const data: Partial<ContractTemplate> = { name: 'Test' };
      const created = await templateEngine.createTemplate(tenantId, data, userId);

      await templateEngine.updateTemplate(created.id, tenantId, { name: 'Updated' }, userId);

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('listTemplates', () => {
    it('should list all active templates for tenant', async () => {
      await templateEngine.createTemplate(tenantId, { name: 'Template 1' }, userId);
      await templateEngine.createTemplate(tenantId, { name: 'Template 2' }, userId);

      const result = await templateEngine.listTemplates(tenantId);

      expect(result.templates.length).toBe(2);
      expect(result.total).toBe(2);
    });

    it('should filter templates by category', async () => {
      await templateEngine.createTemplate(tenantId, { name: 'Service', category: 'services' }, userId);
      await templateEngine.createTemplate(tenantId, { name: 'Sales', category: 'sales' }, userId);

      const result = await templateEngine.listTemplates(tenantId, { category: 'services' });

      expect(result.templates.length).toBe(1);
      expect(result.templates[0].category).toBe('services');
    });

    it('should apply pagination', async () => {
      for (let i = 0; i < 5; i++) {
        await templateEngine.createTemplate(tenantId, { name: `Template ${i}` }, userId);
      }

      const result = await templateEngine.listTemplates(tenantId, { limit: 2, offset: 0 });

      expect(result.templates.length).toBe(2);
      expect(result.total).toBe(5);
    });
  });

  describe('generateFromTemplate', () => {
    it('should generate contract from template with variables', async () => {
      const data: Partial<ContractTemplate> = {
        name: 'Service Agreement',
        content: 'Agreement between {{CLIENT}} and {{PROVIDER}} for {{SERVICE}}'
      };
      const created = await templateEngine.createTemplate(tenantId, data, userId);

      const content = await templateEngine.generateFromTemplate(created.id, tenantId, {
        CLIENT: 'Acme Corp',
        PROVIDER: 'Service Inc',
        SERVICE: 'Consulting'
      });

      expect(content).toContain('Acme Corp');
      expect(content).toContain('Service Inc');
      expect(content).toContain('Consulting');
    });

    it('should throw error for non-existent template', async () => {
      await expect(
        templateEngine.generateFromTemplate('non-existent', tenantId, {})
      ).rejects.toThrow('Template not found');
    });

    it('should handle multiple occurrences of same variable', async () => {
      const data: Partial<ContractTemplate> = {
        name: 'Test',
        content: '{{NAME}} agrees. {{NAME}} will perform.'
      };
      const created = await templateEngine.createTemplate(tenantId, data, userId);

      const content = await templateEngine.generateFromTemplate(created.id, tenantId, {
        NAME: 'John'
      });

      expect(content).toBe('John agrees. John will perform.');
    });
  });

  describe('deleteTemplate', () => {
    it('should delete template', async () => {
      const data: Partial<ContractTemplate> = { name: 'Test Template' };
      const created = await templateEngine.createTemplate(tenantId, data, userId);

      await templateEngine.deleteTemplate(created.id, tenantId);

      const retrieved = await templateEngine.getTemplate(created.id, tenantId);

      expect(retrieved).toBeNull();
    });

    it('should emit template:deleted event', async () => {
      const spy = jest.fn();
      templateEngine.on('template:deleted', spy);

      const data: Partial<ContractTemplate> = { name: 'Test' };
      const created = await templateEngine.createTemplate(tenantId, data, userId);

      await templateEngine.deleteTemplate(created.id, tenantId);

      expect(spy).toHaveBeenCalled();
    });

    it('should throw error for non-existent template', async () => {
      await expect(
        templateEngine.deleteTemplate('non-existent', tenantId)
      ).rejects.toThrow('Template not found');
    });
  });

  describe('getTemplateVersions', () => {
    it('should return template versions', async () => {
      const data: Partial<ContractTemplate> = { name: 'Original' };
      const created = await templateEngine.createTemplate(tenantId, data, userId);

      await templateEngine.updateTemplate(created.id, tenantId, { name: 'Updated' }, userId);

      const versions = await templateEngine.getTemplateVersions(created.id);

      expect(versions.length).toBe(2);
      expect(versions[0].version).toBe(1);
      expect(versions[1].version).toBe(2);
    });
  });

  describe('searchTemplates', () => {
    it('should search templates by name', async () => {
      await templateEngine.createTemplate(tenantId, { name: 'Service Agreement' }, userId);
      await templateEngine.createTemplate(tenantId, { name: 'Sales Contract' }, userId);

      const results = await templateEngine.searchTemplates(tenantId, 'Service');

      expect(results.length).toBe(1);
      expect(results[0].name).toContain('Service');
    });

    it('should search templates by description', async () => {
      await templateEngine.createTemplate(
        tenantId,
        { name: 'Template', description: 'For service agreements' },
        userId
      );

      const results = await templateEngine.searchTemplates(tenantId, 'service');

      expect(results.length).toBe(1);
    });

    it('should return empty array for no matches', async () => {
      await templateEngine.createTemplate(tenantId, { name: 'Test' }, userId);

      const results = await templateEngine.searchTemplates(tenantId, 'NonExistent');

      expect(results.length).toBe(0);
    });
  });

  describe('cloneTemplate', () => {
    it('should clone template', async () => {
      const data: Partial<ContractTemplate> = {
        name: 'Original Template',
        content: 'Template content',
        sections: [{ id: '1', name: 'Section 1', content: 'Content', required: true, order: 1 }]
      };
      const created = await templateEngine.createTemplate(tenantId, data, userId);

      const cloned = await templateEngine.cloneTemplate(created.id, tenantId, userId);

      expect(cloned.id).not.toBe(created.id);
      expect(cloned.name).toContain('Clone');
      expect(cloned.content).toBe(created.content);
      expect(cloned.version).toBe(1);
    });

    it('should emit template:cloned event', async () => {
      const spy = jest.fn();
      templateEngine.on('template:cloned', spy);

      const data: Partial<ContractTemplate> = { name: 'Test' };
      const created = await templateEngine.createTemplate(tenantId, data, userId);

      await templateEngine.cloneTemplate(created.id, tenantId, userId);

      expect(spy).toHaveBeenCalled();
    });

    it('should throw error for non-existent template', async () => {
      await expect(
        templateEngine.cloneTemplate('non-existent', tenantId, userId)
      ).rejects.toThrow('Template not found');
    });
  });

  describe('template variables', () => {
    it('should handle template with multiple variable types', async () => {
      const data: Partial<ContractTemplate> = {
        name: 'Complex Template',
        variables: [
          { name: 'CLIENT_NAME', type: 'text', required: true },
          { name: 'AMOUNT', type: 'number', required: true },
          { name: 'START_DATE', type: 'date', required: true },
          { name: 'PRIORITY', type: 'select', required: false, options: ['High', 'Medium', 'Low'] }
        ]
      };

      const template = await templateEngine.createTemplate(tenantId, data, userId);

      expect(template.variables.length).toBe(4);
      expect(template.variables[0].type).toBe('text');
      expect(template.variables[1].type).toBe('number');
    });
  });

  describe('template sections', () => {
    it('should manage template sections', async () => {
      const data: Partial<ContractTemplate> = {
        name: 'Multi-Section Template',
        sections: [
          { id: '1', name: 'Header', content: 'Header content', required: true, order: 1 },
          { id: '2', name: 'Terms', content: 'Terms content', required: true, order: 2 },
          { id: '3', name: 'Footer', content: 'Footer content', required: false, order: 3 }
        ]
      };

      const template = await templateEngine.createTemplate(tenantId, data, userId);

      expect(template.sections.length).toBe(3);
      expect(template.sections[0].order).toBe(1);
      expect(template.sections[2].required).toBe(false);
    });
  });
});
