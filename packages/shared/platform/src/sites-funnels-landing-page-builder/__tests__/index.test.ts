/**
 * Unit Tests for Landing Page Builder Index
 * Ensures proper module exports
 */

import * as LandingPageBuilderModule from '../index';
import { SitesFunnelsLandingPageBuilder } from '../SitesFunnelsLandingPageBuilder';

describe('Landing Page Builder Module Exports', () => {
  it('should export SitesFunnelsLandingPageBuilder class', () => {
    expect(LandingPageBuilderModule.SitesFunnelsLandingPageBuilder).toBeDefined();
    expect(LandingPageBuilderModule.SitesFunnelsLandingPageBuilder).toBe(SitesFunnelsLandingPageBuilder);
  });

  it('should be able to instantiate exported class', () => {
    const builder = new LandingPageBuilderModule.SitesFunnelsLandingPageBuilder();
    expect(builder).toBeInstanceOf(SitesFunnelsLandingPageBuilder);
  });
});
