/**
 * Event System Errors
 * Custom error classes for the Event System module
 */

/**
 * Base Event System Error
 */
export class EventSystemError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'EventSystemError';
  }
}

/**
 * Error thrown when event validation fails
 */
export class EventValidationError extends EventSystemError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('EVENT_VALIDATION_ERROR', message, details);
    this.name = 'EventValidationError';
  }
}

/**
 * Error thrown when event publishing fails
 */
export class EventPublishError extends EventSystemError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('EVENT_PUBLISH_ERROR', message, details);
    this.name = 'EventPublishError';
  }
}

/**
 * Error thrown when subscription fails
 */
export class SubscriptionError extends EventSystemError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('SUBSCRIPTION_ERROR', message, details);
    this.name = 'SubscriptionError';
  }
}

/**
 * Error thrown when connection to event bus fails
 */
export class ConnectionError extends EventSystemError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('CONNECTION_ERROR', message, details);
    this.name = 'ConnectionError';
  }
}

/**
 * Error thrown when tenant isolation is violated
 */
export class TenantIsolationError extends EventSystemError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('TENANT_ISOLATION_ERROR', message, details);
    this.name = 'TenantIsolationError';
  }
}

/**
 * Error thrown when authentication fails
 */
export class AuthenticationError extends EventSystemError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('AUTHENTICATION_ERROR', message, details);
    this.name = 'AuthenticationError';
  }
}

/**
 * Error thrown when authorization fails
 */
export class AuthorizationError extends EventSystemError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('AUTHORIZATION_ERROR', message, details);
    this.name = 'AuthorizationError';
  }
}
