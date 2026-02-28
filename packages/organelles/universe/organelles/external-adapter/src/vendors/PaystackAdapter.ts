/**
 * ORG-EI-EXTERNAL_ADAPTER-v0.1.0 — PaystackAdapter
 * Nigeria-First payment vendor adapter
 * Agent: webwakaagent4 (Engineering & Delivery)
 * Issue: #510 (P3-T03)
 */

import { IVendorAdapter } from '../ports';
import { VendorConfig, VendorHealthStatus, CircuitState } from '../types';
import { VendorUnavailableError, VendorAuthError, VendorTimeoutError, UninitializedError } from '../errors';

export class PaystackAdapter implements IVendorAdapter {
  readonly vendorId = 'paystack';
  readonly category = 'payment';
  private config?: VendorConfig;
  private initialized = false;

  async initialize(config: VendorConfig): Promise<void> {
    if (!config.apiKey || config.apiKey.trim() === '') {
      throw new VendorAuthError(this.vendorId);
    }
    this.config = config;
    this.initialized = true;
  }

  async execute<T, R>(operation: string, payload: T, timeout: number): Promise<R> {
    if (!this.initialized || !this.config) {
      throw new UninitializedError(this.vendorId);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const url = `${this.config.baseUrl}/${operation}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new VendorAuthError(this.vendorId);
        }
        throw new VendorUnavailableError(this.vendorId, `HTTP ${response.status}`);
      }

      return (await response.json()) as R;
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        throw new VendorTimeoutError(this.vendorId, timeout);
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  async healthCheck(): Promise<VendorHealthStatus> {
    return {
      vendorId: this.vendorId,
      status: this.initialized ? 'healthy' : 'unknown',
      latencyP50Ms: 0,
      latencyP99Ms: 0,
      errorRate: 0,
      circuitState: CircuitState.CLOSED,
      lastChecked: Date.now(),
      rateLimitRemaining: 100,
    };
  }

  async shutdown(): Promise<void> {
    this.initialized = false;
    this.config = undefined;
  }
}
