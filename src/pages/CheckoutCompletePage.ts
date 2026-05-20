import { BasePage } from './BasePage';

export class CheckoutCompletePage extends BasePage {
  protected readonly path = '/checkout-complete.html';

  private readonly header = this.page.getByTestId('complete-header');
  private readonly text = this.page.getByTestId('complete-text');
  private readonly backHomeBtn = this.page.getByTestId('back-to-products');

  async waitForLoad(): Promise<void> {
    await this.header.waitFor({ state: 'visible' });
  }

  confirmationText(): Promise<string> {
    return this.text.innerText();
  }

  async backToProducts(): Promise<void> {
    await this.backHomeBtn.click();
    await this.page.waitForURL('**/inventory.html');
  }
}
