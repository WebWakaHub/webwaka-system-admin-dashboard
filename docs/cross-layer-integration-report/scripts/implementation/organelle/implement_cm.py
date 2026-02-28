#!/usr/bin/env python3
"""Create the webwaka-organelle-composition-modeler implementation repo with real TypeScript code."""
import os

BASE = "/home/ubuntu/impl-webwaka-organelle-composition-modeler"
SRC = f"{BASE}/src"
os.makedirs(SRC, exist_ok=True)

files = {}

files["package.json"] = '{\n  "name": "@webwaka/organelle-composition-modeler",\n  "version": "0.1.0",\n  "description": "Composition Modeler Organelle — Declarative composition of organelles into cells",\n  "main": "dist/index.js",\n  "types": "dist/index.d.ts",\n  "scripts": { "build": "tsc", "test": "jest", "lint": "eslint src/" },\n  "license": "UNLICENSED",\n  "private": true\n}\n'

files["tsconfig.json"] = '{\n  "compilerOptions": {\n    "target": "ES2022", "module": "commonjs", "lib": ["ES2022"],\n    "outDir": "./dist", "rootDir": "./src", "strict": true,\n    "esModuleInterop": true, "skipLibCheck": true,\n    "declaration": true, "sourceMap": true\n  },\n  "include": ["src/**/*"]\n}\n'

files["README.md"] = """# @webwaka/organelle-composition-modeler

Composition Modeler Organelle for the WebWaka Biological Architecture.

## Purpose
Declarative composition of organelles into higher-order functional units (cells),
with dependency resolution, port compatibility checking, and topology validation.

## Architecture
- **4-state lifecycle:** DRAFT → VALIDATED → DEPLOYED → ARCHIVED
- **Dependency resolution:** Kahn's algorithm (DAG enforcement)
- **Hexagonal ports:** CompositionManagement, CompositionQuery (primary); Storage, Event, Observability (secondary)
"""

files["src/types.ts"] = """/**
 * Composition Modeler Organelle — Type Definitions
 */

export enum CompositionState {
  DRAFT = 'DRAFT',
  VALIDATED = 'VALIDATED',
  DEPLOYED = 'DEPLOYED',
  ARCHIVED = 'ARCHIVED',
}

export enum CompositionErrorCode {
  COMPOSITION_NOT_FOUND = 'CM-001',
  INVALID_MANIFEST = 'CM-002',
  CYCLE_DETECTED = 'CM-003',
  PORT_INCOMPATIBLE = 'CM-004',
  MISSING_PROVIDER = 'CM-005',
  VERSION_CONFLICT = 'CM-006',
  DUPLICATE_BINDING = 'CM-007',
  COMPOSITION_LOCKED = 'CM-008',
}

export enum CompositionEventType {
  COMPOSITION_CREATED = 'composition.created',
  COMPOSITION_VALIDATED = 'composition.validated',
  COMPOSITION_DEPLOYED = 'composition.deployed',
  COMPOSITION_ARCHIVED = 'composition.archived',
  ORGANELLE_ADDED = 'composition.organelle.added',
  ORGANELLE_REMOVED = 'composition.organelle.removed',
  PORTS_CONNECTED = 'composition.ports.connected',
}

export interface OrganelleRef {
  readonly organelle_id: string;
  readonly version: string;
  readonly config?: Record<string, unknown>;
}

export interface Connection {
  readonly source: string; // format: "organelle_id:port_name"
  readonly target: string;
}

export interface CreateCompositionCommand {
  readonly name: string;
  readonly version: string;
  readonly organelle_refs: OrganelleRef[];
  readonly connection_map: Connection[];
  readonly idempotency_key?: string;
}

export interface ValidateCompositionCommand {
  readonly composition_id: string;
}

export interface DeployCompositionCommand {
  readonly composition_id: string;
  readonly target_environment: string;
}

export interface ArchiveCompositionCommand {
  readonly composition_id: string;
}

export interface DiffCompositionsCommand {
  readonly composition_id_a: string;
  readonly composition_id_b: string;
}

export interface AddOrganelleCommand {
  readonly composition_id: string;
  readonly organelle_ref: OrganelleRef;
}

export interface RemoveOrganelleCommand {
  readonly composition_id: string;
  readonly organelle_id: string;
}

export interface ConnectPortsCommand {
  readonly composition_id: string;
  readonly source: string;
  readonly target: string;
}

export interface CompositionQuery {
  readonly name?: string;
  readonly state?: CompositionState;
  readonly limit?: number;
}

export interface ValidationResult {
  readonly is_valid: boolean;
  readonly errors: ValidationError[];
  readonly warnings: string[];
  readonly dependency_graph: DependencyGraph;
}

export interface ValidationError {
  readonly code: CompositionErrorCode;
  readonly message: string;
  readonly path?: string;
}

export interface DependencyGraph {
  readonly nodes: string[];
  readonly edges: Array<{ from: string; to: string }>;
  readonly topological_order: string[];
}

export interface CompositionDiff {
  readonly added_organelles: string[];
  readonly removed_organelles: string[];
  readonly modified_organelles: string[];
  readonly connection_changes: Array<{ type: 'added' | 'removed'; connection: Connection }>;
}

export interface CompositionSnapshot {
  readonly composition_id: string;
  readonly name: string;
  readonly version: string;
  readonly state: CompositionState;
  readonly organelle_refs: OrganelleRef[];
  readonly connection_map: Connection[];
  readonly snapshot_hash: string;
  readonly created_at: number;
  readonly updated_at: number;
}

export interface CompositionEvent {
  readonly event_type: CompositionEventType;
  readonly timestamp: number;
  readonly composition_id: string;
  readonly payload: Record<string, unknown>;
}

export const CONSTRAINTS = {
  MAX_ORGANELLES_PER_COMPOSITION: 100,
  MAX_CONNECTIONS_PER_COMPOSITION: 500,
  MAX_VERSIONS_RETAINED: 50,
  VALIDATION_TIMEOUT_MS: 5_000,
  SNAPSHOT_HASH_ALGORITHM: 'SHA-256',
} as const;
"""

