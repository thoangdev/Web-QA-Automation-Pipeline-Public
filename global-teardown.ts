import { FullConfig } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';

const execAsync = promisify(exec);
dotenv.config();

/**
 * Global Teardown for Dispel E2E Tests
 * 
 * This teardown runs after all tests and handles:
 * - ZAP proxy cleanup and report generation
 * - Test result processing
 * - Notification sending
 * - Resource cleanup
 */
async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown...');

  // Generate ZAP report if enabled
  if (process.env.ZAP_ENABLED === 'true') {
    await generateZAPReport();
  }

  // Process test results for Tuskr integration
  if (process.env.TUSKR_ENABLED === 'true') {
    await processTuskrResults();
  }

  // Send Slack notifications if enabled
  if (process.env.SLACK_ENABLED === 'true') {
    await sendSlackNotification();
  }

  console.log('✅ Global teardown completed');
}

/**
 * Generate ZAP security report
 */
async function generateZAPReport() {
  console.log('📊 Generating ZAP security report...');
  
  try {
    const zapHost = process.env.ZAP_PROXY_HOST || 'localhost';
    const zapPort = process.env.ZAP_PROXY_PORT || '8080';
    const apiKey = process.env.ZAP_API_KEY;
    
    // Generate HTML report
    const reportCommand = `curl -s "http://${zapHost}:${zapPort}/OTHER/core/other/htmlreport/?apikey=${apiKey}" > test-results/zap-report.html`;
    await execAsync(reportCommand);
    
    // Generate JSON report for programmatic analysis
    const jsonCommand = `curl -s "http://${zapHost}:${zapPort}/JSON/core/view/alerts/?apikey=${apiKey}" > test-results/zap-alerts.json`;
    await execAsync(jsonCommand);
    
    console.log('✅ ZAP reports generated successfully');
    
    // Stop ZAP daemon
    const shutdownCommand = `curl -s "http://${zapHost}:${zapPort}/JSON/core/action/shutdown/?apikey=${apiKey}"`;
    await execAsync(shutdownCommand);
    
  } catch (error) {
    console.error('❌ Failed to generate ZAP report:', error);
  }
}

/**
 * Process results for Tuskr integration
 */
async function processTuskrResults() {
  console.log('📤 Processing results for Tuskr...');
  
  try {
    // Import the Tuskr upload utility
    const { uploadToTuskr } = await import('./shared/tuskr-upload');
    await uploadToTuskr();
    
    console.log('✅ Results uploaded to Tuskr successfully');
  } catch (error) {
    console.error('❌ Failed to upload results to Tuskr:', error);
  }
}

/**
 * Send Slack notification with test results
 */
async function sendSlackNotification() {
  console.log('📢 Sending Slack notification...');
  
  try {
    // Import the Slack notification utility
    const { sendTestResultsToSlack } = await import('./shared/slackNotify');
    await sendTestResultsToSlack();
    
    console.log('✅ Slack notification sent successfully');
  } catch (error) {
    console.error('❌ Failed to send Slack notification:', error);
  }
}

export default globalTeardown;
