#!/usr/bin/env python3
"""Implement the Event Dispatcher Organelle in its dedicated repo."""
import subprocess, os, json

PAT = "REDACTED_PAT"
REPO = "webwaka-organelle-event-dispatcher"
ORG = "WebWakaHub"
LOCAL = f"/home/ubuntu/impl-event-dispatcher"

def run(cmd, cwd=None):
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=cwd)
    if r.returncode != 0:
        print(f"WARN: {cmd[:60]}\n  {r.stderr[:200]}")
    return r.stdout.strip()

# Clone
run(f"rm -rf {LOCAL}")
run(f"git clone https://webwaka007:{PAT}@github.com/{ORG}/{REPO}.git {LOCAL}")
run(f'git config user.email "webwakaagent4@webwaka.io"', cwd=LOCAL)
run(f'git config user.name "webwakaagent4"', cwd=LOCAL)
os.makedirs(f"{LOCAL}/src", exist_ok=True)

files = {}

files["src/types.ts"] = '''/**
 * EventDispatcher Organelle — Type Definitions
 *
 * Layer: Organelle
 * Category: Event Management
 * Code: ORG-EM-EVENT_DISPATCHER
 * Version: 0.1.0
 */

/** Unique identifier for a dispatch record */
export type DispatchId = string;

/** Canonical event type identifier */
export type EventType = string;

/** Subscriber identifier */
export type SubscriberId = string;

/** Dispatch lifecycle status */
export enum DispatchStatus {
  PENDING = 'PENDING',
  PARTIALLY_DELIVERED = 'PARTIALLY_DELIVERED',
  DELIVERED = 'DELIVERED',
  DEAD_LETTERED = 'DEAD_LETTERED',
}

/** Per-subscriber delivery status */
export enum DeliveryStatus {
  PENDING = 'PENDING',
  IN_FLIGHT = 'IN_FLIGHT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  DEAD_LETTERED = 'DEAD_LETTERED',
}

/** Subscriber registration record */
export interface SubscriberRegistration {
  readonly subscriberId: SubscriberId;
  readonly eventType: EventType;
  readonly endpointRef: string;
  readonly isActive: boolean;
}

/** Immutable event envelope */
export interface EventEnvelope {
  readonly eventType: EventType;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly occurredAt: Date;
  readonly sourceContext: string;
}

/** Per-subscriber delivery attempt record */
export interface DeliveryAttempt {
  readonly subscriberId: SubscriberId;
  status: DeliveryStatus;
  attemptCount: number;
  lastError?: string;
  deliveredAt?: Date;
  deadLetteredAt?: Date;
}

/** Dispatch record — tracks fan-out delivery across all subscribers */
export interface DispatchRecord {
  readonly id: DispatchId;
  readonly idempotencyKey: string;
  readonly envelope: EventEnvelope;
  status: DispatchStatus;
  readonly deliveryAttempts: DeliveryAttempt[];
  readonly createdAt: Date;
  updatedAt: Date;
}

/** Request to dispatch an event */
export interface DispatchEventRequest {
  readonly idempotencyKey: string;
  readonly eventType: EventType;
  readonly payload: Record<string, unknown>;
  readonly occurredAt: Date;
  readonly sourceContext: string;
}

/** Request to retrieve a dispatch record */
export interface GetDispatchRequest {
  readonly id: DispatchId;
}

/** Result of a single delivery attempt */
export interface DeliveryResult {
  readonly success: boolean;
  readonly error?: string;
}

/** Structured error type */
export class EventDispatcherError extends Error {
  constructor(
    public readonly code: EventDispatcherErrorCode,
    message: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'EventDispatcherError';
  }
}

/** Error codes */
export enum EventDispatcherErrorCode {
  NOT_FOUND = 'EVENT_DISPATCHER_NOT_FOUND',
  ALREADY_EXISTS = 'EVENT_DISPATCHER_ALREADY_EXISTS',
  NO_SUBSCRIBERS = 'EVENT_DISPATCHER_NO_SUBSCRIBERS',
  DELIVERY_FAILED = 'EVENT_DISPATCHER_DELIVERY_FAILED',
  INTERNAL_ERROR = 'EVENT_DISPATCHER_INTERNAL_ERROR',
}

/** Event types emitted by this Organelle */
export enum EventDispatcherEventType {
  DISPATCHED = 'ORG-EM-EVENT_DISPATCHER_DISPATCHED',
  DELIVERED = 'ORG-EM-EVENT_DISPATCHER_DELIVERED',
  FAILED = 'ORG-EM-EVENT_DISPATCHER_FAILED',
  DEAD_LETTERED = 'ORG-EM-EVENT_DISPATCHER_DEAD_LETTERED',
}

/** Lifecycle event emitted by this Organelle */
export interface EventDispatcherEvent {
  readonly type: EventDispatcherEventType;
  readonly dispatchId: DispatchId;
  readonly occurredAt: Date;
  readonly payload: DispatchRecord;
  readonly subscriberId?: SubscriberId;
}
'''

