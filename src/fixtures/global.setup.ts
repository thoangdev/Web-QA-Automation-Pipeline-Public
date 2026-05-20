import * as fs from 'fs';
import * as path from 'path';

const REQUIRED = ['BASE_URL', 'TEST_USER_USERNAME', 'TEST_USER_PASSWORD'] as const;

export default async function globalSetup(): Promise<void> {
  const missing = REQUIRED.filter(key => !process.env[key]);
  if (missing.length) {
    throw new Error(
      `Missing required env vars: ${missing.join(', ')}. ` +
        `Copy .env.example to .env.local and fill them in, or set them in your CI secrets.`,
    );
  }

  const url = process.env.BASE_URL!;
  if (!/^https?:\/\//.test(url)) {
    throw new Error(`BASE_URL must start with http:// or https:// — got "${url}"`);
  }
  if (url.endsWith('/')) {
    throw new Error(`BASE_URL must not have a trailing slash — got "${url}"`);
  }

  // Wipe any stale worker storage states from a previous run so we always
  // start with a known-good session per worker. Skip if PW_KEEP_AUTH=1 (handy
  // when iterating locally on a passing run).
  if (!process.env.PW_KEEP_AUTH) {
    const authDir = path.join(process.cwd(), '.auth');
    if (fs.existsSync(authDir)) {
      for (const f of fs.readdirSync(authDir)) {
        if (f.startsWith('user-') && f.endsWith('.json')) {
          fs.rmSync(path.join(authDir, f), { force: true });
        }
      }
    }
  }

  fs.mkdirSync(path.join(process.cwd(), '.auth'), { recursive: true });
  fs.mkdirSync(path.join(process.cwd(), 'reports'), { recursive: true });
}
