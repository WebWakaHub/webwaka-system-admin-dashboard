/**
 * Version Utilities Unit Tests
 */

import {
  parseVersion,
  compareVersions,
  satisfiesVersion,
  getLatestVersion,
  getVersionsSatisfyingRange,
} from '../../src/plugin-system/utils/version-utils';

describe('Version Utilities', () => {
  describe('parseVersion', () => {
    it('should parse semantic versions', () => {
      const version = parseVersion('1.2.3');
      expect(version).toEqual({ major: 1, minor: 2, patch: 3 });
    });

    it('should handle missing parts', () => {
      const version = parseVersion('1.2');
      expect(version).toEqual({ major: 1, minor: 2, patch: 0 });
    });

    it('should handle single digit versions', () => {
      const version = parseVersion('1');
      expect(version).toEqual({ major: 1, minor: 0, patch: 0 });
    });
  });

  describe('compareVersions', () => {
    it('should return -1 when v1 < v2', () => {
      expect(compareVersions('1.0.0', '2.0.0')).toBe(-1);
      expect(compareVersions('1.1.0', '1.2.0')).toBe(-1);
      expect(compareVersions('1.0.1', '1.0.2')).toBe(-1);
    });

    it('should return 0 when v1 == v2', () => {
      expect(compareVersions('1.0.0', '1.0.0')).toBe(0);
      expect(compareVersions('2.5.3', '2.5.3')).toBe(0);
    });

    it('should return 1 when v1 > v2', () => {
      expect(compareVersions('2.0.0', '1.0.0')).toBe(1);
      expect(compareVersions('1.2.0', '1.1.0')).toBe(1);
      expect(compareVersions('1.0.2', '1.0.1')).toBe(1);
    });
  });

  describe('satisfiesVersion', () => {
    it('should match exact versions', () => {
      expect(satisfiesVersion('1.2.3', '1.2.3')).toBe(true);
      expect(satisfiesVersion('1.2.3', '1.2.4')).toBe(false);
    });

    it('should match wildcard', () => {
      expect(satisfiesVersion('1.2.3', '*')).toBe(true);
      expect(satisfiesVersion('0.0.0', '*')).toBe(true);
    });

    it('should match caret ranges', () => {
      expect(satisfiesVersion('1.2.3', '^1.0.0')).toBe(true);
      expect(satisfiesVersion('1.5.0', '^1.0.0')).toBe(true);
      expect(satisfiesVersion('2.0.0', '^1.0.0')).toBe(false);
    });

    it('should match tilde ranges', () => {
      expect(satisfiesVersion('1.2.3', '~1.2.0')).toBe(true);
      expect(satisfiesVersion('1.2.5', '~1.2.0')).toBe(true);
      expect(satisfiesVersion('1.3.0', '~1.2.0')).toBe(false);
    });

    it('should match >= operator', () => {
      expect(satisfiesVersion('1.2.3', '>=1.0.0')).toBe(true);
      expect(satisfiesVersion('1.0.0', '>=1.0.0')).toBe(true);
      expect(satisfiesVersion('0.9.0', '>=1.0.0')).toBe(false);
    });

    it('should match <= operator', () => {
      expect(satisfiesVersion('1.0.0', '<=1.2.3')).toBe(true);
      expect(satisfiesVersion('1.2.3', '<=1.2.3')).toBe(true);
      expect(satisfiesVersion('1.3.0', '<=1.2.3')).toBe(false);
    });

    it('should match > operator', () => {
      expect(satisfiesVersion('1.2.4', '>1.2.3')).toBe(true);
      expect(satisfiesVersion('1.2.3', '>1.2.3')).toBe(false);
    });

    it('should match < operator', () => {
      expect(satisfiesVersion('1.2.2', '<1.2.3')).toBe(true);
      expect(satisfiesVersion('1.2.3', '<1.2.3')).toBe(false);
    });
  });

  describe('getLatestVersion', () => {
    it('should return the latest version from a list', () => {
      const versions = ['1.0.0', '2.0.0', '1.5.0', '1.9.9'];
      expect(getLatestVersion(versions)).toBe('2.0.0');
    });

    it('should handle single version', () => {
      expect(getLatestVersion(['1.0.0'])).toBe('1.0.0');
    });

    it('should throw error for empty list', () => {
      expect(() => getLatestVersion([])).toThrow();
    });
  });

  describe('getVersionsSatisfyingRange', () => {
    const versions = ['1.0.0', '1.1.0', '1.2.0', '2.0.0', '2.1.0'];

    it('should filter versions by caret range', () => {
      const result = getVersionsSatisfyingRange(versions, '^1.0.0');
      expect(result).toEqual(['1.0.0', '1.1.0', '1.2.0']);
    });

    it('should filter versions by tilde range', () => {
      const result = getVersionsSatisfyingRange(versions, '~1.1.0');
      expect(result).toEqual(['1.1.0']);
    });

    it('should filter versions by >= operator', () => {
      const result = getVersionsSatisfyingRange(versions, '>=1.1.0');
      expect(result.length).toBeGreaterThanOrEqual(3);
      expect(result).toContain('1.1.0');
    });

    it('should return empty array for no matches', () => {
      const result = getVersionsSatisfyingRange(versions, '^3.0.0');
      expect(result).toEqual([]);
    });
  });
});
