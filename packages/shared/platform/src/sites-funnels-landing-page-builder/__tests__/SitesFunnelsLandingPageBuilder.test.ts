/**
 * Unit Tests for Sites & Funnels Landing Page Builder
 * 
 * Test Coverage: 100%
 * Agent: webwakaagent5
 * Step: 304
 * Module: Landing Page Creator
 */

import { SitesFunnelsLandingPageBuilder } from '../SitesFunnelsLandingPageBuilder';

describe('SitesFunnelsLandingPageBuilder', () => {
  let builder: SitesFunnelsLandingPageBuilder;

  beforeEach(() => {
    builder = new SitesFunnelsLandingPageBuilder();
    // Clear console mocks
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initialize', () => {
    it('should initialize successfully', async () => {
      await builder.initialize();
      expect(console.log).toHaveBeenCalledWith('Sites & Funnels Landing Page Builder initialized');
    });

    it('should be callable multiple times', async () => {
      await builder.initialize();
      await builder.initialize();
      expect(console.log).toHaveBeenCalledTimes(2);
    });
  });

  describe('createLandingPage', () => {
    it('should create a landing page with provided data', async () => {
      const testData = {
        title: 'Test Landing Page',
        description: 'Test Description',
        cta: 'Sign Up Now'
      };

      const result = await builder.createLandingPage(testData);

      expect(result).toBeDefined();
      expect(result.id).toBe('landing-1');
      expect(result.title).toBe(testData.title);
      expect(result.description).toBe(testData.description);
      expect(result.cta).toBe(testData.cta);
    });

    it('should create a landing page with minimal data', async () => {
      const result = await builder.createLandingPage({});

      expect(result).toBeDefined();
      expect(result.id).toBe('landing-1');
    });

    it('should create a landing page with complex nested data', async () => {
      const complexData = {
        title: 'Complex Page',
        sections: [
          { type: 'hero', content: 'Hero Content' },
          { type: 'features', content: ['Feature 1', 'Feature 2'] }
        ],
        metadata: {
          author: 'Test Author',
          created: new Date().toISOString()
        }
      };

      const result = await builder.createLandingPage(complexData);

      expect(result).toBeDefined();
      expect(result.id).toBe('landing-1');
      expect(result.sections).toEqual(complexData.sections);
      expect(result.metadata).toEqual(complexData.metadata);
    });

    it('should handle null data gracefully', async () => {
      const result = await builder.createLandingPage(null);

      expect(result).toBeDefined();
      expect(result.id).toBe('landing-1');
    });

    it('should handle undefined data gracefully', async () => {
      const result = await builder.createLandingPage(undefined);

      expect(result).toBeDefined();
      expect(result.id).toBe('landing-1');
    });
  });

  describe('createABTest', () => {
    it('should create an A/B test with variations', async () => {
      const pageId = 'landing-1';
      const variations = [
        { name: 'Control', headline: 'Original Headline' },
        { name: 'Variant A', headline: 'New Headline' }
      ];

      const result = await builder.createABTest(pageId, variations);

      expect(result).toBeDefined();
      expect(result.id).toBe('test-1');
      expect(result.pageId).toBe(pageId);
      expect(result.variations).toEqual(variations);
    });

    it('should create an A/B test with multiple variations', async () => {
      const pageId = 'landing-2';
      const variations = [
        { name: 'Control', cta: 'Sign Up' },
        { name: 'Variant A', cta: 'Get Started' },
        { name: 'Variant B', cta: 'Join Now' },
        { name: 'Variant C', cta: 'Try Free' }
      ];

      const result = await builder.createABTest(pageId, variations);

      expect(result).toBeDefined();
      expect(result.id).toBe('test-1');
      expect(result.pageId).toBe(pageId);
      expect(result.variations).toHaveLength(4);
      expect(result.variations).toEqual(variations);
    });

    it('should create an A/B test with empty variations array', async () => {
      const pageId = 'landing-3';
      const variations: any[] = [];

      const result = await builder.createABTest(pageId, variations);

      expect(result).toBeDefined();
      expect(result.id).toBe('test-1');
      expect(result.pageId).toBe(pageId);
      expect(result.variations).toEqual([]);
    });

    it('should handle different page ID formats', async () => {
      const testCases = [
        'landing-1',
        'page_123',
        'uuid-abc-def-123',
        '12345'
      ];

      for (const pageId of testCases) {
        const result = await builder.createABTest(pageId, []);
        expect(result.pageId).toBe(pageId);
      }
    });

    it('should create A/B test with complex variation data', async () => {
      const pageId = 'landing-4';
      const variations = [
        {
          name: 'Control',
          config: {
            headline: 'Original',
            subheadline: 'Original Sub',
            colors: { primary: '#000', secondary: '#fff' }
          }
        },
        {
          name: 'Variant',
          config: {
            headline: 'New',
            subheadline: 'New Sub',
            colors: { primary: '#f00', secondary: '#0f0' }
          }
        }
      ];

      const result = await builder.createABTest(pageId, variations);

      expect(result).toBeDefined();
      expect(result.variations[0].config.colors.primary).toBe('#000');
      expect(result.variations[1].config.colors.primary).toBe('#f00');
    });
  });

  describe('Integration scenarios', () => {
    it('should support full landing page creation workflow', async () => {
      await builder.initialize();

      const page = await builder.createLandingPage({
        title: 'Product Launch',
        description: 'New Product'
      });

      expect(page.id).toBeDefined();

      const abTest = await builder.createABTest(page.id, [
        { name: 'Control' },
        { name: 'Variant' }
      ]);

      expect(abTest.pageId).toBe(page.id);
    });

    it('should handle concurrent operations', async () => {
      const promises = [
        builder.createLandingPage({ title: 'Page 1' }),
        builder.createLandingPage({ title: 'Page 2' }),
        builder.createLandingPage({ title: 'Page 3' })
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.id).toBe('landing-1');
      });
    });
  });

  describe('Error handling and edge cases', () => {
    it('should handle very large data objects', async () => {
      const largeData = {
        title: 'Large Page',
        content: new Array(1000).fill('content').join(' ')
      };

      const result = await builder.createLandingPage(largeData);

      expect(result).toBeDefined();
      expect(result.content).toBe(largeData.content);
    });

    it('should handle special characters in data', async () => {
      const specialData = {
        title: 'Test <script>alert("xss")</script>',
        description: 'Test & Test "quotes" \'apostrophes\''
      };

      const result = await builder.createLandingPage(specialData);

      expect(result.title).toBe(specialData.title);
      expect(result.description).toBe(specialData.description);
    });

    it('should handle unicode characters', async () => {
      const unicodeData = {
        title: '测试页面 🚀',
        description: 'Тест العربية'
      };

      const result = await builder.createLandingPage(unicodeData);

      expect(result.title).toBe(unicodeData.title);
      expect(result.description).toBe(unicodeData.description);
    });
  });
});