files["src/composition-entity.ts"] = """/**
 * Composition Modeler — Composition Entity with FSM
 */
import { createHash, randomUUID } from 'crypto';
import {
  CompositionState, CompositionErrorCode, OrganelleRef, Connection,
  CompositionSnapshot, CONSTRAINTS,
} from './types';

export class CompositionError extends Error {
  constructor(public readonly code: CompositionErrorCode, message: string) {
    super(message);
    this.name = 'CompositionError';
  }
}

export class CompositionEntity {
  private _state: CompositionState;
  private _organelle_refs: OrganelleRef[];
  private _connection_map: Connection[];
  private _updated_at: number;
  private _snapshot_hash: string = '';

  constructor(
    public readonly composition_id: string,
    public readonly name: string,
    public readonly version: string,
    organelle_refs: OrganelleRef[],
    connection_map: Connection[],
    public readonly created_at: number,
  ) {
    if (!composition_id) throw new CompositionError(CompositionErrorCode.INVALID_MANIFEST, 'ID required');
    if (!organelle_refs || organelle_refs.length === 0) {
      throw new CompositionError(CompositionErrorCode.INVALID_MANIFEST, 'At least one organelle required (INV-S02)');
    }
    if (organelle_refs.length > CONSTRAINTS.MAX_ORGANELLES_PER_COMPOSITION) {
      throw new CompositionError(CompositionErrorCode.INVALID_MANIFEST, `Max ${CONSTRAINTS.MAX_ORGANELLES_PER_COMPOSITION} organelles`);
    }
    if (connection_map.length > CONSTRAINTS.MAX_CONNECTIONS_PER_COMPOSITION) {
      throw new CompositionError(CompositionErrorCode.INVALID_MANIFEST, `Max ${CONSTRAINTS.MAX_CONNECTIONS_PER_COMPOSITION} connections`);
    }
    // INV-S03: Validate semver
    const semverRe = /^[\\^~]?\\d+\\.\\d+\\.\\d+/;
    for (const ref of organelle_refs) {
      if (!semverRe.test(ref.version)) {
        throw new CompositionError(CompositionErrorCode.VERSION_CONFLICT, `Invalid semver: ${ref.version}`);
      }
    }

    this._state = CompositionState.DRAFT;
    this._organelle_refs = [...organelle_refs];
    this._connection_map = [...connection_map];
    this._updated_at = created_at;
  }

  get state(): CompositionState { return this._state; }
  get organelle_refs(): ReadonlyArray<OrganelleRef> { return this._organelle_refs; }
  get connection_map(): ReadonlyArray<Connection> { return this._connection_map; }

  private assertDraft(): void {
    if (this._state !== CompositionState.DRAFT) {
      throw new CompositionError(CompositionErrorCode.COMPOSITION_LOCKED, `Cannot modify in ${this._state} state (INV-B04)`);
    }
  }

  addOrganelle(ref: OrganelleRef): void {
    this.assertDraft();
    this._organelle_refs.push(ref);
    this._updated_at = Date.now();
  }

  removeOrganelle(organelleId: string): void {
    this.assertDraft();
    this._organelle_refs = this._organelle_refs.filter(r => r.organelle_id !== organelleId);
    this._connection_map = this._connection_map.filter(
      c => !c.source.startsWith(organelleId + ':') && !c.target.startsWith(organelleId + ':')
    );
    this._updated_at = Date.now();
  }

  connectPorts(source: string, target: string): void {
    this.assertDraft();
    const dup = this._connection_map.some(c => c.target === target && c.source !== source);
    if (dup) throw new CompositionError(CompositionErrorCode.DUPLICATE_BINDING, `Port ${target} already bound (CM-007)`);
    this._connection_map.push({ source, target });
    this._updated_at = Date.now();
  }

  validate(): void {
    this.assertDraft();
    this._state = CompositionState.VALIDATED;
    this._snapshot_hash = this.computeHash();
    this._updated_at = Date.now();
  }

  invalidate(): void {
    if (this._state !== CompositionState.VALIDATED) {
      throw new CompositionError(CompositionErrorCode.COMPOSITION_LOCKED, 'Only VALIDATED can revert to DRAFT');
    }
    this._state = CompositionState.DRAFT;
    this._snapshot_hash = '';
    this._updated_at = Date.now();
  }

  deploy(): void {
    if (this._state !== CompositionState.VALIDATED) {
      throw new CompositionError(CompositionErrorCode.COMPOSITION_LOCKED, 'Only VALIDATED can be deployed');
    }
    this._state = CompositionState.DEPLOYED;
    this._updated_at = Date.now();
  }

  archive(): void {
    if (this._state === CompositionState.ARCHIVED) return; // idempotent
    if (this._state === CompositionState.DRAFT) {
      throw new CompositionError(CompositionErrorCode.COMPOSITION_LOCKED, 'DRAFT cannot be archived directly');
    }
    this._state = CompositionState.ARCHIVED;
    this._updated_at = Date.now();
  }

  /** INV-S05: Deterministic JSON serialization for hashing */
  private computeHash(): string {
    const canonical = JSON.stringify({
      name: this.name,
      version: this.version,
      organelle_refs: [...this._organelle_refs].sort((a, b) => a.organelle_id.localeCompare(b.organelle_id)),
      connection_map: [...this._connection_map].sort((a, b) => a.source.localeCompare(b.source)),
    });
    return createHash('sha256').update(canonical).digest('hex');
  }

  toSnapshot(): CompositionSnapshot {
    return {
      composition_id: this.composition_id,
      name: this.name,
      version: this.version,
      state: this._state,
      organelle_refs: [...this._organelle_refs],
      connection_map: [...this._connection_map],
      snapshot_hash: this._snapshot_hash,
      created_at: this.created_at,
      updated_at: this._updated_at,
    };
  }
}
"""

