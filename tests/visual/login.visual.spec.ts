import { test, expect } from '../../src/fixtures/base.fixture';

test('login page visual baseline @visual', async ({ freshContextPage }) => {
  await freshContextPage.goto('/');
  await expect(freshContextPage).toHaveScreenshot('login.png', { maxDiffPixels: 100 });
});

test('inventory page visual baseline @visual', async ({ page, inventoryPage }) => {
  await inventoryPage.goto();
  await expect(page).toHaveScreenshot('inventory.png', {
    maxDiffPixels: 150,
    mask: [page.getByTestId('shopping-cart-badge')],
  });
});
