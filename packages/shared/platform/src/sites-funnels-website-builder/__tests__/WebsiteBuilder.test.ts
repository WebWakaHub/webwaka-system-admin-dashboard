import { WebsiteBuilderService, Page, ABTest, PageContent } from '../WebsiteBuilder';

describe('WebsiteBuilderService', () => {
  let service: WebsiteBuilderService;

  beforeEach(() => {
    service = new WebsiteBuilderService();
  });

  describe('createPage', () => {
    it('should create a new page with default content', async () => {
      const page = await service.createPage('tenant-123', 'Test Page');

      expect(page).toBeDefined();
      expect(page.id).toBeDefined();
      expect(page.tenantId).toBe('tenant-123');
      expect(page.name).toBe('Test Page');
      expect(page.slug).toBe('test-page');
      expect(page.status).toBe('draft');
      expect(page.content).toEqual({ components: [], styles: {}, scripts: [] });
    });

    it('should create a page from a template', async () => {
      const templates = service.getTemplates();
      const templateId = templates[0].id;

      const page = await service.createPage('tenant-123', 'Template Page', templateId);

      expect(page).toBeDefined();
      expect(page.content.components.length).toBeGreaterThan(0);
    });

    it('should generate a URL-friendly slug', async () => {
      const page = await service.createPage('tenant-123', 'My Awesome Landing Page!');

      expect(page.slug).toBe('my-awesome-landing-page');
    });

    it('should set created and updated timestamps', async () => {
      const page = await service.createPage('tenant-123', 'Test Page');

      expect(page.createdAt).toBeInstanceOf(Date);
      expect(page.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('updatePageContent', () => {
    it('should update page content successfully', async () => {
      const page = await service.createPage('tenant-123', 'Test Page');
      
      const newContent: PageContent = {
        components: [
          {
            id: 'hero-1',
            type: 'hero',
            properties: { heading: 'Welcome' }
          }
        ],
        styles: { color: 'blue' },
        scripts: ['analytics.js']
      };

      const updatedPage = await service.updatePageContent(page.id, newContent);

      expect(updatedPage.content).toEqual(newContent);
      expect(updatedPage.updatedAt.getTime()).toBeGreaterThanOrEqual(page.updatedAt.getTime());
    });

    it('should throw error for non-existent page', async () => {
      const newContent: PageContent = {
        components: [],
        styles: {},
        scripts: []
      };

      await expect(service.updatePageContent('non-existent-id', newContent))
        .rejects
        .toThrow('Page not found: non-existent-id');
    });
  });

  describe('publishPage', () => {
    it('should publish a draft page', async () => {
      const page = await service.createPage('tenant-123', 'Test Page');
      
      const publishedPage = await service.publishPage(page.id);

      expect(publishedPage.status).toBe('published');
      expect(publishedPage.updatedAt.getTime()).toBeGreaterThanOrEqual(page.updatedAt.getTime());
    });

    it('should throw error for non-existent page', async () => {
      await expect(service.publishPage('non-existent-id'))
        .rejects
        .toThrow('Page not found: non-existent-id');
    });
  });

  describe('createABTest', () => {
    it('should create an A/B test for a page', async () => {
      const page = await service.createPage('tenant-123', 'Test Page');
      
      const variations = [
        {
          id: 'var-1',
          name: 'Control',
          content: { components: [], styles: {}, scripts: [] }
        },
        {
          id: 'var-2',
          name: 'Variant A',
          content: { components: [], styles: {}, scripts: [] }
        }
      ];

      const abTest = await service.createABTest(
        'tenant-123',
        page.id,
        variations,
        { 'var-1': 50, 'var-2': 50 }
      );

      expect(abTest).toBeDefined();
      expect(abTest.id).toBeDefined();
      expect(abTest.pageId).toBe(page.id);
      expect(abTest.status).toBe('running');
      expect(abTest.variations.length).toBe(2);
      expect(abTest.variations[0].views).toBe(0);
      expect(abTest.variations[0].conversions).toBe(0);
      expect(abTest.variations[0].conversionRate).toBe(0);
    });

    it('should link the A/B test to the page', async () => {
      const page = await service.createPage('tenant-123', 'Test Page');
      
      const variations = [
        {
          id: 'var-1',
          name: 'Control',
          content: { components: [], styles: {}, scripts: [] }
        }
      ];

      const abTest = await service.createABTest(
        'tenant-123',
        page.id,
        variations,
        { 'var-1': 100 }
      );

      const updatedPage = service.getPage(page.id);
      expect(updatedPage?.abTestId).toBe(abTest.id);
    });

    it('should throw error for non-existent page', async () => {
      const variations = [
        {
          id: 'var-1',
          name: 'Control',
          content: { components: [], styles: {}, scripts: [] }
        }
      ];

      await expect(service.createABTest('tenant-123', 'non-existent-id', variations, { 'var-1': 100 }))
        .rejects
        .toThrow('Page not found: non-existent-id');
    });
  });

  describe('recordPageView', () => {
    it('should record a page view', async () => {
      const page = await service.createPage('tenant-123', 'Test Page');
      
      await service.recordPageView(page.id, 'tenant-123', { source: 'google' });

      const analytics = service.getPageAnalytics(page.id);
      expect(analytics.length).toBe(1);
      expect(analytics[0].eventType).toBe('page_view');
      expect(analytics[0].metadata.source).toBe('google');
    });

    it('should increment A/B test variation views', async () => {
      const page = await service.createPage('tenant-123', 'Test Page');
      
      const variations = [
        {
          id: 'var-1',
          name: 'Control',
          content: { components: [], styles: {}, scripts: [] }
        }
      ];

      const abTest = await service.createABTest(
        'tenant-123',
        page.id,
        variations,
        { 'var-1': 100 }
      );

      await service.recordPageView(page.id, 'tenant-123', { variationId: 'var-1' });

      const updatedTest = service.getABTest(abTest.id);
      expect(updatedTest?.variations[0].views).toBe(1);
    });
  });

  describe('recordConversion', () => {
    it('should record a conversion', async () => {
      const page = await service.createPage('tenant-123', 'Test Page');
      
      await service.recordConversion(page.id, 'tenant-123', { value: 100 });

      const analytics = service.getPageAnalytics(page.id);
      expect(analytics.length).toBe(1);
      expect(analytics[0].eventType).toBe('conversion');
      expect(analytics[0].metadata.value).toBe(100);
    });

    it('should increment A/B test variation conversions and calculate conversion rate', async () => {
      const page = await service.createPage('tenant-123', 'Test Page');
      
      const variations = [
        {
          id: 'var-1',
          name: 'Control',
          content: { components: [], styles: {}, scripts: [] }
        }
      ];

      const abTest = await service.createABTest(
        'tenant-123',
        page.id,
        variations,
        { 'var-1': 100 }
      );

      // Record 10 views
      for (let i = 0; i < 10; i++) {
        await service.recordPageView(page.id, 'tenant-123', { variationId: 'var-1' });
      }

      // Record 3 conversions
      for (let i = 0; i < 3; i++) {
        await service.recordConversion(page.id, 'tenant-123', { variationId: 'var-1' });
      }

      const updatedTest = service.getABTest(abTest.id);
      expect(updatedTest?.variations[0].views).toBe(10);
      expect(updatedTest?.variations[0].conversions).toBe(3);
      expect(updatedTest?.variations[0].conversionRate).toBe(30);
    });
  });

  describe('completeABTest', () => {
    it('should complete an A/B test and declare a winner', async () => {
      const page = await service.createPage('tenant-123', 'Test Page');
      
      const variations = [
        {
          id: 'var-1',
          name: 'Control',
          content: { components: [], styles: {}, scripts: [] }
        },
        {
          id: 'var-2',
          name: 'Variant A',
          content: { components: [], styles: {}, scripts: [] }
        }
      ];

      const abTest = await service.createABTest(
        'tenant-123',
        page.id,
        variations,
        { 'var-1': 50, 'var-2': 50 }
      );

      const completedTest = await service.completeABTest(abTest.id, 'var-2');

      expect(completedTest.status).toBe('completed');
      expect(completedTest.winner).toBe('var-2');
      expect(completedTest.completedAt).toBeInstanceOf(Date);
    });

    it('should throw error for non-existent A/B test', async () => {
      await expect(service.completeABTest('non-existent-id', 'var-1'))
        .rejects
        .toThrow('A/B test not found: non-existent-id');
    });
  });

  describe('getPage', () => {
    it('should retrieve a page by ID', async () => {
      const page = await service.createPage('tenant-123', 'Test Page');
      
      const retrievedPage = service.getPage(page.id);

      expect(retrievedPage).toBeDefined();
      expect(retrievedPage?.id).toBe(page.id);
    });

    it('should return undefined for non-existent page', () => {
      const page = service.getPage('non-existent-id');

      expect(page).toBeUndefined();
    });
  });

  describe('getPagesByTenant', () => {
    it('should retrieve all pages for a tenant', async () => {
      await service.createPage('tenant-123', 'Page 1');
      await service.createPage('tenant-123', 'Page 2');
      await service.createPage('tenant-456', 'Page 3');

      const pages = service.getPagesByTenant('tenant-123');

      expect(pages.length).toBe(2);
      expect(pages.every((p: Page) => p.tenantId === 'tenant-123')).toBe(true);
    });

    it('should return empty array for tenant with no pages', () => {
      const pages = service.getPagesByTenant('non-existent-tenant');

      expect(pages).toEqual([]);
    });
  });

  describe('getTemplates', () => {
    it('should return all available templates', () => {
      const templates = service.getTemplates();

      expect(templates.length).toBeGreaterThan(0);
      expect(templates[0]).toHaveProperty('id');
      expect(templates[0]).toHaveProperty('name');
      expect(templates[0]).toHaveProperty('category');
      expect(templates[0]).toHaveProperty('content');
    });
  });

  describe('getPageAnalytics', () => {
    it('should retrieve all analytics events for a page', async () => {
      const page = await service.createPage('tenant-123', 'Test Page');
      
      await service.recordPageView(page.id, 'tenant-123');
      await service.recordConversion(page.id, 'tenant-123');

      const analytics = service.getPageAnalytics(page.id);

      expect(analytics.length).toBe(2);
      expect(analytics[0].pageId).toBe(page.id);
      expect(analytics[1].pageId).toBe(page.id);
    });

    it('should return empty array for page with no analytics', async () => {
      const page = await service.createPage('tenant-123', 'Test Page');
      
      const analytics = service.getPageAnalytics(page.id);

      expect(analytics).toEqual([]);
    });
  });

  describe('Edge Cases', () => {
    it('should throw error for invalid template ID', async () => {
      await expect(service.createPage('tenant-123', 'Test Page', 'invalid-template-id'))
        .rejects
        .toThrow('Template not found: invalid-template-id');
    });

    it('should handle A/B test with paused status', async () => {
      const page = await service.createPage('tenant-123', 'Test Page');
      
      const variations = [
        {
          id: 'var-1',
          name: 'Control',
          content: { components: [], styles: {}, scripts: [] }
        }
      ];

      const abTest = await service.createABTest(
        'tenant-123',
        page.id,
        variations,
        { 'var-1': 100 }
      );

      // Manually set status to paused to test that branch
      const testObj = service.getABTest(abTest.id);
      if (testObj) {
        testObj.status = 'paused';
      }

      // Record page view - should not increment views for paused test
      await service.recordPageView(page.id, 'tenant-123', { variationId: 'var-1' });

      const updatedTest = service.getABTest(abTest.id);
      expect(updatedTest?.variations[0].views).toBe(0);
    });

    it('should handle page view without variation ID', async () => {
      const page = await service.createPage('tenant-123', 'Test Page');
      
      const variations = [
        {
          id: 'var-1',
          name: 'Control',
          content: { components: [], styles: {}, scripts: [] }
        }
      ];

      await service.createABTest(
        'tenant-123',
        page.id,
        variations,
        { 'var-1': 100 }
      );

      // Record page view without variationId
      await service.recordPageView(page.id, 'tenant-123', {});

      const analytics = service.getPageAnalytics(page.id);
      expect(analytics.length).toBe(1);
    });

    it('should handle conversion without variation ID', async () => {
      const page = await service.createPage('tenant-123', 'Test Page');
      
      const variations = [
        {
          id: 'var-1',
          name: 'Control',
          content: { components: [], styles: {}, scripts: [] }
        }
      ];

      await service.createABTest(
        'tenant-123',
        page.id,
        variations,
        { 'var-1': 100 }
      );

      // Record conversion without variationId
      await service.recordConversion(page.id, 'tenant-123', {});

      const analytics = service.getPageAnalytics(page.id);
      expect(analytics.length).toBe(1);
    });

    it('should handle page view with non-existent variation ID', async () => {
      const page = await service.createPage('tenant-123', 'Test Page');
      
      const variations = [
        {
          id: 'var-1',
          name: 'Control',
          content: { components: [], styles: {}, scripts: [] }
        }
      ];

      await service.createABTest(
        'tenant-123',
        page.id,
        variations,
        { 'var-1': 100 }
      );

      // Record page view with non-existent variationId
      await service.recordPageView(page.id, 'tenant-123', { variationId: 'non-existent' });

      const analytics = service.getPageAnalytics(page.id);
      expect(analytics.length).toBe(1);
    });

    it('should calculate conversion rate as 0 when there are no views', async () => {
      const page = await service.createPage('tenant-123', 'Test Page');
      
      const variations = [
        {
          id: 'var-1',
          name: 'Control',
          content: { components: [], styles: {}, scripts: [] }
        }
      ];

      const abTest = await service.createABTest(
        'tenant-123',
        page.id,
        variations,
        { 'var-1': 100 }
      );

      // Record a conversion without any views
      await service.recordConversion(page.id, 'tenant-123', { variationId: 'var-1' });

      const updatedTest = service.getABTest(abTest.id);
      expect(updatedTest?.variations[0].views).toBe(0);
      expect(updatedTest?.variations[0].conversions).toBe(1);
      expect(updatedTest?.variations[0].conversionRate).toBe(0);
    });

    it('should verify index.ts exports', () => {
      const exports = require('../index');
      expect(exports.WebsiteBuilderService).toBeDefined();
    });
  });
});