files["src/dependency-resolver.ts"] = """/**
 * Composition Modeler — Dependency Resolver (Kahn's Algorithm)
 * INV-B01: Detects and rejects cycles in the composition graph.
 */
import { Connection, DependencyGraph, CompositionErrorCode } from './types';
import { CompositionError } from './composition-entity';

export class DependencyResolver {
  /**
   * Resolve dependencies using Kahn's algorithm for topological sort.
   * Throws CM-003 if a cycle is detected.
   */
  static resolve(organelleIds: string[], connections: ReadonlyArray<Connection>): DependencyGraph {
    const nodes = new Set(organelleIds);
    const edges: Array<{ from: string; to: string }> = [];
    const inDegree = new Map<string, number>();
    const adjacency = new Map<string, string[]>();

    for (const id of nodes) {
      inDegree.set(id, 0);
      adjacency.set(id, []);
    }

    for (const conn of connections) {
      const sourceOrg = conn.source.split(':')[0];
      const targetOrg = conn.target.split(':')[0];
      if (sourceOrg === targetOrg) continue; // self-connection, skip

      edges.push({ from: sourceOrg, to: targetOrg });
      adjacency.get(sourceOrg)!.push(targetOrg);
      inDegree.set(targetOrg, (inDegree.get(targetOrg) || 0) + 1);
    }

    // Kahn's algorithm
    const queue: string[] = [];
    for (const [node, degree] of inDegree) {
      if (degree === 0) queue.push(node);
    }

    const topological_order: string[] = [];
    while (queue.length > 0) {
      const current = queue.shift()!;
      topological_order.push(current);

      for (const neighbor of adjacency.get(current) || []) {
        const newDegree = (inDegree.get(neighbor) || 1) - 1;
        inDegree.set(neighbor, newDegree);
        if (newDegree === 0) queue.push(neighbor);
      }
    }

    // INV-B01: If not all nodes processed, a cycle exists
    if (topological_order.length !== nodes.size) {
      const cycleNodes = [...nodes].filter(n => !topological_order.includes(n));
      throw new CompositionError(
        CompositionErrorCode.CYCLE_DETECTED,
        `Circular dependency detected involving: ${cycleNodes.join(', ')}`,
      );
    }

    return { nodes: [...nodes], edges, topological_order };
  }
}
"""