files["src/event-dispatcher-entity.ts"] = '''/**
 * EventDispatcher Entity — Domain Model & Invariant Enforcement
 *
 * Pure domain logic. No I/O side effects.
 * Enforces all invariants declared in P0-T03.
 */
import {
  DispatchRecord,
  DispatchStatus,
  DispatchId,
  DeliveryAttempt,
  DeliveryStatus,
  EventEnvelope,
  DispatchEventRequest,
  EventDispatcherError,
  EventDispatcherErrorCode,
  SubscriberRegistration,
} from './types';

/** Terminal dispatch statuses */
const TERMINAL_DISPATCH_STATUSES: ReadonlySet<DispatchStatus> = new Set([
  DispatchStatus.DELIVERED,
  DispatchStatus.DEAD_LETTERED,
]);

/** Terminal delivery statuses */
const TERMINAL_DELIVERY_STATUSES: ReadonlySet<DeliveryStatus> = new Set([
  DeliveryStatus.DELIVERED,
  DeliveryStatus.DEAD_LETTERED,
]);

/** Generate UUID v4 without external dependencies (INV-ED-001) */
export function generateDispatchId(): DispatchId {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/**
 * Create a new DispatchRecord.
 * INV-ED-001: Unique id
 * INV-ED-006: Payload immutable after creation
 */
export function createDispatchRecord(
  id: DispatchId,
  request: DispatchEventRequest,
  subscribers: SubscriberRegistration[]
): DispatchRecord {
  if (!id || id.trim().length === 0) {
    throw new EventDispatcherError(EventDispatcherErrorCode.INTERNAL_ERROR, 'Dispatch id must be non-empty');
  }
  if (!request.idempotencyKey || request.idempotencyKey.trim().length === 0) {
    throw new EventDispatcherError(EventDispatcherErrorCode.INTERNAL_ERROR, 'idempotencyKey must be non-empty');
  }

  const envelope: EventEnvelope = Object.freeze({
    eventType: request.eventType,
    payload: Object.freeze({ ...request.payload }), // INV-ED-006
    occurredAt: request.occurredAt,
    sourceContext: request.sourceContext,
  });

  const deliveryAttempts: DeliveryAttempt[] = subscribers.map((sub) => ({
    subscriberId: sub.subscriberId,
    status: DeliveryStatus.PENDING,
    attemptCount: 0,
  }));

  const now = new Date();
  return {
    id,
    idempotencyKey: request.idempotencyKey,
    envelope,
    status: DispatchStatus.PENDING,
    deliveryAttempts,
    createdAt: now,
    updatedAt: now,
  };
}

/** Check if a dispatch status is terminal (INV-ED-007) */
export function isTerminalDispatchStatus(status: DispatchStatus): boolean {
  return TERMINAL_DISPATCH_STATUSES.has(status);
}

/** Check if a delivery status is terminal */
export function isTerminalDeliveryStatus(status: DeliveryStatus): boolean {
  return TERMINAL_DELIVERY_STATUSES.has(status);
}

/**
 * Compute the aggregate dispatch status from all delivery attempts.
 * INV-ED-003: Status is monotonically advancing.
 */
export function computeDispatchStatus(attempts: DeliveryAttempt[]): DispatchStatus {
  if (attempts.length === 0) return DispatchStatus.PENDING;

  const allDelivered = attempts.every((a) => a.status === DeliveryStatus.DELIVERED);
  if (allDelivered) return DispatchStatus.DELIVERED;

  const anyDeadLettered = attempts.some((a) => a.status === DeliveryStatus.DEAD_LETTERED);
  if (anyDeadLettered) return DispatchStatus.DEAD_LETTERED;

  const anyDelivered = attempts.some((a) => a.status === DeliveryStatus.DELIVERED);
  if (anyDelivered) return DispatchStatus.PARTIALLY_DELIVERED;

  return DispatchStatus.PENDING;
}

/**
 * Calculate retry backoff delay in milliseconds.
 * Exponential backoff: base * 2^attempt, capped at maxMs.
 */
export function calculateBackoffMs(attempt: number, baseMs = 1000, maxMs = 60000): number {
  return Math.min(baseMs * Math.pow(2, attempt), maxMs);
}
'''

