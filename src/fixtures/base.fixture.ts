import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

type AppFixtures = {
  loginPage: LoginPage;
  authedPage: Page;
};

export const test = base.extend<AppFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  authedPage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: '.auth/user.json' });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

export { expect } from '@playwright/test';
