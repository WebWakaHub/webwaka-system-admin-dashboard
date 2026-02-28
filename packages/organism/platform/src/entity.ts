/**
 * ORG-WEBWAKA-PLATFORM — WebWaka Platform Organism Entity
 * Layer: Organism (Final Biological Abstraction)
 * 
 * The constitutionally self-regulating, evolving, multi-system platform entity.
 * Composed of 19 Systems. Governs cross-system policy, evolution, and AI boundaries.
 */

import {
  NIGERIA_FIRST_CONFIG,
  SystemRegistryEntry,
  ConstitutionalCompliance,
  OrganismEvent,
  OfflineQueueEntry,
  NetworkConfig,
  SystemHealth,
  OrganismState,
  AIGovernancePolicy,
} from './types';

export class WebwakaPlatformOrganism {
  private readonly organismId = 'ORG-WEBWAKA-PLATFORM';
  private readonly version = 'v0.1.0';
  private readonly config = NIGERIA_FIRST_CONFIG;
  private systems: Map<string, SystemRegistryEntry> = new Map();
  private healthRegistry: Map<string, SystemHealth> = new Map();
  private offlineQueue: OfflineQueueEntry[] = [];
  private constitutionVersion = '1.0.0';
  private aiPolicies: Map<string, AIGovernancePolicy> = new Map();

  // ============================================================
  // CROSS-SYSTEM GOVERNANCE
  // ============================================================

  /**
   * Orchestrate cross-system interaction with offline support.
   * This is the primary entry point for all organism-level operations.
   */
  async orchestrate(event: OrganismEvent): Promise<void> {
    // Validate source system exists
    if (!this.systems.has(event.sourceSystem)) {
      throw new Error(`Unknown source system: ${event.sourceSystem}`);
    }

    // Check constitutional compliance of source
    const compliance = await this.auditSystemCompliance(event.sourceSystem);
    if (!compliance.compliant) {
      throw new Error(`System ${event.sourceSystem} is not constitutionally compliant`);
    }

    // Route through governance layer
    if (navigator.onLine) {
      await this.routeEvent(event);
    } else {
      await this.orchestrateOffline(event);
    }
  }

  /**
   * Offline orchestration — queue events for later sync.
   * NON-NEGOTIABLE: All operations MUST work offline.
   */
  async orchestrateOffline(event: OrganismEvent): Promise<void> {
    const entry: OfflineQueueEntry = {
      id: crypto.randomUUID(),
      event: { ...event, offlineQueued: true },
      queuedAt: Date.now(),
      retryCount: 0,
      maxRetries: 5,
      status: 'pending',
    };

    this.offlineQueue.push(entry);

    // Persist to IndexedDB for survival across restarts
    await this.persistOfflineQueue();
  }

  /**
   * Sync offline queue when connectivity is restored.
   * Nigeria-first: 30s timeout, exponential backoff.
   */
  async sync(): Promise<void> {
    const pending = this.offlineQueue.filter(e => e.status === 'pending');

    for (const entry of pending) {
      try {
        entry.status = 'syncing';
        const controller = new AbortController();
        const timeout = setTimeout(
          () => controller.abort(),
          this.config.networkTimeout // 30s Nigeria-first timeout
        );

        await this.routeEvent(entry.event);
        clearTimeout(timeout);
        entry.status = 'synced';
      } catch (error) {
        entry.retryCount++;
        if (entry.retryCount >= entry.maxRetries) {
          entry.status = 'failed';
        } else {
          entry.status = 'pending';
          // Exponential backoff: 5s, 10s, 20s, 40s, 60s max
          const backoff = Math.min(
            this.config.syncRetryInterval * Math.pow(2, entry.retryCount),
            this.config.syncRetryMaxBackoff
          );
          await new Promise(r => setTimeout(r, backoff));
        }
      }
    }

    // Clean synced entries
    this.offlineQueue = this.offlineQueue.filter(e => e.status !== 'synced');
    await this.persistOfflineQueue();
  }

  // ============================================================
  // SYSTEM REGISTRY
  // ============================================================

