/**
 * Winston Logger Configuration
 * 
 * Structured logging for Hospitality Booking Engine with correlation IDs,
 * log levels, and multiple transports for production monitoring.
 * 
 * @module hospitality-booking-engine/utils/logger
 * @author webwakaagent4
 */

import winston from 'winston';
import { v4 as uuidv4 } from 'uuid';

// Log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(colors);

// Log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: format,
  }),
  
  // Error log file
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),
  
  // Combined log file
  new winston.transports.File({
    filename: 'logs/combined.log',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),
];

// Create logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  transports,
});

/**
 * Generate correlation ID for request tracking
 */
export function generateCorrelationId(): string {
  return uuidv4();
}

/**
 * Log with correlation ID
 */
export function logWithCorrelation(
  level: string,
  message: string,
  correlationId: string,
  metadata?: any
): void {
  logger.log(level, `[${correlationId}] ${message}`, metadata);
}

/**
 * Log API request
 */
export function logRequest(
  method: string,
  path: string,
  correlationId: string,
  userId?: string,
  tenantId?: string
): void {
  logger.http(`[${correlationId}] ${method} ${path}`, {
    userId,
    tenantId,
    correlationId,
  });
}

/**
 * Log API response
 */
export function logResponse(
  method: string,
  path: string,
  statusCode: number,
  duration: number,
  correlationId: string
): void {
  logger.http(`[${correlationId}] ${method} ${path} ${statusCode} ${duration}ms`, {
    statusCode,
    duration,
    correlationId,
  });
}

/**
 * Log error with stack trace
 */
export function logError(
  message: string,
  error: Error,
  correlationId?: string,
  metadata?: any
): void {
  const logMessage = correlationId ? `[${correlationId}] ${message}` : message;
  logger.error(logMessage, {
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
    correlationId,
    ...metadata,
  });
}

/**
 * Log payment gateway interaction
 */
export function logPaymentGateway(
  gateway: string,
  operation: string,
  success: boolean,
  correlationId: string,
  metadata?: any
): void {
  const level = success ? 'info' : 'error';
  logger.log(level, `[${correlationId}] Payment Gateway: ${gateway} - ${operation}`, {
    gateway,
    operation,
    success,
    correlationId,
    ...metadata,
  });
}

/**
 * Log performance metric
 */
export function logPerformance(
  operation: string,
  duration: number,
  correlationId?: string
): void {
  const logMessage = correlationId
    ? `[${correlationId}] Performance: ${operation} took ${duration}ms`
    : `Performance: ${operation} took ${duration}ms`;
  
  logger.info(logMessage, {
    operation,
    duration,
    correlationId,
  });
}

export default logger;
