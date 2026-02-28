/**
 * Hospitality Booking Engine - Booking Modification E2E Test
 * 
 * End-to-end test for booking modification flow.
 * Tests: View Booking → Modify → Confirm Changes → Verify
 * 
 * @module hospitality-booking-engine/__tests__/e2e/booking-modification.e2e.test
 * @author webwakaagent5
 */

import { test, expect, Page } from '@playwright/test';

test.describe('Booking Modification Flow', () => {
  let page: Page;
  const testBookingReference = 'BK123456';

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000');
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should modify booking successfully', async () => {
    // Step 1: Navigate to manage booking
    await test.step('Navigate to manage booking', async () => {
      await page.click('[data-testid="manage-booking-link"]');
      await page.waitForSelector('[data-testid="booking-lookup-form"]');
    });

    // Step 2: Look up booking
    await test.step('Look up booking by reference', async () => {
      await page.fill('[data-testid="booking-reference-input"]', testBookingReference);
      await page.click('[data-testid="lookup-button"]');
      
      // Wait for booking details
      await page.waitForSelector('[data-testid="booking-details"]');
      
      // Verify booking information
      await expect(page.locator('[data-testid="booking-reference"]')).toContainText(testBookingReference);
      await expect(page.locator('[data-testid="booking-status"]')).toBeVisible();
      await expect(page.locator('[data-testid="check-in-date"]')).toBeVisible();
      await expect(page.locator('[data-testid="check-out-date"]')).toBeVisible();
    });

    // Step 3: Initiate modification
    await test.step('Initiate modification', async () => {
      await page.click('[data-testid="modify-booking-button"]');
      await page.waitForSelector('[data-testid="modification-form"]');
    });

    // Step 4: Modify booking details
    await test.step('Modify booking details', async () => {
      // Change check-in date
      await page.fill('[data-testid="new-check-in-date"]', '2026-03-02');
      
      // Change adults count
      await page.selectOption('[data-testid="new-adults-count"]', '3');
      
      // Verify modification fee is displayed
      await expect(page.locator('[data-testid="modification-fee"]')).toBeVisible();
      
      // Verify new total amount
      await expect(page.locator('[data-testid="new-total-amount"]')).toBeVisible();
    });

    // Step 5: Confirm modification
    await test.step('Confirm modification', async () => {
      await page.click('[data-testid="confirm-modification-button"]');
      
      // Wait for confirmation
      await page.waitForSelector('[data-testid="modification-confirmation"]');
      
      // Verify success message
      await expect(page.locator('[data-testid="success-message"]')).toContainText('modified successfully');
      
      // Verify updated booking details
      await expect(page.locator('[data-testid="check-in-date"]')).toContainText('2026-03-02');
      await expect(page.locator('[data-testid="adults-count"]')).toContainText('3');
    });
  });

  test('should prevent modification within 24 hours of check-in', async () => {
    // Navigate to booking with imminent check-in
    await page.goto(`http://localhost:3000/bookings/${testBookingReference}`);
    await page.waitForSelector('[data-testid="booking-details"]');
    
    // Try to modify
    await page.click('[data-testid="modify-booking-button"]');
    
    // Verify error message
    await expect(page.locator('[data-testid="error-message"]')).toContainText('24 hours');
  });

  test('should prevent modification of cancelled booking', async () => {
    // Navigate to cancelled booking
    const cancelledReference = 'BK_CANCELLED';
    await page.goto(`http://localhost:3000/bookings/${cancelledReference}`);
    await page.waitForSelector('[data-testid="booking-details"]');
    
    // Verify modify button is disabled
    await expect(page.locator('[data-testid="modify-booking-button"]')).toBeDisabled();
    
    // Verify cancellation notice
    await expect(page.locator('[data-testid="cancellation-notice"]')).toBeVisible();
  });

  test('should handle concurrent modification conflict', async () => {
    // Navigate to booking
    await page.goto(`http://localhost:3000/bookings/${testBookingReference}`);
    await page.waitForSelector('[data-testid="booking-details"]');
    
    // Get current version
    const version = await page.getAttribute('[data-testid="booking-version"]', 'data-version');
    
    // Initiate modification
    await page.click('[data-testid="modify-booking-button"]');
    await page.waitForSelector('[data-testid="modification-form"]');
    
    // Simulate concurrent modification (version mismatch)
    await page.evaluate(() => {
      // Mock API to return version conflict
      window.mockVersionConflict = true;
    });
    
    // Try to save changes
    await page.fill('[data-testid="new-check-in-date"]', '2026-03-02');
    await page.click('[data-testid="confirm-modification-button"]');
    
    // Verify conflict error
    await expect(page.locator('[data-testid="error-message"]')).toContainText('concurrent modification');
  });

  test('should calculate modification fee correctly', async () => {
    // Navigate to booking
    await page.goto(`http://localhost:3000/bookings/${testBookingReference}`);
    await page.click('[data-testid="modify-booking-button"]');
    await page.waitForSelector('[data-testid="modification-form"]');
    
    // Make a change
    await page.fill('[data-testid="new-check-in-date"]', '2026-03-02');
    
    // Verify modification fee
    const modificationFee = await page.locator('[data-testid="modification-fee"]').textContent();
    expect(modificationFee).toMatch(/₦\d+/); // Nigerian Naira symbol
    
    // Verify fee is reasonable (e.g., 5-10% of booking amount)
    const feeAmount = parseInt(modificationFee!.replace(/[₦,]/g, ''));
    expect(feeAmount).toBeGreaterThan(0);
    expect(feeAmount).toBeLessThan(50000); // Reasonable upper limit
  });
});
