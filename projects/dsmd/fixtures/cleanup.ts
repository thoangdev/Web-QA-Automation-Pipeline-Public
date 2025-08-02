import { test as cleanup } from '@playwright/test';

cleanup('cleanup DSMD test data', async ({ page }) => {
  console.log('🧹 Cleaning up DSMD test data...');
  
  try {
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.context().clearCookies();
    
    console.log('✅ DSMD test data cleanup complete');
  } catch (error) {
    console.warn('⚠️  DSMD cleanup failed:', error);
  }
});
