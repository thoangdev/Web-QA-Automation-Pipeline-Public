import { test, expect } from '@playwright/test';
import { DSMDLoginPage } from '../pages/DSMDLoginPage';
import { TEST_USERS } from '../constants';

/**
 * DSMD Login Tests
 * 
 * Test suite for DSMD Device Management Platform authentication
 */

test.describe('DSMD Login Functionality', () => {
  let loginPage: DSMDLoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new DSMDLoginPage(page);
    await loginPage.goto();
  });

  test('should login successfully with admin credentials', async () => {
    await loginPage.login(TEST_USERS.ADMIN.username, TEST_USERS.ADMIN.password);
    expect(await loginPage.isLoginSuccessful()).toBe(true);
  });

  test('should login successfully with operator credentials', async () => {
    await loginPage.login(TEST_USERS.OPERATOR.username, TEST_USERS.OPERATOR.password);
    expect(await loginPage.isLoginSuccessful()).toBe(true);
  });

  test('should login successfully with monitor credentials', async () => {
    await loginPage.login(TEST_USERS.MONITOR.username, TEST_USERS.MONITOR.password);
    expect(await loginPage.isLoginSuccessful()).toBe(true);
  });

  test('should reject invalid credentials', async () => {
    await loginPage.login('invalid@dispel.com', 'wrongpassword');
    expect(await loginPage.isLoginSuccessful()).toBe(false);
  });
});
