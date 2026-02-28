#!/usr/bin/env python3
"""
Create the webwaka-organelle-discovery-registry implementation repo with real TypeScript code.
"""
import os, subprocess

REPO = "webwaka-organelle-discovery-registry"
BASE = f"/home/ubuntu/impl-{REPO}"
SRC = f"{BASE}/src"
os.makedirs(SRC, exist_ok=True)

files = {}

files["package.json"] = """{
  "name": "@webwaka/organelle-discovery-registry",
  "version": "0.1.0",
  "description": "Discovery Registry Organelle — Service discovery and registration for the WebWaka Biological Architecture",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "lint": "eslint src/"
  },
  "keywords": ["webwaka", "organelle", "discovery", "registry", "service-discovery"],
  "license": "UNLICENSED",
  "private": true
}
"""

files["tsconfig.json"] = """{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
"""

files["README.md"] = """# @webwaka/organelle-discovery-registry

Discovery Registry Organelle for the WebWaka Biological Architecture.

## Purpose

Provides canonical service discovery and registration, enabling components to register
capabilities and endpoints, and allowing other components to discover services at runtime.

## Architecture

- **3-state lifecycle:** REGISTERED → EXPIRED → DEREGISTERED
- **Hexagonal ports:** Registration, Discovery (primary); Storage, Event, Observability (secondary)
- **Offline-first:** Local cache with read-only offline mode

## Category

Observability & Discovery (OD)
"""

files["src/types.ts"] = """/**
 * Discovery Registry Organelle — Type Definitions
 * Canonical types for service discovery and registration.
 */

// ─── Service Entry States ───────────────────────────────────────────────────

export enum ServiceState {
  REGISTERED = 'REGISTERED',
  EXPIRED = 'EXPIRED',
  DEREGISTERED = 'DEREGISTERED',
}

export enum HealthStatus {
  HEALTHY = 'HEALTHY',
  DEGRADED = 'DEGRADED',
  UNHEALTHY = 'UNHEALTHY',
  EXPIRED = 'EXPIRED',
}

// ─── Error Codes ────────────────────────────────────────────────────────────

export enum DiscoveryErrorCode {
  SERVICE_ALREADY_REGISTERED = 'DR-001',
  SERVICE_NOT_FOUND = 'DR-002',
  INVALID_CAPABILITY = 'DR-003',
  TTL_EXPIRED = 'DR-004',
  VERSION_INCOMPATIBLE = 'DR-005',
  SCOPE_VIOLATION = 'DR-006',
  REGISTRY_READONLY = 'DR-007',
  INVALID_HEARTBEAT = 'DR-008',
}

// ─── Event Types ────────────────────────────────────────────────────────────

export enum DiscoveryEventType {
  SERVICE_REGISTERED = 'discovery.service.registered',
  SERVICE_DEREGISTERED = 'discovery.service.deregistered',
  SERVICE_HEALTH_CHANGED = 'discovery.service.health_changed',
  VERSION_RESOLVED = 'discovery.version.resolved',
  CAPABILITY_INDEX_UPDATED = 'discovery.capability.index_updated',
}

// ─── Data Transfer Objects ──────────────────────────────────────────────────

export type EndpointProtocol = 'http' | 'https' | 'grpc' | 'ws';

export interface ServiceEndpoint {
  readonly protocol: EndpointProtocol;
  readonly host: string;
  readonly port: number;
  readonly path?: string;
}

export interface Capability {
  readonly capability_id: string;
  readonly capability_name: string;
  readonly version: string;
  readonly scope: string;
}

export interface RegisterServiceCommand {
  readonly service_name: string;
  readonly version: string;
  readonly capabilities: Capability[];
  readonly endpoint: ServiceEndpoint;
  readonly ttl_seconds: number;
  readonly metadata?: Record<string, string>;
  readonly region?: string;
  readonly zone?: string;
  readonly idempotency_key?: string;
}

export interface DeregisterServiceCommand {
  readonly service_id: string;
  readonly idempotency_key?: string;
}

export interface HeartbeatCommand {
  readonly service_id: string;
}

export interface DiscoveryQuery {
  readonly capability?: string;
  readonly service_name?: string;
  readonly version_range?: string;
  readonly region?: string;
  readonly zone?: string;
  readonly include_unhealthy?: boolean;
  readonly limit?: number;
}

export interface ResolveVersionQuery {
  readonly service_name: string;
  readonly version_range: string;
}

export interface GetServiceDetailsQuery {
  readonly service_id: string;
}

export interface ListCapabilitiesQuery {
  readonly scope?: string;
  readonly limit?: number;
}

export interface ServiceRegistrationResult {
  readonly service_id: string;
  readonly registered_at: number;
  readonly expires_at: number;
}

export interface ServiceDiscoveryResult {
  readonly services: ServiceEntrySnapshot[];
  readonly total: number;
}

export interface VersionResolutionResult {
  readonly service_id: string;
  readonly resolved_version: string;
  readonly endpoint: ServiceEndpoint;
}

export interface CapabilityListResult {
  readonly capabilities: CapabilitySummary[];
  readonly total: number;
}

export interface CapabilitySummary {
  readonly capability_id: string;
  readonly capability_name: string;
  readonly provider_count: number;
}

export interface ServiceEntrySnapshot {
  readonly service_id: string;
  readonly service_name: string;
  readonly version: string;
  readonly capabilities: Capability[];
  readonly endpoint: ServiceEndpoint;
  readonly state: ServiceState;
  readonly health_status: HealthStatus;
  readonly region?: string;
  readonly zone?: string;
  readonly registered_at: number;
  readonly expires_at: number;
}

export interface DiscoveryEvent {
  readonly event_type: DiscoveryEventType;
  readonly timestamp: number;
  readonly service_id: string;
  readonly payload: Record<string, unknown>;
}

// ─── Operational Constraints ────────────────────────────────────────────────

export const CONSTRAINTS = {
  MAX_CONCURRENT_REGISTRATIONS: 10_000,
  TTL_MIN_SECONDS: 30,
  TTL_MAX_SECONDS: 86_400,
  DISCOVERY_TIMEOUT_LOCAL_MS: 500,
  DISCOVERY_TIMEOUT_REMOTE_MS: 2_000,
  HEARTBEAT_MIN_INTERVAL_SECONDS: 10,
  CAPABILITY_INDEX_REBUILD_MAX_SECONDS: 5,
} as const;
"""

