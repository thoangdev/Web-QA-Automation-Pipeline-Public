import { Locator, Page } from '@playwright/test';

export class Header {
  private readonly cartLink: Locator;
  private readonly cartBadge: Locator;
  private readonly menuBtn: Locator;
  private readonly logoutLink: Locator;
  private readonly resetLink: Locator;
  private readonly closeMenuBtn: Locator;

  constructor(private readonly page: Page) {
    this.cartLink = page.getByTestId('shopping-cart-link');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
    this.menuBtn = page.getByRole('button', { name: 'Open Menu' });
    this.logoutLink = page.getByTestId('logout-sidebar-link');
    this.resetLink = page.getByTestId('reset-sidebar-link');
    this.closeMenuBtn = page.getByRole('button', { name: 'Close Menu' });
  }

  async cartBadgeCount(): Promise<number> {
    if ((await this.cartBadge.count()) === 0) return 0;
    const text = await this.cartBadge.textContent();
    return Number(text ?? '0');
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
    await this.page.waitForURL('**/cart.html');
  }

  private async openMenu(): Promise<void> {
    await this.menuBtn.click();
    await this.logoutLink.waitFor({ state: 'visible' });
  }

  async logout(): Promise<void> {
    await this.openMenu();
    await this.logoutLink.click();
    await this.page.waitForURL(/\/(index\.html)?$/);
  }

  async resetAppState(): Promise<void> {
    await this.openMenu();
    await this.resetLink.click();
    await this.closeMenuBtn.click();
  }
}
