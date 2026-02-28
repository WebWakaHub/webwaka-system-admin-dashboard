// AnalyticsPlatformSystem — System Coordinator
// System ID: SYS-ANA-ANALYTICSPLATFORM
// Unique Hash: 11fc3779-entity

import {
  SYSTEM_ID, SYSTEM_VERSION, NIGERIA_FIRST_CONFIG,
  OfflineQueueEntry, NetworkConfig, OrganHealth, SystemCapability,
  DataCollectionOrgan, DataProcessingOrgan, VisualizationEngineOrgan, ReportGeneratorOrgan, DashboardManagerOrgan
} from './types';

export class AnalyticsPlatformSystem {
  private readonly systemId = SYSTEM_ID;
  private readonly version = SYSTEM_VERSION;
  private readonly config = NIGERIA_FIRST_CONFIG;
  private offlineQueue: OfflineQueueEntry[] = [];
  private isOnline: boolean = true;
  private lastSyncTimestamp: number = 0;

  // Organ references
  private datacollectionOrgan: DataCollectionOrgan | null = null;
  private dataprocessingOrgan: DataProcessingOrgan | null = null;
  private visualizationengineOrgan: VisualizationEngineOrgan | null = null;
  private reportgeneratorOrgan: ReportGeneratorOrgan | null = null;
  private dashboardmanagerOrgan: DashboardManagerOrgan | null = null;

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
    if (this.datacollectionOrgan) await this.datacollectionOrgan.initialize();
    if (this.dataprocessingOrgan) await this.dataprocessingOrgan.initialize();
    if (this.visualizationengineOrgan) await this.visualizationengineOrgan.initialize();
    if (this.reportgeneratorOrgan) await this.reportgeneratorOrgan.initialize();
    if (this.dashboardmanagerOrgan) await this.dashboardmanagerOrgan.initialize();
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
      'datacollection': this.datacollectionOrgan,
      'dataprocessing': this.dataprocessingOrgan,
      'visualizationengine': this.visualizationengineOrgan,
      'reportgenerator': this.reportgeneratorOrgan,
      'dashboardmanager': this.dashboardmanagerOrgan,
    };

    const organ = organMap[organName.toLowerCase()];
    if (!organ) {
      throw new Error(`Unknown organ: ${organName} in system ${this.systemId}`);
    }

    return (organ as any).execute(command);
  }

  async getHealth(): Promise<Record<string, OrganHealth>> {
    const health: Record<string, OrganHealth> = {};
    if (this.datacollectionOrgan) {
      health['datacollection'] = await this.datacollectionOrgan.getHealth();
    }
    if (this.dataprocessingOrgan) {
      health['dataprocessing'] = await this.dataprocessingOrgan.getHealth();
    }
    if (this.visualizationengineOrgan) {
      health['visualizationengine'] = await this.visualizationengineOrgan.getHealth();
    }
    if (this.reportgeneratorOrgan) {
      health['reportgenerator'] = await this.reportgeneratorOrgan.getHealth();
    }
    if (this.dashboardmanagerOrgan) {
      health['dashboardmanager'] = await this.dashboardmanagerOrgan.getHealth();
    }
    return health;
  }

  getCapabilities(): SystemCapability[] {
    return [
      { name: 'Real-time analytics pipeline', available: true, offlineSupport: true },
      { name: 'Custom dashboard builder', available: true, offlineSupport: true },
      { name: 'Scheduled report generation', available: true, offlineSupport: true },
      { name: 'Data aggregation across domains', available: true, offlineSupport: true },
      { name: 'Predictive analytics engine', available: true, offlineSupport: true },
    ];
  }

  getOfflineQueueStatus(): { pending: number; oldestEntry: number | null } {
    return {
      pending: this.offlineQueue.length,
      oldestEntry: this.offlineQueue.length > 0 ? this.offlineQueue[0].timestamp : null,
    };
  }
}