files["src/discovery-registry-entity.ts"] = """/**
 * Discovery Registry Organelle — Service Entry Entity
 * Domain model with state machine and invariant enforcement.
 */
import {
  ServiceState,
  HealthStatus,
  Capability,
  ServiceEndpoint,
  ServiceEntrySnapshot,
  DiscoveryErrorCode,
  CONSTRAINTS,
} from './types';

export class DiscoveryRegistryError extends Error {
  constructor(
    public readonly code: DiscoveryErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'DiscoveryRegistryError';
  }
}

export class ServiceEntry {
  private _state: ServiceState;
  private _health_status: HealthStatus;
  private _last_heartbeat_at: number;

  constructor(
    public readonly service_id: string,
    public readonly service_name: string,
    public readonly version: string,
    public readonly capabilities: ReadonlyArray<Capability>,
    public readonly endpoint: ServiceEndpoint,
    public readonly ttl_seconds: number,
    public readonly metadata: Record<string, string>,
    public readonly region: string | undefined,
    public readonly zone: string | undefined,
    public readonly registered_at: number,
    private _expires_at: number,
  ) {
    // INV-S01: Unique canonical ID enforced by caller (UUID v4)
    if (!service_id || service_id.trim().length === 0) {
      throw new DiscoveryRegistryError(
        DiscoveryErrorCode.SERVICE_NOT_FOUND,
        'Service ID must be a non-empty string',
      );
    }

    // INV-S02: At least one capability required
    if (!capabilities || capabilities.length === 0) {
      throw new DiscoveryRegistryError(
        DiscoveryErrorCode.INVALID_CAPABILITY,
        'At least one capability must be declared',
      );
    }

    // INV-S03: Validate capability schema
    for (const cap of capabilities) {
      if (!cap.capability_id || !cap.capability_name || !cap.version || !cap.scope) {
        throw new DiscoveryRegistryError(
          DiscoveryErrorCode.INVALID_CAPABILITY,
          `Capability ${cap.capability_id || 'unknown'} has incomplete schema`,
        );
      }
    }

    // Validate TTL constraints
    if (ttl_seconds < CONSTRAINTS.TTL_MIN_SECONDS || ttl_seconds > CONSTRAINTS.TTL_MAX_SECONDS) {
      throw new DiscoveryRegistryError(
        DiscoveryErrorCode.TTL_EXPIRED,
        `TTL must be between ${CONSTRAINTS.TTL_MIN_SECONDS} and ${CONSTRAINTS.TTL_MAX_SECONDS} seconds`,
      );
    }

    this._state = ServiceState.REGISTERED;
    this._health_status = HealthStatus.HEALTHY;
    this._last_heartbeat_at = registered_at;
  }

  get state(): ServiceState {
    return this._state;
  }

  get health_status(): HealthStatus {
    return this._health_status;
  }

  get expires_at(): number {
    return this._expires_at;
  }

  /**
   * Process a heartbeat — resets TTL and updates health status.
   * Guard: Service must be in REGISTERED state.
   */
  heartbeat(now: number): { old_status: HealthStatus; new_status: HealthStatus } {
    if (this._state !== ServiceState.REGISTERED) {
      throw new DiscoveryRegistryError(
        DiscoveryErrorCode.INVALID_HEARTBEAT,
        `Cannot heartbeat service in ${this._state} state`,
      );
    }

    const old_status = this._health_status;
    this._last_heartbeat_at = now;
    this._expires_at = now + this.ttl_seconds * 1000;
    this._health_status = HealthStatus.HEALTHY;

    return { old_status, new_status: this._health_status };
  }

  /**
   * Check and update health status based on current time.
   */
  evaluateHealth(now: number): { changed: boolean; old_status: HealthStatus; new_status: HealthStatus } {
    const old_status = this._health_status;

    if (this._state !== ServiceState.REGISTERED) {
      return { changed: false, old_status, new_status: old_status };
    }

    const elapsed = now - this._last_heartbeat_at;
    const ttl_ms = this.ttl_seconds * 1000;

    if (elapsed >= ttl_ms) {
      this._health_status = HealthStatus.EXPIRED;
    } else if (elapsed >= ttl_ms * 0.8) {
      this._health_status = HealthStatus.DEGRADED;
    } else if (elapsed >= ttl_ms * 0.5) {
      this._health_status = HealthStatus.UNHEALTHY;
    } else {
      this._health_status = HealthStatus.HEALTHY;
    }

    return { changed: old_status !== this._health_status, old_status, new_status: this._health_status };
  }

  /**
   * Transition to EXPIRED state when TTL lapses.
   * Guard: Service must be in REGISTERED state.
   * INV-B01: TTL expiry triggers automatic deregistration.
   */
  expire(): void {
    if (this._state !== ServiceState.REGISTERED) {
      return; // Idempotent — already expired or deregistered
    }
    this._state = ServiceState.EXPIRED;
    this._health_status = HealthStatus.EXPIRED;
  }

  /**
   * Re-register an expired service.
   * Guard: Service must be in EXPIRED state.
   */
  reRegister(now: number): void {
    if (this._state !== ServiceState.EXPIRED) {
      throw new DiscoveryRegistryError(
        DiscoveryErrorCode.SERVICE_ALREADY_REGISTERED,
        'Service must be in EXPIRED state to re-register',
      );
    }
    this._state = ServiceState.REGISTERED;
    this._health_status = HealthStatus.HEALTHY;
    this._last_heartbeat_at = now;
    this._expires_at = now + this.ttl_seconds * 1000;
  }

  /**
   * Deregister the service (terminal state).
   * Guard: Service must be in REGISTERED or EXPIRED state.
   * INV-B05: Deregistration is idempotent.
   */
  deregister(): void {
    if (this._state === ServiceState.DEREGISTERED) {
      return; // INV-B05: Idempotent
    }
    this._state = ServiceState.DEREGISTERED;
  }

  /**
   * Check if a capability is within the declared scope.
   * INV-S04: Scope boundary enforcement.
   */
  hasCapabilityInScope(capabilityId: string, scope: string): boolean {
    return this.capabilities.some(
      (c) => c.capability_id === capabilityId && c.scope === scope,
    );
  }

  /**
   * Create an immutable snapshot for external consumption.
   */
  toSnapshot(): ServiceEntrySnapshot {
    return {
      service_id: this.service_id,
      service_name: this.service_name,
      version: this.version,
      capabilities: [...this.capabilities],
      endpoint: { ...this.endpoint },
      state: this._state,
      health_status: this._health_status,
      region: this.region,
      zone: this.zone,
      registered_at: this.registered_at,
      expires_at: this._expires_at,
    };
  }
}
"""

