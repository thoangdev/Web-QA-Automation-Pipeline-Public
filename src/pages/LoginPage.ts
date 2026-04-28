import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  private email    = this.page.getByLabel('Email');
  private password = this.page.getByLabel('Password');
  private submit   = this.page.getByRole('button', { name: 'Sign in' });

  async login(email: string, password: string) {
    await this.goto('/login');
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submit.click();
    await this.page.waitForURL('**/dashboard**');
  }
}
