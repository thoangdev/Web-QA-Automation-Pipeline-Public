import { test, expect } from '../../src/fixtures/base.fixture';

test.describe('Inventory sorting @regression', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('sorts products by price low to high @regression', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('lohi');
    const prices = await inventoryPage.itemPrices();
    const sorted = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sorted);
  });

  test('sorts products by price high to low @regression', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('hilo');
    const prices = await inventoryPage.itemPrices();
    const sorted = [...prices].sort((a, b) => b - a);
    expect(prices).toEqual(sorted);
  });

  test('sorts products by name Z to A @regression', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('za');
    const names = await inventoryPage.itemNames();
    const sorted = [...names].sort().reverse();
    expect(names).toEqual(sorted);
  });
});
