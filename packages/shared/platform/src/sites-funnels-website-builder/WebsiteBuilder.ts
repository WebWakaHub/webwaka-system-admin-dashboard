import { v4 as uuidv4 } from 'uuid';

/**
 * Website Builder Module - Sites & Funnels Suite
 * 
 * This module provides a specialized website builder for creating high-converting
 * marketing websites, landing pages, and sales funnels with A/B testing and analytics.
 */

export interface Page {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  content: PageContent;
  abTestId?: string;
  status: 'draft' | 'published' | 'archived';
  seoMetadata?: SEOMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface PageContent {
  components: Component[];
  styles: Record<string, any>;
  scripts: string[];
}

export interface Component {
  id: string;
  type: string;
  properties: Record<string, any>;
  children?: Component[];
}

export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  canonicalUrl?: string;
}

export interface ABTest {
  id: string;
  tenantId: string;
  pageId: string;
  variations: ABTestVariation[];
  status: 'running' | 'completed' | 'paused';
  winner?: string;
  trafficSplit: Record<string, number>;
  createdAt: Date;
  completedAt?: Date;
}

export interface ABTestVariation {
  id: string;
  name: string;
  content: PageContent;
  views: number;
  conversions: number;
  conversionRate: number;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  content: PageContent;
  tags: string[];
}

export interface AnalyticsEvent {
  id: string;
  pageId: string;
  tenantId: string;
  eventType: 'page_view' | 'click' | 'conversion' | 'form_submit';
  timestamp: Date;
  metadata: Record<string, any>;
}

/**
 * Website Builder Service
 * Manages the creation, editing, and publishing of marketing websites and landing pages.
 */
export class WebsiteBuilderService {
  private pages: Map<string, Page> = new Map();
  private abTests: Map<string, ABTest> = new Map();
  private templates: Map<string, Template> = new Map();
  private analyticsEvents: AnalyticsEvent[] = [];

  constructor() {
    this.initializeDefaultTemplates();
  }

