/**
 * ExternalAdapter — Cell Orchestrator
 * Cell: CEL-EXTADAPTER-v0.1.0
 * Category: Extensibility & Modularity
 * 
 * Orchestrates the lifecycle of the ExternalAdapter cell,
 * including initialization, health checks, and graceful shutdown.
 */

import { ExternalAdapter } from './ext-adapter-cell';
import { ExternalAdapterConfig, CellState } from './types';

export class ExternalAdapterOrchestrator {
  private cell: ExternalAdapter | null = null;
  private healthCheckInterval: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly config: Partial<ExternalAdapterConfig> = {}) {}

  async initialize(): Promise<ExternalAdapter> {
    this.cell = new ExternalAdapter(this.config);

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

  getCell(): ExternalAdapter | null {
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
