import { Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export class InventoryPage extends BasePage {
  protected readonly path = '/inventory.html';

  private readonly title = this.page.getByTestId('title');
  private readonly sortSelect = this.page.getByTestId('product-sort-container');
  private readonly inventoryList = this.page.getByTestId('inventory-list');
  private readonly inventoryItems = this.page.getByTestId('inventory-item');

  async waitForLoad(): Promise<void> {
    await this.title.waitFor({ state: 'visible' });
  }

  itemCount(): Promise<number> {
    return this.inventoryItems.count();
  }

  itemNames(): Promise<string[]> {
    return this.page.getByTestId('inventory-item-name').allTextContents();
  }

  async itemPrices(): Promise<number[]> {
    const raw = await this.page.getByTestId('inventory-item-price').allTextContents();
    return raw.map(p => Number(p.replace('$', '')));
  }

  private itemCard(name: string): Locator {
    return this.inventoryItems.filter({ hasText: name });
  }

  async addToCart(itemName: string): Promise<void> {
    const card = this.itemCard(itemName);
    await card.getByRole('button', { name: 'Add to cart' }).click();
  }

  async removeFromCart(itemName: string): Promise<void> {
    const card = this.itemCard(itemName);
    await card.getByRole('button', { name: 'Remove' }).click();
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortSelect.selectOption(option);
  }

  async openItem(itemName: string): Promise<void> {
    await this.itemCard(itemName).getByTestId(/^item-\d+-title-link$/).click();
  }
}