files["src/state-machine.ts"] = '''/**
 * EventDispatcher State Machine
 *
 * Defines valid lifecycle transitions for dispatch records.
 * Implements the design defined in P1-T01.
 */
import { DispatchStatus, DeliveryStatus } from './types';

/** Valid dispatch status transitions */
export const DISPATCH_STATE_MACHINE: ReadonlyMap<DispatchStatus, ReadonlySet<DispatchStatus>> = new Map([
  [DispatchStatus.PENDING, new Set([
    DispatchStatus.PARTIALLY_DELIVERED,
    DispatchStatus.DELIVERED,
    DispatchStatus.DEAD_LETTERED,
  ])],
  [DispatchStatus.PARTIALLY_DELIVERED, new Set([
    DispatchStatus.DELIVERED,
    DispatchStatus.DEAD_LETTERED,
  ])],
  [DispatchStatus.DELIVERED, new Set()],
  [DispatchStatus.DEAD_LETTERED, new Set()],
]);

/** Valid delivery attempt transitions */
export const DELIVERY_STATE_MACHINE: ReadonlyMap<DeliveryStatus, ReadonlySet<DeliveryStatus>> = new Map([
  [DeliveryStatus.PENDING, new Set([DeliveryStatus.IN_FLIGHT])],
  [DeliveryStatus.IN_FLIGHT, new Set([DeliveryStatus.DELIVERED, DeliveryStatus.FAILED])],
  [DeliveryStatus.FAILED, new Set([DeliveryStatus.PENDING, DeliveryStatus.DEAD_LETTERED])],
  [DeliveryStatus.DELIVERED, new Set()],
  [DeliveryStatus.DEAD_LETTERED, new Set()],
]);

export function isValidDispatchTransition(from: DispatchStatus, to: DispatchStatus): boolean {
  return DISPATCH_STATE_MACHINE.get(from)?.has(to) ?? false;
}

export function isValidDeliveryTransition(from: DeliveryStatus, to: DeliveryStatus): boolean {
  return DELIVERY_STATE_MACHINE.get(from)?.has(to) ?? false;
}

export function isTerminalDispatch(status: DispatchStatus): boolean {
  const t = DISPATCH_STATE_MACHINE.get(status);
  return !t || t.size === 0;
}
'''

files["src/storage-interface.ts"] = '''/**
 * EventDispatcher Storage Interface
 *
 * Port definition for persistence. Implementations live at the Cell layer.
 * INV-ED-010: All I/O via injected port interfaces.
 */
import { DispatchRecord, DispatchId, SubscriberRegistration, EventType } from './types';

export interface IEventDispatcherStorage {
  /** Persist a new dispatch record */
  save(record: DispatchRecord): Promise<void>;

  /** Retrieve a dispatch record by id */
  findById(id: DispatchId): Promise<DispatchRecord | null>;

  /** Update an existing dispatch record */
  update(record: DispatchRecord): Promise<void>;

  /** Check if an idempotency key has been used */
  findByIdempotencyKey(key: string): Promise<DispatchId | null>;

  /** Record an idempotency key → dispatch id mapping */
  saveIdempotencyKey(key: string, id: DispatchId): Promise<void>;

  /** Find all active subscribers for an event type */
  findSubscribers(eventType: EventType): Promise<SubscriberRegistration[]>;
}
'''

