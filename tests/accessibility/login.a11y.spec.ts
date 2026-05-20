import { test, expect } from '../../src/fixtures/base.fixture';
import AxeBuilder from '@axe-core/playwright';

test('login page passes WCAG 2.1 AA @a11y', async ({ freshContextPage }) => {
  await freshContextPage.goto('/');

  const results = await new AxeBuilder({ page: freshContextPage })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();

  expect.soft(formatViolations(results.violations), 'a11y violations').toEqual('');
});

test('inventory page passes WCAG 2.1 AA @a11y', async ({ page, inventoryPage }) => {
  await inventoryPage.goto();

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    // Known saucedemo bug: sort <select> has no accessible name.
    // Remove this disable when upstream fixes it, or when you adapt the template to your app.
    .disableRules(['select-name'])
    .analyze();

  expect.soft(formatViolations(results.violations), 'a11y violations').toEqual('');
});

type AxeViolation = { id: string; impact?: string | null; description: string };

function formatViolations(violations: AxeViolation[]): string {
  if (violations.length === 0) return '';
  return violations.map(v => `[${v.impact ?? 'unknown'}] ${v.id}: ${v.description}`).join('\n');
}
