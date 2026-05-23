export interface EnvCheckOptions {
  url: string;
  timeoutMs?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  expectedStatus?: number;
}

export interface EnvCheckResult {
  ready: boolean;
  attempts: number;
  totalElapsedMs: number;
  lastStatus?: number;
  lastError?: string;
}

export async function waitForEnvironment(opts: EnvCheckOptions): Promise<EnvCheckResult> {
  const {
    url,
    timeoutMs = Number(process.env['ENV_CHECK_TIMEOUT_MS']) || 300_000,
    initialDelayMs = 2_000,
    maxDelayMs = 30_000,
    expectedStatus = 200,
  } = opts;

  const start = Date.now();
  let delay = initialDelayMs;
  let attempts = 0;
  let lastStatus: number | undefined;
  let lastError: string | undefined;

  while (Date.now() - start < timeoutMs) {
    attempts++;
    try {
      const res = await fetch(url, {
        method: 'GET',
        signal: AbortSignal.timeout(10_000),
      });
      lastStatus = res.status;
      if (res.status === expectedStatus) {
        return { ready: true, attempts, totalElapsedMs: Date.now() - start, lastStatus };
      }
      lastError = `HTTP ${res.status}`;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }

    const remaining = timeoutMs - (Date.now() - start);
    if (remaining <= 0) break;
    await new Promise(resolve => setTimeout(resolve, Math.min(delay, remaining)));
    delay = Math.min(delay * 2, maxDelayMs);
  }

  return { ready: false, attempts, totalElapsedMs: Date.now() - start, lastStatus, lastError };
}
