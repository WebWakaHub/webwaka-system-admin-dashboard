/**
 * ExtensionRegistry - Centralized repository for AI extensions
 */

import { AIExtension } from '../AIExtension';
import { ExtensionNotFoundError, ExtensionAlreadyInstalledError } from '../errors/AIExtensionError';

export interface ExtensionMetadata {
  id: string;
  version: string;
  name: string;
  description: string;
  enabled: boolean;
  installedAt: Date;
}

export class ExtensionRegistry {
  private extensions: Map<string, AIExtension>;
  private metadata: Map<string, ExtensionMetadata>;

  constructor() {
    this.extensions = new Map();
    this.metadata = new Map();
  }

  /**
   * Register an extension
   */
  register(extension: AIExtension): void {
    const extensionId = extension.getId();

    if (this.extensions.has(extensionId)) {
      throw new ExtensionAlreadyInstalledError(extensionId);
    }

    this.extensions.set(extensionId, extension);
    this.metadata.set(extensionId, {
      id: extensionId,
      version: extension.getVersion(),
      name: extension.getName(),
      description: extension.getDescription(),
      enabled: false,
      installedAt: new Date(),
    });
  }

  /**
   * Unregister an extension
   */
  unregister(extensionId: string): void {
    if (!this.extensions.has(extensionId)) {
      throw new ExtensionNotFoundError(extensionId);
    }

    this.extensions.delete(extensionId);
    this.metadata.delete(extensionId);
  }

  /**
   * Get an extension by ID
   */
  get(extensionId: string): AIExtension {
    const extension = this.extensions.get(extensionId);
    if (!extension) {
      throw new ExtensionNotFoundError(extensionId);
    }
    return extension;
  }

  /**
   * Check if an extension is registered
   */
  has(extensionId: string): boolean {
    return this.extensions.has(extensionId);
  }

  /**
   * Get all registered extensions
   */
  getAll(): AIExtension[] {
    return Array.from(this.extensions.values());
  }

  /**
   * Get all enabled extensions
   */
  getEnabled(): AIExtension[] {
    return Array.from(this.extensions.values()).filter((ext) => ext.isExtensionEnabled());
  }

  /**
   * Get extension metadata
   */
  getMetadata(extensionId: string): ExtensionMetadata {
    const metadata = this.metadata.get(extensionId);
    if (!metadata) {
      throw new ExtensionNotFoundError(extensionId);
    }
    return metadata;
  }

  /**
   * Update extension metadata
   */
  updateMetadata(extensionId: string, metadata: Partial<ExtensionMetadata>): void {
    const existing = this.metadata.get(extensionId);
    if (!existing) {
      throw new ExtensionNotFoundError(extensionId);
    }

    this.metadata.set(extensionId, {
      ...existing,
      ...metadata,
    });
  }

  /**
   * Get all extensions count
   */
  count(): number {
    return this.extensions.size;
  }

  /**
   * Clear all extensions
   */
  clear(): void {
    this.extensions.clear();
    this.metadata.clear();
  }
}
