/**
 * Custom error classes for the Analytics & Reporting module
 */

/**
 * Base error class for Analytics & Reporting errors
 */
export class AnalyticsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AnalyticsError';
  }
}

/**
 * Error thrown when event processing fails
 */
export class EventProcessingError extends AnalyticsError {
  constructor(message: string) {
    super(message);
    this.name = 'EventProcessingError';
  }
}

/**
 * Error thrown when querying analytics data fails
 */
export class QueryError extends AnalyticsError {
  constructor(message: string) {
    super(message);
    this.name = 'QueryError';
  }
}

/**
 * Error thrown when database connection fails
 */
export class DatabaseConnectionError extends AnalyticsError {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseConnectionError';
  }
}
