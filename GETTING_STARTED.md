# Getting Started

This guide walks you from zero to a working, CI-connected test suite. Follow it top to bottom the first time; use it as a reference after that.

---

## Contents

1. [Prerequisites](#1-prerequisites)
2. [Installation](#2-installation)
3. [Project walkthrough](#3-project-walkthrough)
4. [Your first test](#4-your-first-test)
5. [Locators and selectors](#5-locators-and-selectors)
6. [Page Objects](#6-page-objects)
7. [Fixtures and shared state](#7-fixtures-and-shared-state)
8. [Authentication](#8-authentication)
9. [API tests](#9-api-tests)
10. [Accessibility tests](#10-accessibility-tests)
11. [Visual tests](#11-visual-tests)
12. [Running and debugging locally](#12-running-and-debugging-locally)
13. [Tagging strategy](#13-tagging-strategy)
14. [CI setup](#14-ci-setup)
15. [Best practices](#15-best-practices)
16. [Common pitfalls](#16-common-pitfalls)
17. [Troubleshooting](#17-troubleshooting)

---

## 1. Prerequisites

| Tool                                                      | Minimum version | Why                                                                                                                                                                     |
| --------------------------------------------------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Node.js](https://nodejs.org)                             | 20 LTS          | Runtime                                                                                                                                                                 |
| [Git](https://git-scm.com)                                | any recent      | Version control                                                                                                                                                         |
| [Docker](https://www.docker.com/products/docker-desktop/) | any recent      | OWASP ZAP scans locally                                                                                                                                                 |
| A code editor                                             | —               | [VS Code](https://code.visualstudio.com) recommended — install the [Playwright extension](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright) |

Verify Node before you start:

```bash
node -v   # should print v20.x.x or higher
npm -v    # should print 10.x.x or higher
```

---

## 2. Installation

```bash
# Clone and enter the repo
git clone https://github.com/your-org/playwright-qa-template.git
cd playwright-qa-template

# Install npm dependencies
npm install

# Install Playwright browsers and OS-level deps
npx playwright install --with-deps

# Copy environment config
cp .env.example .env.local
```

Open `.env.local` and set at minimum:

```bash
BASE_URL=https://your-staging-app.com
TEST_USER_EMAIL=qa-user@your-app.com
TEST_USER_PASSWORD=your-test-password
```

Never commit `.env.local`. It is in `.gitignore` by default.

Verify everything works:

```bash
npx playwright test --grep @smoke --project=chromium
npx playwright show-report
```

If smoke tests pass, you're set up correctly.

---

## 3. Project Walkthrough

```
src/
  fixtures/       ← shared setup injected into every test that needs it
  pages/          ← Page Object classes (one file per page or major flow)
  components/     ← sub-page objects (nav, modals, data tables)
  api/            ← lightweight wrappers around your app's REST API
  utils/          ← pure helpers: date formatting, random data, waits

tests/
  smoke/          ← @smoke: 5–15 fast tests covering the critical path
  regression/     ← @regression: comprehensive happy + unhappy path coverage
  api/            ← @api: REST contract and integration tests
  accessibility/  ← @a11y: axe-core scans for WCAG violations
  visual/         ← @visual: screenshot diffs against committed baselines

test-data/        ← static JSON payloads, seed files, mock responses
```

**Rule of thumb:** if it's reusable across tests, it belongs in `src/`. If it's a test assertion, it belongs in `tests/`.

---

## 4. Your First Test

Create `tests/smoke/login.smoke.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test('user can log in @smoke', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel('Email').fill(process.env.TEST_USER_EMAIL!);
  await page.getByLabel('Password').fill(process.env.TEST_USER_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL('/dashboard');
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});
```

Run it:

```bash
npx playwright test tests/smoke/login.smoke.spec.ts --project=chromium
```

Open the report:

```bash
npx playwright show-report
```

---

## 5. Locators and Selectors

Playwright's recommended priority — use the first option that works:

| Priority | Locator            | Example                                        |
| -------- | ------------------ | ---------------------------------------------- |
| 1        | `getByRole`        | `page.getByRole('button', { name: 'Submit' })` |
| 2        | `getByLabel`       | `page.getByLabel('Email address')`             |
| 3        | `getByPlaceholder` | `page.getByPlaceholder('Search...')`           |
| 4        | `getByText`        | `page.getByText('Confirm order')`              |
| 5        | `getByTestId`      | `page.getByTestId('submit-btn')`               |
| Avoid    | CSS / XPath        | `page.locator('.btn-primary')`                 |

**Why this order matters:** role and label selectors are tied to semantics and accessibility attributes that rarely change. CSS classes change with refactors. XPath breaks when structure changes.

If you need a `data-testid`, agree on a consistent attribute name across your frontend codebase (e.g. `data-testid`) and use `getByTestId` — configure the attribute name in `playwright.config.ts`:

```typescript
use: {
  testIdAttribute: 'data-testid',
}
```

---

## 6. Page Objects

Create one class per page or major flow. Keep locators private — tests should call methods, not interact with raw locators.

```typescript
// src/pages/DashboardPage.ts
import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  private heading = this.page.getByRole('heading', { name: 'Dashboard' });
  private newProjectBtn = this.page.getByRole('button', { name: 'New project' });

  async waitForLoad() {
    await expect(this.heading).toBeVisible();
  }

  async createProject(name: string) {
    await this.newProjectBtn.click();
    await this.page.getByLabel('Project name').fill(name);
    await this.page.getByRole('button', { name: 'Create' }).click();
  }
}
```

Using it in a test:

```typescript
import { test, expect } from '@playwright/test';
import { DashboardPage } from '../../src/pages/DashboardPage';

test('can create a project @regression', async ({ page }) => {
  const dashboard = new DashboardPage(page);
  await dashboard.goto('/dashboard');
  await dashboard.waitForLoad();
  await dashboard.createProject('My test project');
  await expect(page.getByText('My test project')).toBeVisible();
});
```

**Page Object rules:**

- No assertions inside page objects — keep them in the test. Assertions belong to tests, actions belong to page objects.
- One file per major page or flow, not one per component.
- Locators are class fields — defined once, referenced by methods.

---

## 7. Fixtures and Shared State

Fixtures are how you share setup across tests without copying `beforeEach` blocks. They also compose — a fixture can depend on another fixture.

```typescript
// src/fixtures/base.fixture.ts
import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

type AppFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  authedPage: Page;
};

export const test = base.extend<AppFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  authedPage: async ({ browser }, use) => {
    const ctx = await browser.newContext({ storageState: 'auth.json' });
    const page = await ctx.newPage();
    await use(page);
    await ctx.close();
  },
});

export { expect } from '@playwright/test';
```

Import from the fixture file instead of `@playwright/test` in tests that need it:

```typescript
import { test, expect } from '../../src/fixtures/base.fixture';

test('dashboard loads @smoke', async ({ authedPage }) => {
  await authedPage.goto('/dashboard');
  await expect(authedPage.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});
```

---

## 8. Authentication

The fastest way to handle auth is to log in once, save the session, and reuse it — Playwright calls this "storage state."

**Step 1 — Create an auth setup file:**

```typescript
// src/fixtures/auth.setup.ts
import { test as setup } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../../.auth/user.json');

setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.TEST_USER_EMAIL!);
  await page.getByLabel('Password').fill(process.env.TEST_USER_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/dashboard');
  await page.context().storageState({ path: authFile });
});
```

**Step 2 — Add a `setup` project to `playwright.config.ts`:**

```typescript
projects: [
  {
    name: 'setup',
    testMatch: /auth\.setup\.ts/,
  },
  {
    name: 'chromium',
    use: {
      ...devices['Desktop Chrome'],
      storageState: '.auth/user.json',
    },
    dependencies: ['setup'],
  },
],
```

**Step 3 — Gitignore the saved session:**

```bash
# .gitignore
.auth/
```

Now every test in the `chromium` project starts already logged in. Tests that explicitly test the login flow should use a fresh context without `storageState`.

---

## 9. API Tests

Playwright's `request` fixture gives you a full HTTP client with cookie and auth state sharing. No Axios, no Supertest.

```typescript
// tests/api/projects.api.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Projects API', () => {
  test('GET /api/projects returns 200 @api', async ({ request }) => {
    const res = await request.get('/api/projects');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('POST /api/projects creates a project @api', async ({ request }) => {
    const res = await request.post('/api/projects', {
      data: { name: 'API test project' },
    });
    expect(res.status()).toBe(201);
    const project = await res.json();
    expect(project.name).toBe('API test project');
    expect(project.id).toBeDefined();
  });

  test('DELETE /api/projects/:id removes the project @api', async ({ request }) => {
    const create = await request.post('/api/projects', {
      data: { name: 'To be deleted' },
    });
    const { id } = await create.json();

    const del = await request.delete(`/api/projects/${id}`);
    expect(del.status()).toBe(204);
  });
});
```

**API test rules:**

- Each test is self-contained — create the data it needs, clean it up after.
- Test the contract (status, schema), not business logic that's already covered by unit tests.
- Use `request` (unauthenticated) for public endpoints; use `authedPage.request` or the `storageState` project for authenticated endpoints.

---

## 10. Accessibility Tests

axe-core runs in the browser alongside your test. It catches ~57% of accessibility issues automatically.

```typescript
// tests/accessibility/dashboard.a11y.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('login page passes WCAG 2.1 AA @a11y', async ({ page }) => {
    await page.goto('/login');
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(violations).toEqual([]);
  });

  test('dashboard passes WCAG 2.1 AA @a11y', async ({ page }) => {
    await page.goto('/dashboard');
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .exclude('#third-party-widget') // exclude embeds you don't own
      .analyze();
    expect(violations).toEqual([]);
  });
});
```

When violations are found, axe returns structured details. Make them readable in test output:

```typescript
expect(violations, formatViolations(violations)).toEqual([]);

function formatViolations(violations: axe.Result[]) {
  return violations
    .map(v => `[${v.impact}] ${v.id}: ${v.description}\n  ${v.nodes.map(n => n.html).join('\n  ')}`)
    .join('\n\n');
}
```

---

## 11. Visual Tests

Screenshot comparison catches unexpected UI regressions that logic-based assertions miss.

```typescript
// tests/visual/homepage.visual.spec.ts
import { test, expect } from '@playwright/test';

test('homepage visual baseline @visual', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // mask dynamic content so diffs are stable
  await expect(page).toHaveScreenshot('homepage.png', {
    maxDiffPixels: 100,
    mask: [page.locator('[data-testid="user-avatar"]')],
  });
});
```

**First run — generate baselines:**

```bash
npx playwright test --update-snapshots tests/visual/
git add tests/visual/__snapshots__
git commit -m "chore: add visual baselines"
```

**Intentional UI change — update baselines:**

```bash
npx playwright test --update-snapshots tests/visual/
# review the diff in the HTML report, then commit
```

**Tips:**

- Mask avatars, timestamps, and ads — anything that legitimately changes.
- Run visual tests with `--project=chromium` only. Cross-browser screenshot diffs need separate baselines per OS/browser combination.
- Keep `maxDiffPixels` tight (50–150). Loose thresholds let real regressions slip through.

---

## 12. Running and Debugging Locally

### Common run modes

```bash
# Run everything
npx playwright test

# Run one file
npx playwright test tests/smoke/login.smoke.spec.ts

# Run with a tag
npx playwright test --grep @smoke

# Run headed (see the browser)
npx playwright test --headed

# Run in debug mode (pauses on each step)
npx playwright test --debug

# Run with the Playwright UI mode (visual test runner)
npx playwright test --ui
```

### Playwright UI mode

`--ui` opens a visual browser that lets you run individual tests, inspect steps, see network requests, and browse traces. Best way to write and debug tests interactively.

```bash
npx playwright test --ui
```

### Traces

Traces are recorded automatically on the first retry in CI (configured in `playwright.config.ts`). To always record traces locally:

```bash
npx playwright test --trace on
```

Open a trace file:

```bash
npx playwright show-trace path/to/trace.zip
```

### VS Code extension

Install the [Playwright VS Code extension](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright). It adds:

- A test panel to run/debug individual tests with one click
- Inline "pick locator" tool — hover over any element and get its best-practice locator
- Step-through debugging with breakpoints

### Codegen — auto-generate test code

```bash
npx playwright codegen https://your-app.com
```

Opens a browser that records your interactions and generates Playwright code in real time. Use it to bootstrap tests, then clean up the output to use semantic locators and page objects.

---

## 13. Tagging Strategy

Tags in test titles are matched by `--grep`. No external config needed.

| Tag           | Intent                                                  | Run in CI               |
| ------------- | ------------------------------------------------------- | ----------------------- |
| `@smoke`      | Critical paths only — login, core action, key page load | Every push              |
| `@regression` | Full happy + unhappy path coverage                      | Nightly + release       |
| `@api`        | REST contract tests                                     | Every push              |
| `@a11y`       | WCAG 2.1 AA scans                                       | Every PR + nightly      |
| `@visual`     | Screenshot diffs                                        | Every PR (non-blocking) |

A test can have multiple tags:

```typescript
test('checkout completes @smoke @regression', async ({ page }) => { ... });
```

**Rules:**

- `@smoke` tests must stay fast — target under 30 seconds per test, under 2 minutes for the whole smoke suite.
- If a smoke test is slow, it belongs in `@regression`.
- Do not add `@smoke` to every test. Smoke is triage coverage, not full coverage.

---

## 14. CI Setup

### GitHub Actions secrets

Go to your repo: **Settings → Secrets and variables → Actions → New repository secret**

| Secret                  | Required for                       |
| ----------------------- | ---------------------------------- |
| `BASE_URL`              | All tests — target app URL         |
| `TEST_USER_EMAIL`       | Auth and E2E tests                 |
| `TEST_USER_PASSWORD`    | Auth and E2E tests                 |
| `SLACK_WEBHOOK_URL`     | Slack notifications                |
| `LHCI_GITHUB_APP_TOKEN` | Lighthouse CI GitHub status checks |

### First CI run

1. Push to a branch or open a PR.
2. GitHub Actions triggers `ci.yml` automatically.
3. The workflow runs lint → smoke → accessibility → visual.
4. Playwright HTML report is uploaded as a workflow artifact — download it from the Actions run page.

### Workflow files

| File                               | Triggers              | What it runs                                          |
| ---------------------------------- | --------------------- | ----------------------------------------------------- |
| `.github/workflows/ci.yml`         | push, PR              | smoke + api → a11y → visual (nightly adds regression) |
| `.github/workflows/security.yml`   | push to main, nightly | CodeQL + ZAP baseline scan                            |
| `.github/workflows/lighthouse.yml` | PR to main            | Lighthouse CI performance check                       |

### Downloading test reports from CI

1. Go to **Actions** in your GitHub repo.
2. Click the failed run.
3. Scroll to **Artifacts** — download `playwright-report`.
4. Unzip and open `index.html` locally.

---

## 15. Best Practices

### Test structure

- **One assertion theme per test.** A test called "user can check out" should verify checkout, not also verify email confirmation.
- **Arrange → Act → Assert.** Set up state, do the thing, check the result. In that order, nothing else.
- **No shared mutable state.** Each test creates the data it needs and cleans up after itself.

### Selectors

- Always prefer `getByRole`, `getByLabel`, `getByText` over CSS or XPath.
- If you find yourself writing `nth(2)`, the page needs a `data-testid`.
- Ask your frontend team to add `data-testid` attributes to interactive elements that have no stable semantic selector.

### Waiting

- Never use `page.waitForTimeout(2000)` — it is a code smell. Replace with:
  - `await expect(locator).toBeVisible()` — waits until element appears
  - `await page.waitForURL('/dashboard')` — waits for navigation
  - `await page.waitForResponse('**/api/data')` — waits for a specific network call
- Playwright's locators auto-wait. If you have a race condition, look for a missing `await` before reaching for a timeout.

### Assertions

- Use `expect` assertions from `@playwright/test`, not from other libraries — they are async-aware.
- Prefer `toBeVisible()` over `toBeAttached()`. Visible means the user can actually see it.
- Avoid `toBeTruthy()` on Playwright objects — be specific about what you're checking.

### Flake prevention

- Isolate tests with unique test data (use a random suffix: `project-${Date.now()}`).
- Avoid depending on test execution order — each test must work standalone.
- If a test is flaky, add `--repeat-each 5` to reproduce it locally before fixing it.
- Use `test.slow()` to triple the timeout for genuinely slow tests rather than raising the global timeout.

### What to put in smoke vs regression

**Smoke** — the five to ten things that, if broken, mean the app is unusable:

- Login and logout
- Main navigation loads
- Core paid feature works end-to-end
- API health check returns 200

**Regression** — everything else:

- Form validation
- Error states
- Edge cases
- Permissions and roles
- Pagination, sorting, filtering

---

## 16. Common Pitfalls

**Selector breaks after a refactor**
You used a CSS class that changed. Fix: switch to `getByRole` or `getByTestId`. Add `data-testid` attributes to the element if no semantic selector exists.

**Tests pass locally, fail in CI**
Usually one of: different `BASE_URL`, missing env var in CI secrets, or a timing issue that the slower CI environment exposes. Run with `--trace on` in CI and inspect the trace artifact.

**Visual tests fail on every PR**
You have dynamic content (timestamps, avatars, ads) not masked. Add a `mask` option or a `data-testid` on the dynamic element:

```typescript
await expect(page).toHaveScreenshot('page.png', {
  mask: [page.locator('[data-testid="timestamp"]')],
});
```

**Auth state expires mid-run**
The saved `auth.json` has a session that expires. Re-run the setup project or shorten the session lifetime in your app's test environment to something predictable.

**`expect` passes but the UI looks wrong**
You asserted `toBeVisible()` on a container, but the content inside it is still loading. Assert on the specific content you care about, or wait for a network response: `await page.waitForResponse('**/api/data')`.

**Test times out on a form submit**
The submit triggered a navigation that Playwright didn't wait for. Use `Promise.all` to click and wait for navigation simultaneously:

```typescript
await Promise.all([
  page.waitForURL('/confirmation'),
  page.getByRole('button', { name: 'Submit' }).click(),
]);
```

---

## 17. Troubleshooting

**`npx playwright install` fails**

```bash
# Install OS-level deps separately
npx playwright install-deps
npx playwright install
```

On Linux CI, ensure the container has the required system libraries (the `--with-deps` flag handles this automatically).

**`Cannot find module` errors after `npm install`**

```bash
rm -rf node_modules package-lock.json
npm install
```

**Tests hanging and never completing**

Add `--timeout 30000` to override the global timeout while debugging. If a specific step hangs, add a `console.log` before it or use `--debug` to step through.

**Playwright HTML report is blank**

The report requires a local server, not `file://`. Open with:

```bash
npx playwright show-report
```

Not by double-clicking `index.html` directly.

**ZAP scan exits with non-zero even with `-I` flag**

The `-I` flag marks the run as informational — it won't fail the job. If it still fails, check that Docker has network access to your `BASE_URL` from within the container.

**Lighthouse CI `lhci autorun` fails with auth errors**

Set `LHCI_GITHUB_APP_TOKEN` in your GitHub secrets. For local runs, you can skip the upload step:

```bash
lhci autorun --upload.target=filesystem --upload.outputDir=./lhci-results
```

---

## Next Steps

- Read the [Playwright documentation](https://playwright.dev/docs/intro) — it is excellent.
- Add your first real smoke test for your app's login flow.
- Set up the `setup` project and save auth state to speed up tests that require a logged-in user.
- Configure GitHub secrets and push to verify CI runs end to end.
- Once you have 10+ tests, enable the nightly regression schedule in `ci.yml`.
