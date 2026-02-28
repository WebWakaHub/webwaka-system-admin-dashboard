// ConfigPlatformSystem — System Coordinator
// System ID: SYS-CFG-CONFIGPLATFORM
// Unique Hash: 811d36b0-entity

import {
  SYSTEM_ID, SYSTEM_VERSION, NIGERIA_FIRST_CONFIG,
  OfflineQueueEntry, NetworkConfig, OrganHealth, SystemCapability,
  ConfigStoreOrgan, FeatureFlagEngineOrgan, EnvironmentManagerOrgan, SecretVaultOrgan, ConfigSyncOrgan
} from './types';

export class ConfigPlatformSystem {
  private readonly systemId = SYSTEM_ID;
  private readonly version = SYSTEM_VERSION;
  private readonly config = NIGERIA_FIRST_CONFIG;
  private offlineQueue: OfflineQueueEntry[] = [];
  private isOnline: boolean = true;
  private lastSyncTimestamp: number = 0;

  // Organ references
  private configstoreOrgan: ConfigStoreOrgan | null = null;
  private featureflagengineOrgan: FeatureFlagEngineOrgan | null = null;
  private environmentmanagerOrgan: EnvironmentManagerOrgan | null = null;
  private secretvaultOrgan: SecretVaultOrgan | null = null;
  private configsyncOrgan: ConfigSyncOrgan | null = null;

  constructor(private networkConfig: NetworkConfig = {
    timeout: NIGERIA_FIRST_CONFIG.networkTimeout,
    retryAttempts: 3,
    offlineFallback: true,
    syncOnReconnect: true,
  }) {
    this.initializeOfflineDetection();
  }

  private initializeOfflineDetection(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleOnline());
      window.addEventListener('offline', () => this.handleOffline());
    }
  }

  private handleOnline(): void {
    this.isOnline = true;
    if (this.networkConfig.syncOnReconnect) {
      this.sync();
    }
  }

  private handleOffline(): void {
    this.isOnline = false;
  }

  async initialize(): Promise<void> {
    // Initialize all organs
    if (this.configstoreOrgan) await this.configstoreOrgan.initialize();
    if (this.featureflagengineOrgan) await this.featureflagengineOrgan.initialize();
    if (this.environmentmanagerOrgan) await this.environmentmanagerOrgan.initialize();
    if (this.secretvaultOrgan) await this.secretvaultOrgan.initialize();
    if (this.configsyncOrgan) await this.configsyncOrgan.initialize();
  }

  async coordinate(organName: string, command: unknown): Promise<unknown> {
    if (!this.isOnline && this.networkConfig.offlineFallback) {
      return this.coordinateOffline(organName, command);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.networkConfig.timeout);
      
      // Route to appropriate organ
      const result = await this.routeToOrgan(organName, command);
      clearTimeout(timeoutId);
      
      this.lastSyncTimestamp = Date.now();
      return result;
    } catch (error) {
      if (this.networkConfig.offlineFallback) {
        return this.coordinateOffline(organName, command);
      }
      throw error;
    }
  }

  async coordinateOffline(organName: string, command: unknown): Promise<unknown> {
    const entry: OfflineQueueEntry = {
      id: `${this.systemId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      operation: `${organName}:coordinate`,
      payload: command,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: this.networkConfig.retryAttempts,
    };

    this.offlineQueue.push(entry);
    
    // Return optimistic response with pending sync status
    return {
      success: true,
      data: null,
      syncStatus: 'pending',
      offlineId: entry.id,
    };
  }

  async sync(): Promise<{ synced: number; failed: number; pending: number }> {
    let synced = 0;
    let failed = 0;
    const remaining: OfflineQueueEntry[] = [];

    for (const entry of this.offlineQueue) {
      try {
        await this.routeToOrgan(entry.operation.split(':')[0], entry.payload);
        synced++;
      } catch (error) {
        entry.retryCount++;
        if (entry.retryCount < entry.maxRetries) {
          remaining.push(entry);
        } else {
          failed++;
        }
      }
    }

    this.offlineQueue = remaining;
    this.lastSyncTimestamp = Date.now();

    return { synced, failed, pending: remaining.length };
  }

  private async routeToOrgan(organName: string, command: unknown): Promise<unknown> {
    // Route command to the appropriate organ based on name
    const organMap: Record<string, unknown> = {
      'configstore': this.configstoreOrgan,
      'featureflagengine': this.featureflagengineOrgan,
      'environmentmanager': this.environmentmanagerOrgan,
      'secretvault': this.secretvaultOrgan,
      'configsync': this.configsyncOrgan,
    };

    const organ = organMap[organName.toLowerCase()];
    if (!organ) {
      throw new Error(`Unknown organ: ${organName} in system ${this.systemId}`);
    }

    return (organ as any).execute(command);
  }

  async getHealth(): Promise<Record<string, OrganHealth>> {
    const health: Record<string, OrganHealth> = {};
    if (this.configstoreOrgan) {
      health['configstore'] = await this.configstoreOrgan.getHealth();
    }
    if (this.featureflagengineOrgan) {
      health['featureflagengine'] = await this.featureflagengineOrgan.getHealth();
    }
    if (this.environmentmanagerOrgan) {
      health['environmentmanager'] = await this.environmentmanagerOrgan.getHealth();
    }
    if (this.secretvaultOrgan) {
      health['secretvault'] = await this.secretvaultOrgan.getHealth();
    }
    if (this.configsyncOrgan) {
      health['configsync'] = await this.configsyncOrgan.getHealth();
    }
    return health;
  }

  getCapabilities(): SystemCapability[] {
    return [
      { name: 'Dynamic configuration management', available: true, offlineSupport: true },
      { name: 'Feature flag evaluation', available: true, offlineSupport: true },
      { name: 'Environment-aware config resolution', available: true, offlineSupport: true },
      { name: 'Secret rotation management', available: true, offlineSupport: true },
      { name: 'Config change audit trail', available: true, offlineSupport: true },
    ];
  }

  getOfflineQueueStatus(): { pending: number; oldestEntry: number | null } {
    return {
      pending: this.offlineQueue.length,
      oldestEntry: this.offlineQueue.length > 0 ? this.offlineQueue[0].timestamp : null,
    };
  }
}