files["src/state-machine.ts"] = """/**
 * Discovery Registry Organelle — State Machine
 * Formal 3-state lifecycle FSM for service entries.
 */
import { ServiceState } from './types';

export interface Transition {
  readonly from: ServiceState;
  readonly to: ServiceState;
  readonly trigger: string;
}

const VALID_TRANSITIONS: ReadonlyArray<Transition> = [
  { from: ServiceState.REGISTERED, to: ServiceState.REGISTERED, trigger: 'heartbeat' },
  { from: ServiceState.REGISTERED, to: ServiceState.EXPIRED, trigger: 'ttl_expired' },
  { from: ServiceState.REGISTERED, to: ServiceState.DEREGISTERED, trigger: 'deregister' },
  { from: ServiceState.EXPIRED, to: ServiceState.REGISTERED, trigger: 're_register' },
  { from: ServiceState.EXPIRED, to: ServiceState.DEREGISTERED, trigger: 'deregister' },
];

export class ServiceStateMachine {
  private _currentState: ServiceState;

  constructor(initialState: ServiceState = ServiceState.REGISTERED) {
    this._currentState = initialState;
  }

  get currentState(): ServiceState {
    return this._currentState;
  }

  canTransition(trigger: string): boolean {
    return VALID_TRANSITIONS.some(
      (t) => t.from === this._currentState && t.trigger === trigger,
    );
  }

  transition(trigger: string): ServiceState {
    const valid = VALID_TRANSITIONS.find(
      (t) => t.from === this._currentState && t.trigger === trigger,
    );

    if (!valid) {
      throw new Error(
        `Invalid transition: ${trigger} from state ${this._currentState}`,
      );
    }

    this._currentState = valid.to;
    return this._currentState;
  }

  isTerminal(): boolean {
    return this._currentState === ServiceState.DEREGISTERED;
  }

  static getValidTransitions(): ReadonlyArray<Transition> {
    return VALID_TRANSITIONS;
  }
}
"""

