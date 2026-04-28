# Playwright QA Template

A lean, grab-and-go QA pipeline for SaaS web apps. Fork it, point it at your app, and ship with confidence. No enterprise bloat — every tool here is open source or free tier.

**What you get out of the box:**
E2E · API · Visual · Accessibility · Security scanning · Performance budgets · CI/CD · Slack alerts

New here? Read the **[Getting Started guide](GETTING_STARTED.md)** — it walks you from zero to a working CI-connected suite.

---

## Philosophy

- **One framework, all layers.** Playwright handles E2E, API, and visual testing natively. No extra HTTP clients, no extra test runners.
- **Fast feedback first.** Smoke tests run on every push in under 2 minutes. Full regression is nightly or on demand.
- **Free by default.** GitHub Actions, Playwright, axe-core, OWASP ZAP, Lighthouse CI, CodeQL, and Dependabot are all free for public repos and generous on private.
- **Start small.** Clone → set `BASE_URL` → write your first smoke test. Expand the suite as your app grows.

---

## Tool Choices

| What | Tool | Cost |
| --- | --- | --- |
| E2E, API, visual testing | [Playwright](https://playwright.dev) + TypeScript | Free / OSS |
| Accessibility | [axe-core](https://github.com/dequelabs/axe-core) via `@axe-core/playwright` | Free / OSS |
| Security scan | [OWASP ZAP](https://www.zaproxy.org/) baseline scan | Free / OSS |
| Performance budgets | [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) | Free / OSS |
| Code security | [GitHub CodeQL](https://codeql.github.com/) | Free on GitHub |
| Dependency updates | [GitHub Dependabot](https://docs.github.com/en/code-security/dependabot) | Free on GitHub |
| CI/CD | [GitHub Actions](https://docs.github.com/en/actions) | Free tier / pay-as-you-go |
| Slack alerts | Slack Incoming Webhooks | Free |
| Reporting | Playwright HTML report | Free / built-in |
| AI browser control | [@playwright/mcp](https://github.com/microsoft/playwright-mcp) | Free / OSS |

---

## Quick Start

```bash
# 1. Clone and install
npm install
npx playwright install --with-deps

# 2. Set your target URL
cp .env.example .env.local
# edit .env.local: set BASE_URL=https://your-app.com

# 3. Run smoke tests
npx playwright test --grep @smoke

# 4. Open the report
npx playwright show-report
```

That's it. You're running tests.

For a full walkthrough — writing your first test, setting up auth, debugging, CI secrets, and best practices — see the **[Getting Started guide](GETTING_STARTED.md)**.

---

## Folder Structure

```
├── .github/
│   ├── workflows/
│   │   ├── ci.yml           # smoke on every push → regression nightly
│   │   ├── security.yml     # CodeQL + ZAP scan
│   │   └── lighthouse.yml   # performance checks on PRs
│   └── dependabot.yml       # weekly dep updates
│
├── src/
│   ├── fixtures/            # shared setup — auth sessions, API clients
│   ├── pages/               # Page Object Model classes
│   ├── components/          # reusable component objects (nav, modals)
│   ├── api/                 # thin API wrappers for test setup/teardown
│   └── utils/               # date, string, wait helpers
│
├── tests/
│   ├── smoke/               # @smoke — critical path, fast
│   ├── regression/          # @regression — full coverage
│   ├── api/                 # @api — contract and integration
│   ├── accessibility/       # @a11y — axe-core checks
│   └── visual/              # @visual — screenshot diffs
│
├── test-data/               # JSON fixtures and seed payloads
├── .env.example             # env var reference — copy to .env.local
├── lighthouserc.yml         # performance score thresholds
└── playwright.config.ts
```

---

## Running Tests

```bash
# By tag
npx playwright test --grep @smoke
npx playwright test --grep @regression
npx playwright test --grep @a11y

# By folder
npx playwright test tests/api/
npx playwright test tests/visual/

# Single browser (chromium is the fast default in CI)
npx playwright test --project=chromium

# All browsers
npx playwright test --project=chromium --project=firefox --project=webkit

# Update visual baselines
npx playwright test --update-snapshots tests/visual/
```

---

## Tagging

Tags go directly in test titles — no extra config.

| Tag | Runs on | Purpose |
|---|---|---|
| `@smoke` | Every push + PR | Critical happy path, fast |
| `@regression` | Nightly + release | Full coverage |
| `@api` | Every push | REST contract tests |
| `@a11y` | PR + nightly | WCAG 2.1 AA checks |
| `@visual` | PR (non-blocking) | Screenshot diffs |

```typescript
test('user can log in @smoke', async ({ page }) => { ... });
test('checkout flow completes @regression', async ({ page }) => { ... });
```

---

## Playwright Config

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: [
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['github'],
    ['json', { outputFile: 'reports/results.json' }],
  ],
  use: {
    baseURL: process.env.BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },   // default in CI
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },  // opt-in
    { name: 'webkit',   use: { ...devices['Desktop Safari'] } },   // opt-in
  ],
});
```

Cross-browser is opt-in. Run chromium in daily CI; add firefox/webkit for release gates.

---

## Page Object Model

```typescript
// src/pages/BasePage.ts
export class BasePage {
  constructor(protected page: Page) {}

  async goto(path: string) {
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
  }
}
```

```typescript
// src/pages/LoginPage.ts
export class LoginPage extends BasePage {
  private email    = this.page.getByLabel('Email');
  private password = this.page.getByLabel('Password');
  private submit   = this.page.getByRole('button', { name: 'Sign in' });

  async login(email: string, password: string) {
    await this.goto('/login');
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submit.click();
  }
}
```

---

## Fixtures — Shared Setup

Use fixtures instead of `beforeEach` blocks to share auth state and page objects across tests.

```typescript
// src/fixtures/base.fixture.ts
import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

export const test = base.extend<{
  loginPage: LoginPage;
  authedPage: Page;
}>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  authedPage: async ({ browser }, use) => {
    const ctx  = await browser.newContext({ storageState: 'auth.json' });
    const page = await ctx.newPage();
    await use(page);
    await ctx.close();
  },
});
```

---

## API Tests

No extra libraries — Playwright's `request` fixture handles REST calls natively.

```typescript
// tests/api/users.api.spec.ts
test('GET /users returns 200 @api', async ({ request }) => {
  const res  = await request.get('/api/users');
  const body = await res.json();
  expect(res.status()).toBe(200);
  expect(Array.isArray(body.data)).toBe(true);
});
```

---

## Accessibility

axe-core runs inside the Playwright browser — no separate test runner needed.

```typescript
// tests/accessibility/homepage.a11y.spec.ts
import AxeBuilder from '@axe-core/playwright';

test('homepage passes WCAG 2.1 AA @a11y', async ({ page }) => {
  await page.goto('/');
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(violations).toEqual([]);
});
```

---

## Visual Testing

Baselines are committed to the repo under `tests/visual/__snapshots__/`.

```typescript
// tests/visual/homepage.visual.spec.ts
test('homepage visual baseline @visual', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('homepage.png', { maxDiffPixels: 100 });
});
```

Update baselines when you intentionally change the UI:

```bash
npx playwright test --update-snapshots tests/visual/
```

---

## Security (OWASP ZAP)

ZAP does a passive baseline scan — it finds common vulnerabilities without active probing. No config needed beyond a Docker daemon.

**Local:**

```bash
docker run --rm -v $(pwd):/zap/wrk ghcr.io/zaproxy/zaproxy:stable \
  zap-baseline.py -t $BASE_URL -r zap-report.html -I
