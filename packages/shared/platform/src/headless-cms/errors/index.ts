/**
 * Error classes for Headless CMS module
 */

export class HeadlessCMSError extends Error {
  constructor(message: string, public code: string, public statusCode: number = 500) {
    super(message);
    this.name = 'HeadlessCMSError';
  }
}

export class ModelNotFoundError extends HeadlessCMSError {
  constructor(modelId: string) {
    super(`Content model not found: ${modelId}`, 'MODEL_NOT_FOUND', 404);
    this.name = 'ModelNotFoundError';
  }
}

export class EntryNotFoundError extends HeadlessCMSError {
  constructor(entryId: string) {
    super(`Content entry not found: ${entryId}`, 'ENTRY_NOT_FOUND', 404);
    this.name = 'EntryNotFoundError';
  }
}

export class ValidationError extends HeadlessCMSError {
  constructor(message: string, public details?: any) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class PermissionDeniedError extends HeadlessCMSError {
  constructor(action: string, resource: string) {
    super(`Permission denied: ${action} on ${resource}`, 'PERMISSION_DENIED', 403);
    this.name = 'PermissionDeniedError';
  }
}

export class DuplicateModelError extends HeadlessCMSError {
  constructor(modelName: string) {
    super(`Content model already exists: ${modelName}`, 'DUPLICATE_MODEL', 409);
    this.name = 'DuplicateModelError';
  }
}
