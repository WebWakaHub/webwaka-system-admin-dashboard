/**
 * Hospitality Booking Engine - Booking Cancellation E2E Test
 * 
 * End-to-end test for booking cancellation flow.
 * Tests: View Booking → Cancel → Confirm → Verify Refund
 * 
 * @module hospitality-booking-engine/__tests__/e2e/booking-cancellation.e2e.test
 * @author webwakaagent5
 */

import { test, expect, Page } from '@playwright/test';

test.describe('Booking Cancellation Flow', () => {
  let page: Page;
  const testBookingReference = 'BK123456';

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`http://localhost:3000/bookings/${testBookingReference}`);
    await page.waitForSelector('[data-testid="booking-details"]');
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should cancel booking successfully with full refund (>7 days)', async () => {
    // Step 1: Initiate cancellation
    await test.step('Initiate cancellation', async () => {
      await page.click('[data-testid="cancel-booking-button"]');
      await page.waitForSelector('[data-testid="cancellation-form"]');
    });

    // Step 2: Review cancellation policy
    await test.step('Review cancellation policy', async () => {
      await expect(page.locator('[data-testid="cancellation-policy"]')).toBeVisible();
      await expect(page.locator('[data-testid="refund-amount"]')).toBeVisible();
      
      // Verify refund amount (should be 100% for >7 days)
      const refundText = await page.locator('[data-testid="refund-amount"]').textContent();
      expect(refundText).toContain('100%');
    });

    // Step 3: Provide cancellation reason
    await test.step('Provide cancellation reason', async () => {
      await page.selectOption('[data-testid="cancellation-reason"]', 'Change of plans');
      await page.fill('[data-testid="cancellation-notes"]', 'Need to reschedule trip');
    });

    // Step 4: Confirm cancellation
    await test.step('Confirm cancellation', async () => {
      await page.click('[data-testid="confirm-cancellation-button"]');
      
      // Wait for confirmation
      await page.waitForSelector('[data-testid="cancellation-confirmation"]');
      
      // Verify success message
      await expect(page.locator('[data-testid="success-message"]')).toContainText('cancelled successfully');
      
      // Verify refund information
      await expect(page.locator('[data-testid="refund-status"]')).toContainText('pending');
      await expect(page.locator('[data-testid="refund-timeline"]')).toBeVisible();
    });

    // Step 5: Verify booking status
    await test.step('Verify booking status', async () => {
      await expect(page.locator('[data-testid="booking-status"]')).toContainText('Cancelled');
      await expect(page.locator('[data-testid="cancellation-date"]')).toBeVisible();
    });
  });

  test('should cancel booking with 50% refund (3-7 days)', async () => {
    // Mock booking with check-in in 5 days
    await page.evaluate(() => {
      window.mockCheckInDays = 5;
    });
    
    // Initiate cancellation
    await page.click('[data-testid="cancel-booking-button"]');
    await page.waitForSelector('[data-testid="cancellation-form"]');
    
    // Verify refund amount (should be 50%)
    const refundText = await page.locator('[data-testid="refund-amount"]').textContent();
    expect(refundText).toContain('50%');
    
    // Complete cancellation
    await page.selectOption('[data-testid="cancellation-reason"]', 'Change of plans');
    await page.click('[data-testid="confirm-cancellation-button"]');
    
    // Verify confirmation
    await page.waitForSelector('[data-testid="cancellation-confirmation"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('should cancel booking with 25% refund (1-3 days)', async () => {
    // Mock booking with check-in in 2 days
    await page.evaluate(() => {
      window.mockCheckInDays = 2;
    });
    
    // Initiate cancellation
    await page.click('[data-testid="cancel-booking-button"]');
    await page.waitForSelector('[data-testid="cancellation-form"]');
    
    // Verify refund amount (should be 25%)
    const refundText = await page.locator('[data-testid="refund-amount"]').textContent();
    expect(refundText).toContain('25%');
    
    // Complete cancellation
    await page.selectOption('[data-testid="cancellation-reason"]', 'Emergency');
    await page.click('[data-testid="confirm-cancellation-button"]');
    
    // Verify confirmation
    await page.waitForSelector('[data-testid="cancellation-confirmation"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('should prevent cancellation within 24 hours of check-in', async () => {
    // Mock booking with check-in in 12 hours
    await page.evaluate(() => {
      window.mockCheckInHours = 12;
    });
    
    // Try to cancel
    await page.click('[data-testid="cancel-booking-button"]');
    
    // Verify error message
    await expect(page.locator('[data-testid="error-message"]')).toContainText('24 hours');
    
    // Verify cancellation form is not shown
    await expect(page.locator('[data-testid="cancellation-form"]')).not.toBeVisible();
  });

  test('should require cancellation reason', async () => {
    // Initiate cancellation
    await page.click('[data-testid="cancel-booking-button"]');
    await page.waitForSelector('[data-testid="cancellation-form"]');
    
    // Try to confirm without reason
    await page.click('[data-testid="confirm-cancellation-button"]');
    
    // Verify validation error
    await expect(page.locator('[data-testid="error-cancellation-reason"]')).toBeVisible();
  });

  test('should display cancellation policy clearly', async () => {
    // Initiate cancellation
    await page.click('[data-testid="cancel-booking-button"]');
    await page.waitForSelector('[data-testid="cancellation-form"]');
    
    // Verify policy is displayed
    await expect(page.locator('[data-testid="cancellation-policy"]')).toBeVisible();
    
    // Verify policy details
    await expect(page.locator('[data-testid="policy-details"]')).toContainText('>7 days');
    await expect(page.locator('[data-testid="policy-details"]')).toContainText('3-7 days');
    await expect(page.locator('[data-testid="policy-details"]')).toContainText('1-3 days');
    await expect(page.locator('[data-testid="policy-details"]')).toContainText('<24 hours');
  });

  test('should send cancellation confirmation email', async () => {
    // Initiate and complete cancellation
    await page.click('[data-testid="cancel-booking-button"]');
    await page.waitForSelector('[data-testid="cancellation-form"]');
    await page.selectOption('[data-testid="cancellation-reason"]', 'Change of plans');
    await page.click('[data-testid="confirm-cancellation-button"]');
    await page.waitForSelector('[data-testid="cancellation-confirmation"]');
    
    // Verify email notification message
    await expect(page.locator('[data-testid="email-notification"]')).toContainText('confirmation email');
  });

  test('should prevent double cancellation', async () => {
    // Cancel booking
    await page.click('[data-testid="cancel-booking-button"]');
    await page.waitForSelector('[data-testid="cancellation-form"]');
    await page.selectOption('[data-testid="cancellation-reason"]', 'Change of plans');
    await page.click('[data-testid="confirm-cancellation-button"]');
    await page.waitForSelector('[data-testid="cancellation-confirmation"]');
    
    // Verify cancel button is no longer available
    await expect(page.locator('[data-testid="cancel-booking-button"]')).not.toBeVisible();
    
    // Verify cancellation notice
    await expect(page.locator('[data-testid="cancellation-notice"]')).toContainText('already cancelled');
  });

  test('should handle cancellation API error gracefully', async () => {
    // Mock API error
    await page.evaluate(() => {
      window.mockCancellationError = true;
    });
    
    // Try to cancel
    await page.click('[data-testid="cancel-booking-button"]');
    await page.waitForSelector('[data-testid="cancellation-form"]');
    await page.selectOption('[data-testid="cancellation-reason"]', 'Change of plans');
    await page.click('[data-testid="confirm-cancellation-button"]');
    
    // Verify error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('try again');
  });
});
