/**
 * Dependency Resolver Unit Tests
 */

import { DependencyResolver } from '../../src/plugin-system/utils/dependency-resolver';
import { CircularDependencyError } from '../../src/plugin-system/errors';
import { Plugin } from '../../src/plugin-system/types';

describe('DependencyResolver', () => {
  let resolver: DependencyResolver;

  beforeEach(() => {
    resolver = new DependencyResolver();
  });

  describe('resolveDependencies', () => {
    it('should resolve plugin with no dependencies', async () => {
      const plugin: Plugin = {
        id: 'plugin-1',
        name: 'Plugin 1',
        version: '1.0.0',
        repositoryUrl: 'https://example.com/plugin1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await resolver.resolveDependencies(plugin, new Map());

      expect(result.resolved).toBe(true);
      expect(result.dependencies).toEqual([]);
      expect(result.errors).toBeUndefined();
    });

    it('should resolve plugin with single dependency', async () => {
      const dep: Plugin = {
        id: 'plugin-dep',
        name: 'Dependency Plugin',
        version: '1.0.0',
        repositoryUrl: 'https://example.com/dep',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const plugin: Plugin = {
        id: 'plugin-1',
        name: 'Plugin 1',
        version: '1.0.0',
        repositoryUrl: 'https://example.com/plugin1',
        dependencies: [{ pluginId: 'plugin-dep', versionRange: '^1.0.0' }],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const pluginMap = new Map([
        ['plugin-1', plugin],
        ['plugin-dep', dep],
      ]);

      const result = await resolver.resolveDependencies(plugin, pluginMap);

      expect(result.resolved).toBe(true);
      expect(result.dependencies).toHaveLength(1);
      expect(result.dependencies[0].pluginId).toBe('plugin-dep');
    });

    it('should resolve nested dependencies', async () => {
      const depLevel2: Plugin = {
        id: 'plugin-dep2',
        name: 'Dependency Level 2',
        version: '1.0.0',
        repositoryUrl: 'https://example.com/dep2',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const depLevel1: Plugin = {
        id: 'plugin-dep1',
        name: 'Dependency Level 1',
        version: '1.0.0',
        repositoryUrl: 'https://example.com/dep1',
        dependencies: [{ pluginId: 'plugin-dep2', versionRange: '^1.0.0' }],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const plugin: Plugin = {
        id: 'plugin-1',
        name: 'Plugin 1',
        version: '1.0.0',
        repositoryUrl: 'https://example.com/plugin1',
        dependencies: [{ pluginId: 'plugin-dep1', versionRange: '^1.0.0' }],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const pluginMap = new Map([
        ['plugin-1', plugin],
        ['plugin-dep1', depLevel1],
        ['plugin-dep2', depLevel2],
      ]);

      const result = await resolver.resolveDependencies(plugin, pluginMap);

      expect(result.resolved).toBe(true);
      expect(result.dependencies.length).toBeGreaterThanOrEqual(2);
    });

    it('should detect circular dependencies', async () => {
      const plugin1: Plugin = {
        id: 'plugin-1',
        name: 'Plugin 1',
        version: '1.0.0',
        repositoryUrl: 'https://example.com/plugin1',
        dependencies: [{ pluginId: 'plugin-2', versionRange: '^1.0.0' }],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const plugin2: Plugin = {
        id: 'plugin-2',
        name: 'Plugin 2',
        version: '1.0.0',
        repositoryUrl: 'https://example.com/plugin2',
        dependencies: [{ pluginId: 'plugin-1', versionRange: '^1.0.0' }],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const pluginMap = new Map([
        ['plugin-1', plugin1],
        ['plugin-2', plugin2],
      ]);

      const result = await resolver.resolveDependencies(plugin1, pluginMap);

      expect(result.resolved).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors![0]).toContain('Circular dependency');
    });

    it('should handle missing required dependencies', async () => {
      const plugin: Plugin = {
        id: 'plugin-1',
        name: 'Plugin 1',
        version: '1.0.0',
        repositoryUrl: 'https://example.com/plugin1',
        dependencies: [{ pluginId: 'missing-plugin', versionRange: '^1.0.0' }],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await resolver.resolveDependencies(plugin, new Map());

      expect(result.resolved).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors![0]).toContain('not found');
    });

    it('should handle optional dependencies', async () => {
      const plugin: Plugin = {
        id: 'plugin-1',
        name: 'Plugin 1',
        version: '1.0.0',
        repositoryUrl: 'https://example.com/plugin1',
        dependencies: [
          { pluginId: 'optional-plugin', versionRange: '^1.0.0', optional: true },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await resolver.resolveDependencies(plugin, new Map());

      expect(result.resolved).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should validate version ranges', async () => {
      const dep: Plugin = {
        id: 'plugin-dep',
        name: 'Dependency Plugin',
        version: '2.0.0',
        repositoryUrl: 'https://example.com/dep',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const plugin: Plugin = {
        id: 'plugin-1',
        name: 'Plugin 1',
        version: '1.0.0',
        repositoryUrl: 'https://example.com/plugin1',
        dependencies: [{ pluginId: 'plugin-dep', versionRange: '^1.0.0' }],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const pluginMap = new Map([
        ['plugin-1', plugin],
        ['plugin-dep', dep],
      ]);

      const result = await resolver.resolveDependencies(plugin, pluginMap);

      expect(result.resolved).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('canUninstall', () => {
    it('should allow uninstall if no plugins depend on it', async () => {
      const plugin1: Plugin = {
        id: 'plugin-1',
        name: 'Plugin 1',
        version: '1.0.0',
        repositoryUrl: 'https://example.com/plugin1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const plugin2: Plugin = {
        id: 'plugin-2',
        name: 'Plugin 2',
        version: '1.0.0',
        repositoryUrl: 'https://example.com/plugin2',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await resolver.canUninstall('plugin-1', [plugin1, plugin2], [
        'plugin-1',
        'plugin-2',
      ]);

      expect(result.canUninstall).toBe(true);
      expect(result.dependents).toBeUndefined();
    });

    it('should prevent uninstall if other plugins depend on it', async () => {
      const plugin1: Plugin = {
        id: 'plugin-1',
        name: 'Plugin 1',
        version: '1.0.0',
        repositoryUrl: 'https://example.com/plugin1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const plugin2: Plugin = {
        id: 'plugin-2',
        name: 'Plugin 2',
        version: '1.0.0',
        repositoryUrl: 'https://example.com/plugin2',
        dependencies: [{ pluginId: 'plugin-1', versionRange: '^1.0.0' }],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await resolver.canUninstall('plugin-1', [plugin1, plugin2], [
        'plugin-1',
        'plugin-2',
      ]);

      expect(result.canUninstall).toBe(false);
      expect(result.dependents).toContain('plugin-2');
    });

    it('should ignore optional dependencies', async () => {
      const plugin1: Plugin = {
        id: 'plugin-1',
        name: 'Plugin 1',
        version: '1.0.0',
        repositoryUrl: 'https://example.com/plugin1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const plugin2: Plugin = {
        id: 'plugin-2',
        name: 'Plugin 2',
        version: '1.0.0',
        repositoryUrl: 'https://example.com/plugin2',
        dependencies: [
          { pluginId: 'plugin-1', versionRange: '^1.0.0', optional: true },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await resolver.canUninstall('plugin-1', [plugin1, plugin2], [
        'plugin-1',
        'plugin-2',
      ]);

      expect(result.canUninstall).toBe(true);
    });
  });

  describe('validateConfiguration', () => {
    it('should validate configuration against schema', () => {
      const config = { apiKey: 'test-key', enabled: true };
      const schema = { apiKey: {}, enabled: {} };

      const result = resolver.validateConfiguration(config, schema);

      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should detect unknown configuration keys', () => {
      const config = { apiKey: 'test-key', unknown: 'value' };
      const schema = { apiKey: {} };

      const result = resolver.validateConfiguration(config, schema);

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors![0]).toContain('Unknown');
    });

    it('should pass validation without schema', () => {
      const config = { apiKey: 'test-key' };

      const result = resolver.validateConfiguration(config);

      expect(result.valid).toBe(true);
    });
  });
});
