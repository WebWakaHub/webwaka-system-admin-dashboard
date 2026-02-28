/**
 * User & Identity Management Module
 * 
 * Provides comprehensive user authentication, authorization, and identity management
 * for the WebWaka platform.
 */

export { UserIdentity } from './UserIdentity';
export * from './types';
export * from './errors';
export { AuthService } from './services/AuthService';
export { UserService } from './services/UserService';
export { RBACService } from './services/RBACService';
