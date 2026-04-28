import { test, expect } from '@playwright/test';

// Replace these with your app's real pages.
// Baselines are committed under tests/visual/__snapshots__/.
// To regenerate: npx playwright test --update-snapshots tests/visual/

test('homepage visual baseline @visual', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('homepage.png', { maxDiffPixels: 100 });
});

test('login page visual baseline @visual', async ({ page }) => {
  await page.goto('/login');
  await expect(page).toHaveScreenshot('login.png', { maxDiffPixels: 100 });
});
