/**
 * WebWaka Platform Core - Main Platform Class
 * 
 * This class orchestrates the initialization and lifecycle of all platform services.
 * 
 * @module core/platform
 * @author webwakaagent4 (Engineering & Delivery)
 */

import { logger } from '../shared/logger';
import { checkDatabaseHealth } from '../shared/database';
import { eventBusService } from './events/event-bus.service';
import { createApp } from './gateway/app';
import { Server } from 'http';

export interface PlatformConfig {
  environment: string;
  port: number;
  host: string;
}

/**
 * Main platform class that orchestrates all core services
 */
export class PlatformCore {
  private config: PlatformConfig;
  private initialized: boolean = false;
  private running: boolean = false;
  private server: Server | null = null;

  constructor(config: PlatformConfig) {
    this.config = config;
  }

  /**
   * Initialize all platform services
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      logger.warn('Platform already initialized');
      return;
    }

    logger.info('Initializing WebWaka Platform Core...', {
      environment: this.config.environment,
      port: this.config.port,
      host: this.config.host,
    });

    // Initialize core services in order:
    // 1. Check database connection
    const dbHealthy = await checkDatabaseHealth();
    if (!dbHealthy) {
      throw new Error('Database health check failed');
    }
    logger.info('Database connection established');

    // 2. Initialize Event Bus
    await eventBusService.initialize();
    logger.info('Event bus initialized');

    // 3. Identity Service (initialized via services)
    // 4. Permission Engine (TODO)
    // 5. Transaction Manager (TODO)
    // 6. Sync Engine (initialized via services)
    // 7. Configuration Service (TODO)
    // 8. Audit Service (TODO)
    // 9. Notification Service (TODO)
    // 10. API Gateway (will be started in start())

    this.initialized = true;
    logger.info('Platform initialization complete');
  }

  /**
   * Start the platform and all services
   */
  async start(): Promise<void> {
    if (!this.initialized) {
      throw new Error('Platform must be initialized before starting');
    }

    if (this.running) {
      logger.warn('Platform already running');
      return;
    }

    logger.info('Starting platform services...');

    // Start API Gateway
    const app = createApp();
    this.server = app.listen(this.config.port, this.config.host, () => {
      logger.info('API Gateway started', {
        host: this.config.host,
        port: this.config.port,
      });
    });

    this.running = true;
    logger.info(`Platform services started on ${this.config.host}:${this.config.port}`);
  }

  /**
   * Stop the platform and all services gracefully
   */
  async stop(): Promise<void> {
    if (!this.running) {
      logger.warn('Platform not running');
      return;
    }

    logger.info('Stopping platform services...');

    // Stop all services in reverse order
    // - Stop API Gateway
    if (this.server) {
      await new Promise<void>((resolve) => {
        this.server!.close(() => {
          logger.info('API Gateway stopped');
          resolve();
        });
      });
    }

    // - Stop Event Bus
    await eventBusService.disconnect();
    logger.info('Event bus disconnected');

    this.running = false;
    this.initialized = false;
    logger.info('Platform services stopped');
  }

  /**
   * Check if platform is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Check if platform is running
   */
  isRunning(): boolean {
    return this.running;
  }
}
