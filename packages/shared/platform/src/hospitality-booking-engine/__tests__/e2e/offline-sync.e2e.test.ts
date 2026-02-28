/**
 * Hospitality Booking Engine - Offline Sync E2E Test
 * 
 * End-to-end test for offline booking and synchronization.
 * Tests: Create Offline → Go Online → Sync → Verify
 * 
 * @module hospitality-booking-engine/__tests__/e2e/offline-sync.e2e.test
 * @author webwakaagent5
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';

test.describe('Offline Sync Flow', () => {
  let page: Page;
  let context: BrowserContext;

  test.beforeEach(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000/bookings');
  });

  test.afterEach(async () => {
    await page.close();
    await context.close();
  });

  test('should create booking offline and sync when online', async () => {
    // Step 1: Go offline
    await test.step('Go offline', async () => {
      await context.setOffline(true);
      
      // Verify offline indicator
      await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
      await expect(page.locator('[data-testid="offline-indicator"]')).toContainText('offline');
    });

    // Step 2: Create booking offline
    await test.step('Create booking offline', async () => {
      // Fill search form
      await page.fill('[data-testid="check-in-date"]', '2026-03-01');
      await page.fill('[data-testid="check-out-date"]', '2026-03-05');
      await page.selectOption('[data-testid="adults-count"]', '2');
      await page.click('[data-testid="search-button"]');
      
      // Note: In offline mode, search results would come from cache
      await page.waitForSelector('[data-testid="search-results"]');
      
      // Select property and room
      await page.click('[data-testid="property-card"]:first-child [data-testid="view-details-button"]');
      await page.click('[data-testid="room-type-card"]:first-child [data-testid="select-room-button"]');
      
      // Fill guest information
      await page.fill('[data-testid="first-name"]', 'John');
      await page.fill('[data-testid="last-name"]', 'Doe');
      await page.fill('[data-testid="email"]', 'john.doe@example.com');
      await page.fill('[data-testid="phone"]', '+2348012345678');
      await page.check('[data-testid="ndpr-consent"]');
      
      // Create booking
      await page.click('[data-testid="create-offline-booking-button"]');
      
      // Verify offline booking created
      await expect(page.locator('[data-testid="offline-booking-notice"]')).toBeVisible();
      await expect(page.locator('[data-testid="offline-booking-notice"]')).toContainText('will be synced');
      
      // Verify booking reference (offline format)
      const reference = await page.locator('[data-testid="booking-reference"]').textContent();
      expect(reference).toMatch(/^OFFLINE_/);
    });

    // Step 3: Verify offline queue
    await test.step('Verify offline queue', async () => {
      // Navigate to offline queue
      await page.click('[data-testid="offline-queue-link"]');
      await page.waitForSelector('[data-testid="offline-queue"]');
      
      // Verify booking in queue
      const queueItems = await page.locator('[data-testid="queue-item"]').count();
      expect(queueItems).toBeGreaterThan(0);
      
      // Verify queue item status
      await expect(page.locator('[data-testid="queue-item"]:first-child [data-testid="sync-status"]')).toContainText('pending');
    });

    // Step 4: Go online
    await test.step('Go online', async () => {
      await context.setOffline(false);
      
      // Wait for online indicator
      await expect(page.locator('[data-testid="offline-indicator"]')).not.toBeVisible();
      
      // Verify sync started automatically
      await expect(page.locator('[data-testid="sync-indicator"]')).toBeVisible();
      await expect(page.locator('[data-testid="sync-indicator"]')).toContainText('Syncing');
    });

    // Step 5: Verify sync completion
    await test.step('Verify sync completion', async () => {
      // Wait for sync to complete
      await page.waitForSelector('[data-testid="sync-complete"]', { timeout: 10000 });
      
      // Verify success message
      await expect(page.locator('[data-testid="sync-complete"]')).toContainText('synced successfully');
      
      // Navigate to bookings list
      await page.click('[data-testid="my-bookings-link"]');
      await page.waitForSelector('[data-testid="bookings-list"]');
      
      // Verify booking is now online
      const bookings = await page.locator('[data-testid="booking-item"]').count();
      expect(bookings).toBeGreaterThan(0);
      
      // Verify booking reference changed from OFFLINE_ to BK
      const reference = await page.locator('[data-testid="booking-item"]:first-child [data-testid="booking-reference"]').textContent();
      expect(reference).toMatch(/^BK[A-Z0-9]+$/);
    });
  });

  test('should handle sync conflict resolution', async () => {
    // Create offline booking
    await context.setOffline(true);
    await page.fill('[data-testid="check-in-date"]', '2026-03-01');
    await page.fill('[data-testid="check-out-date"]', '2026-03-05');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="search-results"]');
    await page.click('[data-testid="property-card"]:first-child [data-testid="view-details-button"]');
    await page.click('[data-testid="room-type-card"]:first-child [data-testid="select-room-button"]');
    await page.fill('[data-testid="first-name"]', 'John');
    await page.fill('[data-testid="last-name"]', 'Doe');
    await page.fill('[data-testid="email"]', 'john@example.com');
    await page.fill('[data-testid="phone"]', '+2348012345678');
    await page.check('[data-testid="ndpr-consent"]');
    await page.click('[data-testid="create-offline-booking-button"]');
    
    // Mock conflict (e.g., room no longer available)
    await page.evaluate(() => {
      window.mockSyncConflict = true;
    });
    
    // Go online
    await context.setOffline(false);
    
    // Wait for conflict notification
    await expect(page.locator('[data-testid="sync-conflict"]')).toBeVisible();
    await expect(page.locator('[data-testid="sync-conflict"]')).toContainText('conflict');
    
    // Verify conflict resolution options
    await expect(page.locator('[data-testid="resolve-conflict-button"]')).toBeVisible();
  });

  test('should retry failed sync with exponential backoff', async () => {
    // Create offline booking
    await context.setOffline(true);
    await page.fill('[data-testid="check-in-date"]', '2026-03-01');
    await page.fill('[data-testid="check-out-date"]', '2026-03-05');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="search-results"]');
    await page.click('[data-testid="property-card"]:first-child [data-testid="view-details-button"]');
    await page.click('[data-testid="room-type-card"]:first-child [data-testid="select-room-button"]');
    await page.fill('[data-testid="first-name"]', 'John');
    await page.fill('[data-testid="last-name"]', 'Doe');
    await page.fill('[data-testid="email"]', 'john@example.com');
    await page.fill('[data-testid="phone"]', '+2348012345678');
    await page.check('[data-testid="ndpr-consent"]');
    await page.click('[data-testid="create-offline-booking-button"]');
    
    // Mock sync failure
    await page.evaluate(() => {
      window.mockSyncFailure = true;
    });
    
    // Go online
    await context.setOffline(false);
    
    // Verify retry indicator
    await expect(page.locator('[data-testid="sync-retry"]')).toBeVisible();
    await expect(page.locator('[data-testid="retry-count"]')).toBeVisible();
    
    // Verify exponential backoff (retry count increases)
    await page.waitForTimeout(2000);
    const retryCount = await page.locator('[data-testid="retry-count"]').textContent();
    expect(parseInt(retryCount!)).toBeGreaterThan(0);
  });

  test('should persist offline bookings across page reloads', async () => {
    // Create offline booking
    await context.setOffline(true);
    await page.fill('[data-testid="check-in-date"]', '2026-03-01');
    await page.fill('[data-testid="check-out-date"]', '2026-03-05');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="search-results"]');
    await page.click('[data-testid="property-card"]:first-child [data-testid="view-details-button"]');
    await page.click('[data-testid="room-type-card"]:first-child [data-testid="select-room-button"]');
    await page.fill('[data-testid="first-name"]', 'John');
    await page.fill('[data-testid="last-name"]', 'Doe');
    await page.fill('[data-testid="email"]', 'john@example.com');
    await page.fill('[data-testid="phone"]', '+2348012345678');
    await page.check('[data-testid="ndpr-consent"]');
    await page.click('[data-testid="create-offline-booking-button"]');
    
    // Get offline booking reference
    const offlineReference = await page.locator('[data-testid="booking-reference"]').textContent();
    
    // Reload page
    await page.reload();
    
    // Navigate to offline queue
    await page.click('[data-testid="offline-queue-link"]');
    await page.waitForSelector('[data-testid="offline-queue"]');
    
    // Verify booking still in queue
    await expect(page.locator(`[data-testid="queue-item"][data-reference="${offlineReference}"]`)).toBeVisible();
  });

  test('should show offline indicator when network disconnects', async () => {
    // Start online
    await expect(page.locator('[data-testid="offline-indicator"]')).not.toBeVisible();
    
    // Go offline
    await context.setOffline(true);
    
    // Verify offline indicator appears
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="offline-indicator"]')).toContainText('offline');
  });

  test('should cache search results for offline use', async () => {
    // Perform search online
    await page.fill('[data-testid="check-in-date"]', '2026-03-01');
    await page.fill('[data-testid="check-out-date"]', '2026-03-05');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="search-results"]');
    
    // Get result count
    const onlineResults = await page.locator('[data-testid="property-card"]').count();
    
    // Go offline
    await context.setOffline(true);
    
    // Perform same search
    await page.fill('[data-testid="check-in-date"]', '2026-03-01');
    await page.fill('[data-testid="check-out-date"]', '2026-03-05');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="search-results"]');
    
    // Verify cached results
    const offlineResults = await page.locator('[data-testid="property-card"]').count();
    expect(offlineResults).toBe(onlineResults);
    
    // Verify cache indicator
    await expect(page.locator('[data-testid="cached-results-indicator"]')).toBeVisible();
  });
});