```

**CI:** runs nightly against your staging URL via [`.github/workflows/security.yml`](.github/workflows/security.yml).

---

## Performance (Lighthouse CI)

Score thresholds in `lighthouserc.yml` — PRs fail if the app regresses below them.

```yaml
# lighthouserc.yml
ci:
  collect:
    url:
      - ${BASE_URL}
      - ${BASE_URL}/login
  assert:
    assertions:
      categories:performance:   [error, { minScore: 0.85 }]
      categories:accessibility: [error, { minScore: 0.90 }]
      categories:best-practices:[error, { minScore: 0.90 }]
  upload:
    target: temporary-public-storage
```

Adjust `minScore` values to match your app's current baseline, then tighten over time.

---

## CI Workflows

### Every push / PR — `ci.yml`

```
lint + typecheck
  └── @smoke + @api  (chromium, parallel, ~2 min)
        └── @a11y
              └── @visual  (non-blocking)
                    └── HTML report artifact
                          └── Slack notification
```

### Nightly — `ci.yml` (scheduled)

```
@regression (chromium)
  └── @a11y + @visual
        └── Slack notification
```

### On every push to `main` — `security.yml`

- CodeQL static analysis
- ZAP baseline scan (nightly, against staging)

### On every PR — `lighthouse.yml`

- Lighthouse CI score check — blocks merge on regression

---

## Slack Notifications

Add to GitHub secrets: `SLACK_WEBHOOK_URL`

```yaml
# add to the end of ci.yml jobs
- name: Slack notify
  if: always()
  uses: slackapi/slack-github-action@v2
  with:
    webhook: ${{ secrets.SLACK_WEBHOOK_URL }}
    webhook-type: incoming-webhook
    payload: |
      {
        "text": "${{ job.status == 'success' && '✅' || '❌' }} *${{ github.repository }}* — ${{ github.workflow }}",
        "attachments": [{
          "color": "${{ job.status == 'success' && 'good' || 'danger' }}",
          "fields": [
            { "title": "Branch", "value": "${{ github.ref_name }}", "short": true },
            { "title": "Actor",  "value": "${{ github.actor }}",    "short": true },
            { "title": "Run",    "value": "${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}", "short": false }
          ]
        }]
      }
