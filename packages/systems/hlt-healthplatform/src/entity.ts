// HealthPlatformSystem — System Coordinator
// System ID: SYS-HLT-HEALTHPLATFORM
// Unique Hash: c8a9bb24-entity

import {
  SYSTEM_ID, SYSTEM_VERSION, NIGERIA_FIRST_CONFIG,
  OfflineQueueEntry, NetworkConfig, OrganHealth, SystemCapability,
  PatientRegistryOrgan, ClinicalRecordOrgan, AppointmentSchedulerOrgan, PrescriptionManagerOrgan, HealthAnalyticsOrgan
} from './types';

export class HealthPlatformSystem {
  private readonly systemId = SYSTEM_ID;
  private readonly version = SYSTEM_VERSION;
  private readonly config = NIGERIA_FIRST_CONFIG;
  private offlineQueue: OfflineQueueEntry[] = [];
  private isOnline: boolean = true;
  private lastSyncTimestamp: number = 0;

  // Organ references
  private patientregistryOrgan: PatientRegistryOrgan | null = null;
  private clinicalrecordOrgan: ClinicalRecordOrgan | null = null;
  private appointmentschedulerOrgan: AppointmentSchedulerOrgan | null = null;
  private prescriptionmanagerOrgan: PrescriptionManagerOrgan | null = null;
  private healthanalyticsOrgan: HealthAnalyticsOrgan | null = null;

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
    if (this.patientregistryOrgan) await this.patientregistryOrgan.initialize();
    if (this.clinicalrecordOrgan) await this.clinicalrecordOrgan.initialize();
    if (this.appointmentschedulerOrgan) await this.appointmentschedulerOrgan.initialize();
    if (this.prescriptionmanagerOrgan) await this.prescriptionmanagerOrgan.initialize();
    if (this.healthanalyticsOrgan) await this.healthanalyticsOrgan.initialize();
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
      'patientregistry': this.patientregistryOrgan,
      'clinicalrecord': this.clinicalrecordOrgan,
      'appointmentscheduler': this.appointmentschedulerOrgan,
      'prescriptionmanager': this.prescriptionmanagerOrgan,
      'healthanalytics': this.healthanalyticsOrgan,
    };

    const organ = organMap[organName.toLowerCase()];
    if (!organ) {
      throw new Error(`Unknown organ: ${organName} in system ${this.systemId}`);
    }

    return (organ as any).execute(command);
  }

  async getHealth(): Promise<Record<string, OrganHealth>> {
    const health: Record<string, OrganHealth> = {};
    if (this.patientregistryOrgan) {
      health['patientregistry'] = await this.patientregistryOrgan.getHealth();
    }
    if (this.clinicalrecordOrgan) {
      health['clinicalrecord'] = await this.clinicalrecordOrgan.getHealth();
    }
    if (this.appointmentschedulerOrgan) {
      health['appointmentscheduler'] = await this.appointmentschedulerOrgan.getHealth();
    }
    if (this.prescriptionmanagerOrgan) {
      health['prescriptionmanager'] = await this.prescriptionmanagerOrgan.getHealth();
    }
    if (this.healthanalyticsOrgan) {
      health['healthanalytics'] = await this.healthanalyticsOrgan.getHealth();
    }
    return health;
  }

  getCapabilities(): SystemCapability[] {
    return [
      { name: 'Patient registration and management', available: true, offlineSupport: true },
      { name: 'Electronic health record management', available: true, offlineSupport: true },
      { name: 'Appointment scheduling with SMS reminders', available: true, offlineSupport: true },
      { name: 'Prescription tracking', available: true, offlineSupport: true },
      { name: 'Health outcome analytics', available: true, offlineSupport: true },
    ];
  }

  getOfflineQueueStatus(): { pending: number; oldestEntry: number | null } {
    return {
      pending: this.offlineQueue.length,
      oldestEntry: this.offlineQueue.length > 0 ? this.offlineQueue[0].timestamp : null,
    };
  }
}
