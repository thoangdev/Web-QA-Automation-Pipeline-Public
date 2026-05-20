# Skill: Write Test

## Purpose

Produce a complete, runnable Playwright test file that matches this project's conventions exactly.

---

## When to Use

- A new feature or user story needs automated test coverage
- An existing test needs to be rewritten to match project conventions
- A test type needs to be added for a page that already has a page object

---

## Input

| Field                | Required | Description                              |
| -------------------- | -------- | ---------------------------------------- |
| Feature or behavior  | Yes      | What the test should verify              |
| Test type            | Yes      | smoke / regression / api / a11y / visual |
| Target page or URL   | Yes      | Where the interaction happens            |
| Auth required        | Yes      | Whether the test needs a logged-in user  |
| Existing page object | No       | Path to the POM class if one exists      |

---

## Output

A complete `.spec.ts` file in the correct `tests/` subfolder containing:

- Correct import (`@playwright/test` or `src/fixtures/base.fixture.ts`)
- Semantic locators (no CSS, no XPath)
- The correct tag embedded in the test title
- Arrange → Act → Assert structure
- No `waitForTimeout` calls

---

## Process

1. Identify the test type and determine the output folder and file suffix
2. Check `src/pages/` — is there a page object for the target page?
   - Yes → import and use it
   - No → create it first using `create-page-object` skill
3. Determine if auth is needed:
   - Yes → `import { test, expect } from '../../src/fixtures/base.fixture'`
   - No → `import { test, expect } from '@playwright/test'`
4. Write the test body in Arrange → Act → Assert order
5. Add the tag to the test title string
6. Verify all import paths resolve from the file's actual location
7. Check the quality checklist before outputting

---

## Type-specific Rules

### `@smoke`

- Under 30 seconds per test
- Happy path only — no error states
- Must be the absolute minimum to verify the feature works

### `@regression`

- Covers happy path + key error states + edge cases
- Can be slower — runs nightly, not on every push

### `@api`

- Use Playwright's `request` fixture — no Axios, no node-fetch
- Each test is self-contained: create data → assert → clean up
- Test the contract (status code, schema shape) — not business logic already unit-tested

### `@a11y`

- Always call `.withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])`
- Use `.exclude()` for third-party embeds you do not own
- Make violations readable with a format helper

### `@visual`

- Always `--project=chromium` only
- Always mask dynamic content: avatars, timestamps, ads
- Keep `maxDiffPixels` between 50 and 150

---

## Constraints

- No `waitForTimeout` under any circumstances
- No CSS class selectors or XPath
- No credentials in code — read from `process.env.*`
- Import paths must be relative and correct from the file's location

---

## Example

```typescript
// tests/smoke/login.smoke.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';

test('user can log in @smoke', async ({ page }) => {
  // Arrange
  const loginPage = new LoginPage(page);

  // Act
  await loginPage.login(process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!);

  // Assert
  await expect(page).toHaveURL('/dashboard');
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});
```
