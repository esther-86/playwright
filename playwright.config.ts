import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
require('dotenv').config()

// https://playwright.dev/docs/browsers 
const availBrowserConfigs = [
  /* Test against desktop browsers */
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
  /* Test against mobile viewports. */
  {
    name: 'Mobile Chrome',
    use: { ...devices['Pixel 5'] },
  },
  {
    name: 'Mobile Safari',
    use: { ...devices['iPhone 12'] },
  },
  /* Test against branded browsers. */
  {
    name: 'Google Chrome',
    use: { ...devices['Desktop Chrome'], channel: 'chrome' }, // or 'chrome-beta'
  },
  {
    name: 'Microsoft Edge',
    use: { ...devices['Desktop Edge'], channel: 'msedge' }, // or 'msedge-dev'
  },
]

const desiredBrowserConfigName = (process.env.TEST_BROWSER_CONFIG ? process.env.TEST_BROWSER_CONFIG : 'chromium').toLowerCase()
const desiredBrowserConfig = availBrowserConfigs.find((cfg) => cfg.name.toLowerCase() === desiredBrowserConfigName);
if (desiredBrowserConfigName.indexOf('mobile') < 0) {
  desiredBrowserConfig.use.viewport = { width: 1400, height: 920 }
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
// eslint-disable-next-line import/no-default-export
export default defineConfig({
  testDir: './tests-playwright',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* 
  Retry due to a lot of flakiness seen, per https://docs.google.com/spreadsheets/d/1P1Yjw-Mh3IDfvXQzzDGLgzREJudJbwfh9h1byxt-8TY/edit#gid=1032955781
  Except for @bug ones - Skip them. TODO: Skip them programatically based on environment variable instead of hardcode like this
  retries: 1 to have balance between runtime and reducing flakiness
  6/5/24: If get job timeout, will not be able to get artifacts. Need to not retry to ensure no job timeout is hit.
  */
  retries: process.env.CI_RETRIES ? +process.env.CI_RETRIES : 0,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['list'],
    ['junit', { outputFile: 'test-results.xml' }],
    ['html', { open: 'never', outputFolder: 'test-html' }]
  ],

  // https://playwright.dev/docs/test-timeouts
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    actionTimeout: 30 * 1000,
    navigationTimeout: 45 * 1000,

    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://127.0.0.1:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    // trace: 'on-first-retry',
    trace: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    /* 
    // Somehow, when added global setup, the playwright UI mode doesn't show all tests
    {
      name: 'setup api',
      testMatch: /global\.setup\.ts/,
    }, 
    */
    desiredBrowserConfig,
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
