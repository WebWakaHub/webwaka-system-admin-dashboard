// LocationPlatformSystem — System Coordinator
// System ID: SYS-GEO-LOCATIONPLATFORM
// Unique Hash: 0edd976f-entity

import {
  SYSTEM_ID, SYSTEM_VERSION, NIGERIA_FIRST_CONFIG,
  OfflineQueueEntry, NetworkConfig, OrganHealth, SystemCapability,
  MapRendererOrgan, GeocoderOrgan, SpatialAnalyzerOrgan, RoutePlannerOrgan, GeofenceManagerOrgan
} from './types';

export class LocationPlatformSystem {
  private readonly systemId = SYSTEM_ID;
  private readonly version = SYSTEM_VERSION;
  private readonly config = NIGERIA_FIRST_CONFIG;
  private offlineQueue: OfflineQueueEntry[] = [];
  private isOnline: boolean = true;
  private lastSyncTimestamp: number = 0;

  // Organ references
  private maprendererOrgan: MapRendererOrgan | null = null;
  private geocoderOrgan: GeocoderOrgan | null = null;
  private spatialanalyzerOrgan: SpatialAnalyzerOrgan | null = null;
  private routeplannerOrgan: RoutePlannerOrgan | null = null;
  private geofencemanagerOrgan: GeofenceManagerOrgan | null = null;

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
    if (this.maprendererOrgan) await this.maprendererOrgan.initialize();
    if (this.geocoderOrgan) await this.geocoderOrgan.initialize();
    if (this.spatialanalyzerOrgan) await this.spatialanalyzerOrgan.initialize();
    if (this.routeplannerOrgan) await this.routeplannerOrgan.initialize();
    if (this.geofencemanagerOrgan) await this.geofencemanagerOrgan.initialize();
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
      'maprenderer': this.maprendererOrgan,
      'geocoder': this.geocoderOrgan,
      'spatialanalyzer': this.spatialanalyzerOrgan,
      'routeplanner': this.routeplannerOrgan,
      'geofencemanager': this.geofencemanagerOrgan,
    };

    const organ = organMap[organName.toLowerCase()];
    if (!organ) {
      throw new Error(`Unknown organ: ${organName} in system ${this.systemId}`);
    }

    return (organ as any).execute(command);
  }

  async getHealth(): Promise<Record<string, OrganHealth>> {
    const health: Record<string, OrganHealth> = {};
    if (this.maprendererOrgan) {
      health['maprenderer'] = await this.maprendererOrgan.getHealth();
    }
    if (this.geocoderOrgan) {
      health['geocoder'] = await this.geocoderOrgan.getHealth();
    }
    if (this.spatialanalyzerOrgan) {
      health['spatialanalyzer'] = await this.spatialanalyzerOrgan.getHealth();
    }
    if (this.routeplannerOrgan) {
      health['routeplanner'] = await this.routeplannerOrgan.getHealth();
    }
    if (this.geofencemanagerOrgan) {
      health['geofencemanager'] = await this.geofencemanagerOrgan.getHealth();
    }
    return health;
  }

  getCapabilities(): SystemCapability[] {
    return [
      { name: 'Interactive map rendering', available: true, offlineSupport: true },
      { name: 'Address geocoding with Nigerian address support', available: true, offlineSupport: true },
      { name: 'Spatial data analysis', available: true, offlineSupport: true },
      { name: 'Route optimization', available: true, offlineSupport: true },
      { name: 'Geofence monitoring and alerts', available: true, offlineSupport: true },
    ];
  }

  getOfflineQueueStatus(): { pending: number; oldestEntry: number | null } {
    return {
      pending: this.offlineQueue.length,
      oldestEntry: this.offlineQueue.length > 0 ? this.offlineQueue[0].timestamp : null,
    };
  }
}
