// LogisticsPlatformSystem — System Coordinator
// System ID: SYS-LOG-LOGISTICSPLATFORM
// Unique Hash: d42bdf91-entity

import {
  SYSTEM_ID, SYSTEM_VERSION, NIGERIA_FIRST_CONFIG,
  OfflineQueueEntry, NetworkConfig, OrganHealth, SystemCapability,
  InventoryManagerOrgan, ShipmentTrackerOrgan, WarehouseControllerOrgan, DeliveryOptimizerOrgan, SupplyChainPlannerOrgan
} from './types';

export class LogisticsPlatformSystem {
  private readonly systemId = SYSTEM_ID;
  private readonly version = SYSTEM_VERSION;
  private readonly config = NIGERIA_FIRST_CONFIG;
  private offlineQueue: OfflineQueueEntry[] = [];
  private isOnline: boolean = true;
  private lastSyncTimestamp: number = 0;

  // Organ references
  private inventorymanagerOrgan: InventoryManagerOrgan | null = null;
  private shipmenttrackerOrgan: ShipmentTrackerOrgan | null = null;
  private warehousecontrollerOrgan: WarehouseControllerOrgan | null = null;
  private deliveryoptimizerOrgan: DeliveryOptimizerOrgan | null = null;
  private supplychainplannerOrgan: SupplyChainPlannerOrgan | null = null;

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
    if (this.inventorymanagerOrgan) await this.inventorymanagerOrgan.initialize();
    if (this.shipmenttrackerOrgan) await this.shipmenttrackerOrgan.initialize();
    if (this.warehousecontrollerOrgan) await this.warehousecontrollerOrgan.initialize();
    if (this.deliveryoptimizerOrgan) await this.deliveryoptimizerOrgan.initialize();
    if (this.supplychainplannerOrgan) await this.supplychainplannerOrgan.initialize();
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
      'inventorymanager': this.inventorymanagerOrgan,
      'shipmenttracker': this.shipmenttrackerOrgan,
      'warehousecontroller': this.warehousecontrollerOrgan,
      'deliveryoptimizer': this.deliveryoptimizerOrgan,
      'supplychainplanner': this.supplychainplannerOrgan,
    };

    const organ = organMap[organName.toLowerCase()];
    if (!organ) {
      throw new Error(`Unknown organ: ${organName} in system ${this.systemId}`);
    }

    return (organ as any).execute(command);
  }

  async getHealth(): Promise<Record<string, OrganHealth>> {
    const health: Record<string, OrganHealth> = {};
    if (this.inventorymanagerOrgan) {
      health['inventorymanager'] = await this.inventorymanagerOrgan.getHealth();
    }
    if (this.shipmenttrackerOrgan) {
      health['shipmenttracker'] = await this.shipmenttrackerOrgan.getHealth();
    }
    if (this.warehousecontrollerOrgan) {
      health['warehousecontroller'] = await this.warehousecontrollerOrgan.getHealth();
    }
    if (this.deliveryoptimizerOrgan) {
      health['deliveryoptimizer'] = await this.deliveryoptimizerOrgan.getHealth();
    }
    if (this.supplychainplannerOrgan) {
      health['supplychainplanner'] = await this.supplychainplannerOrgan.getHealth();
    }
    return health;
  }

  getCapabilities(): SystemCapability[] {
    return [
      { name: 'Inventory level management', available: true, offlineSupport: true },
      { name: 'Real-time shipment tracking', available: true, offlineSupport: true },
      { name: 'Warehouse operations management', available: true, offlineSupport: true },
      { name: 'Last-mile delivery optimization', available: true, offlineSupport: true },
      { name: 'Supply chain demand planning', available: true, offlineSupport: true },
    ];
  }

  getOfflineQueueStatus(): { pending: number; oldestEntry: number | null } {
    return {
      pending: this.offlineQueue.length,
      oldestEntry: this.offlineQueue.length > 0 ? this.offlineQueue[0].timestamp : null,
    };
  }
}
