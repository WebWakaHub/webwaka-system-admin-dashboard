/**
 * ORG-IN-INSTRUMENTATION_PROBE-v0.1.0
 * W3C Trace Context Propagator (Outbound Adapter)
 *
 * Agent: webwakaagent4 (Engineering & Delivery)
 * Issue: webwaka-organelle-universe#480 (P3-T02)
 *
 * Implements IContextPropagatorPort per W3C Trace Context specification.
 * Handles traceparent and tracestate header injection/extraction.
 */

import { IContextPropagatorPort } from '../ports';
import { SpanContext } from '../types';
import { TracePropagationError } from '../errors';

const TRACEPARENT_HEADER = 'traceparent';
const TRACESTATE_HEADER = 'tracestate';
const TRACEPARENT_REGEX = /^00-([0-9a-f]{32})-([0-9a-f]{16})-([0-9a-f]{2})$/;

export class W3CContextPropagator implements IContextPropagatorPort {
  inject(context: SpanContext, carrier: Record<string, string>): void {
    if (!context.traceId || !context.spanId) {
      throw new TracePropagationError('Cannot inject: missing traceId or spanId');
    }

    // W3C traceparent format: version-traceId-spanId-traceFlags
    const flags = context.traceFlags.toString(16).padStart(2, '0');
    carrier[TRACEPARENT_HEADER] = `00-${context.traceId}-${context.spanId}-${flags}`;

    if (context.traceState) {
      carrier[TRACESTATE_HEADER] = context.traceState;
    }
  }

  extract(carrier: Record<string, string>): SpanContext | null {
    const traceparent = carrier[TRACEPARENT_HEADER];
    if (!traceparent) return null;

    const match = TRACEPARENT_REGEX.exec(traceparent);
    if (!match) return null;

    const [, traceId, spanId, flagsHex] = match;

    // Validate: traceId must not be all zeros
    if (traceId === '00000000000000000000000000000000') return null;
    // Validate: spanId must not be all zeros
    if (spanId === '0000000000000000') return null;

    return {
      traceId,
      spanId,
      traceFlags: parseInt(flagsHex, 16),
      traceState: carrier[TRACESTATE_HEADER],
    };
  }

  createRootContext(): SpanContext {
    return {
      traceId: this.generateTraceId(),
      spanId: this.generateSpanId(),
      traceFlags: 1, // sampled
    };
  }

  private generateTraceId(): string {
    // 128-bit (32 hex chars) cryptographic random
    const bytes = new Uint8Array(16);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(bytes);
    } else {
      for (let i = 0; i < 16; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
    }
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private generateSpanId(): string {
    // 64-bit (16 hex chars) cryptographic random
    const bytes = new Uint8Array(8);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(bytes);
    } else {
      for (let i = 0; i < 8; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
    }
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }
}