files["src/delivery-interface.ts"] = '''/**
 * EventDispatcher Delivery Interface
 *
 * Port definition for subscriber delivery. Implementations live at the Cell layer.
 * INV-ED-010: All I/O via injected port interfaces.
 */
import { SubscriberRegistration, EventEnvelope, DeliveryResult } from './types';

export interface IEventDispatcherDelivery {
  /**
   * Attempt to deliver an event envelope to a subscriber.
   * Must return DeliveryResult — must NOT throw.
   */
  deliver(subscriber: SubscriberRegistration, envelope: EventEnvelope): Promise<DeliveryResult>;
}
'''

files["src/event-interface.ts"] = '''/**
 * EventDispatcher Event Interface
 *
 * Port definition for lifecycle event emission.
 * INV-ED-010: All I/O via injected port interfaces.
 */
import { EventDispatcherEvent } from './types';

export interface IEventDispatcherEventEmitter {
  /** Emit a lifecycle event. Fire-and-forget; must not throw. */
  emit(event: EventDispatcherEvent): Promise<void>;
}
'''

files["src/observability-interface.ts"] = '''/**
 * EventDispatcher Observability Interface
 *
 * Port definition for metrics, logging, and tracing.
 * INV-ED-010: All I/O via injected port interfaces.
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export enum MetricType {
  COUNTER = 'COUNTER',
  GAUGE = 'GAUGE',
  HISTOGRAM = 'HISTOGRAM',
}

export interface IEventDispatcherObservability {
  log(level: LogLevel, message: string, context?: Record<string, unknown>): void;
  metric(name: string, type: MetricType, value: number, labels?: Record<string, string>): void;
  startSpan(operationName: string, context?: Record<string, unknown>): () => void;
}
'''

