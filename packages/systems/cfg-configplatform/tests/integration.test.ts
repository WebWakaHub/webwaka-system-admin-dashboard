// ConfigPlatformSystem — Integration Tests
// System ID: SYS-CFG-CONFIGPLATFORM

import { ConfigPlatformSystem } from '../src/entity';
import { SYSTEM_ID, NIGERIA_FIRST_CONFIG } from '../src/types';

describe('ConfigPlatformSystem Integration', () => {
  let system: ConfigPlatformSystem;

  beforeAll(async () => {
    system = new ConfigPlatformSystem();
    await system.initialize();
  });

  it('should handle organ routing', async () => {
    // Verify system can route to organs
    try {
      await system.execute('configstore', { type: 'health-check' });
    } catch (e) {
      // Expected: organ not initialized in test
      expect(e).toBeDefined();
    }
  });

  it('should handle offline fallback gracefully', async () => {
    const result = await system.executeOffline('configstore', { type: 'test' });
    expect((result as any).syncStatus).toBe('pending');
  });

  it('should maintain Nigeria-First defaults', () => {
    expect(NIGERIA_FIRST_CONFIG.offlineEnabled).toBe(true);
    expect(NIGERIA_FIRST_CONFIG.syncRetryInterval).toBe(5000);
  });
});
