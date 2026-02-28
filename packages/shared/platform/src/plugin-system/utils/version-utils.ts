/**
 * Version Utilities
 * Handles semantic versioning for plugins
 */

/**
 * Parse a semantic version string
 */
export function parseVersion(version: string): { major: number; minor: number; patch: number } {
  const parts = version.split('.');
  return {
    major: parseInt(parts[0], 10) || 0,
    minor: parseInt(parts[1], 10) || 0,
    patch: parseInt(parts[2], 10) || 0,
  };
}

/**
 * Compare two semantic versions
 * Returns: -1 if v1 < v2, 0 if v1 == v2, 1 if v1 > v2
 */
export function compareVersions(v1: string, v2: string): number {
  const ver1 = parseVersion(v1);
  const ver2 = parseVersion(v2);

  if (ver1.major !== ver2.major) {
    return ver1.major < ver2.major ? -1 : 1;
  }
  if (ver1.minor !== ver2.minor) {
    return ver1.minor < ver2.minor ? -1 : 1;
  }
  if (ver1.patch !== ver2.patch) {
    return ver1.patch < ver2.patch ? -1 : 1;
  }

  return 0;
}

/**
 * Check if a version satisfies a version range
 * Supports: ^1.2.3 (caret), ~1.2.3 (tilde), >=1.2.3, <=1.2.3, 1.2.3 (exact)
 */
export function satisfiesVersion(version: string, range: string): boolean {
  if (range === '*' || range === '') {
    return true;
  }

  // Exact version
  if (!range.match(/^[~^><=]/)) {
    return compareVersions(version, range) === 0;
  }

  // Caret: allows changes that do not modify the left-most non-zero digit
  if (range.startsWith('^')) {
    const baseVersion = range.substring(1);
    const base = parseVersion(baseVersion);
    const ver = parseVersion(version);

    if (base.major !== 0) {
      return ver.major === base.major && compareVersions(version, baseVersion) >= 0;
    } else if (base.minor !== 0) {
      return (
        ver.major === 0 &&
        ver.minor === base.minor &&
        compareVersions(version, baseVersion) >= 0
      );
    } else {
      return compareVersions(version, baseVersion) === 0;
    }
  }

  // Tilde: allows patch-level changes
  if (range.startsWith('~')) {
    const baseVersion = range.substring(1);
    const base = parseVersion(baseVersion);
    const ver = parseVersion(version);

    return (
      ver.major === base.major &&
      ver.minor === base.minor &&
      compareVersions(version, baseVersion) >= 0
    );
  }

  // Greater than or equal
  if (range.startsWith('>=')) {
    const baseVersion = range.substring(2);
    return compareVersions(version, baseVersion) >= 0;
  }

  // Less than or equal
  if (range.startsWith('<=')) {
    const baseVersion = range.substring(2);
    return compareVersions(version, baseVersion) <= 0;
  }

  // Greater than
  if (range.startsWith('>')) {
    const baseVersion = range.substring(1);
    return compareVersions(version, baseVersion) > 0;
  }

  // Less than
  if (range.startsWith('<')) {
    const baseVersion = range.substring(1);
    return compareVersions(version, baseVersion) < 0;
  }

  return false;
}

/**
 * Get the latest version from a list of versions
 */
export function getLatestVersion(versions: string[]): string {
  if (versions.length === 0) {
    throw new Error('No versions provided');
  }

  return versions.reduce((latest, current) => {
    return compareVersions(current, latest) > 0 ? current : latest;
  });
}

/**
 * Get versions that satisfy a range
 */
export function getVersionsSatisfyingRange(versions: string[], range: string): string[] {
  return versions.filter((v) => satisfiesVersion(v, range));
}
