/**
 * AI-Extension Framework - Main entry point
 */

export { AIExtension, AIExtensionConfig } from './AIExtension';
export { AIExtensionFramework, FrameworkConfig } from './AIExtensionFramework';

// Errors
export {
  AIExtensionError,
  ExtensionNotFoundError,
  ExtensionAlreadyInstalledError,
  ExtensionNotEnabledError,
  AIServiceError,
  ExtensionSandboxError,
} from './errors/AIExtensionError';

// Manager
export { ExtensionManager, ExtensionState } from './manager/ExtensionManager';

// Registry
export { ExtensionRegistry, ExtensionMetadata } from './registry/ExtensionRegistry';

// Sandbox
export { ExtensionSandbox, SandboxConfig, SandboxContext } from './sandbox/ExtensionSandbox';

// AI Service Gateway
export {
  AIServiceGateway,
  AITextGenerationRequest,
  AITextGenerationResponse,
  AIEmbeddingRequest,
  AIEmbeddingResponse,
  AIClassificationRequest,
  AIClassificationResponse,
} from './gateway/AIServiceGateway';

// Event Bus Bridge
export { EventBusBridge, BridgeConfig } from './bridge/EventBusBridge';