  /**
   * Initialize default templates for common use cases
   */
  private initializeDefaultTemplates(): void {
    const defaultTemplates: Template[] = [
      {
        id: uuidv4(),
        name: 'Product Launch Landing Page',
        category: 'landing-page',
        thumbnail: '/templates/product-launch.png',
        content: {
          components: [
            {
              id: uuidv4(),
              type: 'hero',
              properties: {
                heading: 'Introducing Our New Product',
                subheading: 'The solution you\'ve been waiting for',
                ctaText: 'Get Started',
                backgroundImage: '/images/hero-bg.jpg'
              }
            }
          ],
          styles: {},
          scripts: []
        },
        tags: ['product', 'launch', 'saas']
      },
      {
        id: uuidv4(),
        name: 'Lead Generation Form',
        category: 'landing-page',
        thumbnail: '/templates/lead-gen.png',
        content: {
          components: [
            {
              id: uuidv4(),
              type: 'form',
              properties: {
                heading: 'Get Your Free Guide',
                fields: ['name', 'email', 'phone'],
                submitText: 'Download Now'
              }
            }
          ],
          styles: {},
          scripts: []
        },
        tags: ['lead-generation', 'form', 'marketing']
      }
    ];

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  /**
   * Create a new page
   */
  async createPage(tenantId: string, name: string, templateId?: string): Promise<Page> {
    const page: Page = {
      id: uuidv4(),
      tenantId,
      name,
      slug: this.generateSlug(name),
      content: templateId ? this.getTemplateContent(templateId) : { components: [], styles: {}, scripts: [] },
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.pages.set(page.id, page);
    await this.emitEvent('sites-funnels.page.created', { pageId: page.id, tenantId });
    
    return page;
  }

  /**
   * Update page content
   */
  async updatePageContent(pageId: string, content: PageContent): Promise<Page> {
    const page = this.pages.get(pageId);
    if (!page) {
      throw new Error(`Page not found: ${pageId}`);
    }

    // Small delay to ensure timestamp is different
    await new Promise(resolve => setTimeout(resolve, 10));
    page.content = content;
    page.updatedAt = new Date();
    
    this.pages.set(pageId, page);
    await this.emitEvent('sites-funnels.page.updated', { pageId, tenantId: page.tenantId });
    
    return page;
  }

  /**
   * Publish a page
   */
  async publishPage(pageId: string): Promise<Page> {
    const page = this.pages.get(pageId);
    if (!page) {
      throw new Error(`Page not found: ${pageId}`);
    }

    // Small delay to ensure timestamp is different
    await new Promise(resolve => setTimeout(resolve, 10));
    page.status = 'published';
    page.updatedAt = new Date();
    
    this.pages.set(pageId, page);
    await this.emitEvent('sites-funnels.page.published', { pageId, tenantId: page.tenantId });
    
    return page;
  }

  /**
   * Create an A/B test for a page
   */
  async createABTest(
    tenantId: string,
    pageId: string,
    variations: Omit<ABTestVariation, 'views' | 'conversions' | 'conversionRate'>[],
    trafficSplit: Record<string, number>
  ): Promise<ABTest> {
    const page = this.pages.get(pageId);
    if (!page) {
      throw new Error(`Page not found: ${pageId}`);
    }

    const abTest: ABTest = {
      id: uuidv4(),
      tenantId,
      pageId,
      variations: variations.map(v => ({
        ...v,
        views: 0,
        conversions: 0,
        conversionRate: 0
      })),
      status: 'running',
      trafficSplit,
      createdAt: new Date()
    };

    this.abTests.set(abTest.id, abTest);
    page.abTestId = abTest.id;
    this.pages.set(pageId, page);

    await this.emitEvent('sites-funnels.ab-test.created', { abTestId: abTest.id, pageId, tenantId });
    
    return abTest;
  }

  /**
   * Record a page view for analytics
   */
  async recordPageView(pageId: string, tenantId: string, metadata: Record<string, any> = {}): Promise<void> {
    const event: AnalyticsEvent = {
      id: uuidv4(),
      pageId,
      tenantId,
      eventType: 'page_view',
      timestamp: new Date(),
      metadata
    };

    this.analyticsEvents.push(event);

    // Update A/B test views if applicable
    const page = this.pages.get(pageId);
    if (page?.abTestId) {
      const abTest = this.abTests.get(page.abTestId);
      if (abTest && abTest.status === 'running' && metadata.variationId) {
        const variation = abTest.variations.find(v => v.id === metadata.variationId);
        if (variation) {
          variation.views++;
          this.abTests.set(abTest.id, abTest);
        }
      }
    }

    await this.emitEvent('sites-funnels.analytics.page-view', { pageId, tenantId, metadata });
  }

  /**
   * Record a conversion for analytics
   */
  async recordConversion(pageId: string, tenantId: string, metadata: Record<string, any> = {}): Promise<void> {
    const event: AnalyticsEvent = {
      id: uuidv4(),
      pageId,
      tenantId,
      eventType: 'conversion',
      timestamp: new Date(),
      metadata
    };

    this.analyticsEvents.push(event);

    // Update A/B test conversions if applicable
    const page = this.pages.get(pageId);
    if (page?.abTestId) {
      const abTest = this.abTests.get(page.abTestId);
      if (abTest && abTest.status === 'running' && metadata.variationId) {
        const variation = abTest.variations.find(v => v.id === metadata.variationId);
        if (variation) {
          variation.conversions++;
          variation.conversionRate = variation.views > 0 ? (variation.conversions / variation.views) * 100 : 0;
          this.abTests.set(abTest.id, abTest);
        }
      }
    }

    await this.emitEvent('sites-funnels.analytics.conversion', { pageId, tenantId, metadata });
  }

  /**
   * Complete an A/B test and declare a winner
   */
  async completeABTest(abTestId: string, winnerId: string): Promise<ABTest> {
    const abTest = this.abTests.get(abTestId);
    if (!abTest) {
      throw new Error(`A/B test not found: ${abTestId}`);
    }

    abTest.status = 'completed';
    abTest.winner = winnerId;
    abTest.completedAt = new Date();
    
    this.abTests.set(abTestId, abTest);
    await this.emitEvent('sites-funnels.ab-test.completed', { abTestId, winnerId, tenantId: abTest.tenantId });
    
    return abTest;
  }

  /**
   * Get page by ID
   */
  getPage(pageId: string): Page | undefined {
    return this.pages.get(pageId);
  }

  /**
   * Get all pages for a tenant
   */
  getPagesByTenant(tenantId: string): Page[] {
    return Array.from(this.pages.values()).filter(page => page.tenantId === tenantId);
  }

  /**
   * Get A/B test by ID
   */
  getABTest(abTestId: string): ABTest | undefined {
    return this.abTests.get(abTestId);
  }

  /**
   * Get all templates
   */
  getTemplates(): Template[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get analytics for a page
   */
  getPageAnalytics(pageId: string): AnalyticsEvent[] {
    return this.analyticsEvents.filter(event => event.pageId === pageId);
  }

  /**
   * Helper: Generate URL-friendly slug from name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Helper: Get template content
   */
  private getTemplateContent(templateId: string): PageContent {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }
    return JSON.parse(JSON.stringify(template.content)); // Deep clone
  }

  /**
   * Helper: Emit event to Event Bus
   */
  private async emitEvent(eventType: string, data: any): Promise<void> {
    // In a real implementation, this would publish to the Event Bus
    console.log(`Event emitted: ${eventType}`, data);
  }
}

export default WebsiteBuilderService;
