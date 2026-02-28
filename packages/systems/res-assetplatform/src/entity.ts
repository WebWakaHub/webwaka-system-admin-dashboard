// AssetPlatformSystem — System Coordinator
// System ID: SYS-RES-ASSETPLATFORM
// Unique Hash: 3c7597ec-entity

import {
  SYSTEM_ID, SYSTEM_VERSION, NIGERIA_FIRST_CONFIG,
  OfflineQueueEntry, NetworkConfig, OrganHealth, SystemCapability,
  AssetRegistryOrgan, LifecycleManagerOrgan, MaintenanceSchedulerOrgan, DepreciationCalculatorOrgan, AuditTrailOrgan
} from './types';

export class AssetPlatformSystem {
  private readonly systemId = SYSTEM_ID;
  private readonly version = SYSTEM_VERSION;
  private readonly config = NIGERIA_FIRST_CONFIG;
  private offlineQueue: OfflineQueueEntry[] = [];
  private isOnline: boolean = true;
  private lastSyncTimestamp: number = 0;

  // Organ references
  private assetregistryOrgan: AssetRegistryOrgan | null = null;
  private lifecyclemanagerOrgan: LifecycleManagerOrgan | null = null;
  private maintenanceschedulerOrgan: MaintenanceSchedulerOrgan | null = null;
  private depreciationcalculatorOrgan: DepreciationCalculatorOrgan | null = null;
  private audittrailOrgan: AuditTrailOrgan | null = null;

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
    if (this.assetregistryOrgan) await this.assetregistryOrgan.initialize();
    if (this.lifecyclemanagerOrgan) await this.lifecyclemanagerOrgan.initialize();
    if (this.maintenanceschedulerOrgan) await this.maintenanceschedulerOrgan.initialize();
    if (this.depreciationcalculatorOrgan) await this.depreciationcalculatorOrgan.initialize();
    if (this.audittrailOrgan) await this.audittrailOrgan.initialize();
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
      'assetregistry': this.assetregistryOrgan,
      'lifecyclemanager': this.lifecyclemanagerOrgan,
      'maintenancescheduler': this.maintenanceschedulerOrgan,
      'depreciationcalculator': this.depreciationcalculatorOrgan,
      'audittrail': this.audittrailOrgan,
    };

    const organ = organMap[organName.toLowerCase()];
    if (!organ) {
      throw new Error(`Unknown organ: ${organName} in system ${this.systemId}`);
    }

    return (organ as any).execute(command);
  }

  async getHealth(): Promise<Record<string, OrganHealth>> {
    const health: Record<string, OrganHealth> = {};
    if (this.assetregistryOrgan) {
      health['assetregistry'] = await this.assetregistryOrgan.getHealth();
    }
    if (this.lifecyclemanagerOrgan) {
      health['lifecyclemanager'] = await this.lifecyclemanagerOrgan.getHealth();
    }
    if (this.maintenanceschedulerOrgan) {
      health['maintenancescheduler'] = await this.maintenanceschedulerOrgan.getHealth();
    }
    if (this.depreciationcalculatorOrgan) {
      health['depreciationcalculator'] = await this.depreciationcalculatorOrgan.getHealth();
    }
    if (this.audittrailOrgan) {
      health['audittrail'] = await this.audittrailOrgan.getHealth();
    }
    return health;
  }

  getCapabilities(): SystemCapability[] {
    return [
      { name: 'Asset registration and tracking', available: true, offlineSupport: true },
      { name: 'Asset lifecycle management', available: true, offlineSupport: true },
      { name: 'Preventive maintenance scheduling', available: true, offlineSupport: true },
      { name: 'Depreciation calculation engine', available: true, offlineSupport: true },
      { name: 'Asset audit and compliance', available: true, offlineSupport: true },
    ];
  }

  getOfflineQueueStatus(): { pending: number; oldestEntry: number | null } {
    return {
      pending: this.offlineQueue.length,
      oldestEntry: this.offlineQueue.length > 0 ? this.offlineQueue[0].timestamp : null,
    };
  }
}
