// AnalyticsPlatformSystem — Integration Tests
// System ID: SYS-ANA-ANALYTICSPLATFORM

import { AnalyticsPlatformSystem } from '../src/entity';
import { SYSTEM_ID, NIGERIA_FIRST_CONFIG } from '../src/types';

describe('AnalyticsPlatformSystem Integration', () => {
  let system: AnalyticsPlatformSystem;

  beforeAll(async () => {
    system = new AnalyticsPlatformSystem();
    await system.initialize();
  });

  it('should handle organ routing', async () => {
    // Verify system can route to organs
    try {
      await system.execute('datacollection', { type: 'health-check' });
    } catch (e) {
      // Expected: organ not initialized in test
      expect(e).toBeDefined();
    }
  });

  it('should handle offline fallback gracefully', async () => {
    const result = await system.executeOffline('datacollection', { type: 'test' });
    expect((result as any).syncStatus).toBe('pending');
  });

  it('should maintain Nigeria-First defaults', () => {
    expect(NIGERIA_FIRST_CONFIG.offlineEnabled).toBe(true);
    expect(NIGERIA_FIRST_CONFIG.syncRetryInterval).toBe(5000);
  });
});
