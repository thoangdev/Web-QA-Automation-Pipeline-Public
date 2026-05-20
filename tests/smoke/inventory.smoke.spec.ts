import { test, expect } from '../../src/fixtures/base.fixture';

test('add a product to the cart @smoke', async ({ inventoryPage, header }) => {
  await inventoryPage.goto();
  await inventoryPage.addToCart('Sauce Labs Backpack');

  expect(await header.cartBadgeCount()).toBe(1);
});
