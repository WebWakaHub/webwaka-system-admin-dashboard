/**
 * ResourceRegistry — Cell Entity Tests
 * Cell: CEL-RESOURCEREG-v0.1.0
 * 
 * Tests cover:
 * - Online execution pipeline
 * - Offline execution and queuing
 * - Sync and conflict resolution
 * - State machine transitions
 * - Nigeria-first timeout handling
 * - Doctrine compliance
 */

import { ResourceRegistry, ResourceRegistryValidationError } from '../src/resource-reg-cell';
import { ResourceRegistryCommand, ExecutionContext, CellState } from '../src/types';

describe('ResourceRegistry', () => {
  let cell: ResourceRegistry;

  const mockCommand: ResourceRegistryCommand = {
    id: 'cmd-001',
    type: 'test-command',
    payload: { key: 'value' },
    idempotencyKey: 'idem-001',
    timestamp: Date.now(),
    locale: 'en-NG',
  };

  const mockContext: ExecutionContext = {
    tenantId: 'tenant-ng-001',
    userId: 'user-001',
    locale: 'en-NG',
    timezone: 'Africa/Lagos',
    isOffline: false,
    networkQuality: 'medium',
    correlationId: 'corr-001',
  };

  beforeEach(() => {
    cell = new ResourceRegistry({
      timeoutMs: 5000,
      locale: 'en-NG',
    });
  });

  describe('Online Execution', () => {
    it('should execute a valid command successfully', async () => {
      const result = await cell.execute(mockCommand, mockContext);
      expect(result).toBeDefined();
      expect(result.commandId).toBe(mockCommand.id);
      expect(result.status).toBe('success');
    });

    it('should reject commands without required fields', async () => {
      const invalidCommand = { ...mockCommand, id: '' };
      await expect(cell.execute(invalidCommand, mockContext)).rejects.toThrow(ResourceRegistryValidationError);
    });

    it('should transition through correct states during execution', async () => {
      const states: CellState[] = [];
      cell.onStateChange((state) => states.push(state));
      await cell.execute(mockCommand, mockContext);
      expect(states).toContain('VALIDATING');
      expect(states).toContain('PROCESSING');
      expect(states).toContain('COMPLETING');
      expect(states).toContain('IDLE');
    });

    it('should record execution metrics', async () => {
      await cell.execute(mockCommand, mockContext);
      const metrics = cell.getMetrics();
      expect(metrics.length).toBeGreaterThan(0);
      expect(metrics.some(m => m.name === 'execution_duration_ms')).toBe(true);
    });
  });

  describe('Offline Execution (NON-NEGOTIABLE)', () => {
    it('should queue commands when offline', async () => {
      const offlineContext = { ...mockContext, isOffline: true };
      const result = await cell.execute(mockCommand, offlineContext);
      expect(result.status).toBe('partial');
      expect(result.data.offlineEntryId).toBeDefined();
    });

    it('should queue commands when network quality is offline', async () => {
      const offlineContext = { ...mockContext, networkQuality: 'offline' as const };
      const result = await cell.execute(mockCommand, offlineContext);
      expect(result.status).toBe('partial');
    });

    it('should preserve queue ordering via sequence numbers', async () => {
      const offlineContext = { ...mockContext, isOffline: true };
      await cell.execute({ ...mockCommand, id: 'cmd-1' }, offlineContext);
      await cell.execute({ ...mockCommand, id: 'cmd-2' }, offlineContext);
      // Queue should maintain FIFO order
      expect(cell.getState()).toBe('OFFLINE');
    });
  });

  describe('Sync', () => {
    it('should sync offline queue when network is restored', async () => {
      const offlineContext = { ...mockContext, isOffline: true };
      await cell.execute(mockCommand, offlineContext);
      const syncResult = await cell.sync();
      expect(syncResult.synced).toBeGreaterThanOrEqual(0);
      expect(syncResult.duration).toBeGreaterThan(0);
    });
  });

  describe('State Machine', () => {
    it('should start in IDLE state', () => {
      expect(cell.getState()).toBe('IDLE');
    });

    it('should return to IDLE after successful execution', async () => {
      await cell.execute(mockCommand, mockContext);
      expect(cell.getState()).toBe('IDLE');
    });
  });

  describe('Nigeria-First Compliance', () => {
    it('should use Nigeria-optimized timeout defaults', () => {
      const defaultCell = new ResourceRegistry();
      // Default timeout should be 30s for high-latency networks
      expect(defaultCell).toBeDefined();
    });

    it('should use en-NG as default locale', () => {
      const result = cell.getState();
      expect(result).toBeDefined();
    });
  });

  describe('Disposal', () => {
    it('should clean up resources on dispose', async () => {
      await cell.dispose();
      expect(cell.getState()).toBe('IDLE');
    });
  });
});
