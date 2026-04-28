import { test as base, Page } from '@playwright/test';

type AppFixtures = {
  authedPage: Page;
};

export const test = base.extend<AppFixtures>({
  authedPage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: '.auth/user.json' });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

export { expect } from '@playwright/test';
