// MarketplacePlatformSystem — System Coordinator
// System ID: SYS-EXT-MARKETPLACEPLATFORM
// Unique Hash: ca4ffc0c-entity

import {
  SYSTEM_ID, SYSTEM_VERSION, NIGERIA_FIRST_CONFIG,
  OfflineQueueEntry, NetworkConfig, OrganHealth, SystemCapability,
  VendorManagerOrgan, ListingEngineOrgan, TransactionProcessorOrgan, ReviewSystemOrgan, DisputeResolutionOrgan
} from './types';

export class MarketplacePlatformSystem {
  private readonly systemId = SYSTEM_ID;
  private readonly version = SYSTEM_VERSION;
  private readonly config = NIGERIA_FIRST_CONFIG;
  private offlineQueue: OfflineQueueEntry[] = [];
  private isOnline: boolean = true;
  private lastSyncTimestamp: number = 0;

  // Organ references
  private vendormanagerOrgan: VendorManagerOrgan | null = null;
  private listingengineOrgan: ListingEngineOrgan | null = null;
  private transactionprocessorOrgan: TransactionProcessorOrgan | null = null;
  private reviewsystemOrgan: ReviewSystemOrgan | null = null;
  private disputeresolutionOrgan: DisputeResolutionOrgan | null = null;

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
    if (this.vendormanagerOrgan) await this.vendormanagerOrgan.initialize();
    if (this.listingengineOrgan) await this.listingengineOrgan.initialize();
    if (this.transactionprocessorOrgan) await this.transactionprocessorOrgan.initialize();
    if (this.reviewsystemOrgan) await this.reviewsystemOrgan.initialize();
    if (this.disputeresolutionOrgan) await this.disputeresolutionOrgan.initialize();
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
      'vendormanager': this.vendormanagerOrgan,
      'listingengine': this.listingengineOrgan,
      'transactionprocessor': this.transactionprocessorOrgan,
      'reviewsystem': this.reviewsystemOrgan,
      'disputeresolution': this.disputeresolutionOrgan,
    };

    const organ = organMap[organName.toLowerCase()];
    if (!organ) {
      throw new Error(`Unknown organ: ${organName} in system ${this.systemId}`);
    }

    return (organ as any).execute(command);
  }

  async getHealth(): Promise<Record<string, OrganHealth>> {
    const health: Record<string, OrganHealth> = {};
    if (this.vendormanagerOrgan) {
      health['vendormanager'] = await this.vendormanagerOrgan.getHealth();
    }
    if (this.listingengineOrgan) {
      health['listingengine'] = await this.listingengineOrgan.getHealth();
    }
    if (this.transactionprocessorOrgan) {
      health['transactionprocessor'] = await this.transactionprocessorOrgan.getHealth();
    }
    if (this.reviewsystemOrgan) {
      health['reviewsystem'] = await this.reviewsystemOrgan.getHealth();
    }
    if (this.disputeresolutionOrgan) {
      health['disputeresolution'] = await this.disputeresolutionOrgan.getHealth();
    }
    return health;
  }

  getCapabilities(): SystemCapability[] {
    return [
      { name: 'Vendor onboarding and management', available: true, offlineSupport: true },
      { name: 'Product listing with search', available: true, offlineSupport: true },
      { name: 'Transaction processing with escrow', available: true, offlineSupport: true },
      { name: 'Rating and review system', available: true, offlineSupport: true },
      { name: 'Dispute resolution workflow', available: true, offlineSupport: true },
    ];
  }

  getOfflineQueueStatus(): { pending: number; oldestEntry: number | null } {
    return {
      pending: this.offlineQueue.length,
      oldestEntry: this.offlineQueue.length > 0 ? this.offlineQueue[0].timestamp : null,
    };
  }
}
