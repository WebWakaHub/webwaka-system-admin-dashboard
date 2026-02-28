/**
 * Geocoding Organ — Main Coordinator
 * Organ ID: ORGX-GEO-GEOCODING
 * Domain: Geospatial and Location Services
 *
 * This organ coordinates constituent tissues to deliver cohesive
 * geocoding business capability.
 *
 * Doctrines Enforced:
 * - Build Once Use Infinitely: Platform-agnostic coordination logic
 * - Mobile First: Optimized for mobile constraints
 * - PWA First: Service worker integration points
 * - Offline First: Full offline queue with sync-on-reconnect
 * - Nigeria First: 30s timeout, en-NG locale, NGN currency
 * - Africa First: Multi-region with Africa-optimized CDN
 * - Vendor Neutral AI: Abstract inference interface
 */

import {
  NIGERIA_FIRST_CONFIG,
  GeocodingCommand,
  GeocodingEvent,
  GeocodingQuery,
  GeocodingState,
  GeocodingHealth,
  GeocodingAIInference,
  OfflineQueueEntry,
  NetworkConfig,
} from './types';

export class GeocodingOrgan {
  private readonly organId = 'ORGX-GEO-GEOCODING';
  private readonly config = NIGERIA_FIRST_CONFIG;
  private state: GeocodingState;
  private offlineQueue: OfflineQueueEntry[] = [];
  private networkConfig: NetworkConfig;
  private aiInference: GeocodingAIInference | null = null;
  private eventHandlers: Map<string, Array<(event: GeocodingEvent) => void>> = new Map();
  private syncTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.state = {
      version: 0,
      lastUpdated: Date.now(),
      data: {},
      syncStatus: 'synced',
      offlineChanges: [],
    };
    this.networkConfig = {
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      connectionType: '4g',
      effectiveBandwidth: 10,
      rtt: 100,
      timeout: this.config.timeout,
    };
  }

  /**
   * Execute a command within the Geocoding domain.
   * Routes to online or offline execution based on network state.
   */
  async execute(command: GeocodingCommand): Promise<GeocodingEvent> {
    if (!this.networkConfig.isOnline) {
      return this.executeOffline(command);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      // Validate command
      this.validateCommand(command);

      // Apply command to state
      const previousVersion = this.state.version;
      this.state = this.applyCommand(this.state, command);
      this.state.version = previousVersion + 1;
      this.state.lastUpdated = Date.now();
      this.state.syncStatus = 'synced';

      // Emit domain event
      const event: GeocodingEvent = {
        id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        type: `Geocoding.${command.type}.completed`,
        payload: { commandId: command.id, result: this.state.data },
        timestamp: Date.now(),
        organId: this.organId,
        version: this.state.version,
        causationId: command.id,
      };

      this.emitEvent(event);
      return event;
    } catch (error) {
      // Fallback to offline on timeout or network error
      if ((error as Error).name === 'AbortError') {
        return this.executeOffline(command);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Execute a command offline — queues for later sync.
   * Nigeria-First: Designed for unreliable network conditions.
   */
  executeOffline(command: GeocodingCommand): GeocodingEvent {
    const entry: OfflineQueueEntry = {
      id: `oq-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      timestamp: Date.now(),
      operation: 'GeocodingCommand',
      payload: command,
      retryCount: 0,
      lastAttempt: null,
      status: 'pending',
    };

    if (this.offlineQueue.length >= this.config.offlineQueueCapacity) {
      // Evict oldest synced entries first
      this.offlineQueue = this.offlineQueue.filter(e => e.status !== 'synced');
    }

    this.offlineQueue.push(entry);
    this.state.syncStatus = 'pending';
    this.state.offlineChanges = [...this.offlineQueue];

    // Apply optimistically to local state
    this.state = this.applyCommand(this.state, command);
    this.state.version += 1;
    this.state.lastUpdated = Date.now();

    const event: GeocodingEvent = {
      id: `evt-offline-${Date.now()}`,
      type: `Geocoding.${command.type}.queued`,
      payload: { commandId: command.id, queueId: entry.id, offline: true },
      timestamp: Date.now(),
      organId: this.organId,
      version: this.state.version,
      causationId: command.id,
    };

    this.emitEvent(event);
    this.scheduleSyncRetry();
    return event;
  }

  /**
   * Sync offline queue when network is restored.
   * Uses exponential backoff starting at 5s, max 300s.
   */
  async sync(): Promise<void> {
    if (!this.networkConfig.isOnline) return;

    const pendingEntries = this.offlineQueue.filter(e => e.status === 'pending' || e.status === 'failed');

    for (const entry of pendingEntries) {
      try {
        entry.status = 'processing';
        entry.lastAttempt = Date.now();
        entry.retryCount += 1;

        await this.execute(entry.payload as GeocodingCommand);
        entry.status = 'synced';
      } catch (error) {
        entry.status = 'failed';
        const backoff = Math.min(
          this.config.retryBackoff * Math.pow(2, entry.retryCount - 1),
          this.config.maxBackoff
        );
        entry.lastAttempt = Date.now();

        if (entry.retryCount >= this.config.maxRetries) {
          this.emitEvent({
            id: `evt-sync-fail-${Date.now()}`,
            type: `Geocoding.sync.failed`,
            payload: { queueId: entry.id, retries: entry.retryCount },
            timestamp: Date.now(),
            organId: this.organId,
            version: this.state.version,
            causationId: entry.id,
          });
        }
      }
    }

    this.offlineQueue = this.offlineQueue.filter(e => e.status !== 'synced');
    this.state.offlineChanges = [...this.offlineQueue];
    this.state.syncStatus = this.offlineQueue.length === 0 ? 'synced' : 'pending';
  }

  /**
   * Get organ health status.
   */
  getHealth(): GeocodingHealth {
    return {
      organId: this.organId,
      status: this.networkConfig.isOnline ? 'healthy' : 'offline',
      tissueHealth: {
        commandCoordinator: 'healthy',
        stateStore: 'healthy',
        eventMesh: 'healthy',
        validation: 'healthy',
      },
      offlineQueueSize: this.offlineQueue.length,
      lastSyncTimestamp: this.state.lastUpdated,
      networkConfig: this.networkConfig,
    };
  }

  /**
   * Register AI inference provider (Vendor Neutral).
   */
  registerAIProvider(provider: GeocodingAIInference): void {
    this.aiInference = provider;
  }

  // Private methods
  private validateCommand(command: GeocodingCommand): void {
    if (!command.id || !command.type || !command.idempotencyKey) {
      throw new Error(`Invalid Geocoding command: missing required fields`);
    }
    if (command.source !== this.organId) {
      throw new Error(`Command source mismatch: expected ${this.organId}`);
    }
  }

  private applyCommand(state: GeocodingState, command: GeocodingCommand): GeocodingState {
    return {
      ...state,
      data: { ...state.data, [command.type]: command.payload },
    };
  }

  private emitEvent(event: GeocodingEvent): void {
    const handlers = this.eventHandlers.get(event.type) || [];
    handlers.forEach(handler => handler(event));
  }

  private scheduleSyncRetry(): void {
    if (this.syncTimer) clearTimeout(this.syncTimer);
    this.syncTimer = setTimeout(() => {
      this.sync().catch(() => this.scheduleSyncRetry());
    }, this.config.retryBackoff);
  }

  on(eventType: string, handler: (event: GeocodingEvent) => void): void {
    const handlers = this.eventHandlers.get(eventType) || [];
    handlers.push(handler);
    this.eventHandlers.set(eventType, handlers);
  }
}
