import { test, expect } from '../../src/fixtures/base.fixture';
import { getDefaultShipping, getProduct } from '../../src/utils/testData';

test('complete a checkout end to end @regression', async ({
  inventoryPage,
  header,
  cartPage,
  checkoutInfoPage,
  checkoutOverviewPage,
  checkoutCompletePage,
}) => {
  const backpack = getProduct('Sauce Labs Backpack');
  const bikeLight = getProduct('Sauce Labs Bike Light');
  const shipping = getDefaultShipping();

  await inventoryPage.goto();
  await inventoryPage.addToCart(backpack.name);
  await inventoryPage.addToCart(bikeLight.name);

  await header.openCart();
  await cartPage.waitForLoad();
  expect(await cartPage.itemCount()).toBe(2);

  await cartPage.proceedToCheckout();
  await checkoutInfoPage.waitForLoad();
  await checkoutInfoPage.fillAndContinue(shipping);

  await checkoutOverviewPage.waitForLoad();
  const expectedSubtotal = Number((backpack.price + bikeLight.price).toFixed(2));
  expect(await checkoutOverviewPage.subtotalAmount()).toBeCloseTo(expectedSubtotal, 2);

  await checkoutOverviewPage.finish();
  await checkoutCompletePage.waitForLoad();
  expect(await checkoutCompletePage.confirmationText()).toContain('dispatched');
});

test('checkout info form rejects missing fields @regression', async ({
  inventoryPage,
  header,
  cartPage,
  checkoutInfoPage,
}) => {
  await inventoryPage.goto();
  await inventoryPage.addToCart('Sauce Labs Onesie');

  await header.openCart();
  await cartPage.proceedToCheckout();

  await checkoutInfoPage.waitForLoad();
  await checkoutInfoPage.submitWithoutValidation();

  expect(await checkoutInfoPage.getErrorMessage()).toMatch(/first name is required/i);
});
