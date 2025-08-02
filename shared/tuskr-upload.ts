/**
 * Tuskr Integration Module
 * 
 * This module handles uploading test results to Tuskr test management platform
 * Maps test files to test case IDs using the tuskr-rules.json configuration
 */

import fs from 'fs/promises';
import path from 'path';

interface TuskrRule {
  testFile: string;
  testCaseId: string;
  projectName: string;
}

interface TestResult {
  title: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  file: string;
}

interface TuskrUploadPayload {
  projectId: string;
  testRunName: string;
  results: Array<{
    testCaseId: string;
    status: 'passed' | 'failed' | 'skipped';
    executionTime: number;
    comment?: string;
  }>;
}

/**
 * Upload test results to Tuskr
 */
export async function uploadToTuskr(): Promise<void> {
  try {
    console.log('📤 Starting Tuskr upload process...');

    // Load Tuskr mapping rules
    const rules = await loadTuskrRules();
    
    // Load test results
    const results = await loadTestResults();
    
    // Map results to Tuskr format
    const mappedResults = mapResultsToTuskr(results, rules);
    
    // Upload to Tuskr API
    await uploadResults(mappedResults);
    
    console.log('✅ Successfully uploaded results to Tuskr');
    
  } catch (error) {
    console.error('❌ Failed to upload to Tuskr:', error);
    throw error;
  }
}

/**
 * Load Tuskr mapping rules from configuration file
 */
async function loadTuskrRules(): Promise<TuskrRule[]> {
  try {
    const rulesPath = path.join(__dirname, 'tuskr-rules.json');
    const rulesContent = await fs.readFile(rulesPath, 'utf-8');
    return JSON.parse(rulesContent);
  } catch (error) {
    console.warn('⚠️  Could not load tuskr-rules.json, using empty rules');
    return [];
  }
}

/**
 * Load test results from Playwright JSON report
 */
async function loadTestResults(): Promise<TestResult[]> {
  try {
    const resultsPath = path.join(__dirname, '../test-results/results.json');
    const resultsContent = await fs.readFile(resultsPath, 'utf-8');
    const data = JSON.parse(resultsContent);
    
    const results: TestResult[] = [];
    
    // Parse Playwright results format
    for (const suite of data.suites || []) {
      for (const spec of suite.specs || []) {
        for (const test of spec.tests || []) {
          results.push({
            title: test.title,
            status: test.results[0]?.status || 'skipped',
            duration: test.results[0]?.duration || 0,
            error: test.results[0]?.error?.message,
            file: spec.file
          });
        }
      }
    }
    
    return results;
  } catch (error) {
    console.warn('⚠️  Could not load test results');
    return [];
  }
}

/**
 * Map test results to Tuskr format using rules
 */
function mapResultsToTuskr(results: TestResult[], rules: TuskrRule[]): TuskrUploadPayload {
  const mappedResults = results
    .map(result => {
      // Find matching rule for this test file
      const rule = rules.find(r => 
        result.file.includes(r.testFile) || 
        result.title.includes(r.testFile)
      );
      
      if (!rule) {
        console.warn(`⚠️  No Tuskr mapping found for: ${result.file}`);
        return null;
      }
      
      return {
        testCaseId: rule.testCaseId,
        status: result.status,
        executionTime: Math.round(result.duration / 1000), // Convert to seconds
        comment: result.error ? `Error: ${result.error}` : undefined
      };
    })
    .filter(Boolean) as Array<{
      testCaseId: string;
      status: 'passed' | 'failed' | 'skipped';
      executionTime: number;
      comment?: string;
    }>;

  return {
    projectId: process.env.TUSKR_PROJECT_ID || 'dispel-e2e',
    testRunName: `E2E Test Run - ${new Date().toISOString()}`,
    results: mappedResults
  };
}

/**
 * Upload results to Tuskr API
 */
async function uploadResults(payload: TuskrUploadPayload): Promise<void> {
  const tuskrApiUrl = process.env.TUSKR_API_URL;
  const tuskrApiKey = process.env.TUSKR_API_KEY;
  
  if (!tuskrApiUrl || !tuskrApiKey) {
    throw new Error('Tuskr API URL and API Key must be configured');
  }
  
  const response = await fetch(`${tuskrApiUrl}/test-runs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tuskrApiKey}`
    },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Tuskr API error: ${response.status} ${errorText}`);
  }
  
  const result = await response.json();
  console.log(`✅ Created test run in Tuskr: ${result.id}`);
}
