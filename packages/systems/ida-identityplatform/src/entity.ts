// IdentityPlatformSystem — System Coordinator
// System ID: SYS-IDA-IDENTITYPLATFORM
// Unique Hash: 100ccf0e-entity

import {
  SYSTEM_ID, SYSTEM_VERSION, NIGERIA_FIRST_CONFIG,
  OfflineQueueEntry, NetworkConfig, OrganHealth, SystemCapability,
  AuthProviderOrgan, PermissionEngineOrgan, IdentityStoreOrgan, SessionManagerOrgan, AuditLoggerOrgan
} from './types';

export class IdentityPlatformSystem {
  private readonly systemId = SYSTEM_ID;
  private readonly version = SYSTEM_VERSION;
  private readonly config = NIGERIA_FIRST_CONFIG;
  private offlineQueue: OfflineQueueEntry[] = [];
  private isOnline: boolean = true;
  private lastSyncTimestamp: number = 0;

  // Organ references
  private authproviderOrgan: AuthProviderOrgan | null = null;
  private permissionengineOrgan: PermissionEngineOrgan | null = null;
  private identitystoreOrgan: IdentityStoreOrgan | null = null;
  private sessionmanagerOrgan: SessionManagerOrgan | null = null;
  private auditloggerOrgan: AuditLoggerOrgan | null = null;

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
    if (this.authproviderOrgan) await this.authproviderOrgan.initialize();
    if (this.permissionengineOrgan) await this.permissionengineOrgan.initialize();
    if (this.identitystoreOrgan) await this.identitystoreOrgan.initialize();
    if (this.sessionmanagerOrgan) await this.sessionmanagerOrgan.initialize();
    if (this.auditloggerOrgan) await this.auditloggerOrgan.initialize();
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
      'authprovider': this.authproviderOrgan,
      'permissionengine': this.permissionengineOrgan,
      'identitystore': this.identitystoreOrgan,
      'sessionmanager': this.sessionmanagerOrgan,
      'auditlogger': this.auditloggerOrgan,
    };

    const organ = organMap[organName.toLowerCase()];
    if (!organ) {
      throw new Error(`Unknown organ: ${organName} in system ${this.systemId}`);
    }

    return (organ as any).execute(command);
  }

  async getHealth(): Promise<Record<string, OrganHealth>> {
    const health: Record<string, OrganHealth> = {};
    if (this.authproviderOrgan) {
      health['authprovider'] = await this.authproviderOrgan.getHealth();
    }
    if (this.permissionengineOrgan) {
      health['permissionengine'] = await this.permissionengineOrgan.getHealth();
    }
    if (this.identitystoreOrgan) {
      health['identitystore'] = await this.identitystoreOrgan.getHealth();
    }
    if (this.sessionmanagerOrgan) {
      health['sessionmanager'] = await this.sessionmanagerOrgan.getHealth();
    }
    if (this.auditloggerOrgan) {
      health['auditlogger'] = await this.auditloggerOrgan.getHealth();
    }
    return health;
  }

  getCapabilities(): SystemCapability[] {
    return [
      { name: 'Multi-factor authentication', available: true, offlineSupport: true },
      { name: 'Role-based access control', available: true, offlineSupport: true },
      { name: 'Identity lifecycle management', available: true, offlineSupport: true },
      { name: 'Session management with offline tokens', available: true, offlineSupport: true },
      { name: 'Authentication audit trail', available: true, offlineSupport: true },
    ];
  }

  getOfflineQueueStatus(): { pending: number; oldestEntry: number | null } {
    return {
      pending: this.offlineQueue.length,
      oldestEntry: this.offlineQueue.length > 0 ? this.offlineQueue[0].timestamp : null,
    };
  }
}
