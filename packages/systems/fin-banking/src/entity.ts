// BankingSystem — System Coordinator
// System ID: SYS-FIN-BANKING
// Unique Hash: 1042afb4-entity

import {
  SYSTEM_ID, SYSTEM_VERSION, NIGERIA_FIRST_CONFIG,
  OfflineQueueEntry, NetworkConfig, OrganHealth, SystemCapability,
  AccountManagerOrgan, TransactionEngineOrgan, ComplianceMonitorOrgan, StatementGeneratorOrgan, InterestCalculatorOrgan
} from './types';

export class BankingSystem {
  private readonly systemId = SYSTEM_ID;
  private readonly version = SYSTEM_VERSION;
  private readonly config = NIGERIA_FIRST_CONFIG;
  private offlineQueue: OfflineQueueEntry[] = [];
  private isOnline: boolean = true;
  private lastSyncTimestamp: number = 0;

  // Organ references
  private accountmanagerOrgan: AccountManagerOrgan | null = null;
  private transactionengineOrgan: TransactionEngineOrgan | null = null;
  private compliancemonitorOrgan: ComplianceMonitorOrgan | null = null;
  private statementgeneratorOrgan: StatementGeneratorOrgan | null = null;
  private interestcalculatorOrgan: InterestCalculatorOrgan | null = null;

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
    if (this.accountmanagerOrgan) await this.accountmanagerOrgan.initialize();
    if (this.transactionengineOrgan) await this.transactionengineOrgan.initialize();
    if (this.compliancemonitorOrgan) await this.compliancemonitorOrgan.initialize();
    if (this.statementgeneratorOrgan) await this.statementgeneratorOrgan.initialize();
    if (this.interestcalculatorOrgan) await this.interestcalculatorOrgan.initialize();
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
      'accountmanager': this.accountmanagerOrgan,
      'transactionengine': this.transactionengineOrgan,
      'compliancemonitor': this.compliancemonitorOrgan,
      'statementgenerator': this.statementgeneratorOrgan,
      'interestcalculator': this.interestcalculatorOrgan,
    };

    const organ = organMap[organName.toLowerCase()];
    if (!organ) {
      throw new Error(`Unknown organ: ${organName} in system ${this.systemId}`);
    }

    return (organ as any).execute(command);
  }

  async getHealth(): Promise<Record<string, OrganHealth>> {
    const health: Record<string, OrganHealth> = {};
    if (this.accountmanagerOrgan) {
      health['accountmanager'] = await this.accountmanagerOrgan.getHealth();
    }
    if (this.transactionengineOrgan) {
      health['transactionengine'] = await this.transactionengineOrgan.getHealth();
    }
    if (this.compliancemonitorOrgan) {
      health['compliancemonitor'] = await this.compliancemonitorOrgan.getHealth();
    }
    if (this.statementgeneratorOrgan) {
      health['statementgenerator'] = await this.statementgeneratorOrgan.getHealth();
    }
    if (this.interestcalculatorOrgan) {
      health['interestcalculator'] = await this.interestcalculatorOrgan.getHealth();
    }
    return health;
  }

  getCapabilities(): SystemCapability[] {
    return [
      { name: 'Account lifecycle management', available: true, offlineSupport: true },
      { name: 'Real-time transaction processing', available: true, offlineSupport: true },
      { name: 'Regulatory compliance monitoring', available: true, offlineSupport: true },
      { name: 'Statement generation with Naira formatting', available: true, offlineSupport: true },
      { name: 'Interest calculation engine', available: true, offlineSupport: true },
    ];
  }

  getOfflineQueueStatus(): { pending: number; oldestEntry: number | null } {
    return {
      pending: this.offlineQueue.length,
      oldestEntry: this.offlineQueue.length > 0 ? this.offlineQueue[0].timestamp : null,
    };
  }
}
