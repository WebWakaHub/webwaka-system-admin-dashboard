/**
 * Unit Tests for Email Campaign Builder Index
 * Ensures proper module exports
 */

import * as EmailCampaignModule from '../index';
import { SitesFunnelsEmailCampaignBuilder } from '../SitesFunnelsEmailCampaignBuilder';

describe('Email Campaign Builder Module Exports', () => {
  it('should export SitesFunnelsEmailCampaignBuilder class', () => {
    expect(EmailCampaignModule.SitesFunnelsEmailCampaignBuilder).toBeDefined();
    expect(EmailCampaignModule.SitesFunnelsEmailCampaignBuilder).toBe(SitesFunnelsEmailCampaignBuilder);
  });

  it('should be able to instantiate exported class', () => {
    const builder = new EmailCampaignModule.SitesFunnelsEmailCampaignBuilder();
    expect(builder).toBeInstanceOf(SitesFunnelsEmailCampaignBuilder);
  });
});
