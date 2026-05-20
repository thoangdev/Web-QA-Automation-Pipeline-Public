import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutInfoPage } from '../pages/CheckoutInfoPage';
import { CheckoutOverviewPage } from '../pages/CheckoutOverviewPage';
import { CheckoutCompletePage } from '../pages/CheckoutCompletePage';
import { Header } from '../components/Header';

type AppFixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutInfoPage: CheckoutInfoPage;
  checkoutOverviewPage: CheckoutOverviewPage;
  checkoutCompletePage: CheckoutCompletePage;
  header: Header;
  freshContextPage: Page;
};

export const test = base.extend<AppFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutInfoPage: async ({ page }, use) => {
    await use(new CheckoutInfoPage(page));
  },
  checkoutOverviewPage: async ({ page }, use) => {
    await use(new CheckoutOverviewPage(page));
  },
  checkoutCompletePage: async ({ page }, use) => {
    await use(new CheckoutCompletePage(page));
  },
  header: async ({ page }, use) => {
    await use(new Header(page));
  },

  // Authenticated page that resets saucedemo app state after the test runs
  // so cart/sort state doesn't leak between tests sharing the same storage state.
  page: async ({ page }, use) => {
    await use(page);
    try {
      if (page.url().startsWith('http')) {
        await page.goto('/inventory.html', { waitUntil: 'domcontentloaded' });
        const header = new Header(page);
        await header.resetAppState().catch(() => undefined);
      }
    } catch {
      // Swallow teardown errors — test result already captured.
    }
  },

  // Fresh, unauthenticated browser context (e.g. for testing the login flow itself).
  freshContextPage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

export { expect } from '@playwright/test';
