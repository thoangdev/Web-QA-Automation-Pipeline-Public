import { chromium, FullConfig } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';

const execAsync = promisify(exec);
dotenv.config();

/**
 * Global Setup for Dispel E2E Tests
 * 
 * This setup runs before all tests and handles:
 * - ZAP proxy initialization (if enabled)
 * - Global environment validation
 * - Shared resource preparation
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup...');

  // Validate environment variables
  validateEnvironment();

  // Start ZAP proxy if enabled
  if (process.env.ZAP_ENABLED === 'true') {
    await startZAPProxy();
  }

  // Ensure test directories exist
  await ensureTestDirectories();

  console.log('✅ Global setup completed');
}

/**
 * Validate required environment variables
 */
function validateEnvironment() {
  const requiredEnvVars = [
    'STIG_BASE_URL',
    'ABB_BASE_URL', 
    'DSMD_BASE_URL'
  ];

  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missing.join(', ')}`);
    console.warn('Using default values from .env file');
  }
}

/**
 * Start ZAP proxy for security testing
 */
async function startZAPProxy() {
  console.log('🔐 Starting OWASP ZAP proxy...');
  
  try {
    const zapHost = process.env.ZAP_PROXY_HOST || 'localhost';
    const zapPort = process.env.ZAP_PROXY_PORT || '8080';
    
    // Check if ZAP is already running
    try {
      const { stdout } = await execAsync(`curl -s http://${zapHost}:${zapPort}/JSON/core/view/version/`);
      if (stdout.includes('version')) {
        console.log('✅ ZAP proxy is already running');
        return;
      }
    } catch (error) {
      // ZAP not running, continue to start it
    }

    // Start ZAP daemon
    const zapCommand = `zap.sh -daemon -host ${zapHost} -port ${zapPort} -config api.addrs.addr.name=".*" -config api.addrs.addr.regex=true`;
    console.log(`Starting ZAP with command: ${zapCommand}`);
    
    exec(zapCommand, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Failed to start ZAP proxy:', error);
        return;
      }
      console.log('ZAP Output:', stdout);
      if (stderr) {
        console.error('ZAP Errors:', stderr);
      }
    });

    // Wait for ZAP to be ready
    await waitForZAP(zapHost, zapPort);
    console.log('✅ ZAP proxy started successfully');
    
  } catch (error) {
    console.error('❌ Failed to start ZAP proxy:', error);
    console.log('Continuing without ZAP proxy...');
  }
}

/**
 * Wait for ZAP proxy to be ready
 */
async function waitForZAP(host: string, port: string, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await execAsync(`curl -s http://${host}:${port}/JSON/core/view/version/`);
      return;
    } catch (error) {
      console.log(`Waiting for ZAP... (${i + 1}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  throw new Error('ZAP proxy failed to start within timeout period');
}

/**
 * Ensure all test directories exist
 */
async function ensureTestDirectories() {
  const fs = require('fs').promises;
  const path = require('path');
  
  const directories = [
    'test-results',
    'playwright-report',
    'projects/stig/fixtures',
    'projects/abb/fixtures',
    'projects/dsmd/fixtures'
  ];

  for (const dir of directories) {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }
}

export default globalSetup;
