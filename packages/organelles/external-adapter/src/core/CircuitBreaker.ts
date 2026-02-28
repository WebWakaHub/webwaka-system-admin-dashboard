/**
 * ORG-EI-EXTERNAL_ADAPTER-v0.1.0 — CircuitBreaker
 * Per-vendor circuit breaker with CLOSED → OPEN → HALF_OPEN states
 */

import { CircuitState, CircuitBreakerConfig } from '../types';
import { ICircuitBreakerPort } from '../ports';
import { CircuitOpenError } from '../errors';

interface VendorCircuitState {
  state: CircuitState;
  failureCount: number;
  successCount: number;
  lastFailureTime: number;
  lastStateChange: number;
  halfOpenCalls: number;
}

export class CircuitBreaker implements ICircuitBreakerPort {
  private readonly states = new Map<string, VendorCircuitState>();
  private readonly configs = new Map<string, CircuitBreakerConfig>();

  private readonly defaultConfig: CircuitBreakerConfig = {
    failureThreshold: 5,
    successThreshold: 3,
    timeoutMs: 30000,
    halfOpenMaxCalls: 1,
  };

  registerVendor(vendorId: string, config?: CircuitBreakerConfig): void {
    this.configs.set(vendorId, config ?? this.defaultConfig);
    this.states.set(vendorId, {
      state: CircuitState.CLOSED,
      failureCount: 0,
      successCount: 0,
      lastFailureTime: 0,
      lastStateChange: Date.now(),
      halfOpenCalls: 0,
    });
  }

  check(vendorId: string): boolean {
    const vendorState = this.getOrCreateState(vendorId);
    const config = this.configs.get(vendorId) ?? this.defaultConfig;

    if (vendorState.state === CircuitState.CLOSED) {
      return true;
    }

    if (vendorState.state === CircuitState.OPEN) {
      const elapsed = Date.now() - vendorState.lastFailureTime;
      if (elapsed >= config.timeoutMs) {
        vendorState.state = CircuitState.HALF_OPEN;
        vendorState.halfOpenCalls = 0;
        vendorState.successCount = 0;
        vendorState.lastStateChange = Date.now();
        return true;
      }
      return false;
    }

    // HALF_OPEN
    if (vendorState.halfOpenCalls < config.halfOpenMaxCalls) {
      vendorState.halfOpenCalls++;
      return true;
    }
    return false;
  }

  recordSuccess(vendorId: string): void {
    const vendorState = this.getOrCreateState(vendorId);
    const config = this.configs.get(vendorId) ?? this.defaultConfig;

    if (vendorState.state === CircuitState.HALF_OPEN) {
      vendorState.successCount++;
      if (vendorState.successCount >= config.successThreshold) {
        vendorState.state = CircuitState.CLOSED;
        vendorState.failureCount = 0;
        vendorState.successCount = 0;
        vendorState.lastStateChange = Date.now();
      }
    } else if (vendorState.state === CircuitState.CLOSED) {
      vendorState.failureCount = 0;
    }
  }

  recordFailure(vendorId: string): void {
    const vendorState = this.getOrCreateState(vendorId);
    const config = this.configs.get(vendorId) ?? this.defaultConfig;

    if (vendorState.state === CircuitState.HALF_OPEN) {
      vendorState.state = CircuitState.OPEN;
      vendorState.lastFailureTime = Date.now();
      vendorState.lastStateChange = Date.now();
      return;
    }

    vendorState.failureCount++;
    vendorState.lastFailureTime = Date.now();

    if (vendorState.failureCount >= config.failureThreshold) {
      vendorState.state = CircuitState.OPEN;
      vendorState.lastStateChange = Date.now();
    }
  }

  getState(vendorId: string): string {
    return this.getOrCreateState(vendorId).state;
  }

  reset(vendorId: string): void {
    const vendorState = this.getOrCreateState(vendorId);
    vendorState.state = CircuitState.CLOSED;
    vendorState.failureCount = 0;
    vendorState.successCount = 0;
    vendorState.halfOpenCalls = 0;
    vendorState.lastStateChange = Date.now();
  }

  private getOrCreateState(vendorId: string): VendorCircuitState {
    let state = this.states.get(vendorId);
    if (!state) {
      state = {
        state: CircuitState.CLOSED,
        failureCount: 0,
        successCount: 0,
        lastFailureTime: 0,
        lastStateChange: Date.now(),
        halfOpenCalls: 0,
      };
      this.states.set(vendorId, state);
    }
    return state;
  }
}