files["src/storage-interface.ts"] = """/**
 * Discovery Registry Organelle — Storage Port Interface
 * Secondary port for persistence (hexagonal architecture).
 */
import { ServiceEntry } from './discovery-registry-entity';
import { DiscoveryQuery, ServiceEntrySnapshot } from './types';

export interface IDiscoveryStoragePort {
  /** Persist a service entry */
  save(entry: ServiceEntry): Promise<void>;

  /** Find a service by its canonical ID */
  findById(serviceId: string): Promise<ServiceEntry | null>;

  /** Find services that provide a specific capability */
  findByCapability(capabilityId: string): Promise<ServiceEntry[]>;

  /** Find services matching a discovery query */
  findByQuery(query: DiscoveryQuery): Promise<ServiceEntry[]>;

  /** Delete a service entry by ID */
  delete(serviceId: string): Promise<void>;

  /** Sweep and return all entries whose TTL has expired */
  sweepExpired(currentTime: number): Promise<ServiceEntry[]>;

  /** Count total registered services */
  count(): Promise<number>;

  /** Check if a service ID already exists */
  exists(serviceId: string): Promise<boolean>;
}
"""

files["src/event-interface.ts"] = """/**
 * Discovery Registry Organelle — Event Port Interface
 * Secondary port for lifecycle event emission.
 * INV-B03: All state mutations MUST emit corresponding lifecycle events.
 */
import { DiscoveryEvent } from './types';

export interface IDiscoveryEventPort {
  /** Emit a single lifecycle event */
  emit(event: DiscoveryEvent): Promise<void>;

  /** Emit a batch of lifecycle events atomically */
  emitBatch(events: DiscoveryEvent[]): Promise<void>;
}
"""

