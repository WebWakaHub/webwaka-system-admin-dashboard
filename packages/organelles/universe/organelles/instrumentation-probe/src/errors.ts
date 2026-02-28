/**
 * ORG-IN-INSTRUMENTATION_PROBE-v0.1.0
 * Error Taxonomy
 *
 * Agent: webwakaagent4 (Engineering & Delivery)
 * Issue: webwaka-organelle-universe#479 (P3-T01)
 */

export class ProbeError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly recoverable: boolean = false,
  ) {
    super(message);
    this.name = 'ProbeError';
  }
}

export class ProbeInitializationError extends ProbeError {
  constructor(message: string) {
    super(message, 'ERR_PROBE_INIT', false);
    this.name = 'ProbeInitializationError';
  }
}

export class InvalidMetricNameError extends ProbeError {
  constructor(name: string) {
    super(
      `Invalid metric name "${name}". Must match pattern: ^webwaka\\.[a-z]+\\.[a-z_]+\\.[a-z_.]+$`,
      'ERR_INVALID_METRIC_NAME',
      false,
    );
    this.name = 'InvalidMetricNameError';
  }
}

export class MetricRegistryFullError extends ProbeError {
  constructor(limit: number) {
    super(
      `Metric registry full. Maximum ${limit} metrics allowed.`,
      'ERR_METRIC_REGISTRY_FULL',
      false,
    );
    this.name = 'MetricRegistryFullError';
  }
}

export class InvalidStateTransitionError extends ProbeError {
  constructor(from: string, to: string) {
    super(
      `Invalid state transition from ${from} to ${to}`,
      'ERR_INVALID_STATE_TRANSITION',
      false,
    );
    this.name = 'InvalidStateTransitionError';
  }
}

export class TracePropagationError extends ProbeError {
  constructor(message: string) {
    super(message, 'ERR_TRACE_PROPAGATION', true);
    this.name = 'TracePropagationError';
  }
}

export class BufferOverflowError extends ProbeError {
  constructor(currentSize: number, maxSize: number) {
    super(
      `Buffer overflow: ${currentSize} bytes exceeds max ${maxSize} bytes`,
      'ERR_BUFFER_OVERFLOW',
      true,
    );
    this.name = 'BufferOverflowError';
  }
}

export class EmissionTimeoutError extends ProbeError {
  constructor(timeoutMs: number) {
    super(
      `Emission timed out after ${timeoutMs}ms`,
      'ERR_EMISSION_TIMEOUT',
      true,
    );
    this.name = 'EmissionTimeoutError';
  }
}

export class TenantAccessDeniedError extends ProbeError {
  constructor(tenantId: string) {
    super(
      `Access denied for tenant "${tenantId}"`,
      'ERR_TENANT_ACCESS_DENIED',
      false,
    );
    this.name = 'TenantAccessDeniedError';
  }
}
