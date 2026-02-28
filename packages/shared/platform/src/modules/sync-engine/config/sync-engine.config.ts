/**
 * Sync Engine Configuration
 * 
 * Provides configuration for the Sync Engine module.
 */

import { SyncEngineConfig } from '../types';

/**
 * Default Sync Engine configuration
 */
export const defaultSyncEngineConfig: SyncEngineConfig = {
  syncIntervalMs: 30000, // 30 seconds
  maxRetries: 3,
  conflictResolutionStrategy: 'last-write-wins',
  enableRealTimeSync: true,
};

/**
 * Load Sync Engine configuration from environment
 */
export function loadSyncEngineConfig(): SyncEngineConfig {
  return {
    syncIntervalMs: parseInt(process.env.SYNC_INTERVAL_MS || '30000', 10),
    maxRetries: parseInt(process.env.SYNC_MAX_RETRIES || '3', 10),
    conflictResolutionStrategy: (process.env.SYNC_CONFLICT_STRATEGY as any) || 'last-write-wins',
    enableRealTimeSync: process.env.SYNC_ENABLE_REALTIME !== 'false',
  };
}

/**
 * Validate Sync Engine configuration
 */
export function validateSyncEngineConfig(config: SyncEngineConfig): boolean {
  if (config.syncIntervalMs < 1000) {
    throw new Error('Sync interval must be at least 1000ms');
  }
  if (config.maxRetries < 1) {
    throw new Error('Max retries must be at least 1');
  }
  if (!['last-write-wins', 'custom'].includes(config.conflictResolutionStrategy)) {
    throw new Error('Invalid conflict resolution strategy');
  }
  return true;
}
