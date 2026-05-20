import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const isCI = !!process.env.CI;
const STORAGE_STATE = '.auth/user.json';
// Optional: run against the system-installed Chrome instead of Playwright's
// bundled chromium. Useful on host OSes where Playwright has no prebuilt binary.
const chromeChannel = process.env.PW_CHROMIUM_CHANNEL || undefined;

export default defineConfig({
  testDir: './tests',
  globalSetup: require.resolve('./src/fixtures/global.setup.ts'),
  globalTeardown: require.resolve('./src/fixtures/global.teardown.ts'),

  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 4 : undefined,
  timeout: 30_000,
  expect: { timeout: 5_000 },

  reporter: isCI
    ? [
        ['blob', { outputDir: 'blob-report' }],
        ['github'],
        ['json', { outputFile: 'reports/results.json' }],
      ]
    : [
        ['html', { outputFolder: 'reports/html', open: 'never' }],
        ['list'],
        ['json', { outputFile: 'reports/results.json' }],
      ],

  use: {
    baseURL: process.env.BASE_URL || 'https://www.saucedemo.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: process.env.PW_DISABLE_VIDEO ? 'off' : 'retain-on-failure',
    testIdAttribute: 'data-test',
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
    ignoreHTTPSErrors: false,
    extraHTTPHeaders: {
      'X-Test-Run': process.env.GITHUB_RUN_ID || 'local',
    },
  },

  projects: [
    {
      name: 'setup',
      testDir: './src/fixtures',
      testMatch: /global\.auth\.setup\.ts$/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: STORAGE_STATE,
        ...(chromeChannel ? { channel: chromeChannel } : {}),
      },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], storageState: STORAGE_STATE },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'], storageState: STORAGE_STATE },
      dependencies: ['setup'],
    },
  ],
});
