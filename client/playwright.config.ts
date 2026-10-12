import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright journey tests for the PayPal flows.
 *
 * These tests drive the real React app in a real browser but stub:
 *   - PayPal's JS SDK (returned from paypal.com — intercepted at the network level)
 *   - All /api/* calls (so no backend / database is required)
 *
 * See docs/paypal-testing.md for how to add new tests.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