files["src/observability-interface.ts"] = """/**
 * Discovery Registry Organelle — Observability Port Interface
 * Secondary port for metrics, traces, and structured logging.
 */

export interface MetricEntry {
  readonly name: string;
  readonly value: number;
  readonly labels?: Record<string, string>;
  readonly timestamp: number;
}

export interface TraceSpan {
  readonly operation: string;
  readonly duration_ms: number;
  readonly status: 'ok' | 'error';
  readonly attributes?: Record<string, string>;
  readonly timestamp: number;
}

export interface LogEntry {
  readonly level: 'debug' | 'info' | 'warn' | 'error';
  readonly message: string;
  readonly context?: Record<string, unknown>;
  readonly timestamp: number;
}

export interface IDiscoveryObservabilityPort {
  /** Record a metric data point */
  recordMetric(metric: MetricEntry): void;

  /** Record a trace span */
  recordTrace(span: TraceSpan): void;

  /** Record a structured log entry */
  recordLog(entry: LogEntry): void;
}
"""

files["src/discovery-registry-orchestrator.ts"] = """/**
 * Discovery Registry Organelle — Main Orchestrator
 * Implements primary ports (Registration, Discovery) using secondary ports.
 */
import { randomUUID } from 'crypto';
import {
  RegisterServiceCommand,
  DeregisterServiceCommand,
  HeartbeatCommand,
  DiscoveryQuery,
  ResolveVersionQuery,
  GetServiceDetailsQuery,
  ListCapabilitiesQuery,
  ServiceRegistrationResult,
  ServiceDiscoveryResult,
  VersionResolutionResult,
  CapabilityListResult,
  DiscoveryEventType,
  DiscoveryErrorCode,
  HealthStatus,
  CONSTRAINTS,
} from './types';
import { ServiceEntry, DiscoveryRegistryError } from './discovery-registry-entity';
import { IDiscoveryStoragePort } from './storage-interface';
import { IDiscoveryEventPort } from './event-interface';
import { IDiscoveryObservabilityPort } from './observability-interface';

export interface IDiscoveryRegistry {
  registerService(cmd: RegisterServiceCommand): Promise<ServiceRegistrationResult>;
  deregisterService(cmd: DeregisterServiceCommand): Promise<void>;
  renewHeartbeat(cmd: HeartbeatCommand): Promise<void>;
  discoverServices(query: DiscoveryQuery): Promise<ServiceDiscoveryResult>;
  resolveVersion(query: ResolveVersionQuery): Promise<VersionResolutionResult>;
  getServiceDetails(query: GetServiceDetailsQuery): Promise<ServiceEntry>;
  listCapabilities(query: ListCapabilitiesQuery): Promise<CapabilityListResult>;
  sweepExpired(): Promise<number>;
}

export class DiscoveryRegistryOrchestrator implements IDiscoveryRegistry {
  private _offline_mode = false;

  constructor(
    private readonly storage: IDiscoveryStoragePort,
    private readonly events: IDiscoveryEventPort,
    private readonly observability: IDiscoveryObservabilityPort,
  ) {}

  async registerService(cmd: RegisterServiceCommand): Promise<ServiceRegistrationResult> {
    if (this._offline_mode) {
      throw new DiscoveryRegistryError(DiscoveryErrorCode.REGISTRY_READONLY, 'Registry is in offline read-only mode');
    }

    const start = Date.now();

    // Check capacity constraint
    const currentCount = await this.storage.count();
    if (currentCount >= CONSTRAINTS.MAX_CONCURRENT_REGISTRATIONS) {
      throw new DiscoveryRegistryError(DiscoveryErrorCode.SERVICE_ALREADY_REGISTERED, 'Registry capacity exceeded');
    }

    const now = Date.now();
    const service_id = randomUUID();
    const expires_at = now + cmd.ttl_seconds * 1000;

    // Create entity — constructor enforces INV-S01, INV-S02, INV-S03
    const entry = new ServiceEntry(
      service_id,
      cmd.service_name,
      cmd.version,
      cmd.capabilities,
      cmd.endpoint,
      cmd.ttl_seconds,
      cmd.metadata ?? {},
      cmd.region,
      cmd.zone,
      now,
      expires_at,
    );

    // INV-S04: Scope boundary check
    const scopes = new Set(cmd.capabilities.map((c) => c.scope));
    if (scopes.size > 1) {
      this.observability.recordLog({
        level: 'warn',
        message: `Service ${cmd.service_name} declares capabilities across ${scopes.size} scopes`,
        context: { scopes: [...scopes] },
        timestamp: now,
      });
    }

    await this.storage.save(entry);

    // INV-B03: Emit lifecycle event
    await this.events.emit({
      event_type: DiscoveryEventType.SERVICE_REGISTERED,
      timestamp: now,
      service_id,
      payload: {
        service_name: cmd.service_name,
        version: cmd.version,
        capabilities: cmd.capabilities.map((c) => c.capability_id),
        endpoint: cmd.endpoint,
      },
    });

    // Emit capability index update events
    for (const cap of cmd.capabilities) {
      await this.events.emit({
        event_type: DiscoveryEventType.CAPABILITY_INDEX_UPDATED,
        timestamp: now,
        service_id,
        payload: { capability_id: cap.capability_id, action: 'added' },
      });
    }

    this.observability.recordMetric({
      name: 'discovery.registration.count',
      value: 1,
      labels: { service_name: cmd.service_name },
      timestamp: now,
    });

    this.observability.recordTrace({
      operation: 'registerService',
      duration_ms: Date.now() - start,
      status: 'ok',
      timestamp: now,
    });

    return { service_id, registered_at: now, expires_at };
  }

  async deregisterService(cmd: DeregisterServiceCommand): Promise<void> {
    if (this._offline_mode) {
      throw new DiscoveryRegistryError(DiscoveryErrorCode.REGISTRY_READONLY, 'Registry is in offline read-only mode');
    }

    const entry = await this.storage.findById(cmd.service_id);

    // INV-B05: Idempotent deregistration
    if (!entry) {
      return;
    }

    entry.deregister();
    await this.storage.delete(cmd.service_id);

    await this.events.emit({
      event_type: DiscoveryEventType.SERVICE_DEREGISTERED,
      timestamp: Date.now(),
      service_id: cmd.service_id,
      payload: { reason: 'explicit_deregistration' },
    });

    for (const cap of entry.capabilities) {
      await this.events.emit({
        event_type: DiscoveryEventType.CAPABILITY_INDEX_UPDATED,
        timestamp: Date.now(),
        service_id: cmd.service_id,
        payload: { capability_id: cap.capability_id, action: 'removed' },
      });
    }
  }

  async renewHeartbeat(cmd: HeartbeatCommand): Promise<void> {
    if (this._offline_mode) {
      throw new DiscoveryRegistryError(DiscoveryErrorCode.REGISTRY_READONLY, 'Registry is in offline read-only mode');
    }

    const entry = await this.storage.findById(cmd.service_id);
    if (!entry) {
      throw new DiscoveryRegistryError(DiscoveryErrorCode.INVALID_HEARTBEAT, 'Service not found');
    }

    const now = Date.now();
    const { old_status, new_status } = entry.heartbeat(now);

    await this.storage.save(entry);

    if (old_status !== new_status) {
      await this.events.emit({
        event_type: DiscoveryEventType.SERVICE_HEALTH_CHANGED,
        timestamp: now,
        service_id: cmd.service_id,
        payload: { old_status, new_status },
      });
    }
  }

  async discoverServices(query: DiscoveryQuery): Promise<ServiceDiscoveryResult> {
    const entries = await this.storage.findByQuery(query);

    // INV-B02: Filter to healthy services by default
    const filtered = query.include_unhealthy
      ? entries
      : entries.filter((e) => e.health_status === HealthStatus.HEALTHY);

    const limited = query.limit ? filtered.slice(0, query.limit) : filtered;

    return {
      services: limited.map((e) => e.toSnapshot()),
      total: filtered.length,
    };
  }

  async resolveVersion(query: ResolveVersionQuery): Promise<VersionResolutionResult> {
    const entries = await this.storage.findByQuery({
      service_name: query.service_name,
      version_range: query.version_range,
    });

    const healthy = entries.filter((e) => e.health_status === HealthStatus.HEALTHY);

    if (healthy.length === 0) {
      throw new DiscoveryRegistryError(
        DiscoveryErrorCode.VERSION_INCOMPATIBLE,
        `No healthy service found for ${query.service_name} matching ${query.version_range}`,
      );
    }

    // Return the highest matching version
    const sorted = healthy.sort((a, b) => b.version.localeCompare(a.version, undefined, { numeric: true }));
    const best = sorted[0];

    await this.events.emit({
      event_type: DiscoveryEventType.VERSION_RESOLVED,
      timestamp: Date.now(),
      service_id: best.service_id,
      payload: { resolved_version: best.version },
    });

    return {
      service_id: best.service_id,
      resolved_version: best.version,
      endpoint: best.endpoint,
    };
  }

  async getServiceDetails(query: GetServiceDetailsQuery): Promise<ServiceEntry> {
    const entry = await this.storage.findById(query.service_id);
    if (!entry) {
      throw new DiscoveryRegistryError(DiscoveryErrorCode.SERVICE_NOT_FOUND, 'Service not found');
    }
    return entry;
  }

  async listCapabilities(query: ListCapabilitiesQuery): Promise<CapabilityListResult> {
    const allEntries = await this.storage.findByQuery({});
    const capMap = new Map<string, { name: string; count: number }>();

    for (const entry of allEntries) {
      for (const cap of entry.capabilities) {
        if (query.scope && cap.scope !== query.scope) continue;
        const existing = capMap.get(cap.capability_id);
        if (existing) {
          existing.count++;
        } else {
          capMap.set(cap.capability_id, { name: cap.capability_name, count: 1 });
        }
      }
    }

    const capabilities = [...capMap.entries()].map(([id, info]) => ({
      capability_id: id,
      capability_name: info.name,
      provider_count: info.count,
    }));

    const limited = query.limit ? capabilities.slice(0, query.limit) : capabilities;

    return { capabilities: limited, total: capabilities.length };
  }

  /**
   * Sweep expired entries — INV-B01: TTL expiry triggers automatic deregistration.
   */
  async sweepExpired(): Promise<number> {
    const expired = await this.storage.sweepExpired(Date.now());

    for (const entry of expired) {
      entry.expire();
      await this.storage.delete(entry.service_id);

      await this.events.emit({
        event_type: DiscoveryEventType.SERVICE_DEREGISTERED,
        timestamp: Date.now(),
        service_id: entry.service_id,
        payload: { reason: 'ttl_expired' },
      });
    }

    if (expired.length > 0) {
      this.observability.recordMetric({
        name: 'discovery.sweep.expired_count',
        value: expired.length,
        timestamp: Date.now(),
      });
    }

    return expired.length;
  }

  /** Enter offline read-only mode — INV-S05 */
  setOfflineMode(offline: boolean): void {
    this._offline_mode = offline;
    this.observability.recordLog({
      level: 'info',
      message: `Registry offline mode: ${offline}`,
      timestamp: Date.now(),
    });
  }
}
"""

