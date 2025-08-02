import { test as setup } from '@playwright/test';
import { ABBAuthFixture } from './auth';

const authFile = './projects/abb/fixtures/auth.json';

setup('authenticate as ABB analyst', async ({ page }) => {
  console.log('🔐 Setting up ABB analyst authentication...');
  
  const auth = new ABBAuthFixture(page);
  await auth.loginAsAnalyst();
  await auth.saveAuthState(authFile);
  
  console.log('✅ ABB analyst authentication setup complete');
});
