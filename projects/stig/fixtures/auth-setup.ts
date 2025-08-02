import { test as setup, expect } from '@playwright/test';
import { AuthFixture } from './auth';
import { TEST_USERS } from '../constants';

/**
 * Authentication Setup for STIG Project
 * 
 * This file runs before STIG tests to establish authentication state
 */

const authFile = './projects/stig/fixtures/auth.json';

setup('authenticate as admin user', async ({ page }) => {
  console.log('🔐 Setting up STIG admin authentication...');
  
  const auth = new AuthFixture(page);
  
  try {
    // Perform login
    await auth.loginAsAdmin();
    
    // Verify successful login
    const isAuthenticated = await auth.isAuthenticated();
    expect(isAuthenticated).toBe(true);
    
    // Verify admin role
    const hasAdminRole = await auth.verifyUserRole('administrator');
    expect(hasAdminRole).toBe(true);
    
    // Save authentication state
    await auth.saveAuthState(authFile);
    
    console.log('✅ STIG admin authentication setup complete');
    
  } catch (error) {
    console.error('❌ STIG admin authentication setup failed:', error);
    throw error;
  }
});

setup('verify environment connectivity', async ({ page, request }) => {
  console.log('🔗 Verifying STIG environment connectivity...');
  
  try {
    // Test base URL accessibility
    const response = await page.goto('/');
    expect(response?.status()).toBeLessThan(400);
    
    // Test API connectivity
    const apiResponse = await request.get('/api/health');
    expect(apiResponse.status()).toBeLessThan(400);
    
    // Verify login page is accessible
    await page.goto('/login');
    const loginForm = page.locator('[data-testid="login-form"]');
    await expect(loginForm).toBeVisible();
    
    console.log('✅ STIG environment connectivity verified');
    
  } catch (error) {
    console.error('❌ STIG environment connectivity check failed:', error);
    throw error;
  }
});

setup('prepare test data', async ({ page }) => {
  console.log('📋 Preparing STIG test data...');
  
  try {
    // Login as admin to prepare test data
    const auth = new AuthFixture(page);
    await auth.loginAsAdmin();
    
    // Navigate to user management
    await page.goto('/admin/users');
    
    // Check if test users exist, create if necessary
    const testUsers = [TEST_USERS.STANDARD, TEST_USERS.AUDITOR];
    
    for (const user of testUsers) {
      const userExists = await page.locator(`[data-testid="user-row"][data-username="${user.username}"]`).isVisible();
      
      if (!userExists) {
        console.log(`Creating test user: ${user.username}`);
        
        // Click add user button
        await page.locator('[data-testid="add-user-button"]').click();
        
        // Fill user form
        await page.locator('[data-testid="user-email"]').fill(user.username);
        await page.locator('[data-testid="user-role"]').selectOption(user.role);
        await page.locator('[data-testid="user-password"]').fill(user.password);
        
        // Submit form
        await page.locator('[data-testid="save-user-button"]').click();
        
        // Wait for success message
        await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      }
    }
    
    console.log('✅ STIG test data preparation complete');
    
  } catch (error) {
    console.warn('⚠️  STIG test data preparation failed, continuing with existing data:', error);
    // Don't fail setup if test data creation fails
  }
});
