/**
 * Audit System Factory
 * Factory for creating and configuring Audit System instances
 */

import { AuditSystem } from '../AuditSystem';
import { AuditDataStore } from '../store/AuditDataStore';
import { AuditQueryAPI, PermissionChecker } from '../api/AuditQueryAPI';
import { AuditRoutes } from '../api/AuditRoutes';
import { AuditSystemConfig } from '../config/AuditSystemConfig';

/**
 * Mock permission checker for development/testing
 */
class MockPermissionChecker implements PermissionChecker {
  async hasPermission(userId: string, permission: string, tenantId: string): Promise<boolean> {
    // In development, allow all permissions
    // In production, this would integrate with the Permission System (WEEG)
    return true;
  }
}

/**
 * AuditSystemFactory class
 * Factory for creating Audit System instances with proper configuration
 */
export class AuditSystemFactory {
  private static instance: AuditSystem | null = null;
  private static config: AuditSystemConfig = new AuditSystemConfig();

  /**
   * Create or get the Audit System instance (singleton pattern)
   */
  public static getInstance(): AuditSystem {
    if (!this.instance) {
      this.instance = this.createInstance();
    }
    return this.instance;
  }

  /**
   * Create a new Audit System instance
   */
  public static createInstance(permissionChecker?: PermissionChecker): AuditSystem {
    const checker = permissionChecker || new MockPermissionChecker();
    return new AuditSystem(checker);
  }

  /**
   * Get the configuration
   */
  public static getConfig(): AuditSystemConfig {
    return this.config;
  }

  /**
   * Set the configuration
   */
  public static setConfig(config: AuditSystemConfig): void {
    this.config = config;
  }

  /**
   * Create a data store instance
   */
  public static createDataStore(): AuditDataStore {
    return new AuditDataStore();
  }

  /**
   * Create a query API instance
   */
  public static createQueryAPI(dataStore: AuditDataStore, permissionChecker?: PermissionChecker): AuditQueryAPI {
    const checker = permissionChecker || new MockPermissionChecker();
    return new AuditQueryAPI(dataStore, checker);
  }

  /**
   * Create API routes instance
   */
  public static createRoutes(queryAPI: AuditQueryAPI): AuditRoutes {
    return new AuditRoutes(queryAPI);
  }

  /**
   * Reset the singleton instance (for testing)
   */
  public static reset(): void {
    this.instance = null;
  }
}
