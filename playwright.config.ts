import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Root Playwright Configuration for Dispel Multi-Product E2E Testing
 * 
 * This configuration defines three isolated projects: stig, abb, and dsmd
 * Each project has its own base URL, fixtures, and test directories
 * 
 * Features:
 * - ZAP proxy integration for security testing
 * - Configurable timeouts and retries
 * - HTML and JSON reporting
 * - Trace/video/screenshot capture on failure
 * - Parallel execution support
 */
export default defineConfig({
  // Global test directory - projects will override this
  testDir: './projects',
  
  // Global timeout settings
  timeout: parseInt(process.env.TIMEOUT || '30000'),
  expect: {
    timeout: 10000,
  },
  
  // Test execution settings
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : parseInt(process.env.RETRIES || '1'),
  workers: process.env.CI ? 1 : undefined,
  
  // Reporting configuration
  reporter: [
    ['html', { 
      outputFolder: 'playwright-report',
      open: 'never' 
    }],
    ['json', { 
      outputFile: 'test-results/results.json' 
    }],
    ['list'],
    ...(process.env.CI ? [['github']] : [])
  ],
  
  // Global setup and teardown
  globalSetup: require.resolve('./global-setup'),
  globalTeardown: require.resolve('./global-teardown'),
  
  // Default use options for all projects
  use: {
    // Browser settings
    headless: process.env.HEADLESS !== 'false',
    
    // Tracing and debugging
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    
    // ZAP proxy configuration (if enabled)
    ...(process.env.ZAP_ENABLED === 'true' && {
      proxy: {
        server: `http://${process.env.ZAP_PROXY_HOST || 'localhost'}:${process.env.ZAP_PROXY_PORT || '8080'}`,
      },
    }),
    
    // Action settings
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  // Project definitions - each product gets its own isolated environment
  projects: [
    {
      name: 'stig',
      testDir: './projects/stig/tests',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.STIG_BASE_URL || 'https://stig.dispel.local',
        storageState: './projects/stig/fixtures/auth.json',
      },
      dependencies: ['stig-setup'],
    },
    
    {
      name: 'abb',
      testDir: './projects/abb/tests',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.ABB_BASE_URL || 'https://abb.dispel.local',
        storageState: './projects/abb/fixtures/auth.json',
      },
      dependencies: ['abb-setup'],
    },
    
    {
      name: 'dsmd',
      testDir: './projects/dsmd/tests',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.DSMD_BASE_URL || 'https://dsmd.dispel.local',
        storageState: './projects/dsmd/fixtures/auth.json',
      },
      dependencies: ['dsmd-setup'],
    },

    // Setup projects for authentication
    {
      name: 'stig-setup',
      testMatch: './projects/stig/fixtures/auth-setup.ts',
      teardown: 'stig-cleanup',
    },
    
    {
      name: 'abb-setup',
      testMatch: './projects/abb/fixtures/auth-setup.ts',
      teardown: 'abb-cleanup',
    },
    
    {
      name: 'dsmd-setup',
      testMatch: './projects/dsmd/fixtures/auth-setup.ts',
      teardown: 'dsmd-cleanup',
    },

    // Cleanup projects
    {
      name: 'stig-cleanup',
      testMatch: './projects/stig/fixtures/cleanup.ts',
    },
    
    {
      name: 'abb-cleanup',
      testMatch: './projects/abb/fixtures/cleanup.ts',
    },
    
    {
      name: 'dsmd-cleanup',
      testMatch: './projects/dsmd/fixtures/cleanup.ts',
    },
  ],

  // Output directories
  outputDir: 'test-results',
});
