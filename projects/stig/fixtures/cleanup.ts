import { test as cleanup } from '@playwright/test';

/**
 * Cleanup Tasks for STIG Project
 * 
 * This file runs after STIG tests to clean up test data and resources
 */

cleanup('cleanup test data', async ({ page }) => {
  console.log('🧹 Cleaning up STIG test data...');
  
  try {
    // Login as admin to perform cleanup
    await page.goto('/login');
    await page.locator('[data-testid="username-input"]').fill(process.env.STIG_ADMIN_USERNAME || 'stig.admin@dispel.com');
    await page.locator('[data-testid="password-input"]').fill(process.env.STIG_ADMIN_PASSWORD || 'SecurePass123!');
    await page.locator('[data-testid="login-button"]').click();
    
    await page.waitForURL('**/dashboard');
    
    // Navigate to user management
    await page.goto('/admin/users');
    
    // Remove test users created during test run
    const testUserSelector = '[data-testid="user-row"][data-username*="test.user"]';
    const testUsers = page.locator(testUserSelector);
    
    const count = await testUsers.count();
    for (let i = 0; i < count; i++) {
      const deleteButton = testUsers.nth(i).locator('[data-testid="delete-user-button"]');
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        
        // Confirm deletion
        await page.locator('[data-testid="confirm-delete"]').click();
        await page.locator('[data-testid="success-message"]').waitFor();
      }
    }
    
    // Clear any temporary scan data
    await page.goto('/compliance');
    const tempScans = page.locator('[data-testid="scan-row"][data-temporary="true"]');
    const scanCount = await tempScans.count();
    
    for (let i = 0; i < scanCount; i++) {
      const deleteButton = tempScans.nth(i).locator('[data-testid="delete-scan-button"]');
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        await page.locator('[data-testid="confirm-delete"]').click();
      }
    }
    
    console.log('✅ STIG test data cleanup complete');
    
  } catch (error) {
    console.warn('⚠️  STIG cleanup failed, some test data may remain:', error);
    // Don't fail cleanup if it encounters errors
  }
});

cleanup('clear browser data', async ({ page }) => {
  console.log('🗑️  Clearing STIG browser data...');
  
  try {
    // Clear all storage
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Clear cookies
    await page.context().clearCookies();
    
    // Clear any cached data
    await page.context().clearPermissions();
    
    console.log('✅ STIG browser data cleared');
    
  } catch (error) {
    console.warn('⚠️  Browser data cleanup failed:', error);
  }
});
