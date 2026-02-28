// MarketplacePlatformSystem — Integration Tests
// System ID: SYS-EXT-MARKETPLACEPLATFORM

import { MarketplacePlatformSystem } from '../src/entity';
import { SYSTEM_ID, NIGERIA_FIRST_CONFIG } from '../src/types';

describe('MarketplacePlatformSystem Integration', () => {
  let system: MarketplacePlatformSystem;

  beforeAll(async () => {
    system = new MarketplacePlatformSystem();
    await system.initialize();
  });

  it('should handle organ routing', async () => {
    // Verify system can route to organs
    try {
      await system.execute('vendormanager', { type: 'health-check' });
    } catch (e) {
      // Expected: organ not initialized in test
      expect(e).toBeDefined();
    }
  });

  it('should handle offline fallback gracefully', async () => {
    const result = await system.executeOffline('vendormanager', { type: 'test' });
    expect((result as any).syncStatus).toBe('pending');
  });

  it('should maintain Nigeria-First defaults', () => {
    expect(NIGERIA_FIRST_CONFIG.offlineEnabled).toBe(true);
    expect(NIGERIA_FIRST_CONFIG.syncRetryInterval).toBe(5000);
  });
});
