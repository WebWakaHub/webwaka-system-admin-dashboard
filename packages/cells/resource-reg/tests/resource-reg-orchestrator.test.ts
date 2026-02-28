/**
 * ResourceRegistryOrchestrator — Orchestrator Tests
 * Cell: CEL-RESOURCEREG-v0.1.0
 */

import { ResourceRegistryOrchestrator } from '../src/resource-reg-orchestrator';

describe('ResourceRegistryOrchestrator', () => {
  let orchestrator: ResourceRegistryOrchestrator;

  beforeEach(() => {
    orchestrator = new ResourceRegistryOrchestrator({
      timeoutMs: 5000,
    });
  });

  afterEach(async () => {
    await orchestrator.shutdown();
  });

  it('should initialize the cell', async () => {
    const cell = await orchestrator.initialize();
    expect(cell).toBeDefined();
    expect(orchestrator.getCell()).toBe(cell);
  });

  it('should shutdown gracefully', async () => {
    await orchestrator.initialize();
    await orchestrator.shutdown();
    expect(orchestrator.getCell()).toBeNull();
  });

  it('should return null cell before initialization', () => {
    expect(orchestrator.getCell()).toBeNull();
  });
});
