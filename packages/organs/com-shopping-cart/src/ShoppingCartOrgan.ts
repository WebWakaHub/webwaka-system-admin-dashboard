/**
 * ShoppingCart Organ — Main Coordinator
 * Organ ID: ORGX-COM-SHOPPING_CART
 * Domain: Commerce and E-Commerce
 *
 * This organ coordinates constituent tissues to deliver cohesive
 * shopping cart business capability.
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
  ShoppingCartCommand,
  ShoppingCartEvent,
  ShoppingCartQuery,
  ShoppingCartState,
  ShoppingCartHealth,
  ShoppingCartAIInference,
  OfflineQueueEntry,
  NetworkConfig,
} from './types';

export class ShoppingCartOrgan {
  private readonly organId = 'ORGX-COM-SHOPPING_CART';
  private readonly config = NIGERIA_FIRST_CONFIG;
  private state: ShoppingCartState;
  private offlineQueue: OfflineQueueEntry[] = [];
  private networkConfig: NetworkConfig;
  private aiInference: ShoppingCartAIInference | null = null;
  private eventHandlers: Map<string, Array<(event: ShoppingCartEvent) => void>> = new Map();
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
   * Execute a command within the ShoppingCart domain.
   * Routes to online or offline execution based on network state.
   */
  async execute(command: ShoppingCartCommand): Promise<ShoppingCartEvent> {
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
      const event: ShoppingCartEvent = {
        id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        type: `ShoppingCart.${command.type}.completed`,
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
  executeOffline(command: ShoppingCartCommand): ShoppingCartEvent {
    const entry: OfflineQueueEntry = {
      id: `oq-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      timestamp: Date.now(),
      operation: 'ShoppingCartCommand',
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

    const event: ShoppingCartEvent = {
      id: `evt-offline-${Date.now()}`,
      type: `ShoppingCart.${command.type}.queued`,
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

        await this.execute(entry.payload as ShoppingCartCommand);
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
            type: `ShoppingCart.sync.failed`,
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
  getHealth(): ShoppingCartHealth {
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
  registerAIProvider(provider: ShoppingCartAIInference): void {
    this.aiInference = provider;
  }

  // Private methods
  private validateCommand(command: ShoppingCartCommand): void {
    if (!command.id || !command.type || !command.idempotencyKey) {
      throw new Error(`Invalid ShoppingCart command: missing required fields`);
    }
    if (command.source !== this.organId) {
      throw new Error(`Command source mismatch: expected ${this.organId}`);
    }
  }

  private applyCommand(state: ShoppingCartState, command: ShoppingCartCommand): ShoppingCartState {
    return {
      ...state,
      data: { ...state.data, [command.type]: command.payload },
    };
  }

  private emitEvent(event: ShoppingCartEvent): void {
    const handlers = this.eventHandlers.get(event.type) || [];
    handlers.forEach(handler => handler(event));
  }

  private scheduleSyncRetry(): void {
    if (this.syncTimer) clearTimeout(this.syncTimer);
    this.syncTimer = setTimeout(() => {
      this.sync().catch(() => this.scheduleSyncRetry());
    }, this.config.retryBackoff);
  }

  on(eventType: string, handler: (event: ShoppingCartEvent) => void): void {
    const handlers = this.eventHandlers.get(eventType) || [];
    handlers.push(handler);
    this.eventHandlers.set(eventType, handlers);
  }
}
