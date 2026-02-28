// ContentPlatformSystem — System Coordinator
// System ID: SYS-MED-CONTENTPLATFORM
// Unique Hash: 8ef6607e-entity

import {
  SYSTEM_ID, SYSTEM_VERSION, NIGERIA_FIRST_CONFIG,
  OfflineQueueEntry, NetworkConfig, OrganHealth, SystemCapability,
  ContentEditorOrgan, MediaLibraryOrgan, DistributionEngineOrgan, ModerationSystemOrgan, AnalyticsTrackerOrgan
} from './types';

export class ContentPlatformSystem {
  private readonly systemId = SYSTEM_ID;
  private readonly version = SYSTEM_VERSION;
  private readonly config = NIGERIA_FIRST_CONFIG;
  private offlineQueue: OfflineQueueEntry[] = [];
  private isOnline: boolean = true;
  private lastSyncTimestamp: number = 0;

  // Organ references
  private contenteditorOrgan: ContentEditorOrgan | null = null;
  private medialibraryOrgan: MediaLibraryOrgan | null = null;
  private distributionengineOrgan: DistributionEngineOrgan | null = null;
  private moderationsystemOrgan: ModerationSystemOrgan | null = null;
  private analyticstrackerOrgan: AnalyticsTrackerOrgan | null = null;

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
    if (this.contenteditorOrgan) await this.contenteditorOrgan.initialize();
    if (this.medialibraryOrgan) await this.medialibraryOrgan.initialize();
    if (this.distributionengineOrgan) await this.distributionengineOrgan.initialize();
    if (this.moderationsystemOrgan) await this.moderationsystemOrgan.initialize();
    if (this.analyticstrackerOrgan) await this.analyticstrackerOrgan.initialize();
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
      'contenteditor': this.contenteditorOrgan,
      'medialibrary': this.medialibraryOrgan,
      'distributionengine': this.distributionengineOrgan,
      'moderationsystem': this.moderationsystemOrgan,
      'analyticstracker': this.analyticstrackerOrgan,
    };

    const organ = organMap[organName.toLowerCase()];
    if (!organ) {
      throw new Error(`Unknown organ: ${organName} in system ${this.systemId}`);
    }

    return (organ as any).execute(command);
  }

  async getHealth(): Promise<Record<string, OrganHealth>> {
    const health: Record<string, OrganHealth> = {};
    if (this.contenteditorOrgan) {
      health['contenteditor'] = await this.contenteditorOrgan.getHealth();
    }
    if (this.medialibraryOrgan) {
      health['medialibrary'] = await this.medialibraryOrgan.getHealth();
    }
    if (this.distributionengineOrgan) {
      health['distributionengine'] = await this.distributionengineOrgan.getHealth();
    }
    if (this.moderationsystemOrgan) {
      health['moderationsystem'] = await this.moderationsystemOrgan.getHealth();
    }
    if (this.analyticstrackerOrgan) {
      health['analyticstracker'] = await this.analyticstrackerOrgan.getHealth();
    }
    return health;
  }

  getCapabilities(): SystemCapability[] {
    return [
      { name: 'Rich content creation and editing', available: true, offlineSupport: true },
      { name: 'Media asset management', available: true, offlineSupport: true },
      { name: 'Multi-channel content distribution', available: true, offlineSupport: true },
      { name: 'Content moderation workflow', available: true, offlineSupport: true },
      { name: 'Content performance analytics', available: true, offlineSupport: true },
    ];
  }

  getOfflineQueueStatus(): { pending: number; oldestEntry: number | null } {
    return {
      pending: this.offlineQueue.length,
      oldestEntry: this.offlineQueue.length > 0 ? this.offlineQueue[0].timestamp : null,
    };
  }
}
