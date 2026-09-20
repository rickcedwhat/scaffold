import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Match e2e specs in any app's e2e/ folder
  testMatch: 'apps/*/e2e/**/*.spec.ts',

  // Run tests in parallel
  fullyParallel: true,

  // Fail the build on CI if test.only was accidentally committed
  forbidOnly: !!process.env.CI,

  // Retry flaky tests once on CI
  retries: process.env.CI ? 1 : 0,

  // Limit parallelism on CI to avoid resource contention
  workers: process.env.CI ? 2 : undefined,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],

  use: {
    // Base URL for all relative navigations
    baseURL: 'http://localhost:5600',

    // Capture traces on first retry
    trace: 'on-first-retry',

    // Capture screenshot on failure
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Auto-start the demo dev server before running tests
  webServer: {
    command: 'npm --workspace=demo run dev',
    url: 'http://localhost:5600',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
