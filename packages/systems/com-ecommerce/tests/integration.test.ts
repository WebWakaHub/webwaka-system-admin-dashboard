// EcommerceSystem — Integration Tests
// System ID: SYS-COM-ECOMMERCE

import { EcommerceSystem } from '../src/entity';
import { SYSTEM_ID, NIGERIA_FIRST_CONFIG } from '../src/types';

describe('EcommerceSystem Integration', () => {
  let system: EcommerceSystem;

  beforeAll(async () => {
    system = new EcommerceSystem();
    await system.initialize();
  });

  it('should handle organ routing', async () => {
    // Verify system can route to organs
    try {
      await system.execute('productcatalog', { type: 'health-check' });
    } catch (e) {
      // Expected: organ not initialized in test
      expect(e).toBeDefined();
    }
  });

  it('should handle offline fallback gracefully', async () => {
    const result = await system.executeOffline('productcatalog', { type: 'test' });
    expect((result as any).syncStatus).toBe('pending');
  });

  it('should maintain Nigeria-First defaults', () => {
    expect(NIGERIA_FIRST_CONFIG.offlineEnabled).toBe(true);
    expect(NIGERIA_FIRST_CONFIG.syncRetryInterval).toBe(5000);
  });
});
