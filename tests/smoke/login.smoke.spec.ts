import { test, expect } from '../../src/fixtures/base.fixture';
import { LoginPage } from '../../src/pages/LoginPage';
import { InventoryPage } from '../../src/pages/InventoryPage';
import { getUser } from '../../src/utils/testData';

test.describe('Login @smoke', () => {
  test('standard user can log in and reach the inventory @smoke', async ({ freshContextPage }) => {
    const user = getUser('standard');
    const loginPage = new LoginPage(freshContextPage);
    const inventoryPage = new InventoryPage(freshContextPage);

    await loginPage.goto();
    await loginPage.loginAndWaitForInventory(user.username, user.password);
    await inventoryPage.waitForLoad();

    expect(await inventoryPage.itemCount()).toBeGreaterThan(0);
  });

  test('locked-out user sees the locked error @smoke', async ({ freshContextPage }) => {
    const user = getUser('lockedOut');
    const loginPage = new LoginPage(freshContextPage);

    await loginPage.goto();
    await loginPage.login(user.username, user.password);

    expect(await loginPage.getErrorMessage()).toContain('locked out');
  });
});
