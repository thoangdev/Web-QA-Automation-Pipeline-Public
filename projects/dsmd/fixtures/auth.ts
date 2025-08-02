import { Page } from '@playwright/test';
import { TEST_USERS } from '../constants';

/**
 * Authentication Fixture for DSMD Project
 */
export class DSMDAuthFixture {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async loginAsAdmin() {
    return await this.login(TEST_USERS.ADMIN.username, TEST_USERS.ADMIN.password);
  }

  async loginAsOperator() {
    return await this.login(TEST_USERS.OPERATOR.username, TEST_USERS.OPERATOR.password);
  }

  async loginAsMonitor() {
    return await this.login(TEST_USERS.MONITOR.username, TEST_USERS.MONITOR.password);
  }

  private async login(username: string, password: string) {
    await this.page.goto('/login');
    await this.page.locator('[data-testid="dsmd-username"]').fill(username);
    await this.page.locator('[data-testid="dsmd-password"]').fill(password);
    await this.page.locator('[data-testid="dsmd-login-button"]').click();
    await this.page.waitForURL('**/dashboard');
    
    return { username, success: true };
  }

  async saveAuthState(filePath: string) {
    await this.page.context().storageState({ path: filePath });
  }
}
