// InvestmentSystem — System Coordinator
// System ID: SYS-FIN-INVESTMENT
// Unique Hash: 17a2efd6-entity

import {
  SYSTEM_ID, SYSTEM_VERSION, NIGERIA_FIRST_CONFIG,
  OfflineQueueEntry, NetworkConfig, OrganHealth, SystemCapability,
  PortfolioManagerOrgan, TradingEngineOrgan, RiskAnalyzerOrgan, MarketDataFeedOrgan, PerformanceReporterOrgan
} from './types';

export class InvestmentSystem {
  private readonly systemId = SYSTEM_ID;
  private readonly version = SYSTEM_VERSION;
  private readonly config = NIGERIA_FIRST_CONFIG;
  private offlineQueue: OfflineQueueEntry[] = [];
  private isOnline: boolean = true;
  private lastSyncTimestamp: number = 0;

  // Organ references
  private portfoliomanagerOrgan: PortfolioManagerOrgan | null = null;
  private tradingengineOrgan: TradingEngineOrgan | null = null;
  private riskanalyzerOrgan: RiskAnalyzerOrgan | null = null;
  private marketdatafeedOrgan: MarketDataFeedOrgan | null = null;
  private performancereporterOrgan: PerformanceReporterOrgan | null = null;

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
    if (this.portfoliomanagerOrgan) await this.portfoliomanagerOrgan.initialize();
    if (this.tradingengineOrgan) await this.tradingengineOrgan.initialize();
    if (this.riskanalyzerOrgan) await this.riskanalyzerOrgan.initialize();
    if (this.marketdatafeedOrgan) await this.marketdatafeedOrgan.initialize();
    if (this.performancereporterOrgan) await this.performancereporterOrgan.initialize();
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
      'portfoliomanager': this.portfoliomanagerOrgan,
      'tradingengine': this.tradingengineOrgan,
      'riskanalyzer': this.riskanalyzerOrgan,
      'marketdatafeed': this.marketdatafeedOrgan,
      'performancereporter': this.performancereporterOrgan,
    };

    const organ = organMap[organName.toLowerCase()];
    if (!organ) {
      throw new Error(`Unknown organ: ${organName} in system ${this.systemId}`);
    }

    return (organ as any).execute(command);
  }

  async getHealth(): Promise<Record<string, OrganHealth>> {
    const health: Record<string, OrganHealth> = {};
    if (this.portfoliomanagerOrgan) {
      health['portfoliomanager'] = await this.portfoliomanagerOrgan.getHealth();
    }
    if (this.tradingengineOrgan) {
      health['tradingengine'] = await this.tradingengineOrgan.getHealth();
    }
    if (this.riskanalyzerOrgan) {
      health['riskanalyzer'] = await this.riskanalyzerOrgan.getHealth();
    }
    if (this.marketdatafeedOrgan) {
      health['marketdatafeed'] = await this.marketdatafeedOrgan.getHealth();
    }
    if (this.performancereporterOrgan) {
      health['performancereporter'] = await this.performancereporterOrgan.getHealth();
    }
    return health;
  }

  getCapabilities(): SystemCapability[] {
    return [
      { name: 'Portfolio composition management', available: true, offlineSupport: true },
      { name: 'Order execution engine', available: true, offlineSupport: true },
      { name: 'Risk assessment and monitoring', available: true, offlineSupport: true },
      { name: 'Real-time market data integration', available: true, offlineSupport: true },
      { name: 'Investment performance reporting', available: true, offlineSupport: true },
    ];
  }

  getOfflineQueueStatus(): { pending: number; oldestEntry: number | null } {
    return {
      pending: this.offlineQueue.length,
      oldestEntry: this.offlineQueue.length > 0 ? this.offlineQueue[0].timestamp : null,
    };
  }
}
