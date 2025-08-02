import { test as setup } from '@playwright/test';
import { DSMDAuthFixture } from './auth';

const authFile = './projects/dsmd/fixtures/auth.json';

setup('authenticate as DSMD admin', async ({ page }) => {
  console.log('🔐 Setting up DSMD admin authentication...');
  
  const auth = new DSMDAuthFixture(page);
  await auth.loginAsAdmin();
  await auth.saveAuthState(authFile);
  
  console.log('✅ DSMD admin authentication setup complete');
});
