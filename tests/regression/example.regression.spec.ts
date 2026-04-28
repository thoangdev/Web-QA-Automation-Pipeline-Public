import { test, expect } from '@playwright/test';

// Replace these with your app's full-coverage regression tests.
// These run nightly and on release branches — depth over speed.

test('homepage loads with expected title and main landmark @regression', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/.+/);
  await expect(page.getByRole('main')).toBeVisible();
});

test('login page renders form fields @regression', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(page.getByLabel('Password')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
});
