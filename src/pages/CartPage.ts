import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  protected readonly path = '/cart.html';

  private readonly title = this.page.getByTestId('title');
  private readonly items = this.page.getByTestId('inventory-item');
  private readonly itemNames = this.page.getByTestId('inventory-item-name');
  private readonly checkoutBtn = this.page.getByTestId('checkout');
  private readonly continueShoppingBtn = this.page.getByTestId('continue-shopping');

  async waitForLoad(): Promise<void> {
    await this.title.waitFor({ state: 'visible' });
  }

  itemCount(): Promise<number> {
    return this.items.count();
  }

  itemTitles(): Promise<string[]> {
    return this.itemNames.allTextContents();
  }

  async removeItem(itemName: string): Promise<void> {
    await this.items.filter({ hasText: itemName }).getByRole('button', { name: 'Remove' }).click();
  }

  async proceedToCheckout(): Promise<void> {
    await this.checkoutBtn.click();
    await this.page.waitForURL('**/checkout-step-one.html');
  }

  async continueShopping(): Promise<void> {
    await this.continueShoppingBtn.click();
    await this.page.waitForURL('**/inventory.html');
  }
}
