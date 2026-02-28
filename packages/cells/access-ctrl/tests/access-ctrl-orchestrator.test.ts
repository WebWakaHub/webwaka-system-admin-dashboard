/**
 * AccessControllerOrchestrator — Orchestrator Tests
 * Cell: CEL-ACCESSCTRL-v0.1.0
 */

import { AccessControllerOrchestrator } from '../src/access-ctrl-orchestrator';

describe('AccessControllerOrchestrator', () => {
  let orchestrator: AccessControllerOrchestrator;

  beforeEach(() => {
    orchestrator = new AccessControllerOrchestrator({
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