files["src/state-machine.ts"] = """/**
 * Composition Modeler — State Machine
 */
import { CompositionState } from './types';

export interface CompositionTransition {
  readonly from: CompositionState;
  readonly to: CompositionState;
  readonly trigger: string;
}

const VALID_TRANSITIONS: ReadonlyArray<CompositionTransition> = [
  { from: CompositionState.DRAFT, to: CompositionState.DRAFT, trigger: 'modify' },
  { from: CompositionState.DRAFT, to: CompositionState.VALIDATED, trigger: 'validate_success' },
  { from: CompositionState.VALIDATED, to: CompositionState.DEPLOYED, trigger: 'deploy' },
  { from: CompositionState.VALIDATED, to: CompositionState.DRAFT, trigger: 'invalidate' },
  { from: CompositionState.VALIDATED, to: CompositionState.ARCHIVED, trigger: 'archive' },
  { from: CompositionState.DEPLOYED, to: CompositionState.ARCHIVED, trigger: 'archive' },
];

export class CompositionStateMachine {
  static canTransition(from: CompositionState, trigger: string): boolean {
    return VALID_TRANSITIONS.some(t => t.from === from && t.trigger === trigger);
  }

  static getValidTransitions(): ReadonlyArray<CompositionTransition> {
    return VALID_TRANSITIONS;
  }
}
"""

files["src/storage-interface.ts"] = """/**
 * Composition Modeler — Storage Port Interface
 */
import { CompositionEntity } from './composition-entity';
import { CompositionQuery } from './types';

export interface ICompositionStoragePort {
  save(entity: CompositionEntity): Promise<void>;
  findById(compositionId: string): Promise<CompositionEntity | null>;
  findByQuery(query: CompositionQuery): Promise<CompositionEntity[]>;
  findBySnapshotHash(hash: string): Promise<CompositionEntity | null>;
  delete(compositionId: string): Promise<void>;
  count(): Promise<number>;
}
"""

files["src/event-interface.ts"] = """/**
 * Composition Modeler — Event Port Interface
 */
import { CompositionEvent } from './types';

export interface ICompositionEventPort {
  emit(event: CompositionEvent): Promise<void>;
  emitBatch(events: CompositionEvent[]): Promise<void>;
}
"""

files["src/observability-interface.ts"] = """/**
 * Composition Modeler — Observability Port Interface
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

export interface ICompositionObservabilityPort {
  recordMetric(metric: MetricEntry): void;
  recordTrace(span: TraceSpan): void;
  recordLog(entry: LogEntry): void;
}
"""

