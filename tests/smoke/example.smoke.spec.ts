import { test, expect } from '@playwright/test';

// Starter smoke tests — verify your BASE_URL is reachable and returns a page.
// Replace these with your app's actual critical-path tests.
// See GETTING_STARTED.md#4 for guidance on writing your first real test.

test('app is reachable @smoke', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.status()).toBeLessThan(400);
});

test('page has a title @smoke', async ({ page }) => {
  await page.goto('/');
  await expect(page).not.toHaveTitle('');
});