```

---

## Dependabot

Weekly PRs keep Playwright, axe-core, and pinned Action SHAs current automatically.

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule: { interval: weekly }
    groups:
      playwright: { patterns: ["@playwright/*", "playwright"] }
      testing:    { patterns: ["@axe-core/*"] }

  - package-ecosystem: github-actions
    directory: /
    schedule: { interval: weekly }
```

---

## Environment Variables

```bash
# .env.example — copy to .env.local, never commit .env.local
BASE_URL=https://your-app.com
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=
API_KEY=
SLACK_WEBHOOK_URL=
LHCI_GITHUB_APP_TOKEN=   # only needed for Lighthouse CI GitHub status checks
```

---

## Scripts

```bash
npm test                  # all tests
npm run test:smoke        # @smoke only
npm run test:regression   # @regression only
npm run test:api          # API tests
npm run test:a11y         # accessibility
npm run test:visual       # visual diffs
npm run report            # open last HTML report
npm run lint              # ESLint + Prettier
npm run typecheck         # tsc --noEmit
```

---

## Adapting This Template

| Thing to change | Where |
|---|---|
| Target URL | `.env.local` → `BASE_URL` |
| Auth flow | `src/fixtures/base.fixture.ts` + `src/pages/LoginPage.ts` |
| Performance thresholds | `lighthouserc.yml` |
| Smoke test pages | `tests/smoke/` |
| Cross-browser scope | `playwright.config.ts` → `projects` |
| Slack channel | Slack app settings, not this repo |

Add page objects as your app grows. Keep smoke tests small and fast — if `@smoke` takes more than 3 minutes, split tests out into `@regression`.

---

## Using with Claude Code

This template ships with full [Claude Code](https://claude.ai/code) support out of the box.

### Playwright MCP — AI browser control

[`.mcp.json`](.mcp.json) configures the `@playwright/mcp` server, which gives Claude a live browser it can drive while you work. When you open this project in Claude Code, Claude can:

- Navigate to any page in your app and inspect the real DOM
- Discover stable locators for elements (`getByRole`, `getByLabel`, `getByTestId`) instead of guessing
- Take screenshots to verify what a page looks like before writing visual tests
- Reproduce a failing test step-by-step in the browser

No setup needed — it activates automatically when you open the project.

**Switch to headed mode** (browser visible) by editing `.mcp.json`:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

### Claude agent architecture

The `agents/`, `skills/`, and `commands/` folders define how Claude approaches tasks in this repo — writing tests, debugging failures, building page objects. See [`CLAUDE.md`](CLAUDE.md) for the full reference.

---

## Documentation

- [Getting Started](GETTING_STARTED.md) — full setup, first test, auth, debugging, CI, best practices, troubleshooting
- [CLAUDE.md](CLAUDE.md) — coding standards, agent rules, MCP usage, file structure reference