files["src/composition-orchestrator.ts"] = """/**
 * Composition Modeler — Main Orchestrator
 */
import { randomUUID } from 'crypto';
import {
  CreateCompositionCommand, ValidateCompositionCommand, DeployCompositionCommand,
  ArchiveCompositionCommand, DiffCompositionsCommand, AddOrganelleCommand,
  RemoveOrganelleCommand, ConnectPortsCommand, CompositionQuery,
  CompositionSnapshot, ValidationResult, CompositionDiff, DependencyGraph,
  CompositionEventType, CompositionErrorCode, CONSTRAINTS,
} from './types';
import { CompositionEntity, CompositionError } from './composition-entity';
import { DependencyResolver } from './dependency-resolver';
import { ICompositionStoragePort } from './storage-interface';
import { ICompositionEventPort } from './event-interface';
import { ICompositionObservabilityPort } from './observability-interface';

export interface ICompositionModeler {
  createComposition(cmd: CreateCompositionCommand): Promise<CompositionSnapshot>;
  validateComposition(cmd: ValidateCompositionCommand): Promise<ValidationResult>;
  deployComposition(cmd: DeployCompositionCommand): Promise<CompositionSnapshot>;
  archiveComposition(cmd: ArchiveCompositionCommand): Promise<void>;
  addOrganelle(cmd: AddOrganelleCommand): Promise<CompositionSnapshot>;
  removeOrganelle(cmd: RemoveOrganelleCommand): Promise<CompositionSnapshot>;
  connectPorts(cmd: ConnectPortsCommand): Promise<CompositionSnapshot>;
  diffCompositions(cmd: DiffCompositionsCommand): Promise<CompositionDiff>;
  getComposition(compositionId: string): Promise<CompositionSnapshot>;
  listCompositions(query: CompositionQuery): Promise<CompositionSnapshot[]>;
}

export class CompositionOrchestrator implements ICompositionModeler {
  constructor(
    private readonly storage: ICompositionStoragePort,
    private readonly events: ICompositionEventPort,
    private readonly observability: ICompositionObservabilityPort,
  ) {}

  async createComposition(cmd: CreateCompositionCommand): Promise<CompositionSnapshot> {
    const start = Date.now();
    const id = randomUUID();
    const entity = new CompositionEntity(id, cmd.name, cmd.version, cmd.organelle_refs, cmd.connection_map, Date.now());
    await this.storage.save(entity);
    await this.events.emit({
      event_type: CompositionEventType.COMPOSITION_CREATED,
      timestamp: Date.now(), composition_id: id,
      payload: { name: cmd.name, organelle_count: cmd.organelle_refs.length },
    });
    this.observability.recordMetric({ name: 'composition.created.count', value: 1, labels: { name: cmd.name }, timestamp: Date.now() });
    this.observability.recordTrace({ operation: 'createComposition', duration_ms: Date.now() - start, status: 'ok', timestamp: Date.now() });
    return entity.toSnapshot();
  }

  async validateComposition(cmd: ValidateCompositionCommand): Promise<ValidationResult> {
    const start = Date.now();
    const entity = await this.findOrThrow(cmd.composition_id);
    const errors: Array<{ code: CompositionErrorCode; message: string }> = [];
    const warnings: string[] = [];
    let graph: DependencyGraph = { nodes: [], edges: [], topological_order: [] };

    try {
      const orgIds = entity.organelle_refs.map(r => r.organelle_id);
      graph = DependencyResolver.resolve(orgIds, entity.connection_map);
    } catch (e: any) {
      errors.push({ code: CompositionErrorCode.CYCLE_DETECTED, message: e.message });
    }

    // Check for duplicate bindings
    const targetPorts = new Set<string>();
    for (const conn of entity.connection_map) {
      if (targetPorts.has(conn.target)) {
        errors.push({ code: CompositionErrorCode.DUPLICATE_BINDING, message: `Duplicate binding: ${conn.target}` });
      }
      targetPorts.add(conn.target);
    }

    const is_valid = errors.length === 0;
    if (is_valid) entity.validate();
    await this.storage.save(entity);

    await this.events.emit({
      event_type: CompositionEventType.COMPOSITION_VALIDATED,
      timestamp: Date.now(), composition_id: cmd.composition_id,
      payload: { is_valid, error_count: errors.length },
    });

    this.observability.recordTrace({ operation: 'validateComposition', duration_ms: Date.now() - start, status: is_valid ? 'ok' : 'error', timestamp: Date.now() });
    return { is_valid, errors, warnings, dependency_graph: graph };
  }

  async deployComposition(cmd: DeployCompositionCommand): Promise<CompositionSnapshot> {
    const entity = await this.findOrThrow(cmd.composition_id);
    entity.deploy();
    await this.storage.save(entity);
    await this.events.emit({
      event_type: CompositionEventType.COMPOSITION_DEPLOYED,
      timestamp: Date.now(), composition_id: cmd.composition_id,
      payload: { environment: cmd.target_environment },
    });
    return entity.toSnapshot();
  }

  async archiveComposition(cmd: ArchiveCompositionCommand): Promise<void> {
    const entity = await this.findOrThrow(cmd.composition_id);
    entity.archive();
    await this.storage.save(entity);
    await this.events.emit({
      event_type: CompositionEventType.COMPOSITION_ARCHIVED,
      timestamp: Date.now(), composition_id: cmd.composition_id, payload: {},
    });
  }

  async addOrganelle(cmd: AddOrganelleCommand): Promise<CompositionSnapshot> {
    const entity = await this.findOrThrow(cmd.composition_id);
    entity.addOrganelle(cmd.organelle_ref);
    await this.storage.save(entity);
    return entity.toSnapshot();
  }

  async removeOrganelle(cmd: RemoveOrganelleCommand): Promise<CompositionSnapshot> {
    const entity = await this.findOrThrow(cmd.composition_id);
    entity.removeOrganelle(cmd.organelle_id);
    await this.storage.save(entity);
    return entity.toSnapshot();
  }

  async connectPorts(cmd: ConnectPortsCommand): Promise<CompositionSnapshot> {
    const entity = await this.findOrThrow(cmd.composition_id);
    entity.connectPorts(cmd.source, cmd.target);
    await this.storage.save(entity);
    return entity.toSnapshot();
  }

  async diffCompositions(cmd: DiffCompositionsCommand): Promise<CompositionDiff> {
    const a = await this.findOrThrow(cmd.composition_id_a);
    const b = await this.findOrThrow(cmd.composition_id_b);
    const aIds = new Set(a.organelle_refs.map(r => r.organelle_id));
    const bIds = new Set(b.organelle_refs.map(r => r.organelle_id));
    return {
      added_organelles: [...bIds].filter(id => !aIds.has(id)),
      removed_organelles: [...aIds].filter(id => !bIds.has(id)),
      modified_organelles: [...aIds].filter(id => bIds.has(id)),
      connection_changes: [],
    };
  }

  async getComposition(compositionId: string): Promise<CompositionSnapshot> {
    return (await this.findOrThrow(compositionId)).toSnapshot();
  }

  async listCompositions(query: CompositionQuery): Promise<CompositionSnapshot[]> {
    const entities = await this.storage.findByQuery(query);
    return entities.map(e => e.toSnapshot());
  }

  private async findOrThrow(id: string): Promise<CompositionEntity> {
    const entity = await this.storage.findById(id);
    if (!entity) throw new CompositionError(CompositionErrorCode.COMPOSITION_NOT_FOUND, `Composition ${id} not found`);
    return entity;
  }
}
"""

