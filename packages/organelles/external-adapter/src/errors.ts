/**
 * ORG-EI-EXTERNAL_ADAPTER-v0.1.0 — Error Taxonomy
 * Agent: webwakaagent4 (Engineering & Delivery)
 */

export class ExternalAdapterError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly retryable: boolean = false,
    public readonly retryAfterMs?: number,
    public readonly vendorCode?: string,
    public readonly vendorMessage?: string,
  ) {
    super(message);
    this.name = 'ExternalAdapterError';
  }
}

export class ServiceNotFoundError extends ExternalAdapterError {
  constructor(serviceId: string) {
    super('SERVICE_NOT_FOUND', `Service '${serviceId}' is not registered`, false);
    this.name = 'ServiceNotFoundError';
  }
}

export class ValidationError extends ExternalAdapterError {
  constructor(message: string) {
    super('VALIDATION_ERROR', message, false);
    this.name = 'ValidationError';
  }
}

export class VendorUnavailableError extends ExternalAdapterError {
  constructor(vendorId: string, cause?: string) {
    super('VENDOR_UNAVAILABLE', `Vendor '${vendorId}' is unavailable: ${cause}`, true);
    this.name = 'VendorUnavailableError';
  }
}

export class VendorAuthError extends ExternalAdapterError {
  constructor(vendorId: string) {
    super('VENDOR_AUTH_ERROR', `Authentication failed for vendor '${vendorId}'`, false);
    this.name = 'VendorAuthError';
  }
}

export class VendorTimeoutError extends ExternalAdapterError {
  constructor(vendorId: string, timeoutMs: number) {
    super('VENDOR_TIMEOUT', `Vendor '${vendorId}' timed out after ${timeoutMs}ms`, true);
    this.name = 'VendorTimeoutError';
  }
}

export class RateLimitExceededError extends ExternalAdapterError {
  constructor(vendorId: string, retryAfterMs: number) {
    super('RATE_LIMIT_EXCEEDED', `Rate limit exceeded for vendor '${vendorId}'`, true, retryAfterMs);
    this.name = 'RateLimitExceededError';
  }
}

export class CircuitOpenError extends ExternalAdapterError {
  constructor(vendorId: string) {
    super('CIRCUIT_OPEN', `Circuit breaker is OPEN for vendor '${vendorId}'`, true);
    this.name = 'CircuitOpenError';
  }
}

export class QueueFullError extends ExternalAdapterError {
  constructor(currentSize: number, maxSize: number) {
    super('QUEUE_FULL', `Offline queue is full (${currentSize}/${maxSize})`, false);
    this.name = 'QueueFullError';
  }
}

export class ComplianceViolationError extends ExternalAdapterError {
  constructor(violations: string[]) {
    super('COMPLIANCE_VIOLATION', `Compliance violations: ${violations.join(', ')}`, false);
    this.name = 'ComplianceViolationError';
  }
}

export class UninitializedError extends ExternalAdapterError {
  constructor(vendorId: string) {
    super('UNINITIALIZED', `Vendor adapter '${vendorId}' not initialized`, false);
    this.name = 'UninitializedError';
  }
}

export class ShutdownError extends ExternalAdapterError {
  constructor(vendorId: string) {
    super('SHUTDOWN', `Vendor adapter '${vendorId}' has been shut down`, false);
    this.name = 'ShutdownError';
  }
}
