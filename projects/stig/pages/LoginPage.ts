import { Page, Locator } from '@playwright/test';
import { SELECTORS, EXPECTED_TEXT, TIMEOUTS } from '../constants';

/**
 * Page Object Model for STIG Login Page
 * 
 * Encapsulates login functionality and provides a clean interface
 * for test scenarios involving authentication
 */
export class LoginPage {
  private page: Page;
  
  // Locators
  readonly loginForm: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.loginForm = page.locator(SELECTORS.LOGIN_FORM);
    this.usernameInput = page.locator(SELECTORS.USERNAME_INPUT);
    this.passwordInput = page.locator(SELECTORS.PASSWORD_INPUT);
    this.loginButton = page.locator(SELECTORS.LOGIN_BUTTON);
    this.errorMessage = page.locator(SELECTORS.LOGIN_ERROR);
  }

  /**
   * Navigate to the login page
   */
  async goto() {
    await this.page.goto('/login');
    await this.waitForLoad();
  }

  /**
   * Wait for login page to fully load
   */
  async waitForLoad() {
    await this.loginForm.waitFor({ timeout: TIMEOUTS.LOGIN });
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Perform login with credentials
   */
  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    
    // Wait for navigation or error
    await this.page.waitForLoadState('networkidle', { timeout: TIMEOUTS.LOGIN });
  }

  /**
   * Check if login was successful
   */
  async isLoginSuccessful(): Promise<boolean> {
    try {
      // Check if we're redirected to dashboard
      await this.page.waitForURL('**/dashboard', { timeout: TIMEOUTS.NAVIGATION });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string> {
    await this.errorMessage.waitFor({ timeout: 5000 });
    return await this.errorMessage.textContent() || '';
  }

  /**
   * Check if specific error is displayed
   */
  async hasInvalidCredentialsError(): Promise<boolean> {
    const errorText = await this.getErrorMessage();
    return errorText.includes(EXPECTED_TEXT.INVALID_CREDENTIALS);
  }

  /**
   * Check if login form is visible
   */
  async isVisible(): Promise<boolean> {
    return await this.loginForm.isVisible();
  }

  /**
   * Check if page title is correct
   */
  async hasCorrectTitle(): Promise<boolean> {
    const title = await this.page.title();
    return title.includes(EXPECTED_TEXT.LOGIN_PAGE_TITLE);
  }

  /**
   * Clear login form
   */
  async clearForm() {
    await this.usernameInput.clear();
    await this.passwordInput.clear();
  }

  /**
   * Check if login button is enabled
   */
  async isLoginButtonEnabled(): Promise<boolean> {
    return await this.loginButton.isEnabled();
  }

  /**
   * Check if form has validation errors
   */
  async hasValidationErrors(): Promise<boolean> {
    const usernameError = this.page.locator('[data-testid="username-error"]');
    const passwordError = this.page.locator('[data-testid="password-error"]');
    
    return (await usernameError.isVisible()) || (await passwordError.isVisible());
  }
}
