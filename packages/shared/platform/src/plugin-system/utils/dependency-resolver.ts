/**
 * Dependency Resolver
 * Resolves plugin dependencies and detects conflicts
 */

import { Plugin, PluginDependency, DependencyResolutionResult, ResolvedDependency } from '../types';
import { CircularDependencyError, DependencyResolutionError } from '../errors';
import { compareVersions, satisfiesVersion } from './version-utils';

export class DependencyResolver {
  /**
   * Resolve dependencies for a plugin
   */
  async resolveDependencies(
    plugin: Plugin,
    availablePlugins: Map<string, Plugin>,
    installedPlugins?: Map<string, string>
  ): Promise<DependencyResolutionResult> {
    const resolved: ResolvedDependency[] = [];
    const errors: string[] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    try {
      await this.resolveDependenciesRecursive(
        plugin,
        availablePlugins,
        installedPlugins || new Map(),
        resolved,
        visited,
        recursionStack,
        errors
      );

      return {
        resolved: errors.length === 0,
        dependencies: resolved,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      if (error instanceof CircularDependencyError) {
        return {
          resolved: false,
          dependencies: resolved,
          errors: [error.message],
        };
      }
      throw error;
    }
  }

  /**
   * Recursively resolve dependencies
   */
  private async resolveDependenciesRecursive(
    plugin: Plugin,
    availablePlugins: Map<string, Plugin>,
    installedPlugins: Map<string, string>,
    resolved: ResolvedDependency[],
    visited: Set<string>,
    recursionStack: Set<string>,
    errors: string[]
  ): Promise<void> {
    if (recursionStack.has(plugin.id)) {
      const cycle = Array.from(recursionStack).concat(plugin.id);
      throw new CircularDependencyError(cycle);
    }

    if (visited.has(plugin.id)) {
      return;
    }

    recursionStack.add(plugin.id);

    if (plugin.dependencies && plugin.dependencies.length > 0) {
      for (const dep of plugin.dependencies) {
        const depPlugin = availablePlugins.get(dep.pluginId);

        if (!depPlugin) {
          if (!dep.optional) {
            errors.push(
              `Required dependency ${dep.pluginId} not found for plugin ${plugin.id}`
            );
          }
          continue;
        }

        // Check version compatibility
        if (!satisfiesVersion(depPlugin.version, dep.versionRange)) {
          errors.push(
            `Dependency ${dep.pluginId} version ${depPlugin.version} does not satisfy ${dep.versionRange}`
          );
          continue;
        }

        // Check if already installed with compatible version
        const installedVersion = installedPlugins.get(dep.pluginId);
        if (installedVersion && !satisfiesVersion(installedVersion, dep.versionRange)) {
          errors.push(
            `Installed version ${installedVersion} of ${dep.pluginId} does not satisfy ${dep.versionRange}`
          );
          continue;
        }

        // Add to resolved list if not already there
        if (!resolved.find((r) => r.pluginId === dep.pluginId)) {
          resolved.push({
            pluginId: dep.pluginId,
            version: depPlugin.version,
            resolved: true,
          });
        }

        // Recursively resolve dependencies
        await this.resolveDependenciesRecursive(
          depPlugin,
          availablePlugins,
          installedPlugins,
          resolved,
          visited,
          recursionStack,
          errors
        );
      }
    }

    recursionStack.delete(plugin.id);
    visited.add(plugin.id);
  }

  /**
   * Check if a plugin can be uninstalled (no other plugins depend on it)
   */
  async canUninstall(
    pluginId: string,
    allPlugins: Plugin[],
    tenantInstalledPlugins: string[]
  ): Promise<{ canUninstall: boolean; dependents?: string[] }> {
    const dependents: string[] = [];

    for (const plugin of allPlugins) {
      // Only check installed plugins
      if (!tenantInstalledPlugins.includes(plugin.id)) {
        continue;
      }

      // Check if this plugin depends on the target plugin
      if (plugin.dependencies) {
        for (const dep of plugin.dependencies) {
          if (dep.pluginId === pluginId && !dep.optional) {
            dependents.push(plugin.id);
            break;
          }
        }
      }
    }

    return {
      canUninstall: dependents.length === 0,
      dependents: dependents.length > 0 ? dependents : undefined,
    };
  }

  /**
   * Validate plugin configuration against schema
   */
  validateConfiguration(
    config: Record<string, unknown>,
    schema?: Record<string, unknown>
  ): { valid: boolean; errors?: string[] } {
    if (!schema) {
      return { valid: true };
    }

    const errors: string[] = [];

    // Basic validation - in production, use JSON Schema validator
    for (const [key, value] of Object.entries(config)) {
      if (!(key in schema)) {
        errors.push(`Unknown configuration key: ${key}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
}
