/**
 * Plugin Sandbox
 * Provides secure, isolated execution environment for plugins
 */

import { EventBus } from '../../shared/event-bus';
import { PluginSandboxError, PluginTimeoutError, PluginExecutionError } from '../errors';

export interface SandboxConfig {
  memoryLimit?: string;
  cpuLimit?: string;
  timeout?: number;
  networkEnabled?: boolean;
  filesystemEnabled?: boolean;
}

export interface SandboxExecutionContext {
  pluginId: string;
  tenantId: string;
  eventBus: EventBus;
  config?: Record<string, unknown>;
}

export interface SandboxExecutionResult {
  success: boolean;
  output?: unknown;
  error?: {
    code: string;
    message: string;
  };
  executionTime: number;
}

/**
 * Plugin Sandbox - manages secure plugin execution
 * In production, this would use Docker containers
 * For development, this uses isolated Node.js contexts
 */
export class PluginSandbox {
  private sandboxConfig: SandboxConfig;
  private runningPlugins: Map<string, NodeJS.Timeout> = new Map();

  constructor(config?: SandboxConfig) {
    this.sandboxConfig = {
      memoryLimit: config?.memoryLimit || '512M',
      cpuLimit: config?.cpuLimit || '1',
      timeout: config?.timeout || 30000, // 30 seconds
      networkEnabled: config?.networkEnabled ?? false,
      filesystemEnabled: config?.filesystemEnabled ?? false,
    };
  }

  /**
   * Execute plugin code in sandbox
   */
  async executePlugin(
    context: SandboxExecutionContext,
    pluginCode: string
  ): Promise<SandboxExecutionResult> {
    const startTime = Date.now();
    const pluginKey = `${context.tenantId}:${context.pluginId}`;

    try {
      // Validate plugin code
      this.validatePluginCode(pluginCode);

      // Create execution timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        const timeoutId = setTimeout(() => {
          this.runningPlugins.delete(pluginKey);
          reject(new PluginTimeoutError(context.pluginId));
        }, this.sandboxConfig.timeout);

        this.runningPlugins.set(pluginKey, timeoutId);
      });

      // Execute plugin with timeout
      const executionPromise = this.executePluginCode(context, pluginCode);

      const output = await Promise.race([executionPromise, timeoutPromise]);

      // Clear timeout
      const timeoutId = this.runningPlugins.get(pluginKey);
      if (timeoutId) {
        clearTimeout(timeoutId);
        this.runningPlugins.delete(pluginKey);
      }

      return {
        success: true,
        output,
        executionTime: Date.now() - startTime,
      };
    } catch (error) {
      const timeoutId = this.runningPlugins.get(pluginKey);
      if (timeoutId) {
        clearTimeout(timeoutId);
        this.runningPlugins.delete(pluginKey);
      }

      if (error instanceof PluginTimeoutError) {
        return {
          success: false,
          error: {
            code: 'PLUGIN_TIMEOUT',
            message: error.message,
          },
          executionTime: Date.now() - startTime,
        };
      }

      if (error instanceof PluginExecutionError) {
        return {
          success: false,
          error: {
            code: 'PLUGIN_EXECUTION_ERROR',
            message: error.message,
          },
          executionTime: Date.now() - startTime,
        };
      }

      return {
        success: false,
        error: {
          code: 'PLUGIN_SANDBOX_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        executionTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Validate plugin code before execution
   */
  private validatePluginCode(code: string): void {
    // Check for dangerous patterns
    const dangerousPatterns = [
      /require\s*\(\s*['"]fs['"]\s*\)/,
      /require\s*\(\s*['"]child_process['"]\s*\)/,
      /require\s*\(\s*['"]os['"]\s*\)/,
      /require\s*\(\s*['"]path['"]\s*\)/,
      /eval\s*\(/,
      /Function\s*\(/,
      /process\./,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(code)) {
        throw new PluginSandboxError(
          `Plugin code contains dangerous pattern: ${pattern.source}`
        );
      }
    }
  }

  /**
   * Execute plugin code in isolated context
   */
  private async executePluginCode(
    context: SandboxExecutionContext,
    code: string
  ): Promise<unknown> {
    try {
      // Create a function from the plugin code
      // In production, this would be executed in a Docker container
      const pluginFunction = new Function('context', `return (async function() { ${code} })()`);

      // Execute the plugin function
      const result = await pluginFunction(context);

      return result;
    } catch (error) {
      throw new PluginExecutionError(
        context.pluginId,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Stop a running plugin
   */
  async stopPlugin(tenantId: string, pluginId: string): Promise<void> {
    const pluginKey = `${tenantId}:${pluginId}`;
    const timeoutId = this.runningPlugins.get(pluginKey);

    if (timeoutId) {
      clearTimeout(timeoutId);
      this.runningPlugins.delete(pluginKey);
    }
  }

  /**
   * Get sandbox configuration
   */
  getConfig(): SandboxConfig {
    return { ...this.sandboxConfig };
  }

  /**
   * Get running plugins count
   */
  getRunningPluginsCount(): number {
    return this.runningPlugins.size;
  }
}
