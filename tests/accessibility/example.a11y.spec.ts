import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Replace these with your app's real pages.
// axe-core runs inside the Playwright browser — no separate runner needed.

test('homepage passes WCAG 2.1 AA @a11y', async ({ page }) => {
  await page.goto('/');
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(violations).toEqual([]);
});

test('login page passes WCAG 2.1 AA @a11y', async ({ page }) => {
  await page.goto('/login');
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(violations).toEqual([]);
});
