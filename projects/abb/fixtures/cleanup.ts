import { test as cleanup } from '@playwright/test';

cleanup('cleanup ABB test data', async ({ page }) => {
  console.log('🧹 Cleaning up ABB test data...');
  
  try {
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.context().clearCookies();
    
    console.log('✅ ABB test data cleanup complete');
  } catch (error) {
    console.warn('⚠️  ABB cleanup failed:', error);
  }
});
