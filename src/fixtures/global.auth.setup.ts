import { test as setup } from '@playwright/test';

if (process.env.PW_CHROMIUM_CHANNEL) {
  setup.use({ channel: process.env.PW_CHROMIUM_CHANNEL });
}

import * as fs from 'fs';
import * as path from 'path';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { getUser } from '../utils/testData';

const AUTH_FILE = path.join(process.cwd(), '.auth', 'user.json');

setup('authenticate as standard user', async ({ page }) => {
  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });

  const user = getUser('standard');
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.loginAndWaitForInventory(user.username, user.password);

  const inventory = new InventoryPage(page);
  await inventory.waitForLoad();

  await page.context().storageState({ path: AUTH_FILE });
});
