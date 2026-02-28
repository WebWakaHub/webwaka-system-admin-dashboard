/**
 * Plugin System Errors
 * Custom error classes for the Plugin System
 */

export class PluginSystemError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'PluginSystemError';
  }
}

export class PluginNotFoundError extends PluginSystemError {
  constructor(pluginId: string) {
    super(
      'PLUGIN_NOT_FOUND',
      `Plugin with ID ${pluginId} not found`,
      404
    );
    this.name = 'PluginNotFoundError';
  }
}

export class PluginAlreadyInstalledError extends PluginSystemError {
  constructor(pluginId: string, tenantId: string) {
    super(
      'PLUGIN_ALREADY_INSTALLED',
      `Plugin ${pluginId} is already installed for tenant ${tenantId}`,
      409
    );
    this.name = 'PluginAlreadyInstalledError';
  }
}

export class PluginNotInstalledError extends PluginSystemError {
  constructor(pluginId: string, tenantId: string) {
    super(
      'PLUGIN_NOT_INSTALLED',
      `Plugin ${pluginId} is not installed for tenant ${tenantId}`,
      404
    );
    this.name = 'PluginNotInstalledError';
  }
}

export class PluginAlreadyActiveError extends PluginSystemError {
  constructor(pluginId: string) {
    super(
      'PLUGIN_ALREADY_ACTIVE',
      `Plugin ${pluginId} is already active`,
      409
    );
    this.name = 'PluginAlreadyActiveError';
  }
}

export class PluginNotActiveError extends PluginSystemError {
  constructor(pluginId: string) {
    super(
      'PLUGIN_NOT_ACTIVE',
      `Plugin ${pluginId} is not active`,
      409
    );
    this.name = 'PluginNotActiveError';
  }
}

export class DependencyResolutionError extends PluginSystemError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(
      'DEPENDENCY_RESOLUTION_ERROR',
      message,
      400,
      details
    );
    this.name = 'DependencyResolutionError';
  }
}

export class CircularDependencyError extends PluginSystemError {
  constructor(cycle: string[]) {
    super(
      'CIRCULAR_DEPENDENCY',
      `Circular dependency detected: ${cycle.join(' -> ')}`,
      400,
      { cycle }
    );
    this.name = 'CircularDependencyError';
  }
}

export class InvalidPluginConfigurationError extends PluginSystemError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(
      'INVALID_PLUGIN_CONFIGURATION',
      message,
      400,
      details
    );
    this.name = 'InvalidPluginConfigurationError';
  }
}

export class PluginSignatureVerificationError extends PluginSystemError {
  constructor(pluginId: string) {
    super(
      'SIGNATURE_VERIFICATION_FAILED',
      `Failed to verify signature for plugin ${pluginId}`,
      401
    );
    this.name = 'PluginSignatureVerificationError';
  }
}

export class PluginDependencyError extends PluginSystemError {
  constructor(pluginId: string, dependencyId: string) {
    super(
      'PLUGIN_DEPENDENCY_ERROR',
      `Cannot uninstall plugin ${pluginId} because plugin ${dependencyId} depends on it`,
      409
    );
    this.name = 'PluginDependencyError';
  }
}

export class PluginSandboxError extends PluginSystemError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(
      'PLUGIN_SANDBOX_ERROR',
      message,
      500,
      details
    );
    this.name = 'PluginSandboxError';
  }
}

export class PluginExecutionError extends PluginSystemError {
  constructor(pluginId: string, message: string) {
    super(
      'PLUGIN_EXECUTION_ERROR',
      `Execution error in plugin ${pluginId}: ${message}`,
      500
    );
    this.name = 'PluginExecutionError';
  }
}

export class PluginTimeoutError extends PluginSystemError {
  constructor(pluginId: string) {
    super(
      'PLUGIN_TIMEOUT',
      `Plugin ${pluginId} execution timed out`,
      504
    );
    this.name = 'PluginTimeoutError';
  }
}

export class TenantPluginLimitExceededError extends PluginSystemError {
  constructor(tenantId: string, limit: number) {
    super(
      'TENANT_PLUGIN_LIMIT_EXCEEDED',
      `Tenant ${tenantId} has reached the maximum number of plugins (${limit})`,
      429
    );
    this.name = 'TenantPluginLimitExceededError';
  }
}
