/**
 * Unit Tests for Form Builder Index
 * Ensures proper module exports
 */

import * as FormBuilderModule from '../index';
import { SitesFunnelsFormBuilder } from '../SitesFunnelsFormBuilder';

describe('Form Builder Module Exports', () => {
  it('should export SitesFunnelsFormBuilder class', () => {
    expect(FormBuilderModule.SitesFunnelsFormBuilder).toBeDefined();
    expect(FormBuilderModule.SitesFunnelsFormBuilder).toBe(SitesFunnelsFormBuilder);
  });

  it('should be able to instantiate exported class', () => {
    const builder = new FormBuilderModule.SitesFunnelsFormBuilder();
    expect(builder).toBeInstanceOf(SitesFunnelsFormBuilder);
  });
});
