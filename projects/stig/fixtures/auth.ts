import { Page, APIRequestContext } from '@playwright/test';
import { TEST_USERS, API_ENDPOINTS } from '../constants';

/**
 * Authentication Fixture for STIG Project
 * 
 * Handles login state management and API authentication
 */
export class AuthFixture {
  private page: Page;
  private apiContext?: APIRequestContext;

  constructor(page: Page, apiContext?: APIRequestContext) {
    this.page = page;
    this.apiContext = apiContext;
  }

  /**
   * Login with admin credentials
   */
  async loginAsAdmin() {
    return await this.login(TEST_USERS.ADMIN.username, TEST_USERS.ADMIN.password);
  }

  /**
   * Login with standard user credentials
   */
  async loginAsUser() {
    return await this.login(TEST_USERS.STANDARD.username, TEST_USERS.STANDARD.password);
  }

  /**
   * Login with auditor credentials
   */
  async loginAsAuditor() {
    return await this.login(TEST_USERS.AUDITOR.username, TEST_USERS.AUDITOR.password);
  }

  /**
   * Generic login method
   */
  async login(username: string, password: string) {
    // Navigate to login page
    await this.page.goto('/login');
    
    // Fill credentials
    await this.page.locator('[data-testid="username-input"]').fill(username);
    await this.page.locator('[data-testid="password-input"]').fill(password);
    
    // Submit form
    await this.page.locator('[data-testid="login-button"]').click();
    
    // Wait for navigation to dashboard
    await this.page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Verify login success
    const welcomeMessage = this.page.locator('[data-testid="welcome-message"]');
    await welcomeMessage.waitFor({ timeout: 5000 });
    
    return {
      username,
      success: true,
      redirectUrl: this.page.url()
    };
  }

  /**
   * Login via API for faster test setup
   */
  async loginViaAPI(username: string, password: string) {
    if (!this.apiContext) {
      throw new Error('API context not available for API login');
    }

    const response = await this.apiContext.post(API_ENDPOINTS.LOGIN, {
      data: {
        username,
        password
      }
    });

    if (!response.ok()) {
      throw new Error(`API login failed: ${response.status()}`);
    }

    const data = await response.json();
    
    // Store authentication tokens in browser context
    await this.page.context().addCookies([
      {
        name: 'auth_token',
        value: data.token,
        domain: new URL(this.page.url()).hostname,
        path: '/'
      }
    ]);

    return {
      token: data.token,
      user: data.user,
      success: true
    };
  }

  /**
   * Logout and clear session
   */
  async logout() {
    // Clear browser storage
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Clear cookies
    await this.page.context().clearCookies();

    // Navigate to login page
    await this.page.goto('/login');
  }

  /**
   * Check if user is currently authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      // Check for auth token in storage
      const token = await this.page.evaluate(() => localStorage.getItem('auth_token'));
      return !!token;
    } catch {
      return false;
    }
  }

  /**
   * Get current user information
   */
  async getCurrentUser() {
    const userInfo = await this.page.evaluate(() => {
      const userData = localStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    });

    return userInfo;
  }

  /**
   * Save authentication state to file
   */
  async saveAuthState(filePath: string) {
    await this.page.context().storageState({ path: filePath });
  }

  /**
   * Load authentication state from file
   */
  async loadAuthState(filePath: string) {
    // This would be used in test setup to restore saved auth state
    // The actual loading happens in the browser context creation
    console.log(`Loading auth state from: ${filePath}`);
  }

  /**
   * Verify user has required role/permissions
   */
  async verifyUserRole(expectedRole: string): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.role === expectedRole;
  }

  /**
   * Setup session for testing (includes CSRF tokens, etc.)
   */
  async setupSession() {
    // Get CSRF token if needed
    const csrfToken = await this.page.locator('meta[name="csrf-token"]').getAttribute('content');
    
    if (csrfToken) {
      // Store CSRF token for API requests
      await this.page.evaluate((token) => {
        sessionStorage.setItem('csrf_token', token);
      }, csrfToken);
    }

    // Set any required headers for API requests
    if (this.apiContext) {
      await this.apiContext.dispose();
    }
  }
}
