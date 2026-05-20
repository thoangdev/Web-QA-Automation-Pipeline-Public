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

  fs.mkdirSync(path.join(process.cwd(), '.auth'), { recursive: true });
  fs.mkdirSync(path.join(process.cwd(), 'reports'), { recursive: true });
}
