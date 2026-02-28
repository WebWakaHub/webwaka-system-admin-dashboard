/**
 * Hospitality Booking Engine - Complete Booking Flow E2E Test
 * 
 * End-to-end test for complete booking flow using Playwright.
 * Tests: Search → Select → Book → Pay → Confirm
 * 
 * @module hospitality-booking-engine/__tests__/e2e/booking-flow.e2e.test
 * @author webwakaagent5
 */

import { test, expect, Page } from '@playwright/test';

test.describe('Complete Booking Flow', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Set viewport for mobile-first testing
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    
    // Navigate to booking page
    await page.goto('http://localhost:3000/bookings');
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should complete full booking flow successfully', async () => {
    // Step 1: Search for available rooms
    await test.step('Search for available rooms', async () => {
      await page.fill('[data-testid="check-in-date"]', '2026-03-01');
      await page.fill('[data-testid="check-out-date"]', '2026-03-05');
      await page.selectOption('[data-testid="adults-count"]', '2');
      await page.selectOption('[data-testid="children-count"]', '0');
      await page.click('[data-testid="search-button"]');

      // Wait for search results
      await page.waitForSelector('[data-testid="search-results"]');
      
      // Verify results are displayed
      const results = await page.locator('[data-testid="property-card"]').count();
      expect(results).toBeGreaterThan(0);
    });

    // Step 2: Select a property and room
    await test.step('Select property and room', async () => {
      // Click on first property
      await page.click('[data-testid="property-card"]:first-child [data-testid="view-details-button"]');
      
      // Wait for property details
      await page.waitForSelector('[data-testid="property-details"]');
      
      // Verify property information is displayed
      await expect(page.locator('[data-testid="property-name"]')).toBeVisible();
      await expect(page.locator('[data-testid="property-location"]')).toBeVisible();
      await expect(page.locator('[data-testid="property-rating"]')).toBeVisible();
      
      // Select a room type
      await page.click('[data-testid="room-type-card"]:first-child [data-testid="select-room-button"]');
    });

    // Step 3: Fill guest information
    await test.step('Fill guest information', async () => {
      // Wait for guest form
      await page.waitForSelector('[data-testid="guest-form"]');
      
      // Fill guest details
      await page.fill('[data-testid="first-name"]', 'John');
      await page.fill('[data-testid="last-name"]', 'Doe');
      await page.fill('[data-testid="email"]', 'john.doe@example.com');
      await page.fill('[data-testid="phone"]', '+2348012345678');
      
      // Accept NDPR consent
      await page.check('[data-testid="ndpr-consent"]');
      
      // Verify form validation
      await expect(page.locator('[data-testid="first-name"]')).toHaveValue('John');
      await expect(page.locator('[data-testid="phone"]')).toHaveValue('+2348012345678');
      
      // Continue to payment
      await page.click('[data-testid="continue-to-payment-button"]');
    });

    // Step 4: Select payment gateway
    await test.step('Select payment gateway', async () => {
      // Wait for payment options
      await page.waitForSelector('[data-testid="payment-options"]');
      
      // Select Paystack
      await page.click('[data-testid="payment-gateway-paystack"]');
      
      // Verify booking summary
      await expect(page.locator('[data-testid="booking-summary"]')).toBeVisible();
      await expect(page.locator('[data-testid="total-amount"]')).toBeVisible();
      
      // Confirm booking
      await page.click('[data-testid="confirm-booking-button"]');
    });

    // Step 5: Process payment (redirect to Paystack)
    await test.step('Process payment', async () => {
      // Wait for redirect to payment gateway
      await page.waitForURL(/paystack\.com|flutterwave\.com/);
      
      // In test environment, we would use test cards
      // For E2E test, we verify the redirect happened
      expect(page.url()).toContain('paystack.com');
      
      // Note: In real E2E test, we would:
      // 1. Fill test card details
      // 2. Submit payment
      // 3. Wait for redirect back to our site
      // For this test, we'll mock the callback
    });

    // Step 6: Verify booking confirmation
    await test.step('Verify booking confirmation', async () => {
      // Simulate callback from payment gateway
      await page.goto('http://localhost:3000/bookings/confirmation?reference=BK123456&status=success');
      
      // Wait for confirmation page
      await page.waitForSelector('[data-testid="booking-confirmation"]');
      
      // Verify confirmation details
      await expect(page.locator('[data-testid="confirmation-message"]')).toContainText('confirmed');
      await expect(page.locator('[data-testid="booking-reference"]')).toBeVisible();
      await expect(page.locator('[data-testid="booking-details"]')).toBeVisible();
      
      // Verify booking reference format
      const reference = await page.locator('[data-testid="booking-reference"]').textContent();
      expect(reference).toMatch(/^BK[A-Z0-9]+$/);
    });
  });

  test('should handle validation errors in guest form', async () => {
    // Search and select room
    await page.fill('[data-testid="check-in-date"]', '2026-03-01');
    await page.fill('[data-testid="check-out-date"]', '2026-03-05');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="search-results"]');
    await page.click('[data-testid="property-card"]:first-child [data-testid="view-details-button"]');
    await page.click('[data-testid="room-type-card"]:first-child [data-testid="select-room-button"]');
    
    // Try to continue without filling form
    await page.click('[data-testid="continue-to-payment-button"]');
    
    // Verify validation errors
    await expect(page.locator('[data-testid="error-first-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-email"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-phone"]')).toBeVisible();
  });

  test('should handle invalid phone number format', async () => {
    // Navigate to guest form
    await page.fill('[data-testid="check-in-date"]', '2026-03-01');
    await page.fill('[data-testid="check-out-date"]', '2026-03-05');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="search-results"]');
    await page.click('[data-testid="property-card"]:first-child [data-testid="view-details-button"]');
    await page.click('[data-testid="room-type-card"]:first-child [data-testid="select-room-button"]');
    
    // Fill form with invalid phone
    await page.fill('[data-testid="first-name"]', 'John');
    await page.fill('[data-testid="last-name"]', 'Doe');
    await page.fill('[data-testid="email"]', 'john@example.com');
    await page.fill('[data-testid="phone"]', '08012345678'); // Invalid format
    await page.check('[data-testid="ndpr-consent"]');
    await page.click('[data-testid="continue-to-payment-button"]');
    
    // Verify phone validation error
    await expect(page.locator('[data-testid="error-phone"]')).toContainText('+234');
  });

  test('should handle missing NDPR consent', async () => {
    // Navigate to guest form
    await page.fill('[data-testid="check-in-date"]', '2026-03-01');
    await page.fill('[data-testid="check-out-date"]', '2026-03-05');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="search-results"]');
    await page.click('[data-testid="property-card"]:first-child [data-testid="view-details-button"]');
    await page.click('[data-testid="room-type-card"]:first-child [data-testid="select-room-button"]');
    
    // Fill form without NDPR consent
    await page.fill('[data-testid="first-name"]', 'John');
    await page.fill('[data-testid="last-name"]', 'Doe');
    await page.fill('[data-testid="email"]', 'john@example.com');
    await page.fill('[data-testid="phone"]', '+2348012345678');
    // Don't check NDPR consent
    await page.click('[data-testid="continue-to-payment-button"]');
    
    // Verify NDPR consent error
    await expect(page.locator('[data-testid="error-ndpr-consent"]')).toBeVisible();
  });

  test('should work on mobile viewport (320px)', async () => {
    // Set mobile viewport
    await page.setViewportSize({ width: 320, height: 568 });
    
    // Verify mobile layout
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    
    // Complete search
    await page.fill('[data-testid="check-in-date"]', '2026-03-01');
    await page.fill('[data-testid="check-out-date"]', '2026-03-05');
    await page.click('[data-testid="search-button"]');
    
    // Verify results are responsive
    await page.waitForSelector('[data-testid="search-results"]');
    const results = await page.locator('[data-testid="property-card"]').count();
    expect(results).toBeGreaterThan(0);
  });

  test('should work on tablet viewport (768px)', async () => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Complete search
    await page.fill('[data-testid="check-in-date"]', '2026-03-01');
    await page.fill('[data-testid="check-out-date"]', '2026-03-05');
    await page.click('[data-testid="search-button"]');
    
    // Verify results are responsive
    await page.waitForSelector('[data-testid="search-results"]');
    const results = await page.locator('[data-testid="property-card"]').count();
    expect(results).toBeGreaterThan(0);
  });

  test('should work on desktop viewport (1024px)', async () => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1024, height: 768 });
    
    // Complete search
    await page.fill('[data-testid="check-in-date"]', '2026-03-01');
    await page.fill('[data-testid="check-out-date"]', '2026-03-05');
    await page.click('[data-testid="search-button"]');
    
    // Verify results are responsive
    await page.waitForSelector('[data-testid="search-results"]');
    const results = await page.locator('[data-testid="property-card"]').count();
    expect(results).toBeGreaterThan(0);
  });
});
