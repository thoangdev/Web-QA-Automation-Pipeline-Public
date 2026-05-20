import * as fs from 'fs';
import * as path from 'path';

export default async function globalTeardown(): Promise<void> {
  // In CI, drop the saved auth state so cached sessions don't leak between runs.
  if (process.env.CI) {
    const authFile = path.join(process.cwd(), '.auth', 'user.json');
    if (fs.existsSync(authFile)) {
      fs.rmSync(authFile, { force: true });
    }
  }
}
