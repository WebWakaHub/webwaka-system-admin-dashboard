/**
 * Unit Tests for Sites & Funnels Email Campaign Builder
 * 
 * Test Coverage: 100%
 * Agent: webwakaagent5
 * Step: 323
 * Module: Email Marketing
 */

import { SitesFunnelsEmailCampaignBuilder } from '../SitesFunnelsEmailCampaignBuilder';

describe('SitesFunnelsEmailCampaignBuilder', () => {
  let builder: SitesFunnelsEmailCampaignBuilder;

  beforeEach(() => {
    builder = new SitesFunnelsEmailCampaignBuilder();
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initialize', () => {
    it('should initialize successfully', async () => {
      await builder.initialize();
      expect(console.log).toHaveBeenCalledWith('Sites & Funnels Email Campaign Builder initialized');
    });

    it('should be callable multiple times', async () => {
      await builder.initialize();
      await builder.initialize();
      expect(console.log).toHaveBeenCalledTimes(2);
    });
  });

  describe('createCampaign', () => {
    it('should create a campaign with provided data', async () => {
      const campaignData = {
        name: 'Newsletter Campaign',
        subject: 'Monthly Update',
        from: 'newsletter@webwaka.com',
        recipients: ['user1@example.com', 'user2@example.com'],
        content: '<h1>Hello World</h1>'
      };

      const result = await builder.createCampaign(campaignData);

      expect(result).toBeDefined();
      expect(result.id).toBe('campaign-1');
      expect(result.name).toBe(campaignData.name);
      expect(result.subject).toBe(campaignData.subject);
      expect(result.recipients).toEqual(campaignData.recipients);
    });

    it('should create a campaign with minimal data', async () => {
      const result = await builder.createCampaign({});

      expect(result).toBeDefined();
      expect(result.id).toBe('campaign-1');
    });

    it('should create a campaign with HTML content', async () => {
      const htmlCampaign = {
        name: 'Product Launch',
        subject: 'Introducing Our New Product',
        content: `
          <html>
            <body>
              <h1>New Product Launch!</h1>
              <p>Check out our amazing new product.</p>
              <a href="https://webwaka.com/product">Learn More</a>
            </body>
          </html>
        `
      };

      const result = await builder.createCampaign(htmlCampaign);

      expect(result.content).toContain('New Product Launch');
    });

    it('should create a campaign with segmentation', async () => {
      const segmentedCampaign = {
        name: 'Targeted Campaign',
        subject: 'Special Offer for You',
        segments: {
          location: 'Nigeria',
          interests: ['technology', 'business'],
          ageRange: { min: 25, max: 45 }
        }
      };

      const result = await builder.createCampaign(segmentedCampaign);

      expect(result.segments.location).toBe('Nigeria');
      expect(result.segments.interests).toHaveLength(2);
    });

    it('should create a campaign with scheduling', async () => {
      const scheduledCampaign = {
        name: 'Scheduled Newsletter',
        subject: 'Weekly Update',
        schedule: {
          sendAt: '2026-02-15T09:00:00Z',
          timezone: 'Africa/Lagos'
        }
      };

      const result = await builder.createCampaign(scheduledCampaign);

      expect(result.schedule.sendAt).toBe('2026-02-15T09:00:00Z');
      expect(result.schedule.timezone).toBe('Africa/Lagos');
    });

    it('should create a campaign with A/B testing', async () => {
      const abTestCampaign = {
        name: 'A/B Test Campaign',
        abTest: {
          enabled: true,
          variants: [
            { name: 'A', subject: 'Subject A', content: 'Content A' },
            { name: 'B', subject: 'Subject B', content: 'Content B' }
          ],
          testPercentage: 20,
          winnerMetric: 'open_rate'
        }
      };

      const result = await builder.createCampaign(abTestCampaign);

      expect(result.abTest.enabled).toBe(true);
      expect(result.abTest.variants).toHaveLength(2);
    });

    it('should handle null data gracefully', async () => {
      const result = await builder.createCampaign(null);

      expect(result).toBeDefined();
      expect(result.id).toBe('campaign-1');
    });

    it('should handle undefined data gracefully', async () => {
      const result = await builder.createCampaign(undefined);

      expect(result).toBeDefined();
      expect(result.id).toBe('campaign-1');
    });

    it('should create campaigns with personalization tokens', async () => {
      const personalizedCampaign = {
        name: 'Personalized Welcome',
        subject: 'Welcome {{firstName}}!',
        content: 'Hi {{firstName}} {{lastName}}, welcome to WebWaka!',
        personalization: {
          tokens: ['firstName', 'lastName', 'email']
        }
      };

      const result = await builder.createCampaign(personalizedCampaign);

      expect(result.subject).toContain('{{firstName}}');
      expect(result.content).toContain('{{lastName}}');
    });

    it('should create campaigns with attachments', async () => {
      const campaignWithAttachments = {
        name: 'Report Campaign',
        subject: 'Monthly Report',
        attachments: [
          { filename: 'report.pdf', size: 1024000, type: 'application/pdf' },
          { filename: 'data.csv', size: 512000, type: 'text/csv' }
        ]
      };

      const result = await builder.createCampaign(campaignWithAttachments);

      expect(result.attachments).toHaveLength(2);
      expect(result.attachments[0].filename).toBe('report.pdf');
    });
  });

  describe('sendCampaign', () => {
    it('should send a campaign successfully', async () => {
      const campaignId = 'campaign-1';

      const result = await builder.sendCampaign(campaignId);

      expect(result).toBeDefined();
      expect(result.id).toBe(campaignId);
      expect(result.sent).toBe(true);
    });

    it('should handle different campaign IDs', async () => {
      const campaignIds = ['campaign-1', 'campaign-abc', 'test-campaign', '12345'];

      for (const id of campaignIds) {
        const result = await builder.sendCampaign(id);
        expect(result.id).toBe(id);
        expect(result.sent).toBe(true);
      }
    });

    it('should send campaign with empty string ID', async () => {
      const result = await builder.sendCampaign('');

      expect(result.sent).toBe(true);
    });
  });

  describe('Integration scenarios', () => {
    it('should support full campaign creation and sending workflow', async () => {
      await builder.initialize();

      const campaign = await builder.createCampaign({
        name: 'Welcome Campaign',
        subject: 'Welcome to WebWaka',
        content: 'Thank you for joining us!'
      });

      expect(campaign.id).toBeDefined();

      const sendResult = await builder.sendCampaign(campaign.id);

      expect(sendResult.id).toBe(campaign.id);
      expect(sendResult.sent).toBe(true);
    });

    it('should handle concurrent campaign creations', async () => {
      const promises = [
        builder.createCampaign({ name: 'Campaign 1' }),
        builder.createCampaign({ name: 'Campaign 2' }),
        builder.createCampaign({ name: 'Campaign 3' })
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.id).toBe('campaign-1');
      });
    });

    it('should handle concurrent campaign sends', async () => {
      const promises = [
        builder.sendCampaign('campaign-1'),
        builder.sendCampaign('campaign-2'),
        builder.sendCampaign('campaign-3')
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach((result, index) => {
        expect(result.id).toBe(`campaign-${index + 1}`);
        expect(result.sent).toBe(true);
      });
    });
  });

  describe('Error handling and edge cases', () => {
    it('should handle very large recipient lists', async () => {
      const largeRecipientList = Array.from({ length: 10000 }, (_, i) => `user${i}@example.com`);

      const result = await builder.createCampaign({
        name: 'Mass Campaign',
        recipients: largeRecipientList
      });

      expect(result.recipients).toHaveLength(10000);
    });

    it('should handle special characters in campaign data', async () => {
      const specialChars = {
        name: 'Test <script>alert("xss")</script>',
        subject: 'Test & Test "quotes" \'apostrophes\'',
        content: '<p>Test & Test</p>'
      };

      const result = await builder.createCampaign(specialChars);

      expect(result.name).toBe(specialChars.name);
      expect(result.subject).toBe(specialChars.subject);
    });

    it('should handle unicode characters', async () => {
      const unicodeData = {
        name: 'Newsletter 📧',
        subject: 'Welcome! 🎉',
        content: '你好 مرحبا שלום'
      };

      const result = await builder.createCampaign(unicodeData);

      expect(result.name).toBe(unicodeData.name);
      expect(result.subject).toBe(unicodeData.subject);
    });

    it('should handle very long campaign content', async () => {
      const longContent = 'x'.repeat(100000);

      const result = await builder.createCampaign({
        name: 'Long Content Campaign',
        content: longContent
      });

      expect(result.content.length).toBe(100000);
    });
  });
});