files["src/index.ts"] = """/**
 * @webwaka/organelle-discovery-registry
 * Public API surface for the Discovery Registry Organelle.
 */

// Types and enums
export {
  ServiceState,
  HealthStatus,
  DiscoveryErrorCode,
  DiscoveryEventType,
  CONSTRAINTS,
} from './types';

export type {
  ServiceEndpoint,
  Capability,
  RegisterServiceCommand,
  DeregisterServiceCommand,
  HeartbeatCommand,
  DiscoveryQuery,
  ResolveVersionQuery,
  GetServiceDetailsQuery,
  ListCapabilitiesQuery,
  ServiceRegistrationResult,
  ServiceDiscoveryResult,
  VersionResolutionResult,
  CapabilityListResult,
  CapabilitySummary,
  ServiceEntrySnapshot,
  DiscoveryEvent,
} from './types';

// Domain entities
export { ServiceEntry, DiscoveryRegistryError } from './discovery-registry-entity';

// State machine
export { ServiceStateMachine } from './state-machine';
export type { Transition } from './state-machine';

// Port interfaces
export type { IDiscoveryStoragePort } from './storage-interface';
export type { IDiscoveryEventPort } from './event-interface';
export type { IDiscoveryObservabilityPort, MetricEntry, TraceSpan, LogEntry } from './observability-interface';

// Orchestrator
export { DiscoveryRegistryOrchestrator } from './discovery-registry-orchestrator';
export type { IDiscoveryRegistry } from './discovery-registry-orchestrator';
"""

# Write all files
for rel_path, content in files.items():
    full_path = os.path.join(BASE, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w') as f:
        f.write(content)
    print(f"Written: {rel_path}")

print(f"\nTotal files: {len(files)}")
print(f"Directory: {BASE}")
