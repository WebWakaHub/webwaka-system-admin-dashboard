/**
 * Sync Engine Module
 * 
 * Exports all public APIs for the Offline-First Sync Engine.
 */

// Types
export * from './types';

// Configuration
export * from './config/sync-engine.config';

// Client
export { OfflineStorageService } from './client/offline-storage.service';
export { SyncEngineClientService } from './client/sync-engine-client.service';

// Server
export { SyncEngineServerService } from './server/sync-engine-server.service';

/**
 * Initialize Sync Engine Client
 */
import { SyncEngineClientService } from './client/sync-engine-client.service';
import { SyncEngineConfig } from './types';
import { loadSyncEngineConfig } from './config/sync-engine.config';

export async function initializeSyncEngineClient(
  tenantId: string,
  userId: string,
  config?: Partial<SyncEngineConfig>
): Promise<SyncEngineClientService> {
  const fullConfig = {
    ...loadSyncEngineConfig(),
    ...config,
  };

  const client = new SyncEngineClientService(fullConfig, tenantId, userId);
  await client.initialize();
  return client;
}

/**
 * Initialize Sync Engine Server
 */
import { SyncEngineServerService } from './server/sync-engine-server.service';

export function initializeSyncEngineServer(): SyncEngineServerService {
  return new SyncEngineServerService();
}
