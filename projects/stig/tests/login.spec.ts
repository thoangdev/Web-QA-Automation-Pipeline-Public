import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { TEST_USERS, EXPECTED_TEXT } from '../constants';

/**
 * STIG Login Tests
 * 
 * Test suite covering authentication functionality for the STIG application
 * Includes positive and negative test scenarios
 */

test.describe('STIG Login Functionality', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    
    // Navigate to login page before each test
    await loginPage.goto();
  });

  test('should display login page correctly', async () => {
    // Verify login page loads with correct elements
    await expect(loginPage.loginForm).toBeVisible();
    expect(await loginPage.hasCorrectTitle()).toBe(true);
    expect(await loginPage.isLoginButtonEnabled()).toBe(true);
  });

  test('should login successfully with admin credentials', async () => {
    // Test successful admin login
    await loginPage.login(TEST_USERS.ADMIN.username, TEST_USERS.ADMIN.password);
    
    // Verify successful login
    expect(await loginPage.isLoginSuccessful()).toBe(true);
    
    // Verify dashboard loads
    expect(await dashboardPage.isLoaded()).toBe(true);
    expect(await dashboardPage.hasCorrectTitle()).toBe(true);
    
    // Verify admin access
    expect(await dashboardPage.hasAdminAccess()).toBe(true);
  });

  test('should login successfully with standard user credentials', async () => {
    // Test successful standard user login
    await loginPage.login(TEST_USERS.STANDARD.username, TEST_USERS.STANDARD.password);
    
    // Verify successful login
    expect(await loginPage.isLoginSuccessful()).toBe(true);
    
    // Verify dashboard loads
    expect(await dashboardPage.isLoaded()).toBe(true);
    
    // Verify standard user access (no admin features)
    expect(await dashboardPage.hasAdminAccess()).toBe(false);
  });

  test('should login successfully with auditor credentials', async () => {
    // Test successful auditor login
    await loginPage.login(TEST_USERS.AUDITOR.username, TEST_USERS.AUDITOR.password);
    
    // Verify successful login
    expect(await loginPage.isLoginSuccessful()).toBe(true);
    expect(await dashboardPage.isLoaded()).toBe(true);
  });

  test('should reject invalid credentials', async () => {
    // Test login with invalid credentials
    await loginPage.login('invalid@email.com', 'wrongpassword');
    
    // Verify login fails
    expect(await loginPage.isLoginSuccessful()).toBe(false);
    
    // Verify error message is displayed
    expect(await loginPage.hasInvalidCredentialsError()).toBe(true);
  });

  test('should reject empty credentials', async () => {
    // Test login with empty fields
    await loginPage.login('', '');
    
    // Verify validation errors appear
    expect(await loginPage.hasValidationErrors()).toBe(true);
    
    // Verify still on login page
    expect(await loginPage.isVisible()).toBe(true);
  });

  test('should reject login with empty username', async () => {
    // Test login with only password
    await loginPage.login('', 'somepassword');
    
    // Verify validation error for username
    expect(await loginPage.hasValidationErrors()).toBe(true);
  });

  test('should reject login with empty password', async () => {
    // Test login with only username
    await loginPage.login('user@example.com', '');
    
    // Verify validation error for password
    expect(await loginPage.hasValidationErrors()).toBe(true);
  });

  test('should handle multiple failed login attempts', async () => {
    // Attempt multiple failed logins
    for (let i = 0; i < 3; i++) {
      await loginPage.clearForm();
      await loginPage.login('hacker@evil.com', 'bruteforce');
      expect(await loginPage.hasInvalidCredentialsError()).toBe(true);
    }
    
    // Verify account lockout or rate limiting (if implemented)
    // This would depend on your specific security implementation
  });

  test('should logout successfully', async () => {
    // First login
    await loginPage.login(TEST_USERS.ADMIN.username, TEST_USERS.ADMIN.password);
    expect(await dashboardPage.isLoaded()).toBe(true);
    
    // Then logout
    await dashboardPage.logout();
    
    // Verify redirected to login page
    expect(await loginPage.isVisible()).toBe(true);
  });

  test('should redirect to intended page after login', async () => {
    // Try to access protected page directly
    await loginPage.page.goto('/admin/users');
    
    // Should be redirected to login
    await loginPage.waitForLoad();
    expect(await loginPage.isVisible()).toBe(true);
    
    // Login with admin credentials
    await loginPage.login(TEST_USERS.ADMIN.username, TEST_USERS.ADMIN.password);
    
    // Should be redirected to the originally requested page
    await loginPage.page.waitForURL('**/admin/users');
    expect(loginPage.page.url()).toContain('/admin/users');
  });

  test('should maintain session across page refreshes', async () => {
    // Login successfully
    await loginPage.login(TEST_USERS.ADMIN.username, TEST_USERS.ADMIN.password);
    expect(await dashboardPage.isLoaded()).toBe(true);
    
    // Refresh the page
    await dashboardPage.page.reload();
    
    // Should still be authenticated
    expect(await dashboardPage.isLoaded()).toBe(true);
  });

  test('should handle concurrent sessions appropriately', async ({ context }) => {
    // This test would check session management for multiple browser contexts
    // Implementation depends on your session handling strategy
    
    const page2 = await context.newPage();
    const loginPage2 = new LoginPage(page2);
    
    // Login in first session
    await loginPage.login(TEST_USERS.ADMIN.username, TEST_USERS.ADMIN.password);
    
    // Try to login in second session with same user
    await loginPage2.goto();
    await loginPage2.login(TEST_USERS.ADMIN.username, TEST_USERS.ADMIN.password);
    
    // Verify behavior according to your session policy
    // (could allow multiple sessions, invalidate previous, etc.)
    
    await page2.close();
  });
});
