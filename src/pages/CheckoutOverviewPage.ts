import { BasePage } from './BasePage';

export class CheckoutOverviewPage extends BasePage {
  protected readonly path = '/checkout-step-two.html';

  private readonly title = this.page.getByTestId('title');
  private readonly items = this.page.getByTestId('inventory-item');
  private readonly subtotal = this.page.getByTestId('subtotal-label');
  private readonly total = this.page.getByTestId('total-label');
  private readonly finishBtn = this.page.getByTestId('finish');

  async waitForLoad(): Promise<void> {
    await this.title.waitFor({ state: 'visible' });
  }

  itemCount(): Promise<number> {
    return this.items.count();
  }

  async subtotalAmount(): Promise<number> {
    const text = (await this.subtotal.textContent()) ?? '';
    return Number(text.replace(/[^0-9.]/g, ''));
  }

  async totalAmount(): Promise<number> {
    const text = (await this.total.textContent()) ?? '';
    return Number(text.replace(/[^0-9.]/g, ''));
  }

  async finish(): Promise<void> {
    await this.finishBtn.click();
    await this.page.waitForURL('**/checkout-complete.html');
  }
}
