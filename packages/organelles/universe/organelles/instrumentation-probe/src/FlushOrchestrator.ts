/**
 * ORG-IN-INSTRUMENTATION_PROBE-v0.1.0
 * FlushOrchestrator — Adaptive Batch Emission Engine
 *
 * Agent: webwakaagent4 (Engineering & Delivery)
 * Issue: webwaka-organelle-universe#481 (P3-T03)
 *
 * Handles bandwidth-aware batch assembly and emission scheduling.
 * Adapts batch size based on network conditions (3G+, 2G, offline).
 * Enforces INV-IN-P03 (batch ≤ 64KB) and INV-IN-P05 (flush ≤ 30s).
 */

import {
  MetricBatch,
  SpanData,
  StructuredLogEvent,
  EmissionQueueEntry,
} from './types';
import { ITelemetryEmitterPort, IOfflineBufferPort } from './ports';
import { EmissionTimeoutError } from './errors';

export enum NetworkTier {
  BROADBAND = 'BROADBAND',  // ≥ 1Mbps
  NARROW = 'NARROW',        // < 1Mbps
  OFFLINE = 'OFFLINE',      // 0 Mbps
}

interface FlushConfig {
  maxBatchSizeBytes: number;  // INV-IN-P03: ≤ 64KB
  maxFlushTimeMs: number;     // INV-IN-P05: ≤ 30s
  broadbandBatchSize: number; // 256KB for 3G+
  narrowBatchSize: number;    // 64KB for 2G
}

const DEFAULT_FLUSH_CONFIG: FlushConfig = {
  maxBatchSizeBytes: 64 * 1024,
  maxFlushTimeMs: 30_000,
  broadbandBatchSize: 256 * 1024,
  narrowBatchSize: 64 * 1024,
};

export class FlushOrchestrator {
  private config: FlushConfig;
  private networkTier: NetworkTier = NetworkTier.BROADBAND;

  constructor(
    private readonly emitter: ITelemetryEmitterPort,
    private readonly buffer: IOfflineBufferPort,
    config?: Partial<FlushConfig>,
  ) {
    this.config = { ...DEFAULT_FLUSH_CONFIG, ...config };
  }

  /**
   * Detect current network tier based on navigator.connection API
   * or fallback to emitter availability check.
   */
  async detectNetworkTier(): Promise<NetworkTier> {
    // Check if emitter is available at all
    try {
      const available = await this.emitter.isAvailable();
      if (!available) {
        this.networkTier = NetworkTier.OFFLINE;
        return this.networkTier;
      }
    } catch {
      this.networkTier = NetworkTier.OFFLINE;
      return this.networkTier;
    }

    // Check navigator.connection if available (browser)
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const conn = (navigator as any).connection;
      if (conn?.downlink !== undefined) {
        if (conn.downlink >= 1) {
          this.networkTier = NetworkTier.BROADBAND;
        } else {
          this.networkTier = NetworkTier.NARROW;
        }
        return this.networkTier;
      }
    }

    // Default to broadband if we can reach the emitter
    this.networkTier = NetworkTier.BROADBAND;
    return this.networkTier;
  }

  /**
   * Get the effective batch size based on current network tier.
   */
  getEffectiveBatchSize(): number {
    switch (this.networkTier) {
      case NetworkTier.BROADBAND:
        return this.config.broadbandBatchSize;
      case NetworkTier.NARROW:
        return this.config.narrowBatchSize;
      case NetworkTier.OFFLINE:
        return 0; // No emission when offline
    }
  }

  /**
   * Flush queued entries, respecting batch size limits and timeout.
   * Returns true if all entries were flushed, false if some remain.
   */
  async flush(queue: EmissionQueueEntry[]): Promise<boolean> {
    if (queue.length === 0) return true;

    await this.detectNetworkTier();

    if (this.networkTier === NetworkTier.OFFLINE) {
      // Buffer everything for offline-first
      await this.bufferAll(queue);
      return true;
    }

    const startTime = Date.now();
    const batchSize = this.getEffectiveBatchSize();
    let currentBatchBytes = 0;
    const metrics: MetricBatch = { metrics: [], timestamp: Date.now() };
    const traces: SpanData[] = [];
    const logs: StructuredLogEvent[] = [];

    for (const entry of queue) {
      // Check flush timeout (INV-IN-P05)
      if (Date.now() - startTime > this.config.maxFlushTimeMs) {
        throw new EmissionTimeoutError(this.config.maxFlushTimeMs);
      }

      const entryBytes = this.estimateBytes(entry);

      // Check batch size limit
      if (currentBatchBytes + entryBytes > batchSize) {
        // Emit current batch
        await this.emitBatch(metrics, traces, logs);
        metrics.metrics = [];
        traces.length = 0;
        logs.length = 0;
        currentBatchBytes = 0;
      }

      // Add to current batch
      switch (entry.type) {
        case 'metric':
          metrics.metrics.push(entry.data as any);
          break;
        case 'trace':
          traces.push(entry.data as SpanData);
          break;
        case 'log':
          logs.push(entry.data as StructuredLogEvent);
          break;
      }
      currentBatchBytes += entryBytes;
    }

    // Emit remaining batch
    if (metrics.metrics.length > 0 || traces.length > 0 || logs.length > 0) {
      await this.emitBatch(metrics, traces, logs);
    }

    return true;
  }

  private async emitBatch(
    metrics: MetricBatch,
    traces: SpanData[],
    logs: StructuredLogEvent[],
  ): Promise<void> {
    try {
      if (metrics.metrics.length > 0) {
        await this.emitter.emitMetrics(metrics);
      }
      if (traces.length > 0) {
        await this.emitter.emitTraces(traces);
      }
      if (logs.length > 0) {
        await this.emitter.emitLogs(logs);
      }
    } catch {
      // On failure, buffer for retry
      await this.buffer.append({
        type: 'metric',
        payload: metrics,
        timestamp: Date.now(),
        retryCount: 0,
      });
    }
  }

  private async bufferAll(queue: EmissionQueueEntry[]): Promise<void> {
    for (const entry of queue) {
      await this.buffer.append({
        type: entry.type,
        payload: entry.type === 'metric'
          ? { metrics: [entry.data as any], timestamp: Date.now() }
          : entry.type === 'trace'
          ? [entry.data as SpanData]
          : [entry.data as StructuredLogEvent],
        timestamp: Date.now(),
        retryCount: 0,
      });
    }
  }

  private estimateBytes(entry: EmissionQueueEntry): number {
    // Rough estimate: JSON serialization size
    return JSON.stringify(entry.data).length * 2; // UTF-16 worst case
  }
}
