/**
 * InferenceCellOrchestrator — Orchestrator Tests
 * Cell: CEL-AI-INFERENCE_CELL-v0.1.0
 */

import { InferenceCellOrchestrator } from '../src/ai-inference-cell-orchestrator';

describe('InferenceCellOrchestrator', () => {
  let orchestrator: InferenceCellOrchestrator;

  beforeEach(() => {
    orchestrator = new InferenceCellOrchestrator({
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
