/**
 * WebWaka Platform Core - Logger Utility
 * 
 * Provides structured logging functionality for the platform.
 * 
 * @module shared/logger
 * @author webwakaagent4 (Engineering & Delivery)
 */

import winston from 'winston';

const logLevel = process.env.LOG_LEVEL || 'info';
const logFormat = process.env.LOG_FORMAT || 'json';

/**
 * Create Winston logger instance
 */
export const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    logFormat === 'json'
      ? winston.format.json()
      : winston.format.simple()
  ),
  defaultMeta: {
    service: 'webwaka-platform-core',
    version: '0.1.0-alpha',
  },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
          return `${timestamp} [${level}]: ${message} ${metaStr}`;
        })
      ),
    }),
  ],
});

/**
 * Log info message
 */
export function logInfo(message: string, meta?: Record<string, unknown>): void {
  logger.info(message, meta);
}

/**
 * Log error message
 */
export function logError(message: string, error?: Error | unknown, meta?: Record<string, unknown>): void {
  logger.error(message, { error, ...meta });
}

/**
 * Log warning message
 */
export function logWarning(message: string, meta?: Record<string, unknown>): void {
  logger.warn(message, meta);
}

/**
 * Log debug message
 */
export function logDebug(message: string, meta?: Record<string, unknown>): void {
  logger.debug(message, meta);
}