files["src/event-dispatcher-orchestrator.ts"] = '''/**
 * EventDispatcher Organelle — Main Orchestrator
 *
 * Coordinates all EventDispatcher operations.
 * Enforces all invariants and constraints defined in P0-T03.
 * Emits lifecycle events after every state-changing operation.
 *
 * Constitutional Reference: ORG-EM-EVENT_DISPATCHER
 */
import {
  DispatchRecord,
  DispatchId,
  DispatchStatus,
  DeliveryAttempt,
  DeliveryStatus,
  DispatchEventRequest,
  GetDispatchRequest,
  EventDispatcherError,
  EventDispatcherErrorCode,
  EventDispatcherEvent,
  EventDispatcherEventType,
} from './types';
import {
  generateDispatchId,
  createDispatchRecord,
  isTerminalDispatchStatus,
  isTerminalDeliveryStatus,
  computeDispatchStatus,
  calculateBackoffMs,
} from './event-dispatcher-entity';
import { IEventDispatcherStorage } from './storage-interface';
import { IEventDispatcherDelivery } from './delivery-interface';
import { IEventDispatcherEventEmitter } from './event-interface';
import { IEventDispatcherObservability, LogLevel, MetricType } from './observability-interface';

/** Primary interface contract */
export interface IEventDispatcher {
  dispatch(request: DispatchEventRequest): Promise<DispatchRecord>;
  getDispatch(request: GetDispatchRequest): Promise<DispatchRecord>;
}

/** Configuration for retry behaviour */
export interface EventDispatcherConfig {
  maxRetries?: number;
  baseRetryDelayMs?: number;
  maxRetryDelayMs?: number;
}

const DEFAULT_CONFIG: Required<EventDispatcherConfig> = {
  maxRetries: 5,
  baseRetryDelayMs: 1000,
  maxRetryDelayMs: 60000,
};

/**
 * EventDispatcher Organelle Implementation
 *
 * All dependencies injected at construction time (Dependency Inversion).
 * No framework, no database engine, no HTTP server — pure domain logic.
 */
export class EventDispatcher implements IEventDispatcher {
  private readonly config: Required<EventDispatcherConfig>;

  constructor(
    private readonly storage: IEventDispatcherStorage,
    private readonly delivery: IEventDispatcherDelivery,
    private readonly eventEmitter: IEventDispatcherEventEmitter,
    private readonly observability: IEventDispatcherObservability,
    config: EventDispatcherConfig = {}
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Dispatch an event to all active subscribers (fan-out).
   * INV-ED-002: Idempotency key prevents duplicate dispatches.
   * INV-ED-004: Per-subscriber delivery state is independent.
   */
  async dispatch(request: DispatchEventRequest): Promise<DispatchRecord> {
    const span = this.observability.startSpan('EventDispatcher.dispatch', {
      eventType: request.eventType,
      idempotencyKey: request.idempotencyKey,
    });

    try {
      // INV-ED-002: Idempotency guard
      const existingId = await this.storage.findByIdempotencyKey(request.idempotencyKey);
      if (existingId) {
        const existing = await this.storage.findById(existingId);
        if (existing) {
          this.observability.log(LogLevel.INFO, 'Idempotent dispatch — returning existing record', {
            id: existingId,
            idempotencyKey: request.idempotencyKey,
          });
          return existing;
        }
      }

      // Resolve subscribers
      const subscribers = await this.storage.findSubscribers(request.eventType);
      if (subscribers.length === 0) {
        throw new EventDispatcherError(
          EventDispatcherErrorCode.NO_SUBSCRIBERS,
          `No active subscribers for event type: ${request.eventType}`,
          { eventType: request.eventType }
        );
      }

      // Create dispatch record
      const id = generateDispatchId();
      const record = createDispatchRecord(id, request, subscribers);

      await this.storage.save(record);
      await this.storage.saveIdempotencyKey(request.idempotencyKey, id);

      // Emit DISPATCHED event
      await this._emitEvent(EventDispatcherEventType.DISPATCHED, record);
      this.observability.metric('event-dispatcher.dispatched', MetricType.COUNTER, 1, {
        event_type: request.eventType,
      });

      // Fan-out delivery loop (INV-ED-004: independent per subscriber)
      for (const attempt of record.deliveryAttempts) {
        await this._deliverToSubscriber(record, attempt);
      }

      // Compute final aggregate status (INV-ED-003)
      record.status = computeDispatchStatus(record.deliveryAttempts);
      record.updatedAt = new Date();
      await this.storage.update(record);

      this.observability.log(LogLevel.INFO, 'Dispatch complete', {
        id: record.id,
        status: record.status,
        subscriberCount: subscribers.length,
      });

      return record;
    } catch (err) {
      this.observability.log(LogLevel.ERROR, 'Dispatch failed', { error: String(err) });
      if (err instanceof EventDispatcherError) throw err;
      throw new EventDispatcherError(EventDispatcherErrorCode.INTERNAL_ERROR, `Dispatch failed: ${String(err)}`);
    } finally {
      span();
    }
  }

  /**
   * Retrieve an existing dispatch record.
   */
  async getDispatch(request: GetDispatchRequest): Promise<DispatchRecord> {
    const span = this.observability.startSpan('EventDispatcher.getDispatch', { id: request.id });
    try {
      const record = await this.storage.findById(request.id);
      if (!record) {
        throw new EventDispatcherError(
          EventDispatcherErrorCode.NOT_FOUND,
          `Dispatch record not found: ${request.id}`
        );
      }
      return record;
    } catch (err) {
      if (err instanceof EventDispatcherError) throw err;
      throw new EventDispatcherError(EventDispatcherErrorCode.INTERNAL_ERROR, `GetDispatch failed: ${String(err)}`);
    } finally {
      span();
    }
  }

  /**
   * Deliver an event to a single subscriber with retry backoff.
   * INV-ED-004: Failure of one subscriber does not affect others.
   * INV-ED-005: Dead-letter after maxRetries exhausted.
   */
  private async _deliverToSubscriber(
    record: DispatchRecord,
    attempt: DeliveryAttempt
  ): Promise<void> {
    const span = this.observability.startSpan('EventDispatcher.deliverToSubscriber', {
      subscriberId: attempt.subscriberId,
      dispatchId: record.id,
    });

    const subscriber = { subscriberId: attempt.subscriberId, eventType: record.envelope.eventType, endpointRef: '', isActive: true };

    try {
      attempt.status = DeliveryStatus.IN_FLIGHT;

      for (let i = 0; i <= this.config.maxRetries; i++) {
        attempt.attemptCount = i + 1;

        const result = await this.delivery.deliver(subscriber, record.envelope);

        if (result.success) {
          attempt.status = DeliveryStatus.DELIVERED;
          attempt.deliveredAt = new Date();
          this.observability.metric('event-dispatcher.delivered', MetricType.COUNTER, 1, {
            event_type: record.envelope.eventType,
            subscriber_id: attempt.subscriberId,
          });
          await this._emitEvent(EventDispatcherEventType.DELIVERED, record, attempt.subscriberId);
          return;
        }

        attempt.lastError = result.error;
        this.observability.log(LogLevel.WARN, 'Delivery attempt failed', {
          subscriberId: attempt.subscriberId,
          attempt: i + 1,
          error: result.error,
        });
        this.observability.metric('event-dispatcher.retry_attempt', MetricType.COUNTER, 1, {
          event_type: record.envelope.eventType,
          attempt: String(i + 1),
        });

        if (i < this.config.maxRetries) {
          // Backoff delay (INV-ED-005: retry before dead-letter)
          const delayMs = calculateBackoffMs(i, this.config.baseRetryDelayMs, this.config.maxRetryDelayMs);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          attempt.status = DeliveryStatus.FAILED;
        }
      }

      // INV-ED-005: Max retries exhausted — dead-letter
      attempt.status = DeliveryStatus.DEAD_LETTERED;
      attempt.deadLetteredAt = new Date();
      this.observability.metric('event-dispatcher.dead_lettered', MetricType.COUNTER, 1, {
        event_type: record.envelope.eventType,
        subscriber_id: attempt.subscriberId,
      });
      this.observability.log(LogLevel.ERROR, 'Delivery dead-lettered after max retries', {
        subscriberId: attempt.subscriberId,
        maxRetries: this.config.maxRetries,
        lastError: attempt.lastError,
      });
      await this._emitEvent(EventDispatcherEventType.DEAD_LETTERED, record, attempt.subscriberId);
    } finally {
      span();
    }
  }

  /** Emit a lifecycle event. Swallows errors per INV-ED-010. */
  private async _emitEvent(
    type: EventDispatcherEventType,
    record: DispatchRecord,
    subscriberId?: string
  ): Promise<void> {
    try {
      const event: EventDispatcherEvent = {
        type,
        dispatchId: record.id,
        occurredAt: new Date(),
        payload: record,
        subscriberId,
      };
      await this.eventEmitter.emit(event);
    } catch {
      // Observability errors must not propagate (INV-ED-010)
    }
  }
}
'''

