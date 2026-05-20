import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  protected readonly path = '/';

  private readonly username = this.page.getByTestId('username');
  private readonly password = this.page.getByTestId('password');
  private readonly submit = this.page.getByTestId('login-button');
  private readonly error = this.page.getByTestId('error');
  private readonly logo = this.page.locator('.login_logo');

  async waitForLoad(): Promise<void> {
    await this.logo.waitFor({ state: 'visible' });
  }

  async login(username: string, password: string): Promise<void> {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.submit.click();
  }

  async loginAndWaitForInventory(username: string, password: string): Promise<void> {
    await this.login(username, password);
    await this.page.waitForURL('**/inventory.html');
  }

  async getErrorMessage(): Promise<string> {
    return (await this.error.textContent()) ?? '';
  }
}
