import { Module } from '../types';

/**
 * Module Versioning Manager
 * Manages module versions and compatibility
 */
export interface IModuleVersionManager {
  /**
   * Check if module version is compatible
   */
  isCompatible(moduleVersion: string, requiredVersion: string): boolean;

  /**
   * Get latest compatible version
   */
  getLatestCompatibleVersion(moduleVersions: string[], requiredVersion: string): string | undefined;

  /**
   * Parse semantic version
   */
  parseVersion(version: string): { major: number; minor: number; patch: number };

  /**
   * Compare versions
   */
  compareVersions(version1: string, version2: string): number;
}

export class DefaultModuleVersionManager implements IModuleVersionManager {
  isCompatible(moduleVersion: string, requiredVersion: string): boolean {
    const parsed = this.parseVersion(moduleVersion);
    const required = this.parseVersion(requiredVersion);

    // Simple compatibility check: major version must match, minor and patch can be >= required
    if (parsed.major !== required.major) {
      return false;
    }

    if (parsed.minor < required.minor) {
      return false;
    }

    if (parsed.minor === required.minor && parsed.patch < required.patch) {
      return false;
    }

    return true;
  }

  getLatestCompatibleVersion(moduleVersions: string[], requiredVersion: string): string | undefined {
    const compatible = moduleVersions.filter(v => this.isCompatible(v, requiredVersion));
    if (compatible.length === 0) return undefined;

    return compatible.sort((a, b) => this.compareVersions(b, a))[0];
  }

  parseVersion(version: string): { major: number; minor: number; patch: number } {
    const parts = version.split('.');
    return {
      major: parseInt(parts[0]) || 0,
      minor: parseInt(parts[1]) || 0,
      patch: parseInt(parts[2]) || 0,
    };
  }

  compareVersions(version1: string, version2: string): number {
    const v1 = this.parseVersion(version1);
    const v2 = this.parseVersion(version2);

    if (v1.major !== v2.major) return v1.major - v2.major;
    if (v1.minor !== v2.minor) return v1.minor - v2.minor;
    return v1.patch - v2.patch;
  }
}