files["src/index.ts"] = """/**
 * @webwaka/organelle-composition-modeler — Public API
 */
export { CompositionState, CompositionErrorCode, CompositionEventType, CONSTRAINTS } from './types';
export type {
  OrganelleRef, Connection, CreateCompositionCommand, ValidateCompositionCommand,
  DeployCompositionCommand, ArchiveCompositionCommand, DiffCompositionsCommand,
  AddOrganelleCommand, RemoveOrganelleCommand, ConnectPortsCommand, CompositionQuery,
  ValidationResult, ValidationError, DependencyGraph, CompositionDiff,
  CompositionSnapshot, CompositionEvent,
} from './types';
export { CompositionEntity, CompositionError } from './composition-entity';
export { DependencyResolver } from './dependency-resolver';
export { CompositionStateMachine } from './state-machine';
export type { CompositionTransition } from './state-machine';
export type { ICompositionStoragePort } from './storage-interface';
export type { ICompositionEventPort } from './event-interface';
export type { ICompositionObservabilityPort, MetricEntry, TraceSpan, LogEntry } from './observability-interface';
export { CompositionOrchestrator } from './composition-orchestrator';
export type { ICompositionModeler } from './composition-orchestrator';
"""

for rel_path, content in files.items():
    full_path = os.path.join(BASE, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w') as f:
        f.write(content)
    print(f"Written: {rel_path}")

print(f"\nTotal files: {len(files)}")
