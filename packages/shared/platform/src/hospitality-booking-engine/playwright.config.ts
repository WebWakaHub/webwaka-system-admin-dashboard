/**
 * Playwright Configuration for Hospitality Booking Engine E2E Tests
 * 
 * @module hospitality-booking-engine/playwright.config
 * @author webwakaagent5
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './__tests__/e2e',
  
  // Maximum time one test can run
  timeout: 60 * 1000,
  
  // Test execution settings
  fullyParallel: false, // Run tests sequentially for booking flows
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'junit-results.xml' }],
    ['list'],
  ],
  
  // Shared settings for all projects
  use: {
    // Base URL for tests
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    
    // Collect trace on failure
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'retain-on-failure',
    
    // Timeout for each action
    actionTimeout: 10 * 1000,
    
    // Navigation timeout
    navigationTimeout: 30 * 1000,
  },

  // Configure projects for major browsers and devices
  projects: [
    // Mobile browsers (Mobile-First)
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        locale: 'en-NG', // Nigerian English
        timezoneId: 'Africa/Lagos', // Nigerian timezone
      },
    },
    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 12'],
        locale: 'en-NG',
        timezoneId: 'Africa/Lagos',
      },
    },
    
    // Tablet
    {
      name: 'Tablet',
      use: { 
        ...devices['iPad Pro'],
        locale: 'en-NG',
        timezoneId: 'Africa/Lagos',
      },
    },
    
    // Desktop browsers
    {
      name: 'Desktop Chrome',
      use: { 
        ...devices['Desktop Chrome'],
        locale: 'en-NG',
        timezoneId: 'Africa/Lagos',
        viewport: { width: 1024, height: 768 },
      },
    },
    {
      name: 'Desktop Firefox',
      use: { 
        ...devices['Desktop Firefox'],
        locale: 'en-NG',
        timezoneId: 'Africa/Lagos',
        viewport: { width: 1024, height: 768 },
      },
    },
    {
      name: 'Desktop Safari',
      use: { 
        ...devices['Desktop Safari'],
        locale: 'en-NG',
        timezoneId: 'Africa/Lagos',
        viewport: { width: 1024, height: 768 },
      },
    },
    
    // Low-bandwidth simulation (African context)
    {
      name: 'Mobile Chrome (Slow 3G)',
      use: { 
        ...devices['Pixel 5'],
        locale: 'en-NG',
        timezoneId: 'Africa/Lagos',
        // Simulate slow 3G connection
        launchOptions: {
          slowMo: 50,
        },
      },
    },
  ],

  // Run local dev server before tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
