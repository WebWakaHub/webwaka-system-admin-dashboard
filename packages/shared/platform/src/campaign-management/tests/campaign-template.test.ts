import { CampaignTemplate, TemplateChannel, TemplateStatus } from '../models/campaign-template';

describe('CampaignTemplate Model', () => {
  describe('Template Creation', () => {
    it('should create a template with valid data', () => {
      const template = new CampaignTemplate({
        tenantId: 'tenant-123',
        name: 'Welcome Email',
        channel: TemplateChannel.EMAIL,
        subject: 'Welcome {{firstName}}!',
        content: 'Hello {{firstName}}, welcome to our platform!',
      });

      expect(template.id).toBeDefined();
      expect(template.name).toBe('Welcome Email');
      expect(template.status).toBe(TemplateStatus.DRAFT);
      expect(template.version).toBe(1);
    });

    it('should validate required fields', () => {
      const template = new CampaignTemplate({
        tenantId: 'tenant-123',
      });

      const errors = template.validate();
      expect(errors.length).toBeGreaterThan(0);
      expect(errors).toContain('Template name is required');
    });
  });

  describe('Template Variable Extraction', () => {
    it('should extract variables from template content', () => {
      const template = new CampaignTemplate({
        tenantId: 'tenant-123',
        name: 'Test Template',
        content: 'Hello {{firstName}}, your order {{orderId}} is ready!',
      });

      const variables = template.extractVariables();
      expect(variables).toContain('firstName');
      expect(variables).toContain('orderId');
      expect(variables.length).toBe(2);
    });

    it('should handle templates with no variables', () => {
      const template = new CampaignTemplate({
        tenantId: 'tenant-123',
        name: 'Test Template',
        content: 'Hello, your order is ready!',
      });

      const variables = template.extractVariables();
      expect(variables.length).toBe(0);
    });

    it('should handle duplicate variables', () => {
      const template = new CampaignTemplate({
        tenantId: 'tenant-123',
        name: 'Test Template',
        content: 'Hello {{firstName}}, {{firstName}} is a great name!',
      });

      const variables = template.extractVariables();
      expect(variables).toContain('firstName');
      expect(variables.length).toBe(1);
    });
  });

  describe('Template Content Rendering', () => {
    it('should render template with variables', () => {
      const template = new CampaignTemplate({
        tenantId: 'tenant-123',
        name: 'Test Template',
        content: 'Hello {{firstName}}, your order {{orderId}} is ready!',
      });

      const rendered = template.renderContent({
        firstName: 'John',
        orderId: 'ORD-123',
      });

      expect(rendered).toBe('Hello John, your order ORD-123 is ready!');
    });

    it('should handle missing variables gracefully', () => {
      const template = new CampaignTemplate({
        tenantId: 'tenant-123',
        name: 'Test Template',
        content: 'Hello {{firstName}}, {{lastName}}!',
      });

      const rendered = template.renderContent({
        firstName: 'John',
      });

      expect(rendered).toContain('John');
      expect(rendered).toContain('{{lastName}}');
    });

    it('should handle empty template', () => {
      const template = new CampaignTemplate({
        tenantId: 'tenant-123',
        name: 'Test Template',
        content: '',
      });

      const rendered = template.renderContent({
        firstName: 'John',
      });

      expect(rendered).toBe('');
    });
  });

  describe('Template Versioning', () => {
    it('should increment version on update', () => {
      const template = new CampaignTemplate({
        tenantId: 'tenant-123',
        name: 'Test Template',
        version: 1,
      });

      expect(template.version).toBe(1);

      const updated = new CampaignTemplate({
        ...template,
        version: template.version + 1,
      });

      expect(updated.version).toBe(2);
    });
  });
});
