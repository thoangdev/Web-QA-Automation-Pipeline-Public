import * as fs from 'fs';
import * as path from 'path';

/**
 * Wipe all worker storage state files at the end of every CI run so saved
 * session tokens never persist into uploaded artifacts. Even though .auth/ is
 * in .gitignore, CI debuggers can attach the workspace as an artifact, so
 * paranoid cleanup is the safe default.
 */
export default async function globalTeardown(): Promise<void> {
  if (!process.env.CI) return;
  const authDir = path.join(process.cwd(), '.auth');
  if (!fs.existsSync(authDir)) return;

  for (const f of fs.readdirSync(authDir)) {
    if (f.endsWith('.json')) {
      fs.rmSync(path.join(authDir, f), { force: true });
    }
  }
}
