/**
 * AIExtensionError - Base error class for AI-Extension Framework
 */

export class AIExtensionError extends Error {
  public code: string;
  public statusCode: number;

  constructor(message: string, code: string = 'AI_EXTENSION_ERROR', statusCode: number = 500) {
    super(message);
    this.name = 'AIExtensionError';
    this.code = code;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AIExtensionError.prototype);
  }
}

export class ExtensionNotFoundError extends AIExtensionError {
  constructor(extensionId: string) {
    super(`Extension '${extensionId}' not found`, 'EXTENSION_NOT_FOUND', 404);
    this.name = 'ExtensionNotFoundError';
    Object.setPrototypeOf(this, ExtensionNotFoundError.prototype);
  }
}

export class ExtensionAlreadyInstalledError extends AIExtensionError {
  constructor(extensionId: string) {
    super(`Extension '${extensionId}' is already installed`, 'EXTENSION_ALREADY_INSTALLED', 409);
    this.name = 'ExtensionAlreadyInstalledError';
    Object.setPrototypeOf(this, ExtensionAlreadyInstalledError.prototype);
  }
}

export class ExtensionNotEnabledError extends AIExtensionError {
  constructor(extensionId: string) {
    super(`Extension '${extensionId}' is not enabled`, 'EXTENSION_NOT_ENABLED', 400);
    this.name = 'ExtensionNotEnabledError';
    Object.setPrototypeOf(this, ExtensionNotEnabledError.prototype);
  }
}

export class AIServiceError extends AIExtensionError {
  constructor(message: string) {
    super(message, 'AI_SERVICE_ERROR', 502);
    this.name = 'AIServiceError';
    Object.setPrototypeOf(this, AIServiceError.prototype);
  }
}

export class ExtensionSandboxError extends AIExtensionError {
  constructor(message: string) {
    super(message, 'EXTENSION_SANDBOX_ERROR', 500);
    this.name = 'ExtensionSandboxError';
    Object.setPrototypeOf(this, ExtensionSandboxError.prototype);
  }
}
