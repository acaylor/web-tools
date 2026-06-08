import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;
const baseUrl = process.env.BASE_URL || 'http://localhost:5050';
const useWebServer = process.env.NO_WEB_SERVER !== 'true';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './src',
  testMatch: /\.e2e\.(spec\.)?ts$/,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: isCI,
  /* Retry on CI only */
  retries: isCI ? 2 : 0,
  /* Run a few workers per shard on CI. The job runs in the ARC dind sidecar,
     which is bounded by the node rather than the runner container's limits, so
     there is headroom beyond a single worker. Tests use isolated browser
     contexts and `retries: 2` covers the occasional flake under parallelism. */
  workers: isCI ? 3 : undefined,
  /* Heavier headroom on CI: under parallel workers on shared runners the busier
     tools (e.g. the emoji picker's 500ms-debounced fuse.js search) can exceed
     the default 5s assertion / 30s test budgets without being broken. */
  timeout: isCI ? 60_000 : 30_000,
  expect: { timeout: isCI ? 15_000 : 5_000 },
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: baseUrl,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    testIdAttribute: 'data-test-id',
    locale: 'en-GB',
    timezoneId: 'Europe/Paris',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  /* Run your local dev server before starting the tests */

  ...(useWebServer
    && {
      webServer: {
        command: 'npm run preview',
        url: 'http://localhost:5050',
        reuseExistingServer: !isCI,
      },
    }
  ),
});
