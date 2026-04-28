import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  timeout: 30_000,

  reporter: [
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['json', { outputFile: 'reports/results.json' }],
    ...(process.env.CI ? ([['github']] as const) : []),
  ],

  use: {
    baseURL: process.env.BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    testIdAttribute: 'data-testid',
  },

  projects: [
    // Default projects — no auth required.
    // To add auth, see src/fixtures/auth.setup.ts and GETTING_STARTED.md#8.
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

    // ── Auth-enabled projects (uncomment when ready) ───────────────────────────
    // {
    //   name: 'setup',
    //   testMatch: /auth\.setup\.ts/,
    // },
    // {
    //   name: 'chromium',
    //   use: { ...devices['Desktop Chrome'], storageState: '.auth/user.json' },
    //   dependencies: ['setup'],
    // },
  ],
});
