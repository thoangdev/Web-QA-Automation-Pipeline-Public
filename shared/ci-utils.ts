/**
 * CI/CD Utility Functions
 * 
 * Helper functions for workflows, logging, and environment detection
 */

/**
 * Detect if running in CI environment
 */
export function isCI(): boolean {
  return !!(
    process.env.CI ||
    process.env.GITHUB_ACTIONS ||
    process.env.JENKINS_URL ||
    process.env.TRAVIS ||
    process.env.CIRCLECI
  );
}

/**
 * Get CI environment information
 */
export function getCIInfo() {
  return {
    isCI: isCI(),
    provider: getCIProvider(),
    branch: process.env.GITHUB_REF_NAME || process.env.CI_BRANCH || 'main',
    commit: process.env.GITHUB_SHA || process.env.CI_COMMIT_SHA || 'unknown',
    buildNumber: process.env.GITHUB_RUN_NUMBER || process.env.BUILD_NUMBER || 'unknown',
    buildUrl: process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY && process.env.GITHUB_RUN_ID
      ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
      : process.env.BUILD_URL || 'unknown'
  };
}

/**
 * Detect CI provider
 */
function getCIProvider(): string {
  if (process.env.GITHUB_ACTIONS) return 'github-actions';
  if (process.env.JENKINS_URL) return 'jenkins';
  if (process.env.TRAVIS) return 'travis';
  if (process.env.CIRCLECI) return 'circle-ci';
  if (process.env.CI) return 'generic-ci';
  return 'local';
}

/**
 * Enhanced logging with CI-friendly formatting
 */
export class CILogger {
  private prefix: string;

  constructor(prefix = 'E2E') {
    this.prefix = prefix;
  }

  info(message: string, ...args: any[]) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${this.prefix}] ℹ️  ${message}`, ...args);
  }

  success(message: string, ...args: any[]) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${this.prefix}] ✅ ${message}`, ...args);
  }

  warn(message: string, ...args: any[]) {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] [${this.prefix}] ⚠️  ${message}`, ...args);
  }

  error(message: string, ...args: any[]) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [${this.prefix}] ❌ ${message}`, ...args);
  }

  debug(message: string, ...args: any[]) {
    if (process.env.DEBUG || process.env.VERBOSE) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [${this.prefix}] 🐛 ${message}`, ...args);
    }
  }

  /**
   * Log a GitHub Actions group (collapsible section)
   */
  group(title: string, callback: () => void | Promise<void>) {
    if (process.env.GITHUB_ACTIONS) {
      console.log(`::group::${title}`);
    } else {
      this.info(`--- ${title} ---`);
    }

    try {
      const result = callback();
      if (result instanceof Promise) {
        return result.finally(() => {
          if (process.env.GITHUB_ACTIONS) {
            console.log('::endgroup::');
          }
        });
      }
    } finally {
      if (process.env.GITHUB_ACTIONS && !(callback() instanceof Promise)) {
        console.log('::endgroup::');
      }
    }
  }

  /**
   * Set output variable for GitHub Actions
   */
  setOutput(name: string, value: string) {
    if (process.env.GITHUB_ACTIONS) {
      console.log(`::set-output name=${name}::${value}`);
    } else {
      this.info(`Output ${name}=${value}`);
    }
  }

  /**
   * Add annotation for GitHub Actions
   */
  annotate(level: 'notice' | 'warning' | 'error', message: string, file?: string, line?: number) {
    if (process.env.GITHUB_ACTIONS) {
      let annotation = `::${level}`;
      if (file) annotation += ` file=${file}`;
      if (line) annotation += `,line=${line}`;
      annotation += `::${message}`;
      console.log(annotation);
    } else {
      const emoji = level === 'error' ? '❌' : level === 'warning' ? '⚠️' : 'ℹ️';
      this.info(`${emoji} ${message}${file ? ` (${file}${line ? `:${line}` : ''})` : ''}`);
    }
  }
}

/**
 * Create default logger instance
 */
export const logger = new CILogger();

/**
 * Environment validation utilities
 */
export function validateRequiredEnvVars(requiredVars: string[]): void {
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    logger.error(`Missing required environment variables: ${missing.join(', ')}`);
    
    if (isCI()) {
      process.exit(1);
    } else {
      logger.warn('Continuing with default values in local environment');
    }
  }
}

/**
 * Wait for a condition with timeout
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  timeoutMs = 30000,
  intervalMs = 1000
): Promise<void> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeoutMs) {
    const result = await condition();
    if (result) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
  
  throw new Error(`Condition not met within ${timeoutMs}ms`);
}
