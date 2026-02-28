/**
 * Aggregator — Cell Orchestrator
 * Cell: CEL-AGGREGATE-v0.1.0
 * Category: Data & Persistence
 * 
 * Orchestrates the lifecycle of the Aggregator cell,
 * including initialization, health checks, and graceful shutdown.
 */

import { Aggregator } from './aggregate-cell';
import { AggregatorConfig, CellState } from './types';

export class AggregatorOrchestrator {
  private cell: Aggregator | null = null;
  private healthCheckInterval: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly config: Partial<AggregatorConfig> = {}) {}

  async initialize(): Promise<Aggregator> {
    this.cell = new Aggregator(this.config);

    // Set up health monitoring
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, 30000); // Every 30s

    // Listen for state changes
    this.cell.onStateChange((state: CellState) => {
      if (state === 'DEAD_LETTER') {
        this.handleDeadLetter();
      }
    });

    return this.cell;
  }

  async shutdown(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    if (this.cell) {
      await this.cell.dispose();
      this.cell = null;
    }
  }

  getCell(): Aggregator | null {
    return this.cell;
  }

  private performHealthCheck(): void {
    if (!this.cell) return;
    const state = this.cell.getState();
    const metrics = this.cell.getMetrics();
    // Health check logic — emit telemetry
  }

  private handleDeadLetter(): void {
    // Alert and recovery logic
  }
}
