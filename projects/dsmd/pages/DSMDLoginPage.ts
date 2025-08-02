import { Page, Locator } from '@playwright/test';
import { SELECTORS, TIMEOUTS } from '../constants';

/**
 * Page Object Model for DSMD Login Page
 */
export class DSMDLoginPage {
  private page: Page;
  
  readonly loginForm: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.loginForm = page.locator(SELECTORS.LOGIN_FORM);
    this.usernameInput = page.locator(SELECTORS.USERNAME_INPUT);
    this.passwordInput = page.locator(SELECTORS.PASSWORD_INPUT);
    this.loginButton = page.locator(SELECTORS.LOGIN_BUTTON);
  }

  async goto() {
    await this.page.goto('/login');
    await this.waitForLoad();
  }

  async waitForLoad() {
    await this.loginForm.waitFor({ timeout: TIMEOUTS.STATUS_UPDATE });
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async isLoginSuccessful(): Promise<boolean> {
    try {
      await this.page.waitForURL('**/dashboard', { timeout: TIMEOUTS.STATUS_UPDATE });
      return true;
    } catch {
      return false;
    }
  }
}
