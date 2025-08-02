import { test, expect } from '@playwright/test';
import { ABBLoginPage } from '../pages/ABBLoginPage';
import { TEST_USERS, EXPECTED_TEXT } from '../constants';

/**
 * ABB Login Tests
 * 
 * Test suite for ABB Analytics Platform authentication
 */

test.describe('ABB Login Functionality', () => {
  let loginPage: ABBLoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new ABBLoginPage(page);
    await loginPage.goto();
  });

  test('should login successfully with analyst credentials', async () => {
    await loginPage.login(TEST_USERS.ANALYST.username, TEST_USERS.ANALYST.password);
    expect(await loginPage.isLoginSuccessful()).toBe(true);
  });

  test('should login successfully with manager credentials', async () => {
    await loginPage.login(TEST_USERS.MANAGER.username, TEST_USERS.MANAGER.password);
    expect(await loginPage.isLoginSuccessful()).toBe(true);
  });

  test('should login successfully with viewer credentials', async () => {
    await loginPage.login(TEST_USERS.VIEWER.username, TEST_USERS.VIEWER.password);
    expect(await loginPage.isLoginSuccessful()).toBe(true);
  });

  test('should reject invalid credentials', async () => {
    await loginPage.login('invalid@dispel.com', 'wrongpassword');
    expect(await loginPage.isLoginSuccessful()).toBe(false);
  });
});
