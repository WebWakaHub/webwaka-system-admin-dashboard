/**
 * Audit System Initializer
 * Handles initialization and setup of the Audit System module
 */

import { AuditSystem } from '../AuditSystem';
import { AuditSystemFactory } from '../factory/AuditSystemFactory';
import { AuditSystemConfig, AuditSystemConfigOptions } from '../config/AuditSystemConfig';
import { PermissionChecker } from '../api/AuditQueryAPI';

/**
 * Initialization options
 */
export interface InitializationOptions {
  /**
   * Permission checker implementation
   */
  permissionChecker?: PermissionChecker;

  /**
   * Audit System configuration
   */
  config?: Partial<AuditSystemConfigOptions>;

  /**
   * Auto-start the consumer
   */
  autoStart?: boolean;
}

/**
 * Initialization result
 */
export interface InitializationResult {
  /**
   * Whether initialization was successful
   */
  success: boolean;

  /**
   * Audit System instance
   */
  auditSystem?: AuditSystem;

  /**
   * Error message if initialization failed
   */
  error?: string;

  /**
   * Initialization messages
   */
  messages: string[];
}

/**
 * AuditSystemInitializer class
 * Handles initialization of the Audit System module
 */
export class AuditSystemInitializer {
  /**
   * Initialize the Audit System
   */
  public static async initialize(options?: InitializationOptions): Promise<InitializationResult> {
    const messages: string[] = [];

    try {
      messages.push('Initializing Audit System...');

      // Create configuration
      const config = new AuditSystemConfig(options?.config as Partial<AuditSystemConfigOptions>);
      const validation = config.validate();

      if (!validation.valid) {
        return {
          success: false,
          error: `Configuration validation failed: ${validation.errors.join(', ')}`,
          messages,
        };
      }

      messages.push('Configuration validated');

      // Set configuration
      AuditSystemFactory.setConfig(config);

      // Create Audit System instance
      const auditSystem = AuditSystemFactory.createInstance(options?.permissionChecker);
      messages.push('Audit System instance created');

      // Auto-start consumer if requested
      if (options?.autoStart !== false) {
        await auditSystem.start();
        messages.push('Audit System consumer started');
      }

      messages.push('Audit System initialization complete');

      return {
        success: true,
        auditSystem,
        messages,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        messages,
      };
    }
  }

  /**
   * Get the Audit System instance
   */
  public static getInstance(): AuditSystem {
    return AuditSystemFactory.getInstance();
  }

  /**
   * Shutdown the Audit System
   */
  public static async shutdown(): Promise<void> {
    const auditSystem = AuditSystemFactory.getInstance();
    await auditSystem.stop();
  }
}
