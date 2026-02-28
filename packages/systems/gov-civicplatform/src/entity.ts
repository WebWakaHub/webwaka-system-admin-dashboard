// CivicPlatformSystem — System Coordinator
// System ID: SYS-GOV-CIVICPLATFORM
// Unique Hash: fec00688-entity

import {
  SYSTEM_ID, SYSTEM_VERSION, NIGERIA_FIRST_CONFIG,
  OfflineQueueEntry, NetworkConfig, OrganHealth, SystemCapability,
  CitizenPortalOrgan, PolicyManagerOrgan, ServiceCatalogOrgan, FeedbackEngineOrgan, TransparencyDashboardOrgan
} from './types';

export class CivicPlatformSystem {
  private readonly systemId = SYSTEM_ID;
  private readonly version = SYSTEM_VERSION;
  private readonly config = NIGERIA_FIRST_CONFIG;
  private offlineQueue: OfflineQueueEntry[] = [];
  private isOnline: boolean = true;
  private lastSyncTimestamp: number = 0;

  // Organ references
  private citizenportalOrgan: CitizenPortalOrgan | null = null;
  private policymanagerOrgan: PolicyManagerOrgan | null = null;
  private servicecatalogOrgan: ServiceCatalogOrgan | null = null;
  private feedbackengineOrgan: FeedbackEngineOrgan | null = null;
  private transparencydashboardOrgan: TransparencyDashboardOrgan | null = null;

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
    if (this.citizenportalOrgan) await this.citizenportalOrgan.initialize();
    if (this.policymanagerOrgan) await this.policymanagerOrgan.initialize();
    if (this.servicecatalogOrgan) await this.servicecatalogOrgan.initialize();
    if (this.feedbackengineOrgan) await this.feedbackengineOrgan.initialize();
    if (this.transparencydashboardOrgan) await this.transparencydashboardOrgan.initialize();
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
      'citizenportal': this.citizenportalOrgan,
      'policymanager': this.policymanagerOrgan,
      'servicecatalog': this.servicecatalogOrgan,
      'feedbackengine': this.feedbackengineOrgan,
      'transparencydashboard': this.transparencydashboardOrgan,
    };

    const organ = organMap[organName.toLowerCase()];
    if (!organ) {
      throw new Error(`Unknown organ: ${organName} in system ${this.systemId}`);
    }

    return (organ as any).execute(command);
  }

  async getHealth(): Promise<Record<string, OrganHealth>> {
    const health: Record<string, OrganHealth> = {};
    if (this.citizenportalOrgan) {
      health['citizenportal'] = await this.citizenportalOrgan.getHealth();
    }
    if (this.policymanagerOrgan) {
      health['policymanager'] = await this.policymanagerOrgan.getHealth();
    }
    if (this.servicecatalogOrgan) {
      health['servicecatalog'] = await this.servicecatalogOrgan.getHealth();
    }
    if (this.feedbackengineOrgan) {
      health['feedbackengine'] = await this.feedbackengineOrgan.getHealth();
    }
    if (this.transparencydashboardOrgan) {
      health['transparencydashboard'] = await this.transparencydashboardOrgan.getHealth();
    }
    return health;
  }

  getCapabilities(): SystemCapability[] {
    return [
      { name: 'Citizen identity and engagement', available: true, offlineSupport: true },
      { name: 'Policy lifecycle management', available: true, offlineSupport: true },
      { name: 'Public service catalog', available: true, offlineSupport: true },
      { name: 'Citizen feedback collection', available: true, offlineSupport: true },
      { name: 'Government transparency reporting', available: true, offlineSupport: true },
    ];
  }

  getOfflineQueueStatus(): { pending: number; oldestEntry: number | null } {
    return {
      pending: this.offlineQueue.length,
      oldestEntry: this.offlineQueue.length > 0 ? this.offlineQueue[0].timestamp : null,
    };
  }
}
