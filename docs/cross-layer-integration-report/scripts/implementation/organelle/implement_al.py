#!/usr/bin/env python3
"""Generate Audit Logger TypeScript implementation files."""
import os

BASE = "/home/ubuntu/impl-webwaka-organelle-audit-logger"
SRC = os.path.join(BASE, "src")
os.makedirs(SRC, exist_ok=True)

files = {
    "src/types.ts": '''/**
 * ORG-LG-AUDIT_LOGGER-v0.1.0 — Type Definitions
 * Canonical types for the Audit Logger Organelle.
 */

export type LoggerState = 'INITIALIZING' | 'ACTIVE' | 'VERIFYING' | 'ROTATING' | 'EXPORTING' | 'STOPPED';
export type AuditOutcome = 'SUCCESS' | 'FAILURE' | 'DENIED' | 'ERROR';
export type ExportFormat = 'JSON_LINES' | 'CSV';

export interface RecordAuditEventCommand {
  actor: string;
  action: string;
  resource: string;
  outcome: AuditOutcome;
  metadata?: Record<string, unknown>;
  correlation_id: string;
  idempotency_key?: string;
}

export interface RecordBatchCommand {
  events: RecordAuditEventCommand[];
}

export interface AuditQuery {
  filters?: {
    actor?: string;
    action?: string;
    resource?: string;
    outcome?: AuditOutcome;
    correlation_id?: string;
  };
  time_range?: { from: Date; to: Date };
  pagination?: { offset: number; limit: number };
}

export interface ExportCommand {
  format: ExportFormat;
  time_range?: { from: Date; to: Date };
  filters?: AuditQuery['filters'];
}

export interface RetentionPolicyCommand {
  retention_days: number;
  archive_after_days: number;
}

export interface AuditReceipt {
  receipt_id: string;
  sequence_number: number;
  hash: string;
  timestamp: Date;
}

export interface AuditEntry {
  sequence: number;
  actor: string;
  action: string;
  resource: string;
  outcome: AuditOutcome;
  metadata: Record<string, unknown>;
  correlation_id: string;
  hash: string;
  prev_hash: string;
  created_at: Date;
}

export interface IntegrityReport {
  verified: boolean;
  entries_checked: number;
  first_invalid: number | null;
  status: 'VALID' | 'INVALID' | 'GAP_DETECTED';
}

export interface ExportResult {
  format: ExportFormat;
  entry_count: number;
  file_path: string;
  checksum: string;
}

export type AuditErrorCode =
  | 'AL-001' // INVALID_EVENT
  | 'AL-002' // INTEGRITY_VIOLATION
  | 'AL-003' // RETENTION_EXPIRED
  | 'AL-004' // EXPORT_FAILED
  | 'AL-005' // ACCESS_DENIED
  | 'AL-006' // SEQUENCE_GAP
  | 'AL-007' // STORAGE_FULL
  | 'AL-008'; // DUPLICATE_EVENT

export class AuditError extends Error {
  constructor(public readonly code: AuditErrorCode, message: string) {
    super(`[${code}] ${message}`);
    this.name = 'AuditError';
  }
}
''',
    "src/audit-entry.ts": '''/**
 * ORG-LG-AUDIT_LOGGER-v0.1.0 — Audit Entry Entity
 * Immutable audit record with hash chain fields.
 */
import { AuditEntry, AuditOutcome, AuditError } from './types';

const ACTOR_PATTERN = /^[a-zA-Z][a-zA-Z0-9_.-]{2,254}$/;

export class AuditEntryEntity {
  private constructor(private readonly _data: Readonly<AuditEntry>) {
    Object.freeze(this._data);
  }

  static create(params: {
    sequence: number;
    actor: string;
    action: string;
    resource: string;
    outcome: AuditOutcome;
    metadata: Record<string, unknown>;
    correlation_id: string;
    hash: string;
    prev_hash: string;
    created_at: Date;
  }): AuditEntryEntity {
    // INV-B04: Required fields validation
    if (!params.actor || !params.action || !params.resource || !params.outcome) {
      throw new AuditError('AL-001', 'Missing required fields: actor, action, resource, outcome');
    }
    // INV-S01: correlation_id required
    if (!params.correlation_id) {
      throw new AuditError('AL-001', 'correlation_id is required');
    }
    // INV-S02: Actor naming convention
    if (!ACTOR_PATTERN.test(params.actor)) {
      throw new AuditError('AL-001', `Invalid actor format: ${params.actor}`);
    }
    // INV-B01: Sequence must be positive
    if (params.sequence < 1) {
      throw new AuditError('AL-006', 'Sequence number must be positive');
    }
    return new AuditEntryEntity(params);
  }

  get data(): Readonly<AuditEntry> { return this._data; }
  get sequence(): number { return this._data.sequence; }
  get hash(): string { return this._data.hash; }
  get prev_hash(): string { return this._data.prev_hash; }
  get actor(): string { return this._data.actor; }
  get action(): string { return this._data.action; }
  get resource(): string { return this._data.resource; }
  get outcome(): AuditOutcome { return this._data.outcome; }
  get correlation_id(): string { return this._data.correlation_id; }
}
''',
    "src/hash-chain-engine.ts": '''/**
 * ORG-LG-AUDIT_LOGGER-v0.1.0 — Hash Chain Engine
 * Computes SHA-256 hashes and validates chain integrity.
 */
import { ICryptoPort } from './crypto-interface';
import { AuditEntry, IntegrityReport, AuditError } from './types';

export class HashChainEngine {
  constructor(private readonly crypto: ICryptoPort) {}

  /** INV-B02: Compute hash chaining prev_hash with payload fields */
  async computeHash(prevHash: string, actor: string, action: string, resource: string, outcome: string, timestamp: string): Promise<string> {
    const payload = `${prevHash}|${actor}|${action}|${resource}|${outcome}|${timestamp}`;
    return this.crypto.sha256(payload);
  }

  /** INV-B05: Verify hash chain integrity over a range of entries */
  async verifyChain(entries: AuditEntry[]): Promise<IntegrityReport> {
    if (entries.length === 0) {
      return { verified: true, entries_checked: 0, first_invalid: null, status: 'VALID' };
    }

    let prevHash = entries[0].prev_hash;
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];

      // Check sequence continuity
      if (i > 0 && entry.sequence !== entries[i - 1].sequence + 1) {
        return {
          verified: false,
          entries_checked: i,
          first_invalid: entry.sequence,
          status: 'GAP_DETECTED'
        };
      }

      // Recompute and verify hash
      const expectedHash = await this.computeHash(
        prevHash, entry.actor, entry.action, entry.resource,
        entry.outcome, entry.created_at.toISOString()
      );

      if (entry.hash !== expectedHash) {
        return {
          verified: false,
          entries_checked: i,
          first_invalid: entry.sequence,
          status: 'INVALID'
        };
      }

      prevHash = entry.hash;
    }

    return {
      verified: true,
      entries_checked: entries.length,
      first_invalid: null,
      status: 'VALID'
    };
  }
}
''',
    "src/sequence-generator.ts": '''/**
 * ORG-LG-AUDIT_LOGGER-v0.1.0 — Sequence Generator
 * Atomic monotonic sequence number generator.
 * INV-B01: Every audit entry MUST have a unique, monotonically increasing sequence number.
 */

export class SequenceGenerator {
  private _current: number;

  constructor(initialSequence: number = 0) {
    this._current = initialSequence;
  }

  /** Generate next sequence number (atomic increment) */
  next(): number {
    return ++this._current;
  }

  /** Get current sequence without incrementing */
  get current(): number {
    return this._current;
  }

  /** Reset to a specific sequence (for initialization from storage) */
  resetTo(sequence: number): void {
    if (sequence < this._current) {
      throw new Error(`Cannot reset to lower sequence: ${sequence} < ${this._current}`);
    }
    this._current = sequence;
  }
}
''',
    "src/state-machine.ts": '''/**
 * ORG-LG-AUDIT_LOGGER-v0.1.0 — Logger State Machine
 * 6 states: INITIALIZING, ACTIVE, VERIFYING, ROTATING, EXPORTING, STOPPED
 */
import { LoggerState } from './types';

interface Transition {
  from: LoggerState;
  to: LoggerState;
  guard?: () => boolean;
}

const TRANSITIONS: Transition[] = [
  { from: 'INITIALIZING', to: 'ACTIVE' },
  { from: 'ACTIVE', to: 'VERIFYING' },
  { from: 'VERIFYING', to: 'ACTIVE' },
  { from: 'ACTIVE', to: 'ROTATING' },
  { from: 'ROTATING', to: 'ACTIVE' },
  { from: 'ACTIVE', to: 'EXPORTING' },
  { from: 'EXPORTING', to: 'ACTIVE' },
  { from: 'ACTIVE', to: 'STOPPED' },
];

export class LoggerStateMachine {
  private _state: LoggerState = 'INITIALIZING';

  get state(): LoggerState { return this._state; }

  canTransition(to: LoggerState): boolean {
    return TRANSITIONS.some(t => t.from === this._state && t.to === to);
  }

  transition(to: LoggerState): void {
    if (!this.canTransition(to)) {
      throw new Error(`Invalid transition: ${this._state} → ${to}`);
    }
    this._state = to;
  }

  isAcceptingEvents(): boolean {
    return this._state === 'ACTIVE';
  }

  isTerminal(): boolean {
    return this._state === 'STOPPED';
  }
}
''',
    "src/storage-interface.ts": '''/**
 * ORG-LG-AUDIT_LOGGER-v0.1.0 — Storage Port Interface
 * INV-B03: Append-only storage — no update or delete operations.
 */
import { AuditEntry, AuditQuery } from './types';

export interface IAuditStoragePort {
  /** Append a single audit entry (INV-B03: append-only) */
  append(entry: AuditEntry): Promise<void>;

  /** Append a batch of entries atomically */
  appendBatch(entries: AuditEntry[]): Promise<void>;

  /** Retrieve entry by sequence number */
  getBySequence(sequence: number): Promise<AuditEntry | null>;

  /** Retrieve entries in a sequence range */
  getRange(from: number, to: number): Promise<AuditEntry[]>;

  /** Query entries with filters and pagination */
  query(query: AuditQuery): Promise<AuditEntry[]>;

  /** Get the latest entry (for hash chain initialization) */
  getLatestEntry(): Promise<AuditEntry | null>;

  /** Archive entries in range (retention management) */
  archiveRange(from: number, to: number): Promise<number>;

  /** Check if idempotency key already exists */
  hasIdempotencyKey(key: string): Promise<boolean>;
}
''',
    "src/event-interface.ts": '''/**
 * ORG-LG-AUDIT_LOGGER-v0.1.0 — Event Port Interface
 * Emits lifecycle events for audit operations.
 */

export type AuditLifecycleEvent =
  | { type: 'AuditEventRecorded'; sequence: number; hash: string }
  | { type: 'BatchRecorded'; batch_id: string; count: number }
  | { type: 'IntegrityVerified'; status: string; entries_checked: number }
  | { type: 'LogRotated'; old_sequence: number; new_sequence: number }
  | { type: 'RetentionApplied'; entries_affected: number }
  | { type: 'ExportCompleted'; format: string; count: number };

export interface IAuditEventPort {
  emit(event: AuditLifecycleEvent): Promise<void>;
}
''',
    "src/crypto-interface.ts": '''/**
 * ORG-LG-AUDIT_LOGGER-v0.1.0 — Crypto Port Interface
 * CON-O04: SHA-256 hash computation.
 */

export interface ICryptoPort {
  /** Compute SHA-256 hash of input string */
  sha256(input: string): Promise<string>;

  /** Compute checksum for export files */
  checksum(data: Buffer): Promise<string>;
}
''',
    "src/observability-interface.ts": '''/**
 * ORG-LG-AUDIT_LOGGER-v0.1.0 — Observability Port Interface
 * Self-monitoring metrics for the Audit Logger.
 */

export interface IAuditObservabilityPort {
  incrementCounter(name: string, value?: number, tags?: Record<string, string>): void;
  recordHistogram(name: string, value: number, tags?: Record<string, string>): void;
  setGauge(name: string, value: number, tags?: Record<string, string>): void;
}
''',
    "src/audit-logger.ts": '''/**
 * ORG-LG-AUDIT_LOGGER-v0.1.0 — Main Orchestrator
 * Implements all primary ports: IAuditWritePort, IAuditQueryPort, IAuditManagementPort.
 */
import {
  RecordAuditEventCommand, RecordBatchCommand, AuditQuery,
  ExportCommand, RetentionPolicyCommand, AuditReceipt,
  AuditEntry, IntegrityReport, ExportResult, AuditError
} from './types';
import { AuditEntryEntity } from './audit-entry';
import { HashChainEngine } from './hash-chain-engine';
import { SequenceGenerator } from './sequence-generator';
import { LoggerStateMachine } from './state-machine';
import { IAuditStoragePort } from './storage-interface';
import { IAuditEventPort } from './event-interface';
import { ICryptoPort } from './crypto-interface';
import { IAuditObservabilityPort } from './observability-interface';

const GENESIS_HASH = '0'.repeat(64);
const MAX_BATCH_SIZE = 500;   // CON-O01
const MAX_QUERY_RESULTS = 10000; // CON-O03

export interface IAuditLogger {
  recordEvent(cmd: RecordAuditEventCommand): Promise<AuditReceipt>;
  recordBatch(cmd: RecordBatchCommand): Promise<AuditReceipt[]>;
  queryLog(query: AuditQuery): Promise<AuditEntry[]>;
  getEntry(sequence: number): Promise<AuditEntry | null>;
  getLatestSequence(): Promise<number>;
  verifyIntegrity(from: number, to: number): Promise<IntegrityReport>;
  exportTrail(cmd: ExportCommand): Promise<ExportResult>;
  setRetentionPolicy(cmd: RetentionPolicyCommand): Promise<void>;
  rotateLog(reason: string): Promise<void>;
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
}

export class AuditOrchestrator implements IAuditLogger {
  private readonly fsm = new LoggerStateMachine();
  private readonly sequencer: SequenceGenerator;
  private readonly hashEngine: HashChainEngine;
  private lastHash: string = GENESIS_HASH;
  private retentionDays: number = 365;  // CON-O02
  private archiveAfterDays: number = 365;

  constructor(
    private readonly storage: IAuditStoragePort,
    private readonly events: IAuditEventPort,
    private readonly crypto: ICryptoPort,
    private readonly observability: IAuditObservabilityPort
  ) {
    this.sequencer = new SequenceGenerator(0);
    this.hashEngine = new HashChainEngine(crypto);
  }

  async initialize(): Promise<void> {
    const latest = await this.storage.getLatestEntry();
    if (latest) {
      this.sequencer.resetTo(latest.sequence);
      this.lastHash = latest.hash;
    }
    this.fsm.transition('ACTIVE');
    this.observability.setGauge('al.state', 1, { state: 'ACTIVE' });
  }

  async shutdown(): Promise<void> {
    this.fsm.transition('STOPPED');
    this.observability.setGauge('al.state', 0, { state: 'STOPPED' });
  }

  async recordEvent(cmd: RecordAuditEventCommand): Promise<AuditReceipt> {
    if (!this.fsm.isAcceptingEvents()) {
      throw new AuditError('AL-001', `Logger not accepting events (state: ${this.fsm.state})`);
    }

    // INV-AL-008: Idempotency check
    if (cmd.idempotency_key) {
      const exists = await this.storage.hasIdempotencyKey(cmd.idempotency_key);
      if (exists) {
        throw new AuditError('AL-008', `Duplicate event: ${cmd.idempotency_key}`);
      }
    }

    const now = new Date();
    const sequence = this.sequencer.next();

    // INV-B02: Hash chaining
    const hash = await this.hashEngine.computeHash(
      this.lastHash, cmd.actor, cmd.action, cmd.resource,
      cmd.outcome, now.toISOString()
    );

    const entity = AuditEntryEntity.create({
      sequence,
      actor: cmd.actor,
      action: cmd.action,
      resource: cmd.resource,
      outcome: cmd.outcome,
      metadata: cmd.metadata ?? {},
      correlation_id: cmd.correlation_id,
      hash,
      prev_hash: this.lastHash,
      created_at: now
    });

    await this.storage.append(entity.data);
    this.lastHash = hash;

    this.observability.incrementCounter('al.events.recorded.count');
    await this.events.emit({ type: 'AuditEventRecorded', sequence, hash });

    return {
      receipt_id: `rcpt-${sequence}`,
      sequence_number: sequence,
      hash,
      timestamp: now
    };
  }

  async recordBatch(cmd: RecordBatchCommand): Promise<AuditReceipt[]> {
    // CON-O01: Max batch size
    if (cmd.events.length > MAX_BATCH_SIZE) {
      throw new AuditError('AL-001', `Batch size ${cmd.events.length} exceeds maximum ${MAX_BATCH_SIZE}`);
    }

    const receipts: AuditReceipt[] = [];
    for (const event of cmd.events) {
      const receipt = await this.recordEvent(event);
      receipts.push(receipt);
    }

    await this.events.emit({ type: 'BatchRecorded', batch_id: `batch-${Date.now()}`, count: cmd.events.length });
    return receipts;
  }

  async queryLog(query: AuditQuery): Promise<AuditEntry[]> {
    // CON-O03: Max query results
    if (query.pagination && query.pagination.limit > MAX_QUERY_RESULTS) {
      query.pagination.limit = MAX_QUERY_RESULTS;
    }
    if (!query.pagination) {
      query.pagination = { offset: 0, limit: MAX_QUERY_RESULTS };
    }
    return this.storage.query(query);
  }

  async getEntry(sequence: number): Promise<AuditEntry | null> {
    return this.storage.getBySequence(sequence);
  }

  async getLatestSequence(): Promise<number> {
    return this.sequencer.current;
  }

  async verifyIntegrity(from: number, to: number): Promise<IntegrityReport> {
    this.fsm.transition('VERIFYING');
    this.observability.setGauge('al.state', 1, { state: 'VERIFYING' });

    try {
      const entries = await this.storage.getRange(from, to);
      const startTime = Date.now();
      const report = await this.hashEngine.verifyChain(entries);
      const duration = Date.now() - startTime;

      this.observability.recordHistogram('al.integrity.verification.duration_ms', duration);
      await this.events.emit({ type: 'IntegrityVerified', status: report.status, entries_checked: report.entries_checked });

      return report;
    } finally {
      this.fsm.transition('ACTIVE');
      this.observability.setGauge('al.state', 1, { state: 'ACTIVE' });
    }
  }

  async exportTrail(cmd: ExportCommand): Promise<ExportResult> {
    this.fsm.transition('EXPORTING');
    try {
      const entries = await this.storage.query({
        filters: cmd.filters,
        time_range: cmd.time_range,
        pagination: { offset: 0, limit: MAX_QUERY_RESULTS }
      });

      const filePath = `/tmp/audit-export-${Date.now()}.${cmd.format === 'JSON_LINES' ? 'jsonl' : 'csv'}`;
      const data = cmd.format === 'JSON_LINES'
        ? entries.map(e => JSON.stringify(e)).join('\\n')
        : this.toCsv(entries);

      const checksum = await this.crypto.checksum(Buffer.from(data));

      this.observability.recordHistogram('al.export.duration_ms', Date.now());
      await this.events.emit({ type: 'ExportCompleted', format: cmd.format, count: entries.length });

      return { format: cmd.format, entry_count: entries.length, file_path: filePath, checksum };
    } finally {
      this.fsm.transition('ACTIVE');
    }
  }

  async setRetentionPolicy(cmd: RetentionPolicyCommand): Promise<void> {
    this.retentionDays = cmd.retention_days;
    this.archiveAfterDays = cmd.archive_after_days;
  }

  async rotateLog(reason: string): Promise<void> {
    this.fsm.transition('ROTATING');
    try {
      const oldSeq = this.sequencer.current;
      await this.events.emit({ type: 'LogRotated', old_sequence: oldSeq, new_sequence: oldSeq });
    } finally {
      this.fsm.transition('ACTIVE');
    }
  }

  private toCsv(entries: AuditEntry[]): string {
    const header = 'sequence,actor,action,resource,outcome,correlation_id,hash,prev_hash,created_at';
    const rows = entries.map(e =>
      `${e.sequence},${e.actor},${e.action},${e.resource},${e.outcome},${e.correlation_id},${e.hash},${e.prev_hash},${e.created_at.toISOString()}`
    );
    return [header, ...rows].join('\\n');
  }
}
''',
    "src/index.ts": '''/**
 * ORG-LG-AUDIT_LOGGER-v0.1.0 — Public API
 */
export { AuditOrchestrator, IAuditLogger } from './audit-logger';
export { AuditEntryEntity } from './audit-entry';
export { HashChainEngine } from './hash-chain-engine';
export { SequenceGenerator } from './sequence-generator';
export { LoggerStateMachine } from './state-machine';
export { IAuditStoragePort } from './storage-interface';
export { IAuditEventPort, AuditLifecycleEvent } from './event-interface';
export { ICryptoPort } from './crypto-interface';
export { IAuditObservabilityPort } from './observability-interface';
export * from './types';
''',
    "package.json": '''{
  "name": "@webwaka/organelle-audit-logger",
  "version": "0.1.0",
  "description": "Audit Logger Organelle — Tamper-evident, append-only audit trail for the WebWaka Biological Architecture",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "lint": "eslint src/"
  },
  "keywords": ["webwaka", "organelle", "audit", "logger", "hash-chain"],
  "license": "PROPRIETARY"
}
''',
    "tsconfig.json": '''{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
''',
    "README.md": '''# @webwaka/organelle-audit-logger

**ORG-LG-AUDIT_LOGGER-v0.1.0** — Tamper-evident, append-only audit trail for the WebWaka Biological Architecture.

## Features
- SHA-256 hash chain for tamper-evidence
- Monotonic sequence numbering
- Append-only immutable storage
- Filtered query support
- JSON-Lines and CSV export
- Configurable retention policies
- Self-monitoring observability

## Architecture
Hexagonal architecture with 3 primary ports (Write, Query, Management) and 4 secondary ports (Storage, Event, Crypto, Observability).

## Quick Start
```typescript
import { AuditOrchestrator } from \'@webwaka/organelle-audit-logger\';

const logger = new AuditOrchestrator(storage, events, crypto, observability);
await logger.initialize();

const receipt = await logger.recordEvent({
  actor: \'webwakaagent4\',
  action: \'SUBJECT_REGISTERED\',
  resource: \'subject:sub-001\',
  outcome: \'SUCCESS\',
  correlation_id: \'corr-abc-123\'
});
```
'''
}

for path, content in files.items():
    full_path = os.path.join(BASE, path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w') as f:
        f.write(content)
    print(f"Written: {path}")
print(f"\nTotal: {len(files)}")
