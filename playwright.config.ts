import { defineConfig, devices } from "@playwright/test";

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./src/test/e2e",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI
    ? [["html"], ["junit", { outputFile: "test-results/results.xml" }]]
    : "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.TEST_BASE_URL || "http://localhost:3000",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: process.env.CI ? "on-first-retry" : "on",

    /* Take screenshot on failure */
    screenshot: "only-on-failure",

    /* Record video on failure */
    video: "retain-on-failure",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "test",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: process.env.TEST_BASE_URL || "http://localhost:3000",
      },
    },
    {
      name: "cloud",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: process.env.VITE_SUPABASE_URL_CLOUD || "http://localhost:3000",
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer:
    process.env.TEST_ENVIRONMENT === "cloud"
      ? undefined
      : {
          command: "npm run dev",
          url: "http://localhost:3000",
          reuseExistingServer: !process.env.CI,
          timeout: 120 * 1000,
        },

  /* Global setup and teardown */
  globalSetup: "./src/test/e2e/global-setup.ts",
  globalTeardown: "./src/test/e2e/global-teardown.ts",

  /* Test timeout */
  timeout: 30000,

  /* Expect timeout */
  expect: {
    timeout: 10000,
  },

  /* Output directory for test artifacts */
  outputDir: "test-results/",

  /* Preserve test output */
  preserveOutput: "failures-only",
});
