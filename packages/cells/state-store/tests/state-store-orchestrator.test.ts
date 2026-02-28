/**
 * StateStoreOrchestrator — Orchestrator Tests
 * Cell: CEL-STATESTORE-v0.1.0
 */

import { StateStoreOrchestrator } from '../src/state-store-orchestrator';

describe('StateStoreOrchestrator', () => {
  let orchestrator: StateStoreOrchestrator;

  beforeEach(() => {
    orchestrator = new StateStoreOrchestrator({
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
