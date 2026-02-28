/**
 * ExtensionSandbox - Secure execution environment for AI extensions
 */

import { AIExtension } from '../AIExtension';
import { ExtensionSandboxError } from '../errors/AIExtensionError';

export interface SandboxConfig {
  maxMemory?: number;
  maxExecutionTime?: number;
  allowedAPIs?: string[];
}

export interface SandboxContext {
  extensionId: string;
  createdAt: Date;
  lastAccessedAt: Date;
  resourceUsage: {
    memoryUsed: number;
    executionTime: number;
  };
}

export class ExtensionSandbox {
  private contexts: Map<string, SandboxContext>;
  private config: SandboxConfig;

  constructor(config: SandboxConfig = {}) {
    this.contexts = new Map();
    this.config = {
      maxMemory: config.maxMemory || 256 * 1024 * 1024, // 256MB
      maxExecutionTime: config.maxExecutionTime || 30000, // 30 seconds
      allowedAPIs: config.allowedAPIs || [],
    };
  }

  /**
   * Create a sandbox context for an extension
   */
  createContext(extension: AIExtension): SandboxContext {
    const extensionId = extension.getId();

    const context: SandboxContext = {
      extensionId,
      createdAt: new Date(),
      lastAccessedAt: new Date(),
      resourceUsage: {
        memoryUsed: 0,
        executionTime: 0,
      },
    };

    this.contexts.set(extensionId, context);
    return context;
  }

  /**
   * Get sandbox context for an extension
   */
  getContext(extensionId: string): SandboxContext {
    const context = this.contexts.get(extensionId);
    if (!context) {
      throw new ExtensionSandboxError(`Sandbox context not found for extension '${extensionId}'`);
    }

    // Update last accessed time
    context.lastAccessedAt = new Date();
    return context;
  }

  /**
   * Execute a function within the sandbox
   */
  async execute<T>(
    extensionId: string,
    fn: () => Promise<T>,
    timeout: number = this.config.maxExecutionTime!
  ): Promise<T> {
    const context = this.getContext(extensionId);
    const startTime = Date.now();

    try {
      // Create a promise that rejects after timeout
      const timeoutPromise = new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Execution timeout')), timeout)
      );

      // Race between function execution and timeout
      const result = await Promise.race([fn(), timeoutPromise]);

      // Update resource usage
      context.resourceUsage.executionTime += Date.now() - startTime;

      return result;
    } catch (error) {
      throw new ExtensionSandboxError(`Execution error: ${(error as Error).message}`);
    }
  }

  /**
   * Destroy sandbox context
   */
  destroyContext(extensionId: string): void {
    this.contexts.delete(extensionId);
  }

  /**
   * Get all contexts
   */
  getAllContexts(): SandboxContext[] {
    return Array.from(this.contexts.values());
  }

  /**
   * Get context count
   */
  getContextCount(): number {
    return this.contexts.size;
  }

  /**
   * Clear all contexts
   */
  clearAll(): void {
    this.contexts.clear();
  }

  /**
   * Get sandbox configuration
   */
  getConfig(): SandboxConfig {
    return { ...this.config };
  }
}