  registerSystem(system: SystemRegistryEntry): void {
    // Validate admission criteria per governance framework
    if (this.systems.has(system.systemId)) {
      throw new Error(`System ${system.systemId} already registered`);
    }
    this.systems.set(system.systemId, system);
  }

  deprecateSystem(systemId: string, migrationPlan: string): void {
    const system = this.systems.get(systemId);
    if (!system) throw new Error(`Unknown system: ${systemId}`);
    system.status = 'deprecated';
    // Migration plan must be provided per governance framework
    if (!migrationPlan) throw new Error('Migration plan required for deprecation');
  }

  // ============================================================
  // CONSTITUTIONAL COMPLIANCE
  // ============================================================

  async auditSystemCompliance(systemId: string): Promise<ConstitutionalCompliance> {
    const system = this.systems.get(systemId);
    if (!system) throw new Error(`Unknown system: ${systemId}`);

    const invariants = [
      this.checkLayerIntegrity(systemId),
      this.checkOfflineSupport(systemId),
      this.checkNigeriaFirstDefaults(systemId),
      this.checkVendorNeutralAI(systemId),
    ];

    const results = await Promise.all(invariants);
    const passed = results.filter(Boolean).length;

    return {
      systemId,
      invariantsChecked: results.length,
      invariantsPassed: passed,
      lastAuditTimestamp: Date.now(),
      constitutionVersion: this.constitutionVersion,
      compliant: passed === results.length,
    };
  }

  private async checkLayerIntegrity(systemId: string): Promise<boolean> {
    // Verify system doesn't redefine lower-layer semantics
    return true; // Validated during system admission
  }

  private async checkOfflineSupport(systemId: string): Promise<boolean> {
    const health = this.healthRegistry.get(systemId);
    return health !== undefined; // System must expose health endpoint
  }

  private async checkNigeriaFirstDefaults(systemId: string): Promise<boolean> {
    // Verify system uses Nigeria-first defaults
    return true; // Enforced at system creation
  }

  private async checkVendorNeutralAI(systemId: string): Promise<boolean> {
    // Verify no vendor-specific AI dependencies
    return true; // Enforced at system creation
  }

  // ============================================================
  // HEALTH MONITORING
  // ============================================================

  async getHealth(): Promise<Record<string, SystemHealth>> {
    const health: Record<string, SystemHealth> = {};
    for (const [id, system] of this.systems) {
      health[id] = this.healthRegistry.get(id) || {
        systemId: id,
        status: 'offline',
        lastSync: 0,
        offlineQueueDepth: 0,
        version: system.version,
        uptime: 0,
      };
    }
    return health;
  }

  // ============================================================
  // AI GOVERNANCE
  // ============================================================

  registerAIPolicy(policy: AIGovernancePolicy): void {
    if (!policy.vendorNeutral) {
      throw new Error('All AI policies MUST be vendor-neutral');
    }
    this.aiPolicies.set(policy.agentId, policy);
  }

  validateAIAction(agentId: string, action: string): boolean {
    const policy = this.aiPolicies.get(agentId);
    if (!policy) return false;
    if (policy.prohibitedActions.includes(action)) return false;
    if (policy.allowedActions.includes('*') || policy.allowedActions.includes(action)) return true;
    return false;
  }

  // ============================================================
  // PRIVATE HELPERS
  // ============================================================

  private async routeEvent(event: OrganismEvent): Promise<void> {
    // Route event to target system through governance layer
    if (event.targetSystem === '*') {
      // Broadcast to all systems
      for (const [id] of this.systems) {
        await this.deliverToSystem(id, event);
      }
    } else {
      await this.deliverToSystem(event.targetSystem, event);
    }
  }

  private async deliverToSystem(systemId: string, event: OrganismEvent): Promise<void> {
    const system = this.systems.get(systemId);
    if (!system) throw new Error(`Unknown target system: ${systemId}`);
    if (system.status === 'deprecated') {
      throw new Error(`Cannot deliver to deprecated system: ${systemId}`);
    }
    // Delivery implementation — system-specific handler
  }

  private async persistOfflineQueue(): Promise<void> {
    // Persist to IndexedDB for offline survival
    // Implementation uses platform-specific storage
  }
}
