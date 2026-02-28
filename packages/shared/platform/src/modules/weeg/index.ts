/**
 * WEEG (Permission System) - Module Index
 * 
 * This file exports all public interfaces and classes from the WEEG module.
 * 
 * @module weeg
 */

// Core types and interfaces
export * from './types';

// Policy Engine
export * from './policy-engine';

// Permission Service
export * from './permission.service';

// Repository implementations
export * from './repository/postgres.repository';

// Cache implementations
export * from './cache/redis.cache';

// API
export * from './api/weeg.controller';
export * from './api/weeg.routes';
