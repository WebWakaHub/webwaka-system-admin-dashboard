#!/usr/bin/env python3
"""Generate TypeScript implementation for Telemetry Collector organelle."""
import os

BASE = "/home/ubuntu/impl-webwaka-organelle-telemetry-collector"
os.makedirs(f"{BASE}/src", exist_ok=True)

files = {
    "package.json": """{
  "name": "@webwaka/organelle-telemetry-collector",
  "version": "0.1.0",
  "description": "Telemetry Collector Organelle — Signal ingestion, buffering, aggregation, forwarding",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": { "build": "tsc", "test": "jest" },
  "dependencies": { "uuid": "^9.0.0" },
  "devDependencies": { "typescript": "^5.3.0", "@types/node": "^20.0.0", "jest": "^29.0.0", "ts-jest": "^29.0.0" }
}""",
    "tsconfig.json": """{
  "compilerOptions": { "target": "ES2022", "module": "commonjs", "lib": ["ES2022"], "outDir": "./dist", "rootDir": "./src", "strict": true, "esModuleInterop": true, "declaration": true, "sourceMap": true },
  "include": ["src/**/*"]
}""",
    "README.md": """# Telemetry Collector Organelle

**Code:** ORG-TS-TELEMETRY_COLLECTOR | **Version:** 0.1.0 | **Category:** Telemetry & Signals

Collects, buffers, aggregates, and forwards telemetry signals (metrics, traces, logs) from all organelles.

## Key Components
- **BufferManager** — Ring buffer with backpressure (100K capacity)
- **AggregatorEngine** — Time-window rollups (sum, avg, min, max, p50, p95, p99)
- **FlushScheduler** — Periodic flush at configurable intervals
- **TelemetryOrchestrator** — Main orchestrator with 6-state FSM
""",
    "src/types.ts": """// ORG-TS-TELEMETRY_COLLECTOR-v0.1.0 — Type Definitions

export type CollectorState = 'INITIALIZING' | 'COLLECTING' | 'FLUSHING' | 'BACKPRESSURE' | 'DRAINING' | 'STOPPED';
export type SignalType = 'METRIC' | 'TRACE' | 'LOG';
export type SinkState = 'CONNECTED' | 'DEGRADED' | 'DISCONNECTED';
export type RollupFn = 'sum' | 'avg' | 'min' | 'max' | 'p50' | 'p95' | 'p99';

export interface TelemetrySignal {
  readonly signal_id: string;
  readonly signal_type: SignalType;
  readonly payload: Record<string, unknown>;
  readonly correlation_id: string;
  readonly organelle_id: string;
  readonly timestamp: Date;
}

export interface IngestMetricCommand {
  readonly metric_name: string;
  readonly value: number;
  readonly labels: Record<string, string>;
  readonly timestamp: Date;
  readonly correlation_id: string;
}

export interface IngestTraceCommand {
  readonly trace_id: string;
  readonly span_id: string;
  readonly operation: string;
  readonly attributes: Record<string, unknown>;
  readonly start_time: Date;
  readonly end_time?: Date;
  readonly correlation_id: string;
}

export interface IngestLogCommand {
  readonly level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  readonly message: string;
  readonly context: Record<string, unknown>;
  readonly timestamp: Date;
  readonly correlation_id: string;
}

export interface IngestBatchCommand { readonly signals: Array<IngestMetricCommand | IngestTraceCommand | IngestLogCommand>; }

export interface IngestionReceipt {
  readonly receipt_id: string;
  readonly signal_count: number;
  readonly accepted: number;
  readonly rejected: number;
}

export interface AggregatedMetric {
  readonly metric_name: string;
  readonly window_start: Date;
  readonly window_end: Date;
  readonly rollup_fn: RollupFn;
  readonly value: number;
  readonly labels: Record<string, string>;
}

export interface CollectorHealth {
  readonly status: CollectorState;
  readonly buffer_utilization: number;
  readonly throughput_rps: number;
  readonly sink_statuses: Record<string, SinkState>;
}

export interface BufferStatus {
  readonly capacity: number;
  readonly used: number;
  readonly utilization: number;
}

export interface ForwardingResult {
  readonly sink_id: string;
  readonly signals_forwarded: number;
  readonly errors: number;
}

export interface ConfigureSinkCommand {
  readonly sink_id: string;
  readonly sink_type: string;
  readonly endpoint: string;
  readonly credentials?: Record<string, string>;
}

export interface SetRetentionPolicyCommand {
  readonly signal_type: SignalType;
  readonly ttl_seconds: number;
}

export interface MetricQuery {
  readonly metric_name: string;
  readonly window: string;
  readonly rollup_fn: RollupFn;
  readonly from: Date;
  readonly to: Date;
}

export interface SignalQuery {
  readonly signal_type?: SignalType;
  readonly correlation_id?: string;
  readonly from?: Date;
  readonly to?: Date;
  readonly limit?: number;
}

export interface TelemetryEvent {
  readonly event_id: string;
  readonly event_type: string;
  readonly aggregate_id: string;
  readonly payload: Record<string, unknown>;
  readonly timestamp: Date;
}

export interface SinkConfig {
  readonly sink_id: string;
  readonly sink_type: string;
  readonly endpoint: string;
  readonly credentials?: Record<string, string>;
  state: SinkState;
}

export class TelemetryCollectorError extends Error {
  constructor(public readonly code: string, message: string) { super(message); this.name = 'TelemetryCollectorError'; }
}
""",
    "src/buffer-manager.ts": """// ORG-TS-TELEMETRY_COLLECTOR-v0.1.0 — Buffer Manager with Backpressure

import { TelemetrySignal, BufferStatus, TelemetryCollectorError } from './types';

const DEFAULT_CAPACITY = 100_000;
const HIGH_WATERMARK = 0.8;
const LOW_WATERMARK = 0.6;

export class BufferManager {
  private readonly buffer: TelemetrySignal[] = [];
  private readonly capacity: number;

  constructor(capacity: number = DEFAULT_CAPACITY) {
    this.capacity = capacity;
  }

  add(signal: TelemetrySignal): void {
    if (this.buffer.length >= this.capacity) {
      throw new TelemetryCollectorError('TC-003', 'Buffer overflow — backpressure applied');
    }
    this.buffer.push(signal);
  }

  addBatch(signals: TelemetrySignal[]): { accepted: number; rejected: number } {
    let accepted = 0, rejected = 0;
    for (const signal of signals) {
      if (this.buffer.length >= this.capacity) { rejected++; continue; }
      this.buffer.push(signal);
      accepted++;
    }
    return { accepted, rejected };
  }

  drain(count?: number): TelemetrySignal[] {
    const n = count ?? this.buffer.length;
    return this.buffer.splice(0, n);
  }

  get isBackpressureActive(): boolean { return this.utilization >= HIGH_WATERMARK; }
  get isBackpressureRelieved(): boolean { return this.utilization < LOW_WATERMARK; }
  get utilization(): number { return this.buffer.length / this.capacity; }
  get size(): number { return this.buffer.length; }
  get isEmpty(): boolean { return this.buffer.length === 0; }

  getStatus(): BufferStatus {
    return { capacity: this.capacity, used: this.buffer.length, utilization: this.utilization };
  }
}
""",
    "src/aggregator-engine.ts": """// ORG-TS-TELEMETRY_COLLECTOR-v0.1.0 — Aggregator Engine

import { TelemetrySignal, AggregatedMetric, RollupFn } from './types';

export class AggregatorEngine {
  aggregate(signals: TelemetrySignal[], metricName: string, windowMs: number, rollupFn: RollupFn): AggregatedMetric[] {
    const metrics = signals.filter(s => s.signal_type === 'METRIC' && (s.payload as any).metric_name === metricName);
    if (metrics.length === 0) return [];

    const sorted = [...metrics].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const windows: Map<number, number[]> = new Map();

    for (const m of sorted) {
      const windowStart = Math.floor(m.timestamp.getTime() / windowMs) * windowMs;
      if (!windows.has(windowStart)) windows.set(windowStart, []);
      windows.get(windowStart)!.push((m.payload as any).value);
    }

    const results: AggregatedMetric[] = [];
    for (const [windowStart, values] of windows) {
      results.push({
        metric_name: metricName,
        window_start: new Date(windowStart),
        window_end: new Date(windowStart + windowMs),
        rollup_fn: rollupFn,
        value: this.computeRollup(values, rollupFn),
        labels: {},
      });
    }
    return results;
  }

  private computeRollup(values: number[], fn: RollupFn): number {
    const sorted = [...values].sort((a, b) => a - b);
    switch (fn) {
      case 'sum': return values.reduce((a, b) => a + b, 0);
      case 'avg': return values.reduce((a, b) => a + b, 0) / values.length;
      case 'min': return sorted[0];
      case 'max': return sorted[sorted.length - 1];
      case 'p50': return sorted[Math.floor(sorted.length * 0.5)];
      case 'p95': return sorted[Math.floor(sorted.length * 0.95)];
      case 'p99': return sorted[Math.floor(sorted.length * 0.99)];
    }
  }
}
""",
    "src/enrichment-pipeline.ts": """// ORG-TS-TELEMETRY_COLLECTOR-v0.1.0 — Signal Enrichment Pipeline

import { TelemetrySignal, TelemetryCollectorError } from './types';

const METRIC_NAME_REGEX = /^[a-z][a-z0-9_]*(?:\\.[a-z][a-z0-9_]*)*$/;

export class EnrichmentPipeline {
  validate(signal: TelemetrySignal): void {
    if (!signal.correlation_id) {
      throw new TelemetryCollectorError('TC-002', 'Signal missing correlation_id (INV-S01)');
    }
    if (signal.signal_type === 'METRIC') {
      const name = (signal.payload as any).metric_name;
      if (!name || !METRIC_NAME_REGEX.test(name)) {
        throw new TelemetryCollectorError('TC-002', `Invalid metric name format: ${name} (INV-S02)`);
      }
    }
    if (signal.signal_type === 'TRACE') {
      if (!(signal.payload as any).trace_id) {
        throw new TelemetryCollectorError('TC-002', 'Trace span missing trace_id (INV-S03)');
      }
    }
    if (signal.signal_type === 'LOG') {
      const level = (signal.payload as any).level;
      if (!['DEBUG', 'INFO', 'WARN', 'ERROR'].includes(level)) {
        throw new TelemetryCollectorError('TC-002', `Invalid log level: ${level} (INV-S04)`);
      }
    }
  }

  enrich(signal: TelemetrySignal, organelleId: string): TelemetrySignal {
    return {
      ...signal,
      organelle_id: organelleId || signal.organelle_id,
      timestamp: signal.timestamp || new Date(),
    };
  }
}
""",
    "src/state-machine.ts": """// ORG-TS-TELEMETRY_COLLECTOR-v0.1.0 — State Machine

import { CollectorState } from './types';

export interface Transition { from: CollectorState; to: CollectorState; trigger: string; }

export const COLLECTOR_TRANSITIONS: Transition[] = [
  { from: 'INITIALIZING', to: 'COLLECTING', trigger: 'config_loaded' },
  { from: 'COLLECTING', to: 'FLUSHING', trigger: 'flush_triggered' },
  { from: 'FLUSHING', to: 'COLLECTING', trigger: 'flush_complete' },
  { from: 'COLLECTING', to: 'BACKPRESSURE', trigger: 'buffer_high' },
  { from: 'BACKPRESSURE', to: 'COLLECTING', trigger: 'buffer_low' },
  { from: 'COLLECTING', to: 'DRAINING', trigger: 'shutdown' },
  { from: 'BACKPRESSURE', to: 'DRAINING', trigger: 'shutdown' },
  { from: 'DRAINING', to: 'STOPPED', trigger: 'drain_complete' },
];

export function isValidTransition(from: CollectorState, to: CollectorState): boolean {
  return COLLECTOR_TRANSITIONS.some(t => t.from === from && t.to === to);
}

export function getTerminalStates(): CollectorState[] { return ['STOPPED']; }
export function getInitialState(): CollectorState { return 'INITIALIZING'; }
""",
    "src/storage-interface.ts": """// ORG-TS-TELEMETRY_COLLECTOR-v0.1.0 — Storage Port Interface

import { TelemetrySignal, SignalQuery } from './types';

export interface ISignalStoragePort {
  storeSignal(signal: TelemetrySignal): Promise<void>;
  storeSignalBatch(signals: TelemetrySignal[]): Promise<void>;
  querySignals(query: SignalQuery): Promise<TelemetrySignal[]>;
  deleteExpired(ttlSeconds: number): Promise<number>;
}
""",
    "src/forwarding-interface.ts": """// ORG-TS-TELEMETRY_COLLECTOR-v0.1.0 — Signal Forwarding Port Interface

import { TelemetrySignal, ForwardingResult, SinkState } from './types';

export interface ISignalForwardingPort {
  forward(sinkId: string, signals: TelemetrySignal[]): Promise<ForwardingResult>;
  checkSinkHealth(sinkId: string): Promise<SinkState>;
}
""",
    "src/event-interface.ts": """// ORG-TS-TELEMETRY_COLLECTOR-v0.1.0 — Event Port Interface

import { TelemetryEvent } from './types';

export interface ITelemetryEventPort {
  emit(event: TelemetryEvent): Promise<void>;
  emitBatch(events: TelemetryEvent[]): Promise<void>;
}

export function createTelemetryEvent(type: string, aggregateId: string, payload: Record<string, unknown>): TelemetryEvent {
  return { event_id: crypto.randomUUID(), event_type: type, aggregate_id: aggregateId, payload, timestamp: new Date() };
}
""",
    "src/observability-interface.ts": """// ORG-TS-TELEMETRY_COLLECTOR-v0.1.0 — Observability Port (Self-Telemetry)

export interface MetricEntry { name: string; value: number; labels: Record<string, string>; timestamp: Date; }
export interface LogEntry { level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'; message: string; context: Record<string, unknown>; timestamp: Date; }

export interface ITelemetryObservabilityPort {
  recordMetric(metric: MetricEntry): void;
  recordLog(entry: LogEntry): void;
}

export function createMetric(name: string, value: number, labels: Record<string, string> = {}): MetricEntry {
  return { name, value, labels, timestamp: new Date() };
}
export function createLog(level: LogEntry['level'], message: string, context: Record<string, unknown> = {}): LogEntry {
  return { level, message, context, timestamp: new Date() };
}
""",
    "src/telemetry-orchestrator.ts": """// ORG-TS-TELEMETRY_COLLECTOR-v0.1.0 — Main Orchestrator

import { ISignalStoragePort } from './storage-interface';
import { ISignalForwardingPort } from './forwarding-interface';
import { ITelemetryEventPort, createTelemetryEvent } from './event-interface';
import { ITelemetryObservabilityPort, createMetric, createLog } from './observability-interface';
import { BufferManager } from './buffer-manager';
import { AggregatorEngine } from './aggregator-engine';
import { EnrichmentPipeline } from './enrichment-pipeline';
import { isValidTransition } from './state-machine';
import {
  CollectorState, TelemetrySignal, IngestMetricCommand, IngestTraceCommand, IngestLogCommand,
  IngestBatchCommand, IngestionReceipt, CollectorHealth, BufferStatus, ForwardingResult,
  ConfigureSinkCommand, SetRetentionPolicyCommand, MetricQuery, AggregatedMetric,
  SinkConfig, TelemetryCollectorError,
} from './types';

export class TelemetryOrchestrator {
  private state: CollectorState = 'INITIALIZING';
  private readonly buffer: BufferManager;
  private readonly aggregator = new AggregatorEngine();
  private readonly enrichment = new EnrichmentPipeline();
  private readonly sinks: Map<string, SinkConfig> = new Map();
  private readonly retentionPolicies: Map<string, number> = new Map();
  private ingestCount = 0;

  constructor(
    private readonly storage: ISignalStoragePort,
    private readonly forwarding: ISignalForwardingPort,
    private readonly events: ITelemetryEventPort,
    private readonly observability: ITelemetryObservabilityPort,
    bufferCapacity: number = 100_000,
  ) {
    this.buffer = new BufferManager(bufferCapacity);
    this.transitionTo('COLLECTING');
  }

  private transitionTo(target: CollectorState): void {
    if (!isValidTransition(this.state, target)) {
      throw new TelemetryCollectorError('TC-009', `Invalid transition: ${this.state} → ${target}`);
    }
    this.state = target;
  }

  async ingestMetric(cmd: IngestMetricCommand): Promise<IngestionReceipt> {
    this.ensureAccepting();
    const signal: TelemetrySignal = {
      signal_id: crypto.randomUUID(), signal_type: 'METRIC',
      payload: { metric_name: cmd.metric_name, value: cmd.value, labels: cmd.labels },
      correlation_id: cmd.correlation_id, organelle_id: '', timestamp: cmd.timestamp,
    };
    return this.ingestSingle(signal);
  }

  async ingestTrace(cmd: IngestTraceCommand): Promise<IngestionReceipt> {
    this.ensureAccepting();
    const signal: TelemetrySignal = {
      signal_id: crypto.randomUUID(), signal_type: 'TRACE',
      payload: { trace_id: cmd.trace_id, span_id: cmd.span_id, operation: cmd.operation, attributes: cmd.attributes, start_time: cmd.start_time, end_time: cmd.end_time },
      correlation_id: cmd.correlation_id, organelle_id: '', timestamp: cmd.start_time,
    };
    return this.ingestSingle(signal);
  }

  async ingestLog(cmd: IngestLogCommand): Promise<IngestionReceipt> {
    this.ensureAccepting();
    const signal: TelemetrySignal = {
      signal_id: crypto.randomUUID(), signal_type: 'LOG',
      payload: { level: cmd.level, message: cmd.message, context: cmd.context },
      correlation_id: cmd.correlation_id, organelle_id: '', timestamp: cmd.timestamp,
    };
    return this.ingestSingle(signal);
  }

  async ingestBatch(cmd: IngestBatchCommand): Promise<IngestionReceipt> {
    this.ensureAccepting();
    let accepted = 0, rejected = 0;
    for (const s of cmd.signals) {
      try { await this.ingestMetric(s as IngestMetricCommand); accepted++; } catch { rejected++; }
    }
    return { receipt_id: crypto.randomUUID(), signal_count: cmd.signals.length, accepted, rejected };
  }

  private async ingestSingle(signal: TelemetrySignal): Promise<IngestionReceipt> {
    this.enrichment.validate(signal);
    const enriched = this.enrichment.enrich(signal, signal.organelle_id);
    this.buffer.add(enriched);
    this.ingestCount++;
    this.observability.recordMetric(createMetric('tc.signals.ingested.count', 1, { type: signal.signal_type }));
    await this.events.emit(createTelemetryEvent('SignalIngested', signal.signal_id, { type: signal.signal_type }));
    if (this.buffer.isBackpressureActive && this.state === 'COLLECTING') {
      this.transitionTo('BACKPRESSURE');
      this.observability.recordMetric(createMetric('tc.backpressure.active', 1));
    }
    return { receipt_id: crypto.randomUUID(), signal_count: 1, accepted: 1, rejected: 0 };
  }

  async configureSink(cmd: ConfigureSinkCommand): Promise<void> {
    if (this.sinks.size >= 10) throw new TelemetryCollectorError('TC-006', 'Maximum 10 sinks (CON-O05)');
    this.sinks.set(cmd.sink_id, { ...cmd, state: 'CONNECTED' });
    await this.events.emit(createTelemetryEvent('SinkRegistered', cmd.sink_id, { type: cmd.sink_type }));
  }

  async setRetentionPolicy(cmd: SetRetentionPolicyCommand): Promise<void> {
    this.retentionPolicies.set(cmd.signal_type, cmd.ttl_seconds);
  }

  async flushBuffer(signalType?: string): Promise<ForwardingResult> {
    const signals = this.buffer.drain(1000);
    if (signals.length === 0) return { sink_id: 'all', signals_forwarded: 0, errors: 0 };
    await this.storage.storeSignalBatch(signals);
    let totalForwarded = 0, totalErrors = 0;
    for (const [sinkId] of this.sinks) {
      const result = await this.forwarding.forward(sinkId, signals);
      totalForwarded += result.signals_forwarded;
      totalErrors += result.errors;
    }
    await this.events.emit(createTelemetryEvent('BufferFlushed', 'collector', { count: signals.length }));
    return { sink_id: 'all', signals_forwarded: totalForwarded, errors: totalErrors };
  }

  async getCollectorHealth(): Promise<CollectorHealth> {
    const sinkStatuses: Record<string, any> = {};
    for (const [id, config] of this.sinks) sinkStatuses[id] = config.state;
    return { status: this.state, buffer_utilization: this.buffer.utilization * 100, throughput_rps: this.ingestCount, sink_statuses: sinkStatuses };
  }

  async getBufferStatus(): Promise<BufferStatus> { return this.buffer.getStatus(); }

  async getAggregatedMetrics(query: MetricQuery): Promise<AggregatedMetric[]> {
    const signals = await this.storage.querySignals({ signal_type: 'METRIC', from: query.from, to: query.to });
    const windowMs = parseInt(query.window) * 1000;
    return this.aggregator.aggregate(signals, query.metric_name, windowMs, query.rollup_fn);
  }

  private ensureAccepting(): void {
    if (this.state === 'STOPPED' || this.state === 'DRAINING') {
      throw new TelemetryCollectorError('TC-003', `Collector not accepting signals in state: ${this.state}`);
    }
  }
}
""",
    "src/index.ts": """// ORG-TS-TELEMETRY_COLLECTOR-v0.1.0 — Public API

export { TelemetryOrchestrator } from './telemetry-orchestrator';
export { BufferManager } from './buffer-manager';
export { AggregatorEngine } from './aggregator-engine';
export { EnrichmentPipeline } from './enrichment-pipeline';
export { isValidTransition, getTerminalStates, getInitialState, COLLECTOR_TRANSITIONS } from './state-machine';
export type { ISignalStoragePort } from './storage-interface';
export type { ISignalForwardingPort } from './forwarding-interface';
export type { ITelemetryEventPort } from './event-interface';
export { createTelemetryEvent } from './event-interface';
export type { ITelemetryObservabilityPort } from './observability-interface';
export { createMetric, createLog } from './observability-interface';
export * from './types';
""",
}

for name, content in files.items():
    path = os.path.join(BASE, name)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)
    print(f"Written: {name}")
print(f"\nTotal files: {len(files)}")
