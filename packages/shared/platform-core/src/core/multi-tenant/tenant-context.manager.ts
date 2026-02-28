/**
 * Tenant Context Manager
 * 
 * Manages tenant context using AsyncLocalStorage for automatic propagation
 * across async boundaries. Ensures tenant context is available throughout
 * the request lifecycle without manual passing.
 * 
 * @module Multi-Tenant Data Scoping
 * @author webwakaagent4
 * @date 2026-02-09
 */

import { AsyncLocalStorage } from 'async_hooks';

/**
 * Tenant context interface
 */
export interface TenantContext {
  tenantId: string;
  userId?: string;
  requestId?: string;
  timestamp: Date;
}

/**
 * Custom error for missing tenant context
 */
export class TenantContextMissingError extends Error {
  constructor(message: string = 'Tenant context is missing') {
    super(message);
    this.name = 'TenantContextMissingError';
  }
}

/**
 * Custom error for invalid tenant context
 */
export class TenantContextInvalidError extends Error {
  constructor(message: string = 'Tenant context is invalid') {
    super(message);
    this.name = 'TenantContextInvalidError';
  }
}

/**
 * Tenant Context Manager
 * 
 * Provides methods to set, get, and clear tenant context using AsyncLocalStorage.
 * Ensures tenant context is propagated across async operations automatically.
 */
export class TenantContextManager {
  private static instance: TenantContextManager;
  private asyncLocalStorage: AsyncLocalStorage<TenantContext>;

  private constructor() {
    this.asyncLocalStorage = new AsyncLocalStorage<TenantContext>();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): TenantContextManager {
    if (!TenantContextManager.instance) {
      TenantContextManager.instance = new TenantContextManager();
    }
    return TenantContextManager.instance;
  }

  /**
   * Set tenant context for the current async context
   * 
   * @param tenantId - Tenant ID (UUID)
   * @param userId - Optional user ID
   * @param requestId - Optional request ID for tracing
   * @throws TenantContextInvalidError if tenant ID is invalid
   */
  public setTenantContext(
    tenantId: string,
    userId?: string,
    requestId?: string
  ): void {
    this.validateTenantId(tenantId);

    const context: TenantContext = {
      tenantId,
      userId,
      requestId,
      timestamp: new Date(),
    };

    this.asyncLocalStorage.enterWith(context);
  }

  /**
   * Get current tenant context
   * 
   * @param required - If true, throws error when context is missing
   * @returns Tenant context or null if not set
   * @throws TenantContextMissingError if required and context is missing
   */
  public getTenantContext(required: boolean = false): TenantContext | null {
    const context = this.asyncLocalStorage.getStore();

    if (!context && required) {
      throw new TenantContextMissingError(
        'Tenant context is required but not set. Ensure tenant context is set before accessing tenant-scoped resources.'
      );
    }

    return context || null;
  }

  /**
   * Get current tenant ID
   * 
   * @param required - If true, throws error when context is missing
   * @returns Tenant ID or null if not set
   * @throws TenantContextMissingError if required and context is missing
   */
  public getTenantId(required: boolean = false): string | null {
    const context = this.getTenantContext(required);
    return context ? context.tenantId : null;
  }

  /**
   * Clear tenant context for the current async context
   */
  public clearTenantContext(): void {
    this.asyncLocalStorage.disable();
  }

  /**
   * Run a function with a specific tenant context
   * 
   * @param tenantId - Tenant ID to set
   * @param callback - Function to run with tenant context
   * @param userId - Optional user ID
   * @param requestId - Optional request ID
   * @returns Result of callback function
   */
  public async runWithTenantContext<T>(
    tenantId: string,
    callback: () => Promise<T>,
    userId?: string,
    requestId?: string
  ): Promise<T> {
    this.validateTenantId(tenantId);

    const context: TenantContext = {
      tenantId,
      userId,
      requestId,
      timestamp: new Date(),
    };

    return this.asyncLocalStorage.run(context, callback);
  }

  /**
   * Validate tenant ID format (UUID)
   * 
   * @param tenantId - Tenant ID to validate
   * @throws TenantContextInvalidError if tenant ID is invalid
   */
  public validateTenantId(tenantId: string): void {
    if (!tenantId) {
      throw new TenantContextInvalidError('Tenant ID cannot be null or empty');
    }

    if (typeof tenantId !== 'string') {
      throw new TenantContextInvalidError('Tenant ID must be a string');
    }

    // UUID v4 format validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(tenantId)) {
      throw new TenantContextInvalidError(
        `Tenant ID must be a valid UUID v4 format: ${tenantId}`
      );
    }
  }

  /**
   * Check if tenant context is currently set
   * 
   * @returns True if tenant context is set, false otherwise
   */
  public hasTenantContext(): boolean {
    return this.asyncLocalStorage.getStore() !== undefined;
  }

  /**
   * Get tenant context for logging (without sensitive data)
   * 
   * @returns Sanitized tenant context for logging
   */
  public getTenantContextForLogging(): Record<string, any> {
    const context = this.getTenantContext();
    
    if (!context) {
      return { tenantContext: 'not_set' };
    }

    return {
      tenantId: context.tenantId,
      requestId: context.requestId,
      timestamp: context.timestamp.toISOString(),
    };
  }
}

// Export singleton instance
export const tenantContextManager = TenantContextManager.getInstance();
