/**
 * Integration Tests for Sites & Funnels Email Campaign Builder
 * 
 * Agent: webwakaagent5
 * Step: 324
 * Module: Email Marketing
 */

import { SitesFunnelsEmailCampaignBuilder } from '../SitesFunnelsEmailCampaignBuilder';

describe('SitesFunnelsEmailCampaignBuilder Integration Tests', () => {
  let builder: SitesFunnelsEmailCampaignBuilder;

  beforeEach(() => {
    builder = new SitesFunnelsEmailCampaignBuilder();
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('End-to-End Email Campaign Workflow', () => {
    it('should complete full campaign creation and sending workflow', async () => {
      await builder.initialize();

      const campaign = await builder.createCampaign({
        name: 'Product Launch Campaign',
        subject: 'Introducing Our New Product',
        from: 'marketing@webwaka.com',
        recipients: ['customer1@example.com', 'customer2@example.com'],
        content: '<h1>New Product!</h1><p>Check it out!</p>'
      });

      expect(campaign.id).toBe('campaign-1');
      expect(campaign.name).toBe('Product Launch Campaign');

      const sendResult = await builder.sendCampaign(campaign.id);

      expect(sendResult.id).toBe(campaign.id);
      expect(sendResult.sent).toBe(true);
    });

    it('should handle drip campaign workflow', async () => {
      await builder.initialize();

      // Day 1: Welcome email
      const day1 = await builder.createCampaign({
        name: 'Drip - Day 1',
        subject: 'Welcome to WebWaka!',
        schedule: { sendAt: '2026-02-13T09:00:00Z' }
      });

      // Day 3: Feature introduction
      const day3 = await builder.createCampaign({
        name: 'Drip - Day 3',
        subject: 'Discover Our Features',
        schedule: { sendAt: '2026-02-15T09:00:00Z' }
      });

      // Day 7: Success stories
      const day7 = await builder.createCampaign({
        name: 'Drip - Day 7',
        subject: 'Customer Success Stories',
        schedule: { sendAt: '2026-02-19T09:00:00Z' }
      });

      expect(day1.schedule.sendAt).toBeDefined();
      expect(day3.schedule.sendAt).toBeDefined();
      expect(day7.schedule.sendAt).toBeDefined();
    });
  });

  describe('A/B Testing Integration', () => {
    it('should support A/B testing workflow', async () => {
      await builder.initialize();

      const campaign = await builder.createCampaign({
        name: 'A/B Test Campaign',
        abTest: {
          enabled: true,
          variants: [
            {
              name: 'Control',
              subject: 'Check Out Our New Product',
              content: '<p>Standard message</p>'
            },
            {
              name: 'Variant A',
              subject: 'Limited Time: New Product Launch!',
              content: '<p>Urgent message with scarcity</p>'
            }
          ],
          testPercentage: 20,
          winnerMetric: 'click_rate'
        }
      });

      expect(campaign.abTest.enabled).toBe(true);
      expect(campaign.abTest.variants).toHaveLength(2);

      const sendResult = await builder.sendCampaign(campaign.id);
      expect(sendResult.sent).toBe(true);
    });
  });

  describe('Audience Segmentation', () => {
    it('should handle segmented campaigns', async () => {
      await builder.initialize();

      const nigerianCampaign = await builder.createCampaign({
        name: 'Nigeria-Specific Campaign',
        subject: 'Special Offer for Nigerian Customers',
        segments: {
          location: 'Nigeria',
          language: 'en',
          interests: ['technology', 'business']
        }
      });

      const sendResult = await builder.sendCampaign(nigerianCampaign.id);
      expect(sendResult.sent).toBe(true);
    });

    it('should handle multi-segment campaigns', async () => {
      await builder.initialize();

      const campaign = await builder.createCampaign({
        name: 'Multi-Segment Campaign',
        segments: {
          conditions: [
            { field: 'country', operator: 'in', value: ['Nigeria', 'Ghana', 'Kenya'] },
            { field: 'signupDate', operator: 'after', value: '2026-01-01' },
            { field: 'purchaseCount', operator: 'greater_than', value: 0 }
          ],
          logic: 'AND'
        }
      });

      expect(campaign.segments.conditions).toHaveLength(3);
    });
  });

  describe('Personalization and Dynamic Content', () => {
    it('should handle personalized campaigns', async () => {
      await builder.initialize();

      const campaign = await builder.createCampaign({
        name: 'Personalized Welcome',
        subject: 'Welcome {{firstName}}!',
        content: `
          <p>Hi {{firstName}} {{lastName}},</p>
          <p>Thank you for joining us from {{city}}, {{country}}!</p>
          <p>Your account email is: {{email}}</p>
        `,
        personalization: {
          tokens: ['firstName', 'lastName', 'city', 'country', 'email']
        }
      });

      expect(campaign.subject).toContain('{{firstName}}');
      expect(campaign.content).toContain('{{country}}');
    });
  });

  describe('Email Service Provider Integration', () => {
    it('should integrate with Mailchimp', async () => {
      await builder.initialize();

      const campaign = await builder.createCampaign({
        name: 'Mailchimp Campaign',
        integrations: {
          mailchimp: {
            apiKey: 'test-api-key',
            listId: 'abc123',
            tags: ['webwaka', 'newsletter']
          }
        }
      });

      expect(campaign.integrations.mailchimp.listId).toBe('abc123');
    });

    it('should integrate with SendGrid', async () => {
      await builder.initialize();

      const campaign = await builder.createCampaign({
        name: 'SendGrid Campaign',
        integrations: {
          sendgrid: {
            apiKey: 'test-api-key',
            templateId: 'template-123',
            categories: ['marketing', 'product-launch']
          }
        }
      });

      expect(campaign.integrations.sendgrid.templateId).toBe('template-123');
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle rapid sequential campaign creation', async () => {
      await builder.initialize();

      const startTime = Date.now();

      for (let i = 0; i < 50; i++) {
        await builder.createCampaign({
          name: `Campaign ${i}`,
          subject: `Subject ${i}`
        });
      }

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(1000);
    });

    it('should handle concurrent campaign sends', async () => {
      await builder.initialize();

      const campaigns = await Promise.all([
        builder.createCampaign({ name: 'Campaign 1' }),
        builder.createCampaign({ name: 'Campaign 2' }),
        builder.createCampaign({ name: 'Campaign 3' })
      ]);

      const sendPromises = campaigns.map(c => builder.sendCampaign(c.id));
      const results = await Promise.all(sendPromises);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.sent).toBe(true);
      });
    });
  });

  describe('Analytics and Tracking', () => {
    it('should support campaign analytics tracking', async () => {
      await builder.initialize();

      const campaign = await builder.createCampaign({
        name: 'Tracked Campaign',
        analytics: {
          trackOpens: true,
          trackClicks: true,
          trackUnsubscribes: true,
          utmParameters: {
            source: 'email',
            medium: 'campaign',
            campaign: 'product-launch'
          }
        }
      });

      expect(campaign.analytics.trackOpens).toBe(true);
      expect(campaign.analytics.utmParameters.source).toBe('email');
    });
  });

  describe('Compliance and Deliverability', () => {
    it('should include unsubscribe link', async () => {
      await builder.initialize();

      const campaign = await builder.createCampaign({
        name: 'Compliant Campaign',
        content: '<p>Email content</p><p><a href="{{unsubscribe_url}}">Unsubscribe</a></p>',
        compliance: {
          includeUnsubscribeLink: true,
          physicalAddress: '123 Lagos Street, Lagos, Nigeria'
        }
      });

      expect(campaign.content).toContain('{{unsubscribe_url}}');
      expect(campaign.compliance.physicalAddress).toBeDefined();
    });

    it('should support GDPR compliance', async () => {
      await builder.initialize();

      const campaign = await builder.createCampaign({
        name: 'GDPR Compliant Campaign',
        compliance: {
          gdpr: {
            consentRequired: true,
            dataProcessingAgreement: true,
            rightToBeForgotten: true
          }
        }
      });

      expect(campaign.compliance.gdpr.consentRequired).toBe(true);
    });
  });

  describe('Multi-Language Campaigns', () => {
    it('should support multi-language email campaigns', async () => {
      await builder.initialize();

      const campaign = await builder.createCampaign({
        name: 'Multi-Language Newsletter',
        localization: {
          defaultLanguage: 'en',
          translations: {
            en: {
              subject: 'Monthly Newsletter',
              content: '<h1>Hello!</h1>'
            },
            yo: {
              subject: 'Iroyin Oṣooṣu',
              content: '<h1>Pẹlẹ o!</h1>'
            },
            ha: {
              subject: 'Labarin Wata',
              content: '<h1>Sannu!</h1>'
            }
          }
        }
      });

      expect(campaign.localization.translations.yo.subject).toBe('Iroyin Oṣooṣu');
      expect(campaign.localization.translations.ha.subject).toBe('Labarin Wata');
    });
  });
});