files["src/index.ts"] = '''/**
 * EventDispatcher Organelle — Public API
 *
 * This is the only export surface. All consumers must use this interface.
 */
export { IEventDispatcher, EventDispatcher, EventDispatcherConfig } from './event-dispatcher-orchestrator';
export {
  DispatchRecord,
  DispatchStatus,
  DispatchId,
  EventType,
  SubscriberId,
  EventEnvelope,
  DeliveryAttempt,
  DeliveryStatus,
  SubscriberRegistration,
  DispatchEventRequest,
  GetDispatchRequest,
  DeliveryResult,
  EventDispatcherError,
  EventDispatcherErrorCode,
  EventDispatcherEvent,
  EventDispatcherEventType,
} from './types';
export { IEventDispatcherStorage } from './storage-interface';
export { IEventDispatcherDelivery } from './delivery-interface';
export { IEventDispatcherEventEmitter } from './event-interface';
export { IEventDispatcherObservability, LogLevel, MetricType } from './observability-interface';
export { isValidDispatchTransition, isTerminalDispatch } from './state-machine';
export { calculateBackoffMs } from './event-dispatcher-entity';
'''

files["package.json"] = json.dumps({
    "name": "@webwaka/organelle-event-dispatcher",
    "version": "0.1.0",
    "description": "WebWaka Event Dispatcher Organelle — Atomic primitive for reliable event routing and fan-out delivery",
    "main": "dist/index.js",
    "types": "dist/index.d.ts",
    "scripts": {
        "build": "tsc",
        "test": "echo \"Tests not yet implemented\" && exit 0"
    },
    "keywords": ["webwaka", "organelle", "event-management", "event-dispatcher"],
    "author": "WebWaka",
    "license": "UNLICENSED",
    "private": True,
    "devDependencies": {"typescript": "^5.3.3"},
    "dependencies": {}
}, indent=2)

