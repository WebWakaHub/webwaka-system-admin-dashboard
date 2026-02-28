// EnterprisePlatformSystem — System Coordinator
// System ID: SYS-ENT-ENTERPRISEPLATFORM
// Unique Hash: 424f19d8-entity

import {
  SYSTEM_ID, SYSTEM_VERSION, NIGERIA_FIRST_CONFIG,
  OfflineQueueEntry, NetworkConfig, OrganHealth, SystemCapability,
  WorkflowEngineOrgan, ResourcePlannerOrgan, OperationsManagerOrgan, TaskSchedulerOrgan, ApprovalEngineOrgan
} from './types';

export class EnterprisePlatformSystem {
  private readonly systemId = SYSTEM_ID;
  private readonly version = SYSTEM_VERSION;
  private readonly config = NIGERIA_FIRST_CONFIG;
  private offlineQueue: OfflineQueueEntry[] = [];
  private isOnline: boolean = true;
  private lastSyncTimestamp: number = 0;

  // Organ references
  private workflowengineOrgan: WorkflowEngineOrgan | null = null;
  private resourceplannerOrgan: ResourcePlannerOrgan | null = null;
  private operationsmanagerOrgan: OperationsManagerOrgan | null = null;
  private taskschedulerOrgan: TaskSchedulerOrgan | null = null;
  private approvalengineOrgan: ApprovalEngineOrgan | null = null;

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
    if (this.workflowengineOrgan) await this.workflowengineOrgan.initialize();
    if (this.resourceplannerOrgan) await this.resourceplannerOrgan.initialize();
    if (this.operationsmanagerOrgan) await this.operationsmanagerOrgan.initialize();
    if (this.taskschedulerOrgan) await this.taskschedulerOrgan.initialize();
    if (this.approvalengineOrgan) await this.approvalengineOrgan.initialize();
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
      'workflowengine': this.workflowengineOrgan,
      'resourceplanner': this.resourceplannerOrgan,
      'operationsmanager': this.operationsmanagerOrgan,
      'taskscheduler': this.taskschedulerOrgan,
      'approvalengine': this.approvalengineOrgan,
    };

    const organ = organMap[organName.toLowerCase()];
    if (!organ) {
      throw new Error(`Unknown organ: ${organName} in system ${this.systemId}`);
    }

    return (organ as any).execute(command);
  }

  async getHealth(): Promise<Record<string, OrganHealth>> {
    const health: Record<string, OrganHealth> = {};
    if (this.workflowengineOrgan) {
      health['workflowengine'] = await this.workflowengineOrgan.getHealth();
    }
    if (this.resourceplannerOrgan) {
      health['resourceplanner'] = await this.resourceplannerOrgan.getHealth();
    }
    if (this.operationsmanagerOrgan) {
      health['operationsmanager'] = await this.operationsmanagerOrgan.getHealth();
    }
    if (this.taskschedulerOrgan) {
      health['taskscheduler'] = await this.taskschedulerOrgan.getHealth();
    }
    if (this.approvalengineOrgan) {
      health['approvalengine'] = await this.approvalengineOrgan.getHealth();
    }
    return health;
  }

  getCapabilities(): SystemCapability[] {
    return [
      { name: 'Business process automation', available: true, offlineSupport: true },
      { name: 'Resource allocation optimization', available: true, offlineSupport: true },
      { name: 'Operations monitoring dashboard', available: true, offlineSupport: true },
      { name: 'Task scheduling with dependencies', available: true, offlineSupport: true },
      { name: 'Multi-level approval workflows', available: true, offlineSupport: true },
    ];
  }

  getOfflineQueueStatus(): { pending: number; oldestEntry: number | null } {
    return {
      pending: this.offlineQueue.length,
      oldestEntry: this.offlineQueue.length > 0 ? this.offlineQueue[0].timestamp : null,
    };
  }
}
