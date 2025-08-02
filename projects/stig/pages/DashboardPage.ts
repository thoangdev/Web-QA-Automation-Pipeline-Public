import { Page, Locator } from '@playwright/test';
import { SELECTORS, EXPECTED_TEXT, TIMEOUTS } from '../constants';

/**
 * Page Object Model for STIG Dashboard Page
 * 
 * Handles dashboard navigation, widgets, and overview information
 */
export class DashboardPage {
  private page: Page;
  
  // Locators
  readonly header: Locator;
  readonly navMenu: Locator;
  readonly userDropdown: Locator;
  readonly logoutButton: Locator;
  readonly complianceSummary: Locator;
  readonly recentScans: Locator;
  readonly alertsPanel: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = page.locator(SELECTORS.DASHBOARD_HEADER);
    this.navMenu = page.locator(SELECTORS.NAV_MENU);
    this.userDropdown = page.locator(SELECTORS.USER_DROPDOWN);
    this.logoutButton = page.locator(SELECTORS.LOGOUT_BUTTON);
    this.complianceSummary = page.locator(SELECTORS.COMPLIANCE_SUMMARY);
    this.recentScans = page.locator(SELECTORS.RECENT_SCANS);
    this.alertsPanel = page.locator(SELECTORS.ALERTS_PANEL);
  }

  /**
   * Navigate to dashboard
   */
  async goto() {
    await this.page.goto('/dashboard');
    await this.waitForLoad();
  }

  /**
   * Wait for dashboard to fully load
   */
  async waitForLoad() {
    await this.header.waitFor({ timeout: TIMEOUTS.NAVIGATION });
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Check if dashboard is loaded correctly
   */
  async isLoaded(): Promise<boolean> {
    return await this.header.isVisible();
  }

  /**
   * Get dashboard title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Check if correct dashboard title is displayed
   */
  async hasCorrectTitle(): Promise<boolean> {
    const title = await this.getTitle();
    return title.includes(EXPECTED_TEXT.DASHBOARD_TITLE);
  }

  /**
   * Navigate to specific section
   */
  async navigateTo(section: 'users' | 'compliance' | 'reports' | 'settings') {
    const selector = `[data-testid="nav-${section}"]`;
    await this.page.locator(selector).click();
    await this.page.waitForLoadState('networkidle', { timeout: TIMEOUTS.NAVIGATION });
  }

  /**
   * Get compliance summary data
   */
  async getComplianceSummary() {
    await this.complianceSummary.waitFor();
    
    const compliantCount = await this.page.locator('[data-testid="compliant-count"]').textContent();
    const nonCompliantCount = await this.page.locator('[data-testid="non-compliant-count"]').textContent();
    const totalSystems = await this.page.locator('[data-testid="total-systems"]').textContent();
    
    return {
      compliant: parseInt(compliantCount || '0'),
      nonCompliant: parseInt(nonCompliantCount || '0'),
      total: parseInt(totalSystems || '0')
    };
  }

  /**
   * Get recent scans list
   */
  async getRecentScans() {
    await this.recentScans.waitFor();
    
    const scanRows = this.page.locator('[data-testid="scan-row"]');
    const count = await scanRows.count();
    const scans = [];
    
    for (let i = 0; i < count; i++) {
      const row = scanRows.nth(i);
      const name = await row.locator('[data-testid="scan-name"]').textContent();
      const date = await row.locator('[data-testid="scan-date"]').textContent();
      const status = await row.locator('[data-testid="scan-status"]').textContent();
      
      scans.push({
        name: name || '',
        date: date || '',
        status: status || ''
      });
    }
    
    return scans;
  }

  /**
   * Get alerts count
   */
  async getAlertsCount(): Promise<number> {
    await this.alertsPanel.waitFor();
    const alertCountElement = this.page.locator('[data-testid="alerts-count"]');
    const countText = await alertCountElement.textContent();
    return parseInt(countText || '0');
  }

  /**
   * Check if welcome message is displayed
   */
  async hasWelcomeMessage(): Promise<boolean> {
    const welcomeMessage = this.page.locator('[data-testid="welcome-message"]');
    const text = await welcomeMessage.textContent();
    return text?.includes(EXPECTED_TEXT.SUCCESSFUL_LOGIN) || false;
  }

  /**
   * Logout from the application
   */
  async logout() {
    await this.userDropdown.click();
    await this.logoutButton.click();
    await this.page.waitForURL('**/login', { timeout: TIMEOUTS.NAVIGATION });
  }

  /**
   * Check if user has admin privileges
   */
  async hasAdminAccess(): Promise<boolean> {
    const adminMenu = this.page.locator('[data-testid="admin-menu"]');
    return await adminMenu.isVisible();
  }

  /**
   * Refresh dashboard data
   */
  async refresh() {
    const refreshButton = this.page.locator('[data-testid="refresh-button"]');
    await refreshButton.click();
    await this.page.waitForLoadState('networkidle');
  }
}
