// EcommerceSystem — System Coordinator
// System ID: SYS-COM-ECOMMERCE
// Unique Hash: c21a3396-entity

import {
  SYSTEM_ID, SYSTEM_VERSION, NIGERIA_FIRST_CONFIG,
  OfflineQueueEntry, NetworkConfig, OrganHealth, SystemCapability,
  ProductCatalogOrgan, ShoppingCartOrgan, CheckoutEngineOrgan, OrderManagerOrgan, PaymentGatewayOrgan
} from './types';

export class EcommerceSystem {
  private readonly systemId = SYSTEM_ID;
  private readonly version = SYSTEM_VERSION;
  private readonly config = NIGERIA_FIRST_CONFIG;
  private offlineQueue: OfflineQueueEntry[] = [];
  private isOnline: boolean = true;
  private lastSyncTimestamp: number = 0;

  // Organ references
  private productcatalogOrgan: ProductCatalogOrgan | null = null;
  private shoppingcartOrgan: ShoppingCartOrgan | null = null;
  private checkoutengineOrgan: CheckoutEngineOrgan | null = null;
  private ordermanagerOrgan: OrderManagerOrgan | null = null;
  private paymentgatewayOrgan: PaymentGatewayOrgan | null = null;

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
    if (this.productcatalogOrgan) await this.productcatalogOrgan.initialize();
    if (this.shoppingcartOrgan) await this.shoppingcartOrgan.initialize();
    if (this.checkoutengineOrgan) await this.checkoutengineOrgan.initialize();
    if (this.ordermanagerOrgan) await this.ordermanagerOrgan.initialize();
    if (this.paymentgatewayOrgan) await this.paymentgatewayOrgan.initialize();
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
      'productcatalog': this.productcatalogOrgan,
      'shoppingcart': this.shoppingcartOrgan,
      'checkoutengine': this.checkoutengineOrgan,
      'ordermanager': this.ordermanagerOrgan,
      'paymentgateway': this.paymentgatewayOrgan,
    };

    const organ = organMap[organName.toLowerCase()];
    if (!organ) {
      throw new Error(`Unknown organ: ${organName} in system ${this.systemId}`);
    }

    return (organ as any).execute(command);
  }

  async getHealth(): Promise<Record<string, OrganHealth>> {
    const health: Record<string, OrganHealth> = {};
    if (this.productcatalogOrgan) {
      health['productcatalog'] = await this.productcatalogOrgan.getHealth();
    }
    if (this.shoppingcartOrgan) {
      health['shoppingcart'] = await this.shoppingcartOrgan.getHealth();
    }
    if (this.checkoutengineOrgan) {
      health['checkoutengine'] = await this.checkoutengineOrgan.getHealth();
    }
    if (this.ordermanagerOrgan) {
      health['ordermanager'] = await this.ordermanagerOrgan.getHealth();
    }
    if (this.paymentgatewayOrgan) {
      health['paymentgateway'] = await this.paymentgatewayOrgan.getHealth();
    }
    return health;
  }

  getCapabilities(): SystemCapability[] {
    return [
      { name: 'Product listing and search', available: true, offlineSupport: true },
      { name: 'Cart management with offline sync', available: true, offlineSupport: true },
      { name: 'Multi-currency checkout', available: true, offlineSupport: true },
      { name: 'Order lifecycle tracking', available: true, offlineSupport: true },
      { name: 'Payment processing with Naira support', available: true, offlineSupport: true },
    ];
  }

  getOfflineQueueStatus(): { pending: number; oldestEntry: number | null } {
    return {
      pending: this.offlineQueue.length,
      oldestEntry: this.offlineQueue.length > 0 ? this.offlineQueue[0].timestamp : null,
    };
  }
}
