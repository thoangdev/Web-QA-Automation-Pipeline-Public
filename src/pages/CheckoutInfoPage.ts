import { BasePage } from './BasePage';

export interface ShippingInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export class CheckoutInfoPage extends BasePage {
  protected readonly path = '/checkout-step-one.html';

  private readonly title = this.page.getByTestId('title');
  private readonly firstName = this.page.getByTestId('firstName');
  private readonly lastName = this.page.getByTestId('lastName');
  private readonly postalCode = this.page.getByTestId('postalCode');
  private readonly continueBtn = this.page.getByTestId('continue');
  private readonly cancelBtn = this.page.getByTestId('cancel');
  private readonly error = this.page.getByTestId('error');

  async waitForLoad(): Promise<void> {
    await this.title.waitFor({ state: 'visible' });
  }

  async fillAndContinue(info: ShippingInfo): Promise<void> {
    await this.firstName.fill(info.firstName);
    await this.lastName.fill(info.lastName);
    await this.postalCode.fill(info.postalCode);
    await this.continueBtn.click();
    await this.page.waitForURL('**/checkout-step-two.html');
  }

  async submitWithoutValidation(): Promise<void> {
    await this.continueBtn.click();
  }

  async getErrorMessage(): Promise<string> {
    return (await this.error.textContent()) ?? '';
  }
}
