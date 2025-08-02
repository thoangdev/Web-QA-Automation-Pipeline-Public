import { Page, APIRequestContext } from '@playwright/test';
import { TEST_USERS } from '../constants';

/**
 * Authentication Fixture for ABB Project
 */
export class ABBAuthFixture {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async loginAsAnalyst() {
    return await this.login(TEST_USERS.ANALYST.username, TEST_USERS.ANALYST.password);
  }

  async loginAsManager() {
    return await this.login(TEST_USERS.MANAGER.username, TEST_USERS.MANAGER.password);
  }

  async loginAsViewer() {
    return await this.login(TEST_USERS.VIEWER.username, TEST_USERS.VIEWER.password);
  }

  private async login(username: string, password: string) {
    await this.page.goto('/login');
    await this.page.locator('[data-testid="abb-username"]').fill(username);
    await this.page.locator('[data-testid="abb-password"]').fill(password);
    await this.page.locator('[data-testid="abb-login-button"]').click();
    await this.page.waitForURL('**/dashboard');
    
    return { username, success: true };
  }

  async saveAuthState(filePath: string) {
    await this.page.context().storageState({ path: filePath });
  }
}