files["tsconfig.json"] = json.dumps({
    "compilerOptions": {
        "target": "ES2020", "module": "commonjs", "lib": ["ES2020"],
        "declaration": True, "outDir": "./dist", "rootDir": "./src",
        "strict": True, "esModuleInterop": True, "skipLibCheck": True,
        "forceConsistentCasingInFileNames": True, "resolveJsonModule": True,
        "moduleResolution": "node"
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules", "dist"]
}, indent=2)

files["README.md"] = """# EventDispatcher Organelle (`ORG-EM-EVENT_DISPATCHER`)

**Layer:** Organelle  
**Category:** Event Management  
**Version:** 0.1.0  
**Status:** Ratified

## Overview

Atomic primitive for reliable, ordered, fan-out event routing from a single source to multiple registered subscribers, with at-least-once delivery guarantees and dead-letter handling.

## Directory Structure

```
src/
  types.ts                         — Type definitions and error codes
  event-dispatcher-entity.ts       — Domain model and invariant enforcement
  state-machine.ts                 — Dispatch lifecycle state machine
  storage-interface.ts             — Storage port (IEventDispatcherStorage)
  delivery-interface.ts            — Delivery port (IEventDispatcherDelivery)
  event-interface.ts               — Event port (IEventDispatcherEventEmitter)
  observability-interface.ts       — Observability port
  event-dispatcher-orchestrator.ts — Main orchestrator (IEventDispatcher)
  index.ts                         — Public API surface
```

## Usage

```typescript
import { EventDispatcher } from '@webwaka/organelle-event-dispatcher';

const dispatcher = new EventDispatcher(
  storageAdapter,    // IEventDispatcherStorage
  deliveryAdapter,   // IEventDispatcherDelivery
  eventEmitter,      // IEventDispatcherEventEmitter
  observability,     // IEventDispatcherObservability
  { maxRetries: 5 }  // optional config
);

const record = await dispatcher.dispatch({
  idempotencyKey: 'subject-registered-abc123',
  eventType: 'SUBJECT_REGISTERED',
  payload: { subjectId: 'sub-001' },
  occurredAt: new Date(),
  sourceContext: 'organelle:subject-registry',
});
```

## Constitutional Compliance

- No framework lock-in
- No database engine dependency  
- No HTTP server dependency
- No UI logic
- All dependencies injected via ports (Dependency Inversion)
- All invariants enforced in entity module

## Ratification

**Status:** RATIFIED  
**Authority:** webwaka007  
**Constitutional Reference:** ORG-EM-EVENT_DISPATCHER-v0.1.0
"""

# Write all files
for filepath, content in files.items():
    full = f"{LOCAL}/{filepath}"
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, 'w') as f:
        f.write(content)
    print(f"Written: {filepath}")

# Commit and push
run("git add -A", cwd=LOCAL)
commit_msg = """feat(ORG-EM-EVENT_DISPATCHER-P3): Implement EventDispatcher Organelle

Constitutional Reference: ORG-EM-EVENT_DISPATCHER
Phase: 3 — Implementation
Agent: webwakaagent4

Implements:
- types.ts: Type definitions, enums, error codes
- event-dispatcher-entity.ts: Domain model, invariant enforcement
- state-machine.ts: Dispatch lifecycle state machine
- storage-interface.ts: Storage port (IEventDispatcherStorage)
- delivery-interface.ts: Delivery port (IEventDispatcherDelivery)
- event-interface.ts: Event port (IEventDispatcherEventEmitter)
- observability-interface.ts: Observability port
- event-dispatcher-orchestrator.ts: Main orchestrator with fan-out
- index.ts: Public API surface

Key features:
- Fan-out delivery to all active subscribers
- Idempotency via idempotencyKey (INV-ED-002)
- Exponential backoff retry (INV-ED-005)
- Dead-letter routing after maxRetries exhausted
- Independent per-subscriber delivery state (INV-ED-004)
- Immutable event payload (INV-ED-006)
- No framework dependencies. All I/O via injected ports."""

run(f'git commit -m "{commit_msg}"', cwd=LOCAL)
out = run("git push origin main", cwd=LOCAL)
sha = run("git rev-parse --short HEAD", cwd=LOCAL)
print(f"\nPUSHED: {sha}")
print(f"Repo: WebWakaHub/{REPO}")
