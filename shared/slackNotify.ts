/**
 * Slack Notification Module
 * 
 * This module handles sending rich test result notifications to Slack
 * Includes test status, failure details, and links to reports
 */

import fs from 'fs/promises';
import path from 'path';

interface SlackMessage {
  text: string;
  blocks: Array<any>;
}

interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  failedTests: Array<{
    title: string;
    file: string;
    error: string;
  }>;
}

/**
 * Send test results to Slack
 */
export async function sendTestResultsToSlack(): Promise<void> {
  try {
    console.log('📢 Preparing Slack notification...');

    const summary = await generateTestSummary();
    const message = buildSlackMessage(summary);
    
    await sendToSlack(message);
    
    console.log('✅ Slack notification sent successfully');
    
  } catch (error) {
    console.error('❌ Failed to send Slack notification:', error);
    throw error;
  }
}

/**
 * Generate test summary from results
 */
async function generateTestSummary(): Promise<TestSummary> {
  try {
    const resultsPath = path.join(__dirname, '../test-results/results.json');
    const resultsContent = await fs.readFile(resultsPath, 'utf-8');
    const data = JSON.parse(resultsContent);
    
    let total = 0;
    let passed = 0;
    let failed = 0;
    let skipped = 0;
    let duration = 0;
    const failedTests: Array<{ title: string; file: string; error: string }> = [];
    
    // Parse Playwright results
    for (const suite of data.suites || []) {
      for (const spec of suite.specs || []) {
        for (const test of spec.tests || []) {
          total++;
          const result = test.results[0];
          duration += result?.duration || 0;
          
          switch (result?.status) {
            case 'passed':
              passed++;
              break;
            case 'failed':
              failed++;
              failedTests.push({
                title: test.title,
                file: spec.file,
                error: result.error?.message || 'Unknown error'
              });
              break;
            case 'skipped':
              skipped++;
              break;
          }
        }
      }
    }
    
    return {
      total,
      passed,
      failed,
      skipped,
      duration: Math.round(duration / 1000), // Convert to seconds
      failedTests
    };
    
  } catch (error) {
    console.warn('⚠️  Could not load test results for Slack notification');
    return {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
      failedTests: []
    };
  }
}

/**
 * Build Slack message with rich formatting
 */
function buildSlackMessage(summary: TestSummary): SlackMessage {
  const statusEmoji = summary.failed > 0 ? '❌' : '✅';
  const statusText = summary.failed > 0 ? 'Failed' : 'Passed';
  
  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `${statusEmoji} E2E Test Results - ${statusText}`
      }
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Total Tests:* ${summary.total}`
        },
        {
          type: 'mrkdwn',
          text: `*Duration:* ${summary.duration}s`
        },
        {
          type: 'mrkdwn',
          text: `*Passed:* ✅ ${summary.passed}`
        },
        {
          type: 'mrkdwn',
          text: `*Failed:* ❌ ${summary.failed}`
        },
        {
          type: 'mrkdwn',
          text: `*Skipped:* ⏭️ ${summary.skipped}`
        },
        {
          type: 'mrkdwn',
          text: `*Branch:* ${process.env.CI_BRANCH || 'main'}`
        }
      ]
    }
  ];

  // Add failed test details if any
  if (summary.failedTests.length > 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*Failed Tests:*'
      }
    });

    // Limit to first 5 failed tests to avoid message length issues
    const displayedFailures = summary.failedTests.slice(0, 5);
    
    for (const test of displayedFailures) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `• *${test.title}*\n   📄 ${path.basename(test.file)}\n   💬 ${test.error.substring(0, 100)}...`
        }
      });
    }

    if (summary.failedTests.length > 5) {
      blocks.push({
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `_And ${summary.failedTests.length - 5} more failed tests..._`
          }
        ]
      });
    }
  }

  // Add report links
  const reportLinks = [];
  
  if (process.env.CI_PIPELINE_URL) {
    reportLinks.push(`<${process.env.CI_PIPELINE_URL}|🔗 Pipeline>`);
  }
  
  if (process.env.CI_JOB_URL) {
    reportLinks.push(`<${process.env.CI_JOB_URL}|📊 Playwright Report>`);
  }

  // Check if ZAP report exists
  try {
    if (process.env.ZAP_ENABLED === 'true') {
      reportLinks.push(`<${process.env.CI_JOB_URL}/artifacts/test-results/zap-report.html|🔐 ZAP Security Report>`);
    }
  } catch (error) {
    // ZAP report link not available
  }

  if (reportLinks.length > 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Reports:* ${reportLinks.join(' • ')}`
      }
    });
  }

  return {
    text: `E2E Test Results - ${statusText}`,
    blocks
  };
}

/**
 * Send message to Slack webhook
 */
async function sendToSlack(message: SlackMessage): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  
  if (!webhookUrl) {
    throw new Error('SLACK_WEBHOOK_URL environment variable is required');
  }
  
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(message)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Slack webhook error: ${response.status} ${errorText}`);
  }
  
  console.log('✅ Message sent to Slack successfully');
}
