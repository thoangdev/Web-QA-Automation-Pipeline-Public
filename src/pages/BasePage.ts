import { Page, Response } from '@playwright/test';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  protected abstract readonly path: string;

  async goto(): Promise<Response | null> {
    const res = await this.page.goto(this.path);
    await this.waitForLoad();
    return res;
  }

  abstract waitForLoad(): Promise<void>;

  url(): string {
    return this.page.url();
  }
}
