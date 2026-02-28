/**
 * Audit System Module
 * Main entry point for the Audit System module
 */

export { AuditSystem } from './AuditSystem';
export {
  AuditEvent,
  AuditLog,
  AuditLogQuery,
  AuditLogQueryResult,
  Actor,
  Action,
  ChangeDetails,
} from './types/AuditLog';
export {
  AuditSystemError,
  InvalidAuditEventError,
  AuditLogStorageError,
  AuditLogQueryError,
  UnauthorizedAuditAccessError,
} from './errors/AuditSystemError';
export { AuditEventConsumer } from './consumer/AuditEventConsumer';
export { LogProcessor } from './processor/LogProcessor';
export { AuditDataStore } from './store/AuditDataStore';
export { AuditQueryAPI, PermissionChecker } from './api/AuditQueryAPI';
export { AuditRoutes, HttpContext, HttpResponse } from './api/AuditRoutes';
export { EventEmitter, globalEventEmitter } from './utils/EventEmitter';
export { AuditSystemConfig, AuditSystemConfigOptions, globalAuditSystemConfig } from './config/AuditSystemConfig';
export { AuditSystemFactory } from './factory/AuditSystemFactory';
export { AuditMiddleware, AuditMiddlewareConfig } from './middleware/AuditMiddleware';
export { AuditSystemInitializer, InitializationOptions, InitializationResult } from './init/AuditSystemInitializer';
