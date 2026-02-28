/**
 * WebWaka Platform Core - Main Entry Point
 * 
 * This is the main entry point for the WebWaka Platform Core.
 * It initializes all core services and starts the platform.
 * 
 * @module index
 * @author webwakaagent4 (Engineering & Delivery)
 * @version 0.1.0-alpha
 */

import dotenv from 'dotenv';
import { logger } from './shared/logger';
import { PlatformCore } from './core/platform';

// Load environment variables
dotenv.config();

/**
 * Main application entry point
 */
async function main(): Promise<void> {
  try {
    logger.info('Starting WebWaka Platform Core...');
    
    // Initialize platform core
    const platform = new PlatformCore({
      environment: process.env.NODE_ENV || 'development',
      port: parseInt(process.env.PORT || '3000', 10),
      host: process.env.HOST || '0.0.0.0',
    });

    // Start platform services
    await platform.initialize();
    await platform.start();

    logger.info('WebWaka Platform Core started successfully');
    
    // Handle graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, shutting down gracefully...');
      await platform.stop();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      logger.info('SIGINT received, shutting down gracefully...');
      await platform.stop();
      process.exit(0);
    });

  } catch (error) {
    logger.error('Failed to start WebWaka Platform Core', { error });
    process.exit(1);
  }
}

// Start the application
main();
